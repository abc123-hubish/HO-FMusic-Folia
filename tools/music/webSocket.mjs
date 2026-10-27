import { Buffer } from '../../upstream/folia-major/node_modules/buffer/index.js';

// Browser-compatible events backed by native WebSocket; MQTT payloads stay inside native JavaScript.
export function createWebSocketTransport(send) {
  const sockets = new Map();
  let sequence = 0;
  class WebSocket {
    readyState = 0;
    binaryType = 'arraybuffer';
    constructor(url, protocol) {
      if (!/^wss:\/\/mu\.y\.qq\.com\/ws\/handshake(?:\/[^\s?#@]*)?$/.test(String(url)) || protocol !== 'mqtt') {
        throw new Error('Invalid QQ login WebSocket');
      }
      this.id = `qq-ws-${++sequence}`;
      sockets.set(this.id, this);
      void send(JSON.stringify({ transport:'websocket',action:'open',id:this.id,url:String(url),protocol }))
        .catch(() => receive({ id:this.id,event:'error' }));
    }
    send(data) {
      if (this.readyState !== 1) throw new Error('QQ login WebSocket is not open');
      const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer,data.byteOffset,data.byteLength);
      void send(JSON.stringify({ transport:'websocket',action:'send',id:this.id,body:Buffer.from(bytes).toString('base64') }))
        .catch(() => receive({ id:this.id,event:'error' }));
    }
    close() {
      if (this.readyState >= 2) return;
      this.readyState = 2;
      void send(JSON.stringify({ transport:'websocket',action:'close',id:this.id }))
        .catch(() => {}).finally(() => receive({ id:this.id,event:'close' }));
    }
  }
  const receive = event => {
    const socket = sockets.get(event.id);
    if (!socket) return;
    if (event.event === 'open' && socket.readyState === 0) { socket.readyState = 1; socket.onopen?.({}); }
    if (event.event === 'message' && socket.readyState === 1) {
      socket.onmessage?.({ data:Uint8Array.from(Buffer.from(event.body || '', 'base64')).buffer });
    }
    if (event.event === 'error' && socket.readyState < 2) { socket.onerror?.(new Error('QQ login WebSocket failed')); socket.close(); }
    if (event.event === 'close') { socket.readyState = 3; sockets.delete(event.id); socket.onclose?.({}); }
  };
  return { WebSocket, receive:payload => receive(JSON.parse(payload)), closeAll:() => { for (const socket of sockets.values()) socket.close(); } };
}
