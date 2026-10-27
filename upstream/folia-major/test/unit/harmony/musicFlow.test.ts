import fs from 'node:fs';
import vm from 'node:vm';
import { randomBytes } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { installHarmonyMusic } from '@/harmony/music';

// Test real Omni -> providers -> native IPC -> generated ArkJS protocol, with synthetic upstream responses.
const source = fs.readFileSync(new URL('../../../../../entry/src/main/ets/services/music/MusicRuntime.js', import.meta.url),'utf8')
    .replace("import nativeUrl from '@ohos.url';",'const nativeUrl={URL,URLParams:URLSearchParams};')
    .replace('export function createMusicRuntime','function createMusicRuntime');
const song = { id:901,mid:'songmid',name:'流程歌曲',title:'流程歌曲',singer:[{id:8,mid:'artistmid',name:'流程歌手'}],album:{id:7,mid:'albummid',name:'流程专辑'},interval:180,file:{media_mid:'media'} };
const kgSong = { FileHash:'abc',SongName:'流程歌曲',SingerName:'流程歌手',AlbumName:'流程专辑',AlbumID:7,MixSongID:66,Duration:180 };
const reply=(data: unknown)=>JSON.stringify({status:200,headers:[],body:Buffer.from(JSON.stringify(data)).toString('base64')});
beforeEach(()=>{
    vi.resetModules(); const storage=new Map<string,string>();
    vi.stubGlobal('localStorage',{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)});
    vi.stubGlobal('location',{href:'https://folia.local/harmony.html',origin:'https://folia.local'});
    vi.stubGlobal('window',{localStorage,setTimeout,clearTimeout,fetch:vi.fn(),HarmonyConfig:{qq:'',kugou:''}});
});
afterEach(()=>vi.unstubAllGlobals());
function install(provider: 'qq'|'kugou', respond:(input:{url:string;body:string;headers:Record<string,string>})=>string) {
    const context=vm.createContext({URL,URLSearchParams,setTimeout,clearTimeout}); vm.runInContext(source,context);
    const cookies=provider==='qq'?{uin:'o12345',qqmusic_uin:'12345',qqmusic_key:'synthetic-key',qm_keyst:'synthetic-key'}
        :{userid:'24680',KugooID:'24680',token:'synthetic-token',vip_token:'synthetic-vip'};
    let stored=JSON.stringify({cookies:Object.entries(cookies).map(([name,value])=>({name,value,domain:provider==='qq'?'.qq.com':'.kugou.com',path:'/'})),storage:{kgPlatformMigration:'lite-v1'}});
    const runtime=context.createMusicRuntime(provider,async(payload:string)=>respond(JSON.parse(payload)),()=>stored,(value:string)=>{stored=value;},(length:number)=>randomBytes(length).toString('base64'));
    const operations:string[]=[];
    installHarmonyMusic({requestMusic:(id,owner,operation,payload)=>{
        expect(owner).toBe(provider); operations.push(operation);
        void runtime.request(operation,payload).then((result:string)=>window.HarmonyMusic!.receive(id,result));
    }});
    vi.stubGlobal('fetch',(...args:Parameters<typeof fetch>)=>window.fetch(...args));
    return operations;
}
it('QQ search results retain usable metadata through Omni and resolve an account-backed stream',async()=>{
    const operations=install('qq',input=>{
        const body=input.body?JSON.parse(input.body):{};
        if(body.req_1) return reply({req_1:{code:0,data:{body:{song:{list:[song]}}}}});
        if(body.songinfo) return reply({songinfo:{data:{track_info:song}}});
        if(body.req_0?.module==='vkey.GetVkeyServer') {
            expect(input.headers.cookie).toContain('synthetic-key');
            return reply({req_0:{data:{sip:['https://ws.stream.qqmusic.qq.com/'],midurlinfo:[{filename:'M500media.mp3',purl:'media.mp3?vkey=issued'}]}}});
        }
        return reply({code:0,data:{creator:{nick:'Listener'}}});
    });
    const {omni}=await import('@/services/onlineMusic/omni');
    expect((await omni.getLoginStatus('qq'))?.id).toBe('12345');
    const page=await omni.searchProviderSongs('qq','流程歌曲',{limit:10,offset:0});
    expect(page.items[0]).toMatchObject({id:901,name:'流程歌曲',artists:[{name:'流程歌手'}],album:{name:'流程专辑'},durationMs:180000,
        sourceRef:{providerId:'qq',mediaId:'songmid',providerData:{mediaMid:'media'}}});
    expect(await omni.getAudioSource(page.items[0],'standard')).toMatchObject({url:'https://ws.stream.qqmusic.qq.com/media.mp3?vkey=issued',quality:'standard'});
    expect(operations).toEqual(['login_status','search','music_play']);
});
it('KuGou account, search, playlist pages, audio and word lyrics complete the same Omni chain',async()=>{
    const krc='[0,2000]<0,1000,0>流程<1000,1000,0>歌词';
    const data=deflateSync(Buffer.from(krc)),key=[64,71,97,119,94,50,116,71,81,54,49,45,206,210,110,105];
    for(let i=0;i<data.length;i++) data[i]^=key[i%16];
    const operations=install('kugou',input=>{
        const url=new URL(input.url);
        if(url.pathname==='/song_search_v2') return reply({status:1,data:{lists:[kgSong]}});
        if(url.pathname==='/v4/get_list_all_file_v3') {const body=JSON.parse(input.body);return reply({status:1,error_code:0,data:{info:[{...kgSong,FileHash:'page'+body.page,fileid:body.page}],count:2}});}
        if(url.pathname==='/v5/url') return reply({status:1,url:['https://fs.kugou.com/track.mp3']});
        if(url.pathname.includes('getSongInfo.php')) return reply({hash:'abc',songName:'流程歌曲',singerName:'流程歌手',url:'https://fs.kugou.com/track.mp3'});
        if(url.pathname==='/search') return reply({status:200,candidates:[{id:'1',accesskey:'lyric-key'}]});
        if(url.pathname==='/download') return reply({status:200,content:Buffer.concat([Buffer.from('krc1'),data]).toString('base64')});
        return reply({status:1,error_code:0,data:{userid:'24680',nickname:'Listener',token:'synthetic-token',vip_token:'synthetic-vip'}});
    });
    const {omni}=await import('@/services/onlineMusic/omni');
    expect((await omni.getLoginStatus('kugou'))?.id).toBe('24680');
    const page=await omni.searchProviderSongs('kugou','流程歌曲',{limit:10,offset:0});
    const track=page.items[0];
    expect(track).toMatchObject({id:'ABC',artists:[{name:'流程歌手'}],album:{name:'流程专辑'},durationMs:180000,sourceRef:{providerId:'kugou',providerData:{albumAudioId:'66'}}});
    const collection={providerId:'kugou',id:'collection_3_24680_9_0',name:'歌单',type:'playlist' as const};
    const first=await omni.getCollectionTracks(collection,{limit:1,offset:0});
    const second=await omni.getCollectionTracks(collection,{limit:1,offset:1});
    expect(first.items[0].id).toBe('PAGE1');
    const nextRef=second.items[0].sourceRef;
    expect(nextRef.kind==='online' ? nextRef.providerData?.fileId : undefined).toBe(2);
    expect(await omni.getAudioSource(track,'standard')).toMatchObject({url:'https://fs.kugou.com/track.mp3'});
    const lyrics=await omni.getLyrics(track);expect(lyrics.lyrics?.isWordByWord).toBe(true);
    expect(lyrics.wordByWordText).toBe(krc);
    expect(operations).toEqual(expect.arrayContaining(['user_detail','search','playlist_track_all','song_url','search_lyric','lyric']));
});
