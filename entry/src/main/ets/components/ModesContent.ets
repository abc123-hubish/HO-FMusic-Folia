import { LYRIC_MODES, LyricMode } from '../model/FoliaModel';

// Original preview assets and mode identities drive the existing Folia visualizer registry.
@Component
export struct ModesContent {
  @Prop selected: string = 'classic';
  @Prop compact: boolean = false;
  @State contentWidth: number = 380;
  onSelect: (id: string) => void = (_id: string): void => {};
  onPlayer: () => void = (): void => {};
  private preview(name: string): Resource {
    if (name === 'preview_fume') return $r('app.media.preview_fume');
    if (name === 'preview_lumi') return $r('app.media.preview_lumi');
    if (name === 'preview_diorama') return $r('app.media.preview_diorama');
    if (name === 'preview_tilt') return $r('app.media.preview_tilt');
    if (name === 'preview_cappella') return $r('app.media.preview_cappella');
    if (name === 'preview_pat') return $r('app.media.preview_pat');
    if (name === 'preview_cad') return $r('app.media.preview_cad');
    return $r('app.media.preview_pendolo');
  }
  @Builder private modeCard(mode: LyricMode) {
    Column({ space: 0 }) {
      Stack() {
        if (mode.preview.length > 0) {
          Image(this.preview(mode.preview)).width('100%').height(118).objectFit(ImageFit.Cover)
        } else {
          Column({ space: 6 }) {
            Text('FMusic').fontSize(24).fontWeight(FontWeight.Bold).fontColor('#E6EDF1').fontFamily('serif')
            Text(mode.title).fontSize(12).letterSpacing(2).fontColor('#E6EDF1')
          }.width('100%').height(118).justifyContent(FlexAlign.Center)
          .linearGradient({ angle: 135, colors: [[mode.color, 0], ['#283544', 1]] })
        }
        if (this.selected === mode.id) {
          Text('使用中').fontSize(10).fontColor(Color.White).padding({ left: 10, right: 10, top: 5, bottom: 5 })
            .backgroundColor('#48828E').borderRadius(20).position({ x: 10, y: 10 })
        }
      }.width('100%').height(118)
      Column({ space: 6 }) {
        Text(mode.title).fontSize(16).fontWeight(FontWeight.Bold).fontColor($r('app.color.text'))
        Text(mode.subtitle).fontSize(10).fontColor($r('app.color.muted')).maxLines(1)
      }.width('100%').alignItems(HorizontalAlign.Start).padding(14)
    }.width('100%').backgroundColor($r('app.color.surface')).borderRadius(20).clip(true)
      .border({ width: this.selected === mode.id ? 2 : 0, color: '#48828E' }).onClick(() => this.onSelect(mode.id))
  }
  build() {
    Scroll() {
      Column({ space: 18 }) {
        Column({ space: 7 }) {
          Text('辞曲的另一种表达').fontSize(27).fontWeight(FontWeight.Bold).fontColor($r('app.color.text'))
          Text('选择歌词动画，让每首歌拥有自己的舞台').fontSize(12).fontColor($r('app.color.muted'))
        }.width('100%').alignItems(HorizontalAlign.Start)
        Button('进入歌词舞台').width('100%').height(46).fontColor(Color.White).backgroundColor('#48828E').onClick(this.onPlayer)
        Grid() {
          ForEach(LYRIC_MODES, (mode: LyricMode) => { GridItem() { this.modeCard(mode) } }, (mode: LyricMode) => mode.id)
        }.columnsTemplate(this.contentWidth >= 700 ? '1fr 1fr 1fr' : '1fr 1fr').columnsGap(12).rowsGap(14).width('100%')
      }.padding({ left: 20, right: 20, top: this.compact ? 12 : 112,
        bottom: this.compact ? 24 : 190 }).width('100%').constraintSize({ maxWidth: 1000 })
    }.width('100%').height('100%').scrollBar(BarState.Off).edgeEffect(EdgeEffect.Spring)
      .onAreaChange((_old, area) => { this.contentWidth = Number(area.width); })
  }
}
