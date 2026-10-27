import { webSocket } from '@kit.NetworkKit';
import { util } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';

// Private QQ MQTT transport: only the fixed broker and MQTT subprotocol are reachable.
export interface MusicSocketRequest { transport: string; action: string; id: string; url?: string; protocol?: string; body?: string; }
interface MusicSocketEvent { id: string; event: string; body?: string; }
export class MusicSockets {
  private readonly sockets: Map<string, webSocket.WebSocket> = new Map();
  private readonly receive: (payload: string) => void;
  constructor(receive: (payload: string) => void) { this.receive = receive; }
  async request(input: MusicSocketRequest): Promise<string> {
    if (!/^qq-ws-\d+$/.test(input.id)) throw new Error('Invalid QQ socket id');
    if (input.action === 'open') {
      const url = input.url || '';
      if (!/^wss:\/\/mu\.y\.qq\.com\/ws\/handshake(?:\/[^\s?#@]*)?$/.test(url)
        || input.protocol !== 'mqtt' || url.length > 2048 || this.sockets.size >= 4 || this.sockets.has(input.id)) {
        throw new Error('Invalid QQ login connection');
      }
      const socket = webSocket.createWebSocket(); this.sockets.set(input.id, socket);
      socket.on('open', (_error: BusinessError, _value: Object): void => this.emit(input.id, socket, 'open'));
      socket.on('message', (_error: BusinessError, value: string | ArrayBuffer): void => {
        const bytes = typeof value === 'string' ? new util.TextEncoder().encodeInto(value) : new Uint8Array(value);
        if (!bytes.length) return;
        if (bytes.length > 1024 * 1024) { void socket.close().catch(() => {}); return; }
        this.emit(input.id, socket, 'message', new util.Base64Helper().encodeToStringSync(bytes));
      });
      socket.on('error', (_error: BusinessError): void => this.emit(input.id, socket, 'error'));
      socket.on('close', (_error: BusinessError, _value: webSocket.CloseResult): void => {
        this.emit(input.id, socket, 'close'); if (this.sockets.get(input.id) === socket) this.sockets.delete(input.id);
      });
      try {
        const connected = await socket.connect(url, { protocol: 'mqtt', header: { Origin: 'https://y.qq.com' } });
        if (!connected) throw new Error('QQ login WebSocket did not connect');
      } catch (_) {
        this.emit(input.id, socket, 'error'); this.sockets.delete(input.id); void socket.close().catch(() => {});
        throw new Error('QQ login WebSocket failed');
      }
    } else {
      const socket = this.sockets.get(input.id);
      if (input.action === 'close') {
        if (socket) { this.emit(input.id, socket, 'close'); this.sockets.delete(input.id); await socket.close().catch(() => {}); }
      } else if (input.action === 'send') {
        if (!socket || !input.body || input.body.length > 131072) throw new Error('Invalid QQ login frame');
        const bytes = new util.Base64Helper().decodeSync(input.body);
        await socket.send(bytes.buffer as ArrayBuffer);
      } else throw new Error('Invalid QQ socket operation');
    }
    return '{}';
  }
  private emit(id: string, socket: webSocket.WebSocket, event: string, body?: string): void {
    if (this.sockets.get(id) !== socket) return;
    const payload: MusicSocketEvent = { id, event, body }; this.receive(JSON.stringify(payload));
  }
  release(): void {
    for (const socket of this.sockets.values()) void socket.close().catch(() => {});
    this.sockets.clear();
  }
}
