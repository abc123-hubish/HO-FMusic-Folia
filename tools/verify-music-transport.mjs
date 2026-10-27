import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';
import { randomBytes } from 'node:crypto';

// Execute the real ArkTS network adapters, including HarmonyOS's rejection of empty Base64 input.
const read=name=>fs.readFileSync(new URL('../entry/src/main/ets/services/music/'+name,import.meta.url),'utf8');
const runtime=read('MusicRuntime.js').replace("import nativeUrl from '@ohos.url';",'const nativeUrl={URL,URLParams:URLSearchParams};').replace('export function createMusicRuntime','function createMusicRuntime');
const adapter=name=>stripTypeScriptTypes(read(name+'.ets').replace(/^import .*;\r?\n/gm,'')).replace('export class '+name,'class '+name)+'\n'+name+';';
const util={Base64Helper:class{
  encodeToStringSync(bytes){if(!bytes?.length)throw new Error('Parameter error. The type of Parameter must be Uint8Array and the length greater than zero.');return Buffer.from(bytes).toString('base64');}
  decodeSync(value){if(!value)throw new Error('Cannot decode empty base64');return Uint8Array.from(Buffer.from(value,'base64'));}
},TextEncoder};
const json=data=>({statusCode:200,headers:{},body:Uint8Array.from(Buffer.from(JSON.stringify(data))).buffer});
function service(respond){
  const calls=[],sessions=new Map();
  class Request{constructor(url,method,headers,body){Object.assign(this,{url,method,headers,body});}}
  class MusicSession{constructor(provider){this.provider=provider;}read(){return sessions.get(this.provider)||'';}write(value){sessions.set(this.provider,value);}}
  const context=vm.createContext({URL,URLSearchParams,setTimeout,clearTimeout,util,MusicSession,
    MusicMedia:class{register(){}release(){}},MusicSockets:class{release(){}},
    cryptoFramework:{createRandom:()=>({generateRandomSync:length=>({data:randomBytes(length)})})},
    rcp:{Request,createSession:()=>({fetch:async input=>{calls.push(input);return respond(input);},close(){}})}});
  vm.runInContext(runtime,context);const Service=vm.runInContext(adapter('MusicService'),context);
  const api=new Service();return {api,calls,sessions,request:async(operation,params={})=>JSON.parse(await api.request('qq',operation,JSON.stringify(params)))};
}
test('QQ web fallback completes check_sig and OAuth with truly empty redirect bodies on the native adapter',async()=>{
  const {request,sessions}=service(input=>{
    const url=new URL(input.url);
    if(url.pathname==='/ptqrshow')return {statusCode:200,headers:{'set-cookie':'qrsig=native-empty-body-test; Domain=.qq.com; Path=/'},body:Uint8Array.from([137,80,78,71]).buffer};
    if(url.pathname==='/ptqrlogin')return {statusCode:200,headers:{},body:Uint8Array.from(Buffer.from("ptuiCB('0','0','https://ssl.ptlogin2.qq.com/check_sig?uin=12345','0','登录成功','Tester');")).buffer};
    if(url.pathname==='/check_sig')return {statusCode:302,headers:{'set-cookie':['p_skey=synthetic-ticket; Domain=.qq.com; Path=/','uin=o12345; Domain=.qq.com; Path=/']}};
    if(url.pathname.includes('/oauth2.0/authorize'))return {statusCode:302,headers:{location:'https://y.qq.com/portal/wx_redirect.html?code=synthetic-code'},body:new ArrayBuffer(0)};
    if(typeof input.body==='string'&&input.body.includes('QQConnectLogin.LoginServer'))return json({req:{data:{musickey:'synthetic-confirmed-secret',musicid:'12345'}}});
    return json({code:0,data:{creator:{nick:'Tester'}}});
  });
  const key=(await request('login_qr_key',{channel:'qq'})).data.data.unikey;
  const checked=await request('login_qr_check',{key});assert.equal(checked.data.code,803,JSON.stringify(checked));
  assert.ok(sessions.get('qq').includes('synthetic-confirmed-secret'));await request('logout');
});
test('empty binary requests and empty HTTP responses do not invoke native Base64 helpers',async()=>{
  const {api,calls}=service(()=>({statusCode:204,headers:{},body:new ArrayBuffer(0)}));
  const reply=JSON.parse(await api.fetch('qq',JSON.stringify({url:'https://u.y.qq.com/empty',method:'POST',body:'',bodyBase64:true,headers:{},timeoutMs:15000})));
  assert.equal(reply.body,'');assert.equal(reply.status,204);assert.equal(calls[0].body,undefined);api.release();
});
function sockets(){
  const created=[],events=[];
  class Socket{
    handlers={};sent=[];closed=false;
    on(event,listener){this.handlers[event]=listener;}
    async connect(url,options){this.url=url;this.options=options;this.handlers.open(undefined,{});return true;}
    async send(bytes){this.sent.push(Buffer.from(bytes));return true;}
    async close(){this.closed=true;this.handlers.close(undefined,{});return true;}
  }
  const Sockets=vm.runInNewContext(adapter('MusicSockets'),{util,webSocket:{createWebSocket:()=>{const socket=new Socket();created.push(socket);return socket;}}});
  return {api:new Sockets(payload=>events.push(JSON.parse(payload))),created,events};
}
test('native QQ sockets preserve binary MQTT frames and enforce the fixed broker and protocol',async()=>{
  const {api,created,events}=sockets();
  await assert.rejects(()=>api.request({action:'open',id:'qq-ws-1',url:'wss://other.example/ws/handshake',protocol:'mqtt'}));
  await assert.rejects(()=>api.request({action:'open',id:'qq-ws-1',url:'wss://mu.y.qq.com/ws/handshake',protocol:'http'}));
  await api.request({action:'open',id:'qq-ws-1',url:'wss://mu.y.qq.com/ws/handshake/server-ref',protocol:'mqtt'});
  assert.equal(created[0].options.protocol,'mqtt');assert.equal(created[0].options.header.Origin,'https://y.qq.com');
  const frame=Buffer.from([0x10,3,0,255,128]);
  await api.request({action:'send',id:'qq-ws-1',body:frame.toString('base64')});assert.deepEqual(created[0].sent[0],frame);
  created[0].handlers.message(undefined,Uint8Array.from([0x20,3,0,0,0]).buffer);
  assert.equal(events.at(-1).body,Buffer.from([0x20,3,0,0,0]).toString('base64'));
  const count=events.length;created[0].handlers.message(undefined,new ArrayBuffer(0));assert.equal(events.length,count);
  await api.request({action:'close',id:'qq-ws-1'});assert.ok(created[0].closed);
  const closedCount=events.length;created[0].handlers.message(undefined,frame.buffer);assert.equal(events.length,closedCount);
});
