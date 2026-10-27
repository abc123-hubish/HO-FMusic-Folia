import type { Line } from '../../../types';
import { splitLyricGraphemes } from '../../../utils/lyrics/graphemeTiming';
import { segmentLyricWords, segmentTextWords } from '../../../utils/lyrics/wordSegmentation';
import { hashVisualizerSeed } from '../visualizerSeedHash';

// src/components/visualizer/waveLight/waveLightText.ts
// Hero scoring adapted from wave-light 1.5.1, Copyright (c) 2026 pomepii (MIT).
const contentLength = (text: string) => splitLyricGraphemes(text.replace(/[\s\p{P}\p{S}]/gu, '')).length;
const CREDIT = /(?:作词|作曲|编曲|填词|词|曲|混音|录音|制作|lyrics?|compos\w*|arrang\w*|vocal\w*)\s*[:：]/iu;

/** Select a stable contiguous hero word, respecting the user's saved word boundaries. */
export const pickWaveLightKeyword = (line: Line | null, fallback: string): string => {
    const text = line?.fullText || fallback;
    if (!text.trim()) return '';
    const credit = CREDIT.test(text) ? text.slice(Math.max(text.lastIndexOf(':'), text.lastIndexOf('：')) + 1).trim() : '';
    if (credit && splitLyricGraphemes(credit).length <= 8) return credit;
    const parts = credit ? segmentTextWords(credit) : line ? segmentLyricWords(line) : segmentTextWords(text);
    const counts = parts.map(part => part.isWordLike ? contentLength(part.segment) : 0);
    const total = counts.reduce((sum, count) => sum + count, 0) || 1;
    const duration = line ? Math.max(0.4, Math.min(16, line.endTime - line.startTime)) : total * 0.32;
    const scores = counts.map(count => count ? Math.min(count, 8) * 14 + Math.min(2.5, duration * count / total) * 18 : 0);
    const best = Math.max(...scores, 0);
    if (!best) return '';
    const candidates = scores.flatMap((score, index) => score >= best * 0.94 ? [index] : []);
    const winner = candidates[hashVisualizerSeed(text) % candidates.length];
    let lo = winner;
    let hi = winner;
    while (counts.slice(lo, hi + 1).reduce((sum, count) => sum + count, 0) < 2) {
        const prev = lo > 0 ? scores[lo - 1] : 0;
        const next = hi + 1 < scores.length ? scores[hi + 1] : 0;
        if (!prev && !next) break;
        if (prev >= next) lo--; else hi++;
    }
    return splitLyricGraphemes(parts.slice(lo, hi + 1).map(part => part.segment).join('').trim()).slice(0, 12).join('');
};

/** Hold a meaningful line during gaps; seeking back before the intro clears the held line. */
export const resolveWaveLightHeldLine = (lines: Line[], index: number, time: number): Line | null => {
    for (let i = index >= 0 ? Math.min(index, lines.length - 1) : lines.length - 1; i >= 0; i--) {
        if (lines[i].startTime <= time && lines[i].fullText.trim()) return lines[i];
    }
    return null;
};

export const tokenizeWaveLightLine = (text: string): string[] => {
    const tokens: string[] = [];
    let latin = '';
    const flush = () => { if (latin) tokens.push(latin); latin = ''; };
    splitLyricGraphemes(text).forEach(grapheme => {
        if (/^[\p{Script=Latin}\p{M}\p{N}'’&.-]+$/u.test(grapheme)) latin += grapheme;
        else { flush(); tokens.push(grapheme); }
    });
    flush();
    return tokens;
};
