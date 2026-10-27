import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

// Execute the actual ArkTS media adapter with SDK-shaped HTTP/WebResourceResponse doubles.
const code=stripTypeScriptTypes(fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicMedia.ets',import.meta.url),'utf8')
  .replace("import { http } from '@kit.NetworkKit';",''))
  .replace('export class MusicMedia','class MusicMedia')+'\nMusicMedia;';
function adapter(respond) {
  const calls=[];let destroyed=0;
  class Response {
    constructor(){this.ready=new Promise(resolve=>{this.resolve=resolve;});}
    setResponseIsReady(value){if(value)this.resolve();}
    setResponseEncoding(value){this.encoding=value;}
    setResponseMimeType(value){this.mime=value;}
    setResponseData(value){this.data=value;}
    setResponseCode(value){this.status=value;}
    setReasonMessage(value){this.reason=value;}
    setResponseHeader(value){this.headers=value;}
  }
  const http={RequestMethod:{GET:'GET',HEAD:'HEAD'},HttpDataType:{ARRAY_BUFFER:2},createHttp:()=>({
    async request(url,options){calls.push({url,...options});return respond(url,options);},destroy(){destroyed++;}
  })};
  const Media=vm.runInNewContext(code,{http,WebResourceResponse:Response});
  return {media:new Media(),calls,destroyed:()=>destroyed};
}
const request=(method,headers=[])=>({getRequestMethod:()=>method,getRequestHeader:()=>headers});
test('native audio uses valid SDK size limits, forwards Range and exposes partial-content headers',async()=>{
  const {media,calls}=adapter(()=>({responseCode:206,result:new Uint8Array([1,2,3]).buffer,
    header:{'Content-Type':'audio/mpeg','Content-Range':'bytes 0-2/100','Accept-Ranges':'bytes'}}));
  const url='https://ws.stream.qqmusic.qq.com/media.mp3?vkey=issued';media.register('qq',url);
  const response=media.intercept(url,request('GET',[{headerKey:'Range',headerValue:'bytes=0-2'},{headerKey:'If-Range',headerValue:'etag'}]));
  await response.ready;
  assert.equal(calls[0].header.Range,'bytes=0-2');assert.equal(calls[0].header['If-Range'],'etag');
  assert.ok(calls[0].maxLimit>0&&calls[0].maxLimit<=100*1024*1024,'SDK http.maxLimit must be at most 100 MiB');
  assert.equal(response.status,206);assert.equal(response.mime,'audio/mpeg');
  assert.ok(response.headers.some(item=>item.headerKey==='Content-Range'&&item.headerValue==='bytes 0-2/100'));
  assert.ok(response.headers.some(item=>item.headerKey==='Access-Control-Allow-Origin'&&item.headerValue==='*'));
});
test('artwork preflight is answered locally and unrelated domains or write methods are not intercepted',async()=>{
  const {media,calls}=adapter(()=>{throw new Error('Unexpected network request');});
  const response=media.intercept('https://c1.kgimg.com/stdmusic/1024/cover.jpg',request('OPTIONS'));await response.ready;
  assert.equal(response.status,204);assert.equal(calls.length,0);
  assert.equal(media.intercept('https://unrelated.example/track.mp3',request('GET')),undefined);
  assert.equal(media.intercept('https://c1.kgimg.com/cover.jpg',request('POST')),undefined);
});
test('KuGou native media fetch preserves the issued HTTP URL after ArkWeb upgrades its scheme',async()=>{
  const {media,calls}=adapter(()=>({responseCode:206,result:new Uint8Array([1,2,3]).buffer,
    header:{'Content-Type':'audio/mpeg','Content-Range':'bytes 0-2/100'}}));
  const original='http://fs.youthandroid2.kugou.com/path/song.mp3?key=issued';
  media.register('kugou',original);
  const response=media.intercept(original.replace('http:','https:'),request('GET',[{headerKey:'Range',headerValue:'bytes=0-2'}]));
  await response.ready;
  assert.equal(calls[0].url,original);assert.equal(calls[0].header.Range,'bytes=0-2');assert.equal(response.status,206);
});
test('failed media requests finish with a readable CORS response and release native handles',async()=>{
  const {media,destroyed}=adapter(()=>{throw new Error('Connection failed');});
  const response=media.intercept('https://fs.kugou.com/track.mp3',request('GET'));await response.ready;
  assert.equal(response.status,502);assert.equal(destroyed(),1);
  assert.ok(response.headers.some(item=>item.headerKey==='Access-Control-Allow-Origin'));
});
