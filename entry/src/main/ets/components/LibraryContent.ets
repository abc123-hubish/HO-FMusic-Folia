import { FoliaSnapshot, TrackItem } from '../model/FoliaModel';
import { TrackRow } from './TrackRow';

// Native local catalogue with access to the complete original online and collection surfaces.
@Component
export struct LibraryContent {
  @Prop snapshot: FoliaSnapshot = new FoliaSnapshot();
  @Prop compact: boolean = false;
  @State query: string = '';
  onImport: () => void = (): void => {};
  onFullLibrary: () => void = (): void => {};
  onPlay: (id: string) => void = (_id: string): void => {};
  private visible(): TrackItem[] {
    const query = this.query.trim().toLowerCase();
    return this.snapshot.local.filter((item: TrackItem) => !query || `${item.title} ${item.artist} ${item.album}`.toLowerCase().includes(query));
  }
  build() {
    Column({ space: this.compact ? 10 : 18 }) {
      Row({ space: 10 }) {
        TextInput({ text: this.query, placeholder: '搜索本地歌曲、歌手、专辑' }).height(46).layoutWeight(1)
          .backgroundColor($r('app.color.surface')).borderRadius(16).onChange(value => { this.query = value; })
        Button('导入').height(44).fontSize(13).fontColor(Color.White).backgroundColor('#48828E').onClick(this.onImport)
      }.width('100%')
      Row({ space: 14 }) {
        SymbolGlyph($r('sys.symbol.music')).fontSize(24).fontColor(['#48828E'])
        Column({ space: 5 }) {
          Text('打开完整音乐资料库').fontSize(16).fontWeight(FontWeight.Medium).fontColor($r('app.color.text'))
          Text('易 / Q / 酷 / Navidrome · 歌单与收藏').fontSize(11).fontColor($r('app.color.muted'))
        }.alignItems(HorizontalAlign.Start).layoutWeight(1)
        SymbolGlyph($r('sys.symbol.arrow_right')).fontSize(17).fontColor(['#48828E'])
      }.width('100%').padding(this.compact ? 12 : 18).backgroundColor($r('app.color.surface')).borderRadius(22).onClick(this.onFullLibrary)
      Row() {
        Text('本地音乐').fontSize(22).fontWeight(FontWeight.Bold).fontColor($r('app.color.text')).layoutWeight(1)
        Text(`${this.snapshot.local.length} 首`).fontSize(12).fontColor($r('app.color.muted'))
      }.width('100%')
      if (this.snapshot.local.length === 0) {
        if (this.compact) {
          Row({ space: 14 }) {
            SymbolGlyph($r('sys.symbol.folder')).fontSize(35).fontColor(['#91ADB4'])
            Column({ space: 6 }) {
              Text('把喜欢的音乐带进来').fontSize(17).fontWeight(FontWeight.Medium).fontColor($r('app.color.text'))
              Text('选择音频及同名歌词文件，随时聆听').fontSize(12).fontColor($r('app.color.muted'))
            }.alignItems(HorizontalAlign.Start).layoutWeight(1)
            Button('导入音乐').fontColor(Color.White).backgroundColor('#48828E').onClick(this.onImport)
          }.width('100%').layoutWeight(1).padding({ left: 12, right: 12 })
        } else {
        Column({ space: 14 }) {
          SymbolGlyph($r('sys.symbol.folder')).fontSize(48).fontColor(['#91ADB4'])
          Text('把喜欢的音乐带进来').fontSize(18).fontWeight(FontWeight.Medium).fontColor($r('app.color.text'))
          Text('选择音频及同名歌词文件\n音乐会保存在应用内，随时聆听').fontSize(13).fontColor($r('app.color.muted'))
            .textAlign(TextAlign.Center).lineHeight(21)
          Button('导入音乐').fontColor(Color.White).backgroundColor('#48828E').margin({ top: 8 }).onClick(this.onImport)
        }.width('100%').layoutWeight(1).justifyContent(FlexAlign.Center)
        }
      } else {
        List() {
          ForEach(this.visible(), (item: TrackItem, index: number) => {
            ListItem() { TrackRow({ item, index, current: `local:${item.id}` === this.snapshot.songId, onPlay: this.onPlay }) }
          }, (item: TrackItem) => item.id)
        }.width('100%').layoutWeight(1).scrollBar(BarState.Off).edgeEffect(EdgeEffect.Spring)
      }
    }.width('100%').height('100%').padding({ left: 20, right: 20,
      top: this.compact ? 12 : 112, bottom: this.compact ? 12 : 180 })
  }
}
