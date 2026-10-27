// Typed string boundary keeps upstream dynamic protocol data inside native JavaScript.
export interface BodianRuntime { request(operation: string, payload: string): Promise<string>; }
export function createBodianRuntime(deviceId: string, readSession: () => string,
  writeSession: (value: string) => void, nativeRequest: (payload: string) => Promise<string>): BodianRuntime;
