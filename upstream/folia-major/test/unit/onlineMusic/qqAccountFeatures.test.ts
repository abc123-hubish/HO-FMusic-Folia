import { beforeEach, expect, it, vi } from 'vitest';
import { normalizeQqSong } from '@/services/onlineMusic/qqNormalize';

// Confirm the recommendation and write contracts added by the Android provider alignment.
const request=vi.hoisted(()=>vi.fn());
vi.mock('@/services/onlineMusic/qqTransport',()=>({requestQq:request,hasQqSession:()=>true}));
import { qqRecommendations } from '@/services/onlineMusic/qqRecommendations';
import { qqMutations } from '@/services/onlineMusic/qqMutations';
const raw={id:901,mid:'mid',name:'歌曲',singer:[{name:'歌手'}],album:{mid:'album',name:'专辑'},interval:180};
beforeEach(()=>request.mockReset());
it('normalizes daily songs and de-duplicates a personal FM batch',async()=>{
    request.mockResolvedValue({songs:[raw,raw]});
    expect(await qqRecommendations.getDailySongs?.()).toHaveLength(2);
    expect(await qqRecommendations.getPersonalFm?.()).toHaveLength(1);
    expect(request.mock.calls.map(call=>call[0])).toEqual(['user_daily_songs','user_guess_you_like']);
});
it('sends both numeric identity and mid for a like and requires explicit confirmation',async()=>{
    const song=normalizeQqSong(raw); request.mockResolvedValueOnce({liked:true});
    await qqMutations.likeSong?.(song,true);
    expect(request).toHaveBeenCalledWith('user_song_like',{}, {song:{id:901,mid:'mid',type:0},liked:true});
    request.mockResolvedValueOnce({liked:false});
    await expect(qqMutations.likeSong?.(song,true)).rejects.toMatchObject({code:'invalid-response'});
});
it('does not report an unconfirmed playlist change as successful',async()=>{
    request.mockResolvedValue({changed:false});
    await expect(qqMutations.updatePlaylistTracks?.('add',99,[normalizeQqSong(raw)])).rejects.toMatchObject({code:'invalid-response'});
    expect(request).toHaveBeenCalledTimes(1);
});
it('accepts a playlist read-back that already matches the requested state',async()=>{
    request.mockResolvedValue({changed:false,verification:{status:'present'}});
    await expect(qqMutations.updatePlaylistTracks?.('add',99,[normalizeQqSong(raw)])).resolves.toBeUndefined();
});
it('requires explicit playlist and album subscription confirmation',async()=>{
    request.mockResolvedValueOnce({subscribed:true});
    await qqMutations.subscribePlaylist?.(99,true);
    expect(request).toHaveBeenLastCalledWith('user_playlist_subscribe',{}, {tid:'99',subscribed:true});
    request.mockResolvedValueOnce({});
    await expect(qqMutations.subscribeAlbum?.('album',true)).rejects.toMatchObject({code:'invalid-response'});
});
