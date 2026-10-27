import fs from 'node:fs';
import { randomBytes } from 'node:crypto';

// Read-only live QR creation probe. Stores only availability metadata, never QR tickets or account secrets.
let source = fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicRuntime.js', import.meta.url),'utf8');
source = source.replace("import nativeUrl from '@ohos.url';", 'const nativeUrl = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
const { createMusicRuntime } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const results = [];
for (const [provider,channel] of [['qq','qq'],['qq','wechat'],['kugou','kugou']]) {
  let state = '';
  const statuses = [];
  const api = createMusicRuntime(provider, async payload => {
    const input = JSON.parse(payload), url = new URL(input.url);
    const response = await fetch(url,{ method: input.method, headers: input.headers, body: input.body || undefined,
      redirect: 'manual', signal: AbortSignal.timeout(input.timeoutMs) });
    statuses.push({ host: url.hostname, path: url.pathname.replace(/\/connect\/qrcode\/.+/, '/connect/qrcode/<uuid>'), status: response.status });
    const headers = [...response.headers].filter(([k]) => k !== 'set-cookie').map(([name,value]) => ({name,value}));
    headers.push(...response.headers.getSetCookie().map(value => ({name:'set-cookie',value})));
    return JSON.stringify({status:response.status,headers,body:Buffer.from(await response.arrayBuffer()).toString('base64')});
  },() => state,value => {state=value;},length => randomBytes(length).toString('base64'));
  const key = JSON.parse(await api.request('login_qr_key',JSON.stringify(provider === 'qq' ? {channel} : {})));
  const value = provider === 'qq' ? key.data?.data?.unikey : key.data?.key;
  const created = value ? JSON.parse(await api.request('login_qr_create',JSON.stringify({key:value}))) : null;
  const image = created?.data?.data?.qrimg || '';
  results.push({provider,channel,keyCreated:Boolean(value),qrCreated:image.startsWith('data:image/'),
    requests:statuses,error:key.ok && value ? '' : key.error?.message || key.data?.message || 'No QR key'});
}
const result={at:new Date().toISOString(),realAccountLoginTested:false,results};
fs.writeFileSync(new URL('../verification/native-music-login-20261016/live-qr-checks.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
