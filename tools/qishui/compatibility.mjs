// Narrow, checked overlay for qishui-music-api@0.2.2; matches Android branch 64fddcc1's liked-list fix.
// The car service needs type:1 for liked playlist rows, otherwise only the latest row may return.
export function patchQishuiProtocol(file, source) {
  const replace = (before, after) => {
    if (source.split(before).length !== 2) throw new Error(`Review Qishui compatibility overlay: ${file}`);
    source = source.replace(before, after);
  };
  if (file === 'catalog.cjs') {
    replace('async function playlistPage(platform, id, ownerId, limit, offset, marks)',
      'async function playlistPage(platform, id, ownerId, limit, offset, marks, liked)');
    replace('count: 100, cursor, type: null', 'count: 100, cursor, type: liked === true ? 1 : null');
    replace('const keyOf = (id, ownerId) => `${id}:${ownerId || \'\'}`;',
      'const keyOf = (id, ownerId, liked) => `${id}:${ownerId || \'\'}:${liked === true ? 1 : \'\'}`;');
    replace('get(id, ownerId) {', 'get(id, ownerId, liked) {');
    replace('const key = keyOf(id, ownerId);', 'const key = keyOf(id, ownerId, liked);');
    replace('async playlist_tracks({ id, ownerId, limit, offset })', 'async playlist_tracks({ id, ownerId, limit, offset, liked })');
    replace('playlistPage(platform, id, ownerId, limit, offset, cursors.get(id, ownerId))',
      'playlistPage(platform, id, ownerId, limit, offset, cursors.get(id, ownerId, liked), liked)');
  }
  if (file === 'api.cjs') {
    replace('catalog.playlist_tracks({ ...p, ownerId: raw.ownerId || \'\' })',
      'catalog.playlist_tracks({ ...p, ownerId: raw.ownerId || \'\', liked: raw.liked === true })');
    replace('const nowUser = () => sessions.get()?.userId || null;', `const nowUser = () => sessions.get()?.userId || null;
    let observedRevision = sessions.revision;
    const syncCaches = () => {
      if (sessions.revision === observedRevision) return;
      observedRevision = sessions.revision;
      feed.clear(); catalog.forgetPlaylist();
    };`);
    replace('if (!QISHUI_OPERATIONS.includes(operation))', 'syncCaches();\n                if (!QISHUI_OPERATIONS.includes(operation))');
  }
  return source;
}
