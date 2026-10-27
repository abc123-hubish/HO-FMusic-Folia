import { FoliaSnapshot } from '../model/FoliaModel';

// A persistent native transport mirrors the original player's state.
@Component
export struct MiniPlayer {
  @Prop snapshot: FoliaSnapshot = new FoliaSnapshot();
  onPlayer: () => void = (): void => {};
  onToggle: () => void = (): void => {};
  onNext: () => void = (): void => {};
  build() {
    Row({ space: 12 }) {
      Image($r('app.media.folia_icon')).width(40).height(40).borderRadius(12)
      Column({ space: 4 }) {
        Text(this.snapshot.title).fontSize(13).fontWeight(FontWeight.Medium).fontColor($r('app.color.text'))
          .maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis }).width('100%')
        Text(this.snapshot.artist || '正在聆听').fontSize(10).fontColor($r('app.color.muted'))
          .maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis }).width('100%')
      }.layoutWeight(1).alignItems(HorizontalAlign.Start).onClick(this.onPlayer)
      Button() {
        SymbolGlyph(this.snapshot.playing ? $r('sys.symbol.pause') : $r('sys.symbol.play')).fontSize(23).fontColor(['#48828E'])
      }.width(42).height(42).backgroundColor(Color.Transparent).onClick(this.onToggle)
      Button() { SymbolGlyph($r('sys.symbol.arrow_right')).fontSize(22).fontColor(['#48828E']) }
        .width(38).height(42).backgroundColor(Color.Transparent).onClick(this.onNext)
    }.width('100%').height(64).padding({ left: 13, right: 8 }).backgroundColor($r('app.color.surface'))
      .borderRadius(24).shadow({ radius: 18, color: '#0C253947', offsetY: 6 })
  }
}
