import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OnlineProviderId, ProviderAccountSummary } from '../../types/onlineMusic';
import type { LibraryAccountController } from '../../library/core/contracts/account';
import type { LibraryLoginView } from '../../library/core/bindings/useLibraryAccount';
import { canLogoutProvider } from '../../library/core/model/accountRules';
import { SettingsKitThemeContext } from '../modal/settings/kit/kitTheme';
import { Unfold } from '../modal/settings/kit/Reveal';
import WindowFrame from './window/LoginWindow';
import PlatformColumn from './window/PlatformColumn';
import LoginTile from './window/LoginTile';
import LoginMessage, { type MessageAction } from './window/LoginMessage';
import type { LoginScene, LoginCaseKind } from './window/loginView';
import QrLoginFailureHelp from './QrLoginFailureHelp';
import { buildQrLoginFailureHelpProps } from './buildQrLoginFailureHelpProps';
import qqIcon from '../../assets/providers/qq.svg';
import wechatIcon from '../../assets/providers/wechat.svg';
import { useKitReducedMotion } from '../modal/settings/kit/motion';
import { LoginDoneFlight, LoginDoneFlood, LoginDoneTile, loginDoneColours, useLoginDone } from './done/LoginDone';
import { loginDonePlaying } from './done/loginDoneFrame';

// src/components/login/LoginWindow.tsx
// Adapter only: upstream frame, platform column, tile and message use the existing controller snapshot.
export const LoginWindow = ({ isOpen, done, onDoneLeave, onDoneEnd, providers, selected, activeProviderId, login, account, isDaylight, onSelect, onClose, blocked }: {
    isOpen: boolean; done: boolean; onDoneLeave: () => void; onDoneEnd: () => void;
    providers: ProviderAccountSummary[]; selected: OnlineProviderId | null; activeProviderId: OnlineProviderId;
    login: LibraryLoginView | null; account: LibraryAccountController; isDaylight: boolean;
    onSelect: (id: OnlineProviderId) => void; onClose: () => void; blocked: boolean;
}) => {
    const { t } = useTranslation();
    const chosen = providers.find(row => row.providerId === selected);
    const view = login?.session.providerId === selected ? login : null;
    const session = view?.session;
    const phase = session?.phase;
    const failed = phase === 'expired' || phase === 'error' || Boolean(view?.backendFailure);
    const scene: LoginScene = !chosen ? 'none' : session ? phase === 'choosing-method' ? 'methods'
        : failed ? 'failed' : phase === 'scanned' ? 'scanned' : phase === 'confirmed' ? 'reading' : 'code'
        : chosen.requiresAccount === false ? 'accountless' : 'account';
    const failedKind: LoginCaseKind | null = failed ? view?.backendFailure ? 'D' : phase === 'expired' ? 'A' : 'G' : null;
    const [detailsFor, setDetailsFor] = useState<string | null>(null);
    const sceneKey = `${selected}:${phase ?? scene}:${String(session?.failure ?? '')}`;
    const detailsOpen = detailsFor === sceneKey;
    const label = chosen?.shortName || chosen?.displayName || '';
    const actions: MessageAction[] = [];
    if (view?.backendFailure && (session?.backend.canRestart || session?.backend.restarting)) {
        actions.push({ label: session.backend.restarting ? view.backendFailure.restartingLabel : view.backendFailure.restartLabel,
            primary: true, busy: session.backend.restarting, onClick: () => void account.restartLoginBackend() });
    } else if (view?.canRetry) {
        actions.push({ label: view.retryLabel, primary: true, disabled: session?.retryCooldownSeconds !== null, onClick: () => void account.retryLogin() });
    } else if (!view && chosen) {
        if (chosen.status === 'authenticated' || chosen.requiresAccount === false) {
            if (chosen.providerId !== activeProviderId) actions.push({ label: t('home.switchToProvider', { provider: label }), primary: true, onClick: () => void account.requestSwitch(chosen.providerId) });
            if (canLogoutProvider(chosen, activeProviderId)) actions.push({ label: t('account.logout'), onClick: () => void account.logout(chosen.providerId) });
        } else actions.push({ label: t('home.loginToProvider', { provider: label }), primary: true, onClick: () => onSelect(chosen.providerId) });
    }
    const hasDetails = Boolean(view?.canShowDiagnostics && session?.failure && view.failureTips);
    const still = useKitReducedMotion();
    const playing = selected !== null && loginDonePlaying({ open: isOpen, still, scene, done });
    const parts = useLoginDone({ playing, providerId: selected, scanned: phase === 'scanned', confirmed: phase === 'confirmed',
        read: done, onLeave: onDoneLeave, onEnd: onDoneEnd });
    const colours = useMemo(() => selected ? loginDoneColours(selected, label) : null, [selected, label]);
    const shownDone = done && !still && selected !== null;
    return <SettingsKitThemeContext.Provider value={{ isDaylight }}>
        <WindowFrame isOpen={isOpen} quiet={shownDone} leavesThrough={shownDone} blocked={blocked} onClose={onClose} title={chosen ? t('home.loginToProvider', { provider: label }) : t('loginWindow.title')}
            closeTip={t('home.closeLogin')} providerId={selected} providerLabel={label} rings={scene === 'code'}
            overlay={still || !selected || !colours ? undefined : narrow => <LoginDoneFlood parts={parts} providerId={selected}
                label={label} user={chosen?.user ?? null} surface={colours.surface} tickColour={colours.tick} shown={shownDone}
                title={t('home.loginSuccess')} left={narrow ? 24 : 208} />}
            column={lie => <PlatformColumn rows={providers} chosenId={selected} onChoose={row => onSelect(row.providerId)} lie={lie} />}
            tile={<LoginTile scene={scene} providerId={selected} label={label} inBrowser={false} codeImage={session?.qrImageUrl ?? ''}
                tileRef={element => { parts.current.tile = element; }}
                doneLayer={playing && colours ? (source, onPaper) => <LoginDoneTile parts={parts} surface={colours.surface} source={source} onPaper={onPaper} /> : undefined}
                user={chosen?.user ?? null} failedKind={failedKind} refreshLabel={t('home.retryQr')} pendingText={view?.methodStep?.pending ?? ''}
                onRefreshCode={phase === 'expired' && view?.canRetry && session?.retryCooldownSeconds === null ? () => void account.retryLogin() : undefined} />}
            message={<LoginMessage sceneKey={sceneKey}
                headline={view?.backendFailure?.title ?? (view ? view.status || view.title : chosen?.user?.nickname || label || t('loginWindow.choosePlatform'))}
                note={view ? view.note : chosen?.user ? `${label} · ID: ${chosen.user.id}` : chosen?.requiresAccount === false ? t('home.providerNoAccount') : undefined}
                quote={view?.backendFailure && session?.backend.detail ? { who: label, text: session.backend.detail } : undefined}
                methods={view?.methodStep && view.methodStep.options.length > 1 ? {
                    options: view.methodStep.options.map(method => ({ value: method.id, label: method.label, icon: method.iconKey === 'qq' ? qqIcon : method.iconKey === 'wechat' ? wechatIcon : '' })),
                    value: session?.selectedMethodId ?? null, onChange: id => void account.selectLoginMethod(id),
                } : undefined}
                actions={actions} details={hasDetails ? { open: detailsOpen, onToggle: () => setDetailsFor(detailsOpen ? null : sceneKey) } : undefined}
                steps={session ? { marks: ['code', 'phone', 'account'], current: phase === 'confirmed' ? 2 : phase === 'scanned' ? 1 : 0 } : null} />}
            below={<>
                {selected === 'qishui' && <p data-testid="qishui-playback-notice"
                    className="rounded-xl border border-[color:var(--st-line)] bg-[var(--st-fill)] px-3 py-2.5 text-xs leading-relaxed text-[color:var(--st-t2)]">
                    {t('home.qishuiPlaybackNotice')}
                </p>}
                {hasDetails && view && session?.failure && view.failureTips ? <Unfold open={detailsOpen}><div className="pt-4">
                <QrLoginFailureHelp {...buildQrLoginFailureHelpProps({ t, providerId: session.providerId, failure: session.failure, tips: view.failureTips,
                    selfCheck: view.selfCheck, reportElsewhereNote: view.reportElsewhereNote, buildReport: async () => {
                        const result = await account.buildLoginDiagnosticReport();
                        if (result.status !== 'ok') throw new Error('no login session to report');
                        return result.report;
                    } })} /></div></Unfold> : undefined}
            </>} />
        {shownDone && selected && <LoginDoneFlight parts={parts} providerId={selected} label={label} user={chosen?.user ?? null} />}
    </SettingsKitThemeContext.Provider>;
};
