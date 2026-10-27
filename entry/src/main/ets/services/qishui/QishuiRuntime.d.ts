// The protocol's dynamic values remain in native JavaScript behind a typed string boundary.
export interface QishuiRuntime { request(operation: string, payload: string): Promise<string>; }
export function createQishuiRuntime(deviceId: string, readSession: () => string, writeSession: (value: string) => void,
  nativeRequest: (payload: string) => Promise<string>, nativeCrypto: (payload: string) => string): QishuiRuntime;
