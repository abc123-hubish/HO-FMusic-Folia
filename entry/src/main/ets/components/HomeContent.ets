import { FoliaSnapshot, TrackItem } from '../model/FoliaModel';
import { TrackRow } from './TrackRow';

// Native listening home shows only genuine catalogue and queue data.
@Component
export struct HomeContent {
  @Prop snapshot: FoliaSnapshot = new FoliaSnapshot();
  @Prop compact: boolean = false;
  onImport: () => void = (): void => {};
  onLibrary: () => void = (): void => {};
  onPlayer: () => void = (): void => {};
  onModes: () => void = (): void => {};
  onQueue: (id: string) => void = (_id: string): void => {};
  @Builder private sourceCard(title: string, subtitle: string, symbol: Resource, action: () => void) {
    Column({ space: 12 }) {
      SymbolGlyph(symbol).fontSize(25).fontColor(['#48828E'])
      Column({ space: 5 }) {
        Text(title).fontSize(16).fontWeight(FontWeight.Medium).fontColor($r('app.color.text'))
        Text(subtitle).fontSize(11).fontColor($r('app.color.muted'))
      }.alignItems(HorizontalAlign.Start)
    }.alignItems(HorizontalAlign.Start).padding(18).layoutWeight(1).height(126)
    .backgroundColor($r('app.color.surface')).borderRadius(22).onClick(action)
  }
  @Builder private introduction() {
        Column({ space: 8 }) {
          Text('LYRICS REIMAGINED').fontSize(10).letterSpacing(3).fontColor('#48828E').fontWeight(FontWeight.Medium)
          Text('让音乐，\n成为眼前的风景。').fontSize(32).fontWeight(FontWeight.Bold).fontColor($r('app.color.text')).lineHeight(42)
          Text('FMusic · 辞曲新境').fontSize(13).fontColor($r('app.color.muted')).margin({ top: 3 })
        }.alignItems(HorizontalAlign.Start).width('100%').padding({ top: 8 })
  }
  @Builder private stageCard() {
        Stack({ alignContent: Alignment.BottomStart }) {
          Image($r('app.media.preview_fume')).width('100%').height(225).objectFit(ImageFit.Cover)
          Column({ space: 10 }) {
            Text('沉浸式歌词舞台').fontSize(11).fontColor('#DDE7E8').letterSpacing(1)
            Text(this.snapshot.title || '听见旋律，看见诗。').fontSize(25).fontWeight(FontWeight.Bold)
              .fontColor(Color.White).maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis })
            Row({ space: 7 }) {
              Text(this.snapshot.title ? '继续聆听' : '选择你的音乐').fontSize(13).fontColor(Color.White)
              SymbolGlyph($r('sys.symbol.arrow_right')).fontSize(15).fontColor([Color.White])
            }.margin({ top: 4 })
          }.alignItems(HorizontalAlign.Start).width('100%').padding(24)
          .linearGradient({ angle: 180, colors: [['#001D2732', 0], ['#DD1D2732', 1]] })
        }.height(225).width('100%').borderRadius(26).clip(true)
        .onClick(() => { if (this.snapshot.songId) this.onPlayer(); else this.onLibrary(); })
  }
  build() {
    Scroll() {
      Column({ space: 24 }) {
        if (this.compact) {
          Row({ space: 24 }) {
            Column() { this.introduction() }.layoutWeight(1).alignItems(HorizontalAlign.Start)
            Column() { this.stageCard() }.layoutWeight(2)
          }.width('100%')
        } else {
          this.introduction()
          this.stageCard()
        }
        Row({ space: 12 }) {
          this.sourceCard('本地音乐', `${this.snapshot.local.length} 首音乐 · 导入与聆听`, $r('sys.symbol.folder'), this.onImport)
          this.sourceCard('音乐资料库', '在线音源 · Navidrome', $r('sys.symbol.music'), this.onLibrary)
        }.width('100%')
        Row() {
          Column({ space: 6 }) {
            Text('每首歌，都有新的样子').fontSize(20).fontWeight(FontWeight.Bold).fontColor($r('app.color.text'))
            Text('14 种歌词动画 · 自定义背景与主题').fontSize(12).fontColor($r('app.color.muted'))
          }.alignItems(HorizontalAlign.Start).layoutWeight(1)
          SymbolGlyph($r('sys.symbol.arrow_right')).fontSize(19).fontColor(['#48828E'])
        }.width('100%').onClick(this.onModes)
        if (this.snapshot.queue.length > 0) {
          Column({ space: 4 }) {
            Row() {
              Text('正在聆听').fontSize(18).fontWeight(FontWeight.Bold).fontColor($r('app.color.text')).layoutWeight(1)
              Text(`${this.snapshot.queue.length} 首`).fontSize(12).fontColor($r('app.color.muted'))
            }.width('100%').padding({ bottom: 6 })
            ForEach(this.snapshot.queue.slice(0, 4), (item: TrackItem, index: number) => {
              TrackRow({ item, index, current: item.id === this.snapshot.songId, onPlay: this.onQueue })
            }, (item: TrackItem) => item.id)
          }.width('100%').padding(18).backgroundColor($r('app.color.surface')).borderRadius(24)
        }
        Text('把每一次聆听，留给音乐本身。').fontSize(11).fontColor($r('app.color.muted')).margin({ top: 4 })
      }.width('100%').constraintSize({ maxWidth: 1040 }).padding({ left: 20, right: 20,
        top: this.compact ? 12 : 106, bottom: this.compact ? 24 : 190 })
    }.scrollBar(BarState.Off).edgeEffect(EdgeEffect.Spring).width('100%').height('100%')
  }
}
