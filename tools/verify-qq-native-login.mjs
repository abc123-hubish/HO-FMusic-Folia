import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';

// Drive real generated MQTT, credential exchange and status mapping without browser globals or real account secrets.
const source=fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicRuntime.js',import.meta.url),'utf8')
  .replace("import nativeUrl from '@ohos.url';",'const nativeUrl={URL,URLParams:URLSearchParams};')
  .replace('export function createMusicRuntime','function createMusicRuntime');
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const reply=data=>JSON.stringify({status:200,headers:[],body:Buffer.from(JSON.stringify(data)).toString('base64')});
const variable=value=>{const out=[];do{let byte=value%128;value=Math.floor(value/128);if(value)byte|=128;out.push(byte);}while(value);return Buffer.from(out);};
const utf8=text=>{const value=Buffer.from(text);return Buffer.concat([Buffer.from([value.length>>8,value.length&255]),value]);};
const packet=(header,body)=>Buffer.concat([Buffer.from([header]),variable(body.length),body]);
const publish=(type,payload)=>{const props=Buffer.concat([Buffer.from([0x26]),utf8('type'),utf8(type)]);return packet(0x30,Buffer.concat([utf8('management.qrcode_login/native-test-id'),variable(props.length),props,Buffer.from(JSON.stringify(payload))]));};
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
function harness({delaySubscription=false,exchange,redirect=false}={}){
  const context=vm.createContext({URL,URLSearchParams,setTimeout,clearTimeout});vm.runInContext(source,context);
  let saved='',runtime,id,subscriptions=0;
  const calls=[],sockets=[];
  const emit=(event,bytes,socketId=id)=>runtime.receiveSocketEvent(JSON.stringify({id:socketId,event,...(bytes?{body:Buffer.from(bytes).toString('base64')}:{})}));
  runtime=context.createMusicRuntime('qq',async payload=>{
    const input=JSON.parse(payload);calls.push(input);
    if(input.transport==='websocket'){
      if(input.action==='open'){id=input.id;sockets.push(input);queueMicrotask(()=>emit('open',null,input.id));}
      if(input.action==='close')queueMicrotask(()=>emit('close',null,input.id));
      if(input.action==='send'){
        const bytes=Buffer.from(input.body,'base64');
        if(bytes[0]===0x10){
          assert.ok(bytes.includes(Buffer.from('MQTT')));assert.ok(bytes.includes(Buffer.from('native-test-id')));
          if(redirect&&sockets.length===1){const prop=Buffer.concat([Buffer.from([0x1c]),utf8('10.0.0.1:443')]);queueMicrotask(()=>emit('message',packet(0x20,Buffer.concat([Buffer.from([0,0x9c]),variable(prop.length),prop])),input.id));}
          else queueMicrotask(()=>emit('message',Buffer.from([0x20,3,0,0,0]),input.id));
        }
        if(bytes[0]===0x82){subscriptions++;assert.ok(bytes.includes(Buffer.from('management.qrcode_login/native-test-id')));if(!delaySubscription)queueMicrotask(()=>emit('message',Buffer.from([0x90,4,0,1,0,0]),input.id));}
      }
      return '{}';
    }
    if(input.url.includes('tencentmusic.com'))return reply({});
    assert.equal(new URL(input.url).hostname,'u.y.qq.com');
    const body=JSON.parse(input.body);
    if(body.req_0?.method==='CreateQRCode'){
      assert.equal(body.comm.ct,23);assert.equal(body.comm.cv,0);assert.equal(input.headers.cookie,'');
      return reply({code:0,req_0:{code:0,data:{qrcodeID:'native-test-id',qrcode:png}}});
    }
    if(body.req_0?.method==='Login'){
      assert.equal(body.comm.tmeLoginType,6);assert.deepEqual(body.req_0.param,{musicid:12345,qrCodeID:'native-test-id',token:'temporary-token'});
      return exchange?exchange(input):reply({code:0,req_0:{code:0,data:{musicid:12345,musickey:'confirmed-secret'}}});
    }
    return reply({code:0,data:{creator:{nick:'Listener'}}});
  },()=>saved,value=>{saved=value;},length=>randomBytes(length).toString('base64'));
  return {calls,sockets,stored:()=>saved,subscriptions:()=>subscriptions,emit,
    event:(type,payload)=>emit('message',publish(type,payload)),
    request:async(op,params={})=>JSON.parse(await runtime.request(op,JSON.stringify(params)))};
}
const cookies={cookies:{qqmusic_uin:{value:'12345'},qqmusic_key:{value:'temporary-token'}}};
test('QQ native QR waits for MQTT SUBACK, then phone confirmation persists credentials and returns 803',async()=>{
  const api=harness({delaySubscription:true});let ready=false;
  const creating=api.request('login_qr_key',{channel:'qq'}).then(result=>{ready=true;return result;});
  while(!api.subscriptions())await flush();assert.equal(ready,false,'QR must not be exposed before subscribing');
  api.emit('message',Buffer.from([0x90,4,0,1,0,0]));
  const created=await creating,key=created.data.data.unikey;
  assert.equal(JSON.parse(Buffer.from(key,'base64').toString()).native,true);
  assert.match((await api.request('login_qr_create',{key})).data.data.qrimg,/^data:image\/png;base64,/);
  api.event('scanned',null);await flush();assert.equal((await api.request('login_qr_check',{key})).data.code,802);
  api.event('cookies',cookies);for(let n=0;n<20&&!api.stored().includes('confirmed-secret');n++)await flush();
  assert.ok(api.stored().includes('confirmed-secret'),'Persist between UI polls');
  const checked=await api.request('login_qr_check',{key});assert.equal(checked.data.code,803);
  assert.ok(!JSON.stringify(checked).includes('confirmed-secret'));
  assert.equal((await api.request('login_status')).data.data.profile.uin,'12345');
  assert.equal(api.calls.some(call=>call.url?.includes('ptqrlogin')),false);
  await api.request('logout');assert.ok(!api.stored().includes('confirmed-secret'));
});
test('MQTT redirect and fragmented confirmation frames preserve the native login result',async()=>{
  const api=harness({redirect:true}),created=await api.request('login_qr_key',{channel:'qq'}),key=created.data.data.unikey;
  assert.equal(api.sockets[1].url,'wss://mu.y.qq.com/ws/handshake/10.0.0.1:443');
  const bytes=publish('cookies',cookies);api.emit('message',bytes.subarray(0,5));api.emit('message',bytes.subarray(5));
  for(let n=0;n<20&&!api.stored().includes('confirmed-secret');n++)await flush();
  assert.equal((await api.request('login_qr_check',{key})).data.code,803);
});
test('a failed credential exchange becomes a terminal login error instead of endless waiting',async()=>{
  const api=harness({exchange:()=>reply({code:0,req_0:{code:500026,data:{}}})});
  const key=(await api.request('login_qr_key',{channel:'qq'})).data.data.unikey;
  api.event('cookies',cookies);await flush();
  const checked=await api.request('login_qr_check',{key});assert.equal(checked.data.code,0);
  assert.equal(checked.data.failureStage,'native-login');assert.match(checked.data.message,/500026/);
  assert.ok(!api.stored().includes('temporary-token'));
});
test('canceling while credentials are exchanged prevents the late exchange from restoring a session',async()=>{
  let finish;const api=harness({exchange:()=>new Promise(resolve=>{finish=resolve;})});
  const key=(await api.request('login_qr_key',{channel:'qq'})).data.data.unikey;
  api.event('cookies',cookies);while(!finish)await flush();
  await api.request('login_qr_cancel',{key});finish(reply({code:0,req_0:{code:0,data:{musicid:12345,musickey:'late-secret'}}}));
  await flush();assert.ok(!api.stored().includes('late-secret'));
  assert.equal((await api.request('login_qr_check',{key})).data.code,800);
});
test('a disconnected broker after subscription ends login with an actionable error',async()=>{
  const api=harness();const key=(await api.request('login_qr_key',{channel:'qq'})).data.data.unikey;
  api.emit('close');await flush();
  const checked=await api.request('login_qr_check',{key});assert.equal(checked.data.code,0);assert.match(checked.data.message,/连接已断开/);
});
test('duplicate authorization pushes exchange credentials only once',async()=>{
  const api=harness();const key=(await api.request('login_qr_key',{channel:'qq'})).data.data.unikey;
  api.event('authorized',cookies);api.event('cookies',cookies);await flush();
  assert.equal(api.calls.filter(call=>call.body&&!call.transport&&JSON.parse(call.body).req_0?.method==='Login').length,1);
  assert.equal((await api.request('login_qr_check',{key})).data.code,803);
});
