# Wave Light lyric motion

The original center-out token entrance, centered layout, keyword watermark and
batched WebGL/Canvas2D waves remain unchanged. From mount, `WaveLightLyrics.tsx`
follows the lyric clock in parallel with the outer token entrance: unsung glyphs
are dim, the sung glyph lights up and lifts slightly, and its glow releases
upward after the note. This is the lightweight DOM counterpart of Diorama's
base reveal / glow / soul trail, not a second 3D renderer.

`waveLightKaraoke.ts` consumes the shared `buildLineGraphemeTimeline` so parser
word and syllable timing, spaces, repeated words and combining characters are
preserved. Latin words retain their outer layout group. `waveLightGlyphScheduler.ts`
indexes start/release boundaries once and visits only singing or releasing glyphs
during forward playback; backward seeks rebuild the window. Malformed timing data
retains the original full-scan behavior. `waveLightGlyphPainter.ts` reuses one frame
object and caches individual opacity/transform writes directly on each body/ghost,
avoiding inherited per-frame CSS variables. Only live glyphs request compositor
layers, released after the original 0.65-second trail. There is one clock
subscription per visible line, no new RAF and no per-frame React state.

The outer entrance and inner follow-sing transforms compose independently;
no entrance event switches lyric brightness or resets progress. Follow-sing
always reads the actual clock and never delays timing. Static/reduced-motion views show plain readable
text, hidden views unsubscribe, and unmount releases the subscription.

Upstream wave-light 1.5.1 artwork and entrance are Copyright (c) 2026 pomepii,
MIT, see `LICENSE`. These follow-sing additions use the current project's
lyric utilities and reference its Diorama implementation.
