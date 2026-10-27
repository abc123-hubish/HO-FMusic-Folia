// UI snapshots contain display data only. Music identities and provider credentials remain in Folia.
export class TrackItem {
  id: string = '';
  title: string = '';
  artist: string = '';
  album: string = '';
}

export class FoliaSnapshot {
  ready: boolean = false;
  view: string = 'home';
  settings: boolean = false;
  mode: string = 'classic';
  title: string = '';
  artist: string = '';
  cover: string = '';
  songId: string = '';
  playing: boolean = false;
  position: number = 0;
  duration: number = 0;
  lyricLines: number = 0;
  queue: TrackItem[] = [];
  local: TrackItem[] = [];
  results: TrackItem[] = [];
  searching: boolean = false;
  searchError: string = '';
}

export const DEFAULT_NETEASE_API_BASE: string = 'http://106.14.205.179:1000';

export class ApiConfig {
  server: string = '';
  aiProvider: string = 'gemini';
  netease: string = DEFAULT_NETEASE_API_BASE;
  kugou: string = '';
  qq: string = '';
}

export class NativeMusicFile {
  id: string = '';
  name: string = '';
  size: number = 0;
  modified: number = 0;
  mime: string = '';
  url: string = '';
  path: string = '';
  relativePath: string = '';
}

export class HostCommand {
  action: string = '';
  id: string = '';
  query: string = '';
  source: string = '';
  section: string = '';
}

export interface LyricMode {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  color: string;
}

export const LYRIC_MODES: LyricMode[] = [
  { id: 'classic', title: '流光', subtitle: '让每一句，被认真听见', preview: '', color: '#667C8A' },
  { id: 'fume', title: '浮名', subtitle: '文字在光影中轻轻浮现', preview: 'preview_fume', color: '#817B9B' },
  { id: 'lumiere', title: '绘光', subtitle: '与旋律一起，流向远方', preview: 'preview_lumi', color: '#9A7B65' },
  { id: 'diorama', title: '镜台', subtitle: '在立体空间里遇见音乐', preview: 'preview_diorama', color: '#6A8F96' },
  { id: 'tilt', title: '倾诉', subtitle: '沿着文字，拾级而上', preview: 'preview_tilt', color: '#829C8A' },
  { id: 'cappella', title: '群唱', subtitle: '让声音汇成一片星海', preview: 'preview_cappella', color: '#76859D' },
  { id: 'partita', title: '云阶', subtitle: '每一个字，都有自己的节奏', preview: 'preview_pat', color: '#927D8E' },
  { id: 'cadenza', title: '心象', subtitle: '像一场只属于你的演出', preview: 'preview_cad', color: '#847A6D' },
  { id: 'pendolo', title: '时计', subtitle: '在时间的摆动中聆听', preview: 'preview_pendolo', color: '#738C88' },
  { id: 'sonnet', title: '商籁', subtitle: '把旋律写成诗', preview: '', color: '#858DAB' },
  { id: 'claddagh', title: '回环', subtitle: '文字与旋律交织', preview: '', color: '#A08D77' },
  { id: 'monet', title: '莫奈', subtitle: '光与色的印象', preview: '', color: '#7A998B' },
  { id: 'still', title: '静止', subtitle: '留一段安静给音乐', preview: '', color: '#8C9AA6' },
  { id: 'tempera', title: '凝彩', subtitle: '一幅流动的歌词画作', preview: '', color: '#A17E77' }
];
