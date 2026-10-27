import { TrackItem } from '../model/FoliaModel';

// Shared native track row passes stable identities to the original playback controller.
@Component
export struct TrackRow {
  @Prop item: TrackItem = new TrackItem();
  @Prop index: number = 0;
  @Prop current: boolean = false;
  onPlay: (id: string) => void = (_id: string): void => {};
  build() {
    Row({ space: 14 }) {
      Stack() {
        Text(this.current ? '♫' : `${this.index + 1}`).fontSize(this.current ? 23 : 14)
          .fontColor(this.current ? '#48828E' : $r('app.color.muted'))
      }.width(44).height(44).borderRadius(14).backgroundColor($r('app.color.soft_surface'))
      Column({ space: 5 }) {
        Text(this.item.title).fontSize(16).fontWeight(FontWeight.Medium).fontColor($r('app.color.text'))
          .maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis }).width('100%')
        Text(this.item.artist || this.item.album || '本地音乐').fontSize(12).fontColor($r('app.color.muted'))
          .maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis }).width('100%')
      }.alignItems(HorizontalAlign.Start).layoutWeight(1)
      SymbolGlyph($r('sys.symbol.play')).fontSize(17).fontColor(['#48828E'])
    }.width('100%').padding({ top: 12, bottom: 12 }).onClick(() => this.onPlay(this.item.id))
    .accessibilityText(`播放 ${this.item.title}`)
  }
}
