import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes, createHash } from 'node:crypto';
import vm from 'node:vm';

// Exercise the generated native protocol with synthetic upstream responses, never real account credentials.
let source = fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicRuntime.js', import.meta.url), 'utf8');
source = source.replace("import nativeUrl from '@ohos.url';", 'const nativeUrl = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
assert.ok(!/\b(?:require|__require)\(/.test(source), 'Native bundle must not require Node or platform modules dynamically');
const { createMusicRuntime } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const png = Buffer.from([137,80,78,71,13,10,26,10,0]);
const reply = (body, headers = [], status = 200) => ({ status, headers, body: (Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))).toString('base64') });
function runtime(provider, respond, saved = '') {
  let stored = saved;
  const calls = [];
  const api = createMusicRuntime(provider, async payload => {
    const input = JSON.parse(payload); calls.push(input);
    return JSON.stringify(await respond(input));
  }, () => stored, value => { stored = value; }, length => randomBytes(length).toString('base64'));
  return { calls, stored: () => stored,
    request: async (operation, params = {}) => JSON.parse(await api.request(operation, JSON.stringify(params))) };
}
test('KuGou QR generation works in ArkJS without browser TextEncoder, Buffer or fetch globals', async () => {
  const context = vm.createContext({ URL, URLSearchParams, setTimeout, clearTimeout });
  vm.runInContext(source.replace('export function createMusicRuntime', 'function createMusicRuntime'), context);
  assert.equal(vm.runInContext('typeof TextEncoder', context), 'undefined');
  assert.equal(vm.runInContext('typeof Buffer', context), 'undefined');
  assert.equal(vm.runInContext('typeof fetch', context), 'undefined');
  const api = context.createMusicRuntime('kugou', async () => JSON.stringify(reply({ status: 1, data: { qrcode: 'native-qr-test' } })),
    () => '', () => {}, length => randomBytes(length).toString('base64'));
  const result = JSON.parse(await api.request('login_qr_create', '{"key":"native-qr-test"}'));
  assert.equal(result.ok, true);
  const image = result.data.data.qrimg;
  assert.match(image, /^data:image\/svg\+xml;base64,/);
  const svg = Buffer.from(image.split(',')[1], 'base64').toString('utf8');
  assert.match(svg, /<svg[^>]+viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /<path d="M/);
});
test('QQ QR uses fresh qrsig, separate Set-Cookie headers, and its matching hash33 token', async () => {
  const api = runtime('qq', input => {
    const url = new URL(input.url);
    if (url.pathname === '/ptqrshow') return reply(png, [{ name: 'Set-Cookie', value: 'qrsig=fresh-qr; Domain=.qq.com; Path=/' }, { name: 'Set-Cookie', value: 'another=kept; Domain=.qq.com; Path=/' }]);
    assert.equal(url.pathname, '/ptqrlogin');
    assert.ok(input.headers.cookie.includes('qrsig=fresh-qr'));
    let token = 0; for (const c of 'fresh-qr') token += (token << 5) + c.charCodeAt(0);
    assert.equal(url.searchParams.get('ptqrtoken'), String(token & 2147483647));
    return reply("ptuiCB('66','0','','0','二维码未失效','');");
  });
  const key = (await api.request('login_qr_key', { channel: 'qq' })).data.data.unikey;
  assert.match((await api.request('login_qr_create', { key })).data.data.qrimg, /^data:image\/png;base64,/);
  assert.equal((await api.request('login_qr_check', { key })).data.code, 801);
  assert.equal(JSON.parse(api.stored()).cookies.some(c => c.name === 'another'), true);
});
test('QQ performs check_sig, OAuth code exchange and musicu login, then restores and logs out', async () => {
  const respond = input => {
    const url = new URL(input.url);
    if (url.pathname === '/ptqrshow') return reply(png, [{ name: 'set-cookie', value: 'qrsig=qr-session; Domain=.qq.com; Path=/' }]);
    if (url.pathname === '/ptqrlogin') return reply("ptuiCB('0','0','https://ssl.ptlogin2.qq.com/check_sig?uin=12345','0','登录成功！','Tester');");
    if (url.pathname === '/check_sig') return reply('', [{ name: 'set-cookie', value: 'p_skey=oauth-ticket; Domain=.qq.com; Path=/' }, { name: 'set-cookie', value: 'uin=o12345; Domain=.qq.com; Path=/' }]);
    if (url.pathname.includes('oauth2.0/authorize')) {
      assert.equal(new URLSearchParams(input.body).get('response_type'), 'code');
      assert.ok(input.headers.cookie.includes('p_skey=oauth-ticket'));
      return reply('', [{ name: 'location', value: 'https://y.qq.com/portal/wx_redirect.html?code=auth-code' }], 302);
    }
    if (input.body.includes('QQConnectLogin.LoginServer')) {
      assert.equal(JSON.parse(input.body).req.param.code, 'auth-code');
      return reply({ req: { data: { musickey: 'synthetic-music-secret', musicid: '98765' } } });
    }
    return reply({ code: 0, data: { creator: { nick: 'Tester' } } });
  };
  const api = runtime('qq', respond);
  const key = (await api.request('login_qr_key', { channel: 'qq' })).data.data.unikey;
  const result = await api.request('login_qr_check', { key });
  assert.equal(result.data.code, 803, JSON.stringify(result));
  assert.ok(api.stored().includes('synthetic-music-secret'));
  assert.ok(!JSON.stringify(result).includes('synthetic-music-secret'));
  const restored = runtime('qq', respond, api.stored());
  assert.equal((await restored.request('login_status')).data.data.profile.uin, '12345');
  await restored.request('logout');
  assert.ok(!restored.stored().includes('synthetic-music-secret'));
  assert.equal((await restored.request('login_status')).data.data.profile, null);
});
test('WeChat scan exchanges the confirmed code and uses str_musicid rather than zero musicid', async () => {
  const api = runtime('qq', input => {
    const url = new URL(input.url);
    if (url.pathname.endsWith('/qrconnect') && url.hostname === 'open.weixin.qq.com') return reply('<img src="/connect/qrcode/test-uuid" data="uuid=test-uuid"/>');
    if (url.pathname.includes('/connect/qrcode/')) return reply(png);
    if (url.hostname === 'lp.open.weixin.qq.com') return reply("window.wx_errcode=405;window.wx_code='wx-code'");
    const body = JSON.parse(input.body);
    assert.equal(body.req.module, 'music.login.LoginServer');
    assert.equal(body.req.param.code, 'wx-code');
    return reply({ req: { data: { musickey: 'wechat-secret', musicid: 0, str_musicid: '67890' } } });
  });
  const key = (await api.request('login_qr_key', { channel: 'wechat' })).data.data.unikey;
  assert.equal((await api.request('login_qr_check', { key })).data.code, 803);
  assert.ok(api.stored().includes('67890'));
  assert.ok(api.stored().includes('wechat-secret'));
  await api.request('logout');
  assert.ok(!api.stored().includes('wechat-secret'));
});
test('KuGou QR signs real protocol parameters and keeps account tokens native', async () => {
  const api = runtime('kugou', input => {
    const url = new URL(input.url), params = Object.fromEntries(url.searchParams);
    if (url.pathname === '/v2/qrcode' || url.pathname === '/v2/get_userinfo_qrcode') {
      const sign = params.signature; delete params.signature;
      const text = Object.keys(params).map(k => `${k}=${params[k]}`).sort().join('');
      assert.equal(sign, createHash('md5').update('NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt' + text + 'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt').digest('hex'));
      if (url.pathname === '/v2/qrcode') return reply({ status: 1, data: { qrcode: 'kg-qr' } });
      assert.equal(params.appid, '3116');
      assert.equal(input.timeoutMs, 45000);
      return reply({ status: 1, data: { status: 4, userid: '24680', token: 'kg-secret', nickname: 'Tester', vip_token: 'kg-vip-secret', vip_type: 6 } });
    }
    return reply({ status: 1, data: { userid: '24680', nickname: 'Tester', vip_type: 6 } });
  });
  assert.equal((await api.request('login_qr_key')).data.key, 'kg-qr');
  assert.match((await api.request('login_qr_create', { key: 'kg-qr' })).data.data.qrimg, /^data:image\/svg\+xml;base64,/);
  const result = await api.request('login_qr_check', { key: 'kg-qr' });
  assert.equal(result.data.status, 4);
  assert.ok(api.stored().includes('kg-secret'));
  assert.ok(!JSON.stringify(result).includes('kg-secret'));
  assert.ok(!JSON.stringify(result).includes('kg-vip-secret'));
  const restored = runtime('kugou', () => reply({ status: 1, data: {} }), api.stored());
  assert.equal((await restored.request('user_detail')).data.data.user_info.userid, '24680');
  await restored.request('logout');
  assert.ok(!restored.stored().includes('kg-secret'));
  assert.equal((await restored.request('user_detail')).data.data.user_info.userid, '');
});
test('unknown operations and injected credentials cannot dispatch', async () => {
  const api = runtime('qq', () => { throw new Error('Unexpected network request'); });
  assert.equal((await api.request('arbitrary_url')).error.code, 'unsupported');
  assert.equal((await api.request('login_status', { cookie: 'injected' })).ok, false);
  assert.equal(api.calls.length, 0);
});
test('WeChat phone cancellation is terminal rather than returning to waiting', async () => {
  const api = runtime('qq', input => {
    const url = new URL(input.url);
    if (url.hostname === 'lp.open.weixin.qq.com') return reply("window.wx_errcode=403;window.wx_code=''");
    if (url.pathname.includes('/connect/qrcode/')) return reply(png);
    return reply('uuid=cancel-uuid"');
  });
  const key = (await api.request('login_qr_key', {channel:'wechat'})).data.data.unikey;
  const result = await api.request('login_qr_check',{key});
  assert.equal(result.data.code,800);
  assert.equal(result.data.failureReason,'user-canceled');
});
test('KuGou waiting, scanned and expired states preserve the upstream state', async () => {
  let status = 1;
  const api = runtime('kugou', () => reply({status:1,data:{status}}));
  for (const next of [1,2,0]) {
    status=next;
    const result=await api.request('login_qr_check',{key:'test-qr'});
    assert.equal(result.data.status,next);
    assert.equal(result.data.loggedIn,false);
  }
});
test('QQ search and word-timed lyrics retain their exact public request body and response', async () => {
  const api=runtime('qq',input=>{
    assert.equal(new URL(input.url).hostname,'u.y.qq.com');
    const body=JSON.parse(input.body);
    assert.equal(body.request.param.qrc,1);
    assert.equal(body.request.param.singerName,'encoded-name');
    return reply({code:0,request:{code:0,data:{lyric:'encrypted-qrc',trans:'encrypted-trans',roma:'encrypted-roma'}}});
  });
  const payload=JSON.stringify({comm:{ct:11},request:{module:'music.musichallSong.PlayLyricInfo',method:'GetPlayLyricInfo',param:{qrc:1,singerName:'encoded-name'}}});
  const result=await api.request('lyric_request',{payload});
  assert.equal(result.data.request.data.lyric,'encrypted-qrc');
  assert.equal(result.data.request.data.roma,'encrypted-roma');
  assert.equal((await api.request('lyric_request',{payload:'{"request":{"module":"arbitrary","method":"write"}}'})).ok,false);
  assert.equal(api.calls.length,1);
});
test('separate QQ and KuGou runtimes cannot share cookies or persistent state', async () => {
  const qq=runtime('qq',()=>reply(png,[{name:'set-cookie',value:'qrsig=only-qq; Domain=.qq.com; Path=/'}]));
  const kg=runtime('kugou',()=>reply({status:1,data:{qrcode:'only-kg'}}));
  await Promise.all([qq.request('login_qr_key',{channel:'qq'}),kg.request('login_qr_key')]);
  assert.ok(qq.stored().includes('only-qq'));
  assert.ok(!kg.stored().includes('only-qq'));
  assert.equal((await qq.request('login_channels')).data.data.channels.length,2);
});
