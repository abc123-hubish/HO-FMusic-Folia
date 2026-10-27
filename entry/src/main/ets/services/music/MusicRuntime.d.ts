// Typed string boundary; protocol objects and account credentials remain inside native JavaScript.
export interface MusicRuntime { request(operation: string, payload: string): Promise<string>; receiveSocketEvent(payload: string): void; }
export function createMusicRuntime(provider: string, request: (payload: string) => Promise<string>,
  read: () => string, write: (value: string) => void, random: (length: number) => string): MusicRuntime;
