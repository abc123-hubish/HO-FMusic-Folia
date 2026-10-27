import { common } from '@kit.AbilityKit';
import { fileIo as fs, picker } from '@kit.CoreFileKit';
import { util } from '@kit.ArkTS';

// Chunked blob transfer supports original JSON, lyric and image exports through the system save picker.
export class NativeTransferStore {
  private streams: Map<string, fs.File> = new Map();
  private context: common.UIAbilityContext;
  constructor(context: common.UIAbilityContext) { this.context = context; }
  private path(id: string): string {
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(id)) throw new Error('Invalid transfer identity');
    return `${this.context.cacheDir}/${id}`;
  }
  begin(id: string): void {
    const previous = this.streams.get(id);
    if (previous) fs.closeSync(previous);
    this.streams.set(id, fs.openSync(this.path(id), fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE | fs.OpenMode.TRUNC));
  }
  append(id: string, base64: string): void {
    const file = this.streams.get(id);
    if (!file) throw new Error('Transfer is not open');
    const bytes = new util.Base64Helper().decodeSync(base64);
    // The usual decoder result already owns exactly these bytes; avoid copying every export chunk.
    const buffer = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
      ? bytes.buffer as ArrayBuffer
      : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    let offset = 0;
    while (offset < bytes.byteLength) {
      const written = fs.writeSync(file.fd, offset === 0 ? buffer : buffer.slice(offset));
      if (written <= 0) throw new Error('Cannot write export file');
      offset += written;
    }
  }
  finish(id: string): string {
    const file = this.streams.get(id);
    if (file) { fs.closeSync(file); this.streams.delete(id); }
    return this.path(id);
  }
  async export(id: string, name: string): Promise<boolean> {
    const options = new picker.DocumentSaveOptions();
    options.newFileNames = [name.replace(/[\\/:*?"<>|]/g, '_')];
    const selected = await new picker.DocumentViewPicker(this.context).save(options);
    if (selected.length === 0) return false;
    const destination = await fs.open(selected[0], fs.OpenMode.READ_WRITE | fs.OpenMode.TRUNC);
    try { await fs.copyFile(this.path(id), destination.fd); } finally { await fs.close(destination); }
    await fs.unlink(this.path(id));
    return true;
  }
  release(): void { this.streams.forEach((file: fs.File) => { fs.closeSync(file); }); this.streams.clear(); }
}
