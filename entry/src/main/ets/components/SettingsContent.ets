import { ApiConfig } from '../model/FoliaModel';

// Native platform preferences complement Folia's complete feature settings.
@Component
export struct SettingsContent {
  @Prop config: ApiConfig = new ApiConfig();
  @Prop compact: boolean = false;
  @State netease: string = '';
  @State kugou: string = '';
  @State qq: string = '';
  @State editing: boolean = false;
  onSave: (config: ApiConfig) => void = (_config: ApiConfig): void => {};
  onSection: (section: string) => void = (_section: string): void => {};
  @Builder private settingRow(title: string, detail: string, section: string) {
    Row({ space: 12 }) {
      Column({ space: 6 }) {
        Text(title).fontSize(16).fontColor($r('app.color.text')).fontWeight(FontWeight.Medium)
        Text(detail).fontSize(11).fontColor($r('app.color.muted'))
      }.alignItems(HorizontalAlign.Start).layoutWeight(1)
      SymbolGlyph($r('sys.symbol.arrow_right')).fontSize(16).fontColor([$r('app.color.muted')])
    }.width('100%').padding({ left: 18, right: 18, top: 19, bottom: 19 }).onClick(() => this.onSection(section))
  }
  build() {
    Scroll() {
      Column({ space: 22 }) {
        Row({ space: 17 }) {
          Image($r('app.media.folia_icon')).width(66).height(66).borderRadius(19)
          Column({ space: 6 }) {
            Text('FMusic').fontSize(29).fontWeight(FontWeight.Bold).fontColor($r('app.color.text'))
            Text('辞曲新境 · HarmonyOS').fontSize(12).fontColor($r('app.color.muted'))
            Text('上游 0.7.17').fontSize(10).fontColor('#48828E')
          }.alignItems(HorizontalAlign.Start)
        }.width('100%').padding({ top: 5, bottom: 8 })
        Column({ space: 0 }) {
          this.settingRow('外观与主题', '配色、字体、AI 主题与视觉配置', 'appearance')
          Divider().color($r('app.color.divider')).margin({ left: 18, right: 18 })
          this.settingRow('播放与音效', '音质、均衡器、响度、过渡与定时关闭', 'playback')
          Divider().color($r('app.color.divider')).margin({ left: 18, right: 18 })
          this.settingRow('歌词动画', '14 种动画、背景、字幕与逐字效果', 'visualizer')
          Divider().color($r('app.color.divider')).margin({ left: 18, right: 18 })
          this.settingRow('连接与集成', 'Navidrome、AI、外部歌词源', 'integration')
          Divider().color($r('app.color.divider')).margin({ left: 18, right: 18 })
          this.settingRow('存储与同步', '缓存、主题同步、配置导入导出', 'storage')
        }.width('100%').backgroundColor($r('app.color.surface')).borderRadius(24)
        Column({ space: 14 }) {
          Row() {
            Column({ space: 6 }) {
              Text('在线音源服务').fontSize(17).fontWeight(FontWeight.Bold).fontColor($r('app.color.text'))
              Text('填写你部署的音乐 API 地址').fontSize(11).fontColor($r('app.color.muted'))
            }.alignItems(HorizontalAlign.Start).layoutWeight(1)
            Button(this.editing ? '收起' : '配置').fontSize(12).height(33).fontColor('#48828E')
              .backgroundColor($r('app.color.soft_surface')).onClick(() => {
                this.editing = !this.editing;
                if (this.editing) { this.netease = this.config.netease; this.kugou = this.config.kugou;
                  this.qq = this.config.qq; }
              })
          }.width('100%')
          if (this.editing) {
            TextInput({ text: this.netease, placeholder: '易 API · https://…' }).height(46).fontSize(13).onChange(value => { this.netease = value; })
            TextInput({ text: this.kugou, placeholder: '酷 API · https://…' }).height(46).fontSize(13).onChange(value => { this.kugou = value; })
            TextInput({ text: this.qq, placeholder: 'Q API · https://…' }).height(46).fontSize(13).onChange(value => { this.qq = value; })
            Button('保存并应用').width('100%').height(43).fontColor(Color.White).backgroundColor('#48828E')
              .onClick(() => this.onSave({ server: this.config.server || '', aiProvider: this.config.aiProvider || 'gemini',
                netease: this.netease.trim().replace(/\/$/, ''),
                kugou: this.kugou.trim().replace(/\/$/, ''), qq: this.qq.trim().replace(/\/$/, '') }))
          }
        }.width('100%').padding(20).backgroundColor($r('app.color.surface')).borderRadius(24)
        Column({ space: 8 }) {
          Text('FMusic · Lyrics Reimagined').fontSize(12).fontColor($r('app.color.muted'))
          Text('基于 chthollyphile/folia-major · AGPL-3.0').fontSize(10).fontColor($r('app.color.muted'))
        }.margin({ top: 4 })
      }.padding({ left: 20, right: 20, top: this.compact ? 12 : 112,
        bottom: this.compact ? 24 : 190 }).width('100%').constraintSize({ maxWidth: 960 })
    }.width('100%').height('100%').scrollBar(BarState.Off).edgeEffect(EdgeEffect.Spring)
  }
}
