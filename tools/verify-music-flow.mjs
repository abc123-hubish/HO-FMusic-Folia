import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes, createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import vm from 'node:vm';

// Exercise the shipped native bundle in an ArkJS-like environment with synthetic account responses.
const source = fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicRuntime.js', import.meta.url),'utf8')
  .replace("import nativeUrl from '@ohos.url';", 'const nativeUrl = { URL, URLParams: URLSearchParams };')
  .replace('export function createMusicRuntime', 'function createMusicRuntime');
const reply = (body, status = 200) => JSON.stringify({ status, headers: [], body: Buffer.from(JSON.stringify(body)).toString('base64') });
function native(provider, respond, cookies = {}) {
  const context = vm.createContext({ URL, URLSearchParams, setTimeout, clearTimeout });
  vm.runInContext(source, context);
  let saved = JSON.stringify({ cookies: Object.entries(cookies).map(([name,value]) => ({ name,value,domain: provider === 'qq' ? '.qq.com' : '.kugou.com',path:'/' })), storage: { kgPlatformMigration: 'lite-v1' } });
  const calls = [];
  const api = context.createMusicRuntime(provider, async payload => { const input = JSON.parse(payload); calls.push(input); return respond(input); },
    () => saved, value => { saved = value; }, length => randomBytes(length).toString('base64'));
  return { calls, saved: () => saved, request: async (op, params = {}) => JSON.parse(await api.request(op, JSON.stringify(params))) };
}
const kgCookies = { userid:'24680',KugooID:'24680',token:'synthetic-account-token',vip_token:'synthetic-vip-token',vip_type:'0' };
const qqCookies = { uin:'o12345',qqmusic_uin:'12345',qqmusic_key:'synthetic-qq-key',qm_keyst:'synthetic-qq-key' };

test('KuGou authorized playback signs both requests and keeps stream authorization in native memory',async()=>{
  const media='http://fs.youthandroid2.kugou.com/authorized.mp3?key=issued';
  const api=native('kugou',input=>{
    const url=new URL(input.url),params=Object.fromEntries(url.searchParams),signature=params.signature;
    delete params.signature;
    const digest=value=>createHash('md5').update(value).digest('hex');
    const secret='LnT6xpN3khm36zse0QzvmgTZ3waWdRSA';
    assert.equal(signature,digest(secret+Object.keys(params).sort().map(key=>`${key}=${params[key]}`).join('')+secret));
    assert.equal(params.token,'synthetic-account-token');assert.equal(params.userid,'24680');
    assert.equal(params.clientver,'11561');assert.equal(params.hash,'abc');assert.equal(params.album_audio_id,'66');
    if(url.pathname==='/v1/authorization')return reply({status:1,error_code:0,data:{auth:'synthetic-song-authorization',open_time:1787673734}});
    assert.equal(url.pathname,'/tracker/v5/url');assert.equal(url.hostname,'gateway.kugou.com');
    assert.equal(input.headers['x-router'],undefined);assert.equal(params.auth,'synthetic-song-authorization');
    assert.equal(params.quality,'320');
    assert.equal(params.key,digest(`abc185672dd44712f60bb1736df5a377e823116${params.mid}24680`));
    return reply({status:1,error_code:0,url:[media]});
  },kgCookies);
  const result=await api.request('song_url',{hash:'ABC',album_id:'5',album_audio_id:'66',quality:'320'});
  assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.data.source,'authorized-v5');
  assert.equal(result.data.data.play_url,media);assert.equal(result.data.data.level,'exhigh');assert.deepEqual(Array.from(result.media),[media]);
  assert.equal(api.calls.length,2);assert.ok(!JSON.stringify(result).includes('synthetic-song-authorization'));
  assert.ok(!JSON.stringify(result).includes('synthetic-account-token'));
});
test('KuGou rejected song authorization retains the pinned Android playback fallback',async()=>{
  const media='https://fs.kugou.com/compatible.mp3';
  const api=native('kugou',input=>{
    const url=new URL(input.url);
    if(url.pathname==='/v1/authorization')return reply({status:0,error_code:152});
    if(url.pathname==='/app/i/getSongInfo.php')return reply({url:media});
    if(url.pathname==='/v5/url')return reply({status:3});
    return reply({status:1,error_code:0,data:{userid:'24680',token:'synthetic-account-token',vip_token:'synthetic-vip-token'}});
  },kgCookies);
  const result=await api.request('song_url',{hash:'ABC',quality:'128'});
  assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.data.data.play_url,media);
  assert.equal(api.calls.filter(input=>input.url.includes('/v1/authorization')).length,1);
  assert.ok(!api.calls.some(input=>input.url.includes('/tracker/v5/url')));
});

test('KuGou search retains artists, album, duration and quality hashes and does not invent a total', async () => {
  const api = native('kugou', () => reply({ status:1,data:{ lists:[{ FileHash:'abc',SongName:'歌曲',SingerName:'歌手',AlbumName:'专辑',AlbumID:'55',MixSongID:'66',Duration:180,HQFileHash:'hq',SQFileHash:'sq' }] } }));
  const result = await api.request('search',{ keywords:'歌曲',pagesize:50,page:2 });
  assert.equal(result.ok,true); const song=result.data.data.lists[0];
  assert.equal(song.SingerName,'歌手'); assert.equal(song.AlbumName,'专辑');
  assert.equal(song.Duration,180); assert.equal(song.album_audio_id,'66'); assert.equal(song.HQFileHash,'hq');
  assert.equal(result.data.data.total,undefined);
  assert.equal(new URL(api.calls[0].url).searchParams.get('pagesize'),'50');
});
test('QQ song detail retains numeric song identity, media id, album and milliseconds', async () => {
  const api = native('qq', () => reply({ songinfo:{ data:{track_info:{id:901,mid:'songmid',name:'歌曲',singer:[{id:8,mid:'artistmid',name:'歌手'}],album:{mid:'albummid',name:'专辑'},interval:180,file:{media_mid:'mediamid'}}} } }));
  const result=await api.request('song_info',{songmid:'songmid'}); const song=result.data.response.songinfo.data.track_info;
  assert.equal(song.id,'901'); assert.equal(song.durationMs,180000); assert.equal(song.mediaMid,'mediamid');
  assert.equal(song.album.mid,'albummid'); assert.equal(song.singer[0].name,'歌手');
});
test('QQ account credentials reach the vkey service and only the issued media URL crosses into ArkWeb', async () => {
  const api=native('qq', input => {
    const body=JSON.parse(input.body);
    if (body.songinfo) return reply({songinfo:{data:{track_info:{id:901,mid:'songmid',file:{media_mid:'media'},interval:180}}}});
    assert.equal(body.comm.authst,'synthetic-qq-key'); assert.match(input.headers.cookie,/synthetic-qq-key/);
    return reply({req_0:{data:{sip:['https://ws.stream.qqmusic.qq.com/'],midurlinfo:[{filename:'M500media.mp3',purl:'M500media.mp3?vkey=issued'}]}}});
  },qqCookies);
  const result=await api.request('music_play',{songmid:'songmid',mediaId:'media',quality:'128'});
  assert.match(result.data.data.playUrl.songmid.url,/vkey=issued/);
  assert.ok(result.media.includes(result.data.data.playUrl.songmid.url));
  assert.ok(!JSON.stringify(result).includes('synthetic-qq-key'));
});
test('KuGou own playlist pagination preserves fileid and does not repeat page one', async () => {
  const api=native('kugou', input => {
    assert.equal(new URL(input.url).pathname,'/v4/get_list_all_file_v3');
    const body=JSON.parse(input.body); assert.equal(body.token,'synthetic-account-token');
    return reply({status:1,error_code:0,data:{info:[{hash:'hash'+body.page,fileid:100+body.page,filename:'歌手 - 歌曲'}],count:2}});
  },kgCookies);
  const first=await api.request('playlist_track_all',{id:'collection_3_24680_9_0',page:1,pagesize:1});
  const next=await api.request('playlist_track_all',{id:'collection_3_24680_9_0',page:2,pagesize:1});
  assert.equal(first.data.data.info[0].fileid,101); assert.equal(next.data.data.info[0].hash,'hash2');
});
test('KuGou requests KRC and decrypts word timings without DecompressionStream or TextDecoder globals', async () => {
  const text='[0,2000]<0,1000,0>测试<1000,1000,0>歌词';
  const key=[64,71,97,119,94,50,116,71,81,54,49,45,206,210,110,105];
  const data=deflateSync(Buffer.from(text)); for(let i=0;i<data.length;i++) data[i]^=key[i%16];
  const api=native('kugou',input=>{
    assert.equal(new URL(input.url).searchParams.get('fmt'),'krc');
    return reply({status:200,content:Buffer.concat([Buffer.from('krc1'),data]).toString('base64')});
  });
  const result=await api.request('lyric',{id:'1',accesskey:'candidate-key',fmt:'krc',decode:true});
  assert.equal(result.data.decodeContent,text); assert.equal(api.calls.length,1);
});
test('KuGou recommendations dispatch real signed requests instead of returning placeholder arrays', async () => {
  const api=native('kugou',input=>{
    assert.match(input.url,/gateway\.kugou\.com\/everyday_song_recommend/);
    assert.ok(input.headers.cookie.includes('synthetic-account-token'));
    return reply({status:1,error_code:0,data:{songs:[{hash:'recommended',songname:'日推'}]}});
  },kgCookies);
  const result=await api.request('everyday_recommend');
  assert.equal(result.data.data.songs[0].hash,'recommended'); assert.equal(api.calls.length,1);
});
test('KuGou song details use metadata and do not resolve a stream merely to display the song', async () => {
  const api=native('kugou',()=>reply({hash:'abc',songName:'歌曲',singerName:'歌手',albumid:'5',mixsongid:'6',timeLength:180,imgUrl:'https://c1.kgimg.com/a.jpg'}));
  const result=await api.request('audio',{hash:'abc'});
  assert.equal(result.data.data.SongName,'歌曲'); assert.equal(result.data.data.SingerName,'歌手');
  assert.equal(result.data.data.cover,'https://c1.kgimg.com/a.jpg');
  assert.equal(api.calls.length,1); assert.match(api.calls[0].url,/getSongInfo\.php/);
});
test('a QR long poll does not block search and logout discards the late response', async () => {
  let finish, started;
  const waiting=new Promise(resolve=>{started=resolve;});
  const api=native('kugou',input=>{
    if(input.url.includes('get_userinfo_qrcode')){started();return new Promise(resolve=>{finish=resolve;});}
    return reply({status:1,data:{lists:[{FileHash:'abc',SongName:'歌曲'}]}});
  });
  const poll=api.request('login_qr_check',{key:'pending'}); await waiting;
  const search=await api.request('search',{keywords:'歌曲'}); assert.equal(search.ok,true);
  await api.request('logout');
  finish(reply({status:1,data:{status:4,userid:'late',token:'late-secret'}})); await poll;
  assert.ok(!api.saved().includes('late-secret'));
});
test('KuGou business failures do not masquerade as successful playlist writes', async () => {
  const api=native('kugou',()=>reply({status:0,error_code:20028,data:{}}),kgCookies);
  const result=await api.request('playlist_tracks_del',{listid:'9',fileids:'123'});
  assert.equal(result.ok,false); assert.match(result.error.message,/20028/);
});
test('QQ recommendations generate a persistent native device identity without browser crypto globals', async () => {
  const api=native('qq',input=>{
    if(input.url.includes('tencentmusic.com')) return reply({});
    const body=JSON.parse(input.body); assert.equal(body.req_0.method,'get_radio_track');
    assert.match(body.comm.OpenUDID,/^[0-9a-f]{32}$/); assert.equal(body.comm.authst,'synthetic-qq-key');
    return reply({code:0,req_0:{code:0,data:{tracks:[{id:901,mid:'mid',name:'推荐'}]}}});
  },qqCookies);
  const result=await api.request('user_guess_you_like');
  assert.equal(result.ok,true,JSON.stringify(result)); assert.equal(result.data.songs[0].name,'推荐');
  assert.ok(api.saved().includes('openUdid')); assert.ok(!JSON.stringify(result).includes('synthetic-qq-key'));
});
test('KuGou cloud sends encrypted bytes and performs RSA padding with native randomness', async () => {
  const api=native('kugou',input=>{
    assert.equal(new URL(input.url).hostname,'mcloudservice.kugou.com');
    assert.equal(input.bodyBase64,true); assert.equal(Buffer.from(input.body,'base64').length%16,0);
    return reply({});
  },kgCookies);
  const result=await api.request('user_cloud',{page:1,pagesize:30});
  assert.equal(api.calls.length,1); assert.equal(result.ok,false); // Deliberately invalid encrypted server response.
});
test('KuGou library preserves collection ids, covers and mixed album rows before paging', async()=>{
  const api=native('kugou',input=>{
    if(input.url.includes('get_all_list')) return reply({status:1,error_code:0,data:{info:[
      {listid:9,name:'我喜欢',global_collection_id:'collection_3_24680_9_0',type:0,img:'https://c1.kgimg.com/a.jpg',count:1},
      {listid:10,name:'收藏专辑',global_collection_id:'collection_3_24680_10_0',type:1,musiclib_id:55,source:2,img:'https://c1.kgimg.com/b.jpg',count:2}
    ]}});
    return reply({status:1,error_code:0,data:{userid:'24680',token:'synthetic-app-token',vip_token:'synthetic-vip-token'}});
  },kgCookies);
  const first=await api.request('user_playlist',{page:1,pagesize:1});
  const next=await api.request('user_playlist',{page:2,pagesize:1});
  assert.equal(first.ok,true,JSON.stringify(first)); assert.equal(first.data.data.lists[0].global_collection_id,'collection_3_24680_9_0');
  assert.equal(first.data.data.lists[0].img,'https://c1.kgimg.com/a.jpg');
  assert.equal(next.data.data.lists[0].musiclib_id,55); assert.equal(next.data.data.lists[0].source,2);
});
