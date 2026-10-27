import { AbilityConstant, common, Want, wantConstant } from '@kit.AbilityKit';
import { util } from '@kit.ArkTS';
import { hilog } from '@kit.PerformanceAnalysisKit';

// entry/src/main/ets/services/AppContinuation.ets
// Own the system lifecycle while ArkWeb owns the portable playback description.
const PAYLOAD_KEY: string = 'folia.continuation.v1';
const MAX_BYTES: number = 80 * 1024;
class ContinuationHeader {
  schemaVersion: number = 0;
  transferId: string = '';
}

export class AppContinuation {
  private static context?: common.UIAbilityContext;
  private static exporter?: (requestId: string) => void;
  private static pending: string = '';
  private static lastTransferId: string = '';
  private static requestId: string = '';
  private static resolveExport?: (payload: string) => void;
  private static timeout: number = -1;
  private static available: boolean = false;
  private static stateUpdates: Promise<void> = Promise.resolve();

  static attach(context: common.UIAbilityContext, exporter: (requestId: string) => void): void {
    if (AppContinuation.exporter && AppContinuation.exporter !== exporter) {
      AppContinuation.finishExport(AppContinuation.requestId, '');
    }
    AppContinuation.context = context;
    AppContinuation.exporter = exporter;
    AppContinuation.setAvailable(false, true);
  }

  static detach(exporter: (requestId: string) => void): void {
    if (AppContinuation.exporter !== exporter) return;
    AppContinuation.exporter = undefined;
    AppContinuation.finishExport(AppContinuation.requestId, '');
    AppContinuation.setAvailable(false);
  }

  static setAvailable(available: boolean, force: boolean = false): void {
    available = available && AppContinuation.pending.length === 0;
    if (!force && AppContinuation.available === available) return;
    AppContinuation.available = available;
    const context = AppContinuation.context;
    if (!context) return;
    // Keep late async state updates from advertising an old song after a newer INACTIVE update.
    AppContinuation.stateUpdates = AppContinuation.stateUpdates.then(async () => {
      try {
        await context.setMissionContinueState(available
          ? AbilityConstant.ContinueState.ACTIVE : AbilityConstant.ContinueState.INACTIVE);
      } catch (error) {
        hilog.warn(0x0000, 'FoliaContinue', 'Set continuation state failed: %{public}s', String(error));
      }
    });
  }

  static setHostAvailable(exporter: (requestId: string) => void, available: boolean): void {
    if (AppContinuation.exporter === exporter) AppContinuation.setAvailable(available);
  }

  static receive(want: Want): boolean {
    const value = want.parameters?.[PAYLOAD_KEY];
    if (typeof value === 'string' && value.length <= MAX_BYTES) {
      try {
        const header = JSON.parse(value) as ContinuationHeader;
        if (typeof header.transferId === 'string' && header.transferId) {
          if (header.transferId === AppContinuation.lastTransferId) return false;
          AppContinuation.lastTransferId = header.transferId;
        }
      } catch (_) {}
    }
    // A malformed continuation must still suppress ordinary last-session restore on the target.
    AppContinuation.pending = typeof value === 'string' && value.length <= MAX_BYTES ? value : '{}';
    AppContinuation.setAvailable(false, true);
    return true;
  }

  static getPending(): string { return AppContinuation.pending; }
  static acknowledge(payload: string): void {
    if (payload === AppContinuation.pending) AppContinuation.pending = '';
  }

  static finishExport(requestId: string, payload: string): void {
    if (!AppContinuation.resolveExport || requestId !== AppContinuation.requestId) return;
    const resolve = AppContinuation.resolveExport;
    clearTimeout(AppContinuation.timeout);
    AppContinuation.resolveExport = undefined;
    AppContinuation.requestId = '';
    resolve(payload);
  }

  static async save(wantParam: Record<string, Object>): Promise<AbilityConstant.OnContinueResult> {
    const exporter = AppContinuation.exporter;
    if (!exporter || !AppContinuation.available || AppContinuation.pending || AppContinuation.resolveExport) {
      return AbilityConstant.OnContinueResult.REJECT;
    }
    const payload = await new Promise<string>((resolve) => {
      AppContinuation.resolveExport = resolve;
      const requestId = util.generateRandomUUID(true);
      AppContinuation.requestId = requestId;
      AppContinuation.timeout = setTimeout(() => AppContinuation.finishExport(requestId, ''), 2500);
      try { exporter(requestId); } catch (_) { AppContinuation.finishExport(requestId, ''); }
    });
    try {
      if (exporter !== AppContinuation.exporter || !AppContinuation.available || AppContinuation.pending) {
        return AbilityConstant.OnContinueResult.REJECT;
      }
      if (!payload || new util.TextEncoder().encodeInto(payload).byteLength > MAX_BYTES) {
        return AbilityConstant.OnContinueResult.REJECT;
      }
      const header = JSON.parse(payload) as ContinuationHeader;
      if (header.schemaVersion !== 1 || typeof header.transferId !== 'string' || !header.transferId) {
        return AbilityConstant.OnContinueResult.REJECT;
      }
      wantParam[PAYLOAD_KEY] = payload;
      // React restores its own navigation. The default source exit prevents two devices playing together.
      wantParam[wantConstant.Params.SUPPORT_CONTINUE_PAGE_STACK_KEY] = false;
      wantParam[wantConstant.Params.SUPPORT_CONTINUE_SOURCE_EXIT_KEY] = true;
      return AbilityConstant.OnContinueResult.AGREE;
    } catch (_) {
      return AbilityConstant.OnContinueResult.REJECT;
    }
  }
}
