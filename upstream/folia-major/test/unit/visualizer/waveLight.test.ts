import { describe, expect, it, vi } from 'vitest';
import type { Line } from '../../../src/types';
import { DEFAULT_WAVE_LIGHT_TUNING } from '../../../src/types/waveLight';
import { normalizeWaveLightTuning } from '../../../src/utils/waveLightTuning';
import { compressConfig, decompressConfig } from '../../../src/utils/appearanceCodec';
import { applyVisualizerTuningsToSettings, collectVisualizerTunings } from '../../../src/components/visualizer/tuningRegistry';
import { pickWaveLightKeyword, resolveWaveLightHeldLine, tokenizeWaveLightLine } from '../../../src/components/visualizer/waveLight/waveLightText';
import { buildWaveLightPalette } from '../../../src/components/visualizer/waveLight/waveLightPalette';
import { createWaveLightFrame, fillWaveLightFrame, getWaveLightCenters, WAVE_LIGHT_RING_COUNT } from '../../../src/components/visualizer/waveLight/waveLightGeometry';

// test/unit/visualizer/waveLight.test.ts
const line = (text: string, startTime = 0, endTime = 3): Line => ({ fullText: text, startTime, endTime, words: [] });
describe('Wave Light integration', () => {
    it('keeps both wave centers symmetric on the exact midline with reusable finite buffers', () => {
        const frame = createWaveLightFrame();
        const shapes = frame.shapes, styles = frame.styles;
        for (const [width, height] of [[1280, 720], [390, 844], [420, 250]]) {
            const centers = getWaveLightCenters(width, height);
            expect(centers.left + centers.right).toBeCloseTo(width);
            expect(centers.y).toBe(height / 2);
            for (const seconds of [0, 12, 170]) {
                fillWaveLightFrame(frame, width, height, seconds, 1.4);
                expect(frame.shapes).toBe(shapes); expect(frame.styles).toBe(styles);
                expect([...shapes, ...styles].every(Number.isFinite)).toBe(true);
                for (let i = 0; i < WAVE_LIGHT_RING_COUNT; i++) {
                    expect(shapes[i * 4]).toBeCloseTo(i < 15 ? centers.left : centers.right, 3);
                    expect(shapes[i * 4 + 1]).toBe(height / 2);
                }
            }
        }
    });
    it('honors saved segmentation and selects a stable whole keyword', () => {
        const saved = { ...line('把回忆拼好给你'), wordSegments: ['把', '回忆拼好', '给你'] };
        expect(pickWaveLightKeyword(saved, '')).toBe('回忆拼好');
        expect(pickWaveLightKeyword(saved, '')).toBe(pickWaveLightKeyword(saved, ''));
        expect(pickWaveLightKeyword(line('作词：方文山'), '')).toBe('方文山');
    });
    it('preserves Latin words, combining characters, emoji, spaces and punctuation', () => {
        const text = "My  life, e\u0301cho 👨‍👩‍👧‍👦 回忆 don't!";
        const tokens = tokenizeWaveLightLine(text);
        expect(tokens.join('')).toBe(text);
        expect(tokens).toContain("don't");
        expect(tokens).toContain('👨‍👩‍👧‍👦');
        expect(tokens).toContain('e\u0301cho');
    });
    it('holds lyrics through empty lines and gaps, but resets on backward seek', () => {
        const lines = [line('第一句', 2, 5), line('', 5, 7), line('第二句', 9, 12)];
        expect(resolveWaveLightHeldLine(lines, 1, 6)).toBe(lines[0]);
        expect(resolveWaveLightHeldLine(lines, -1, 8)).toBe(lines[0]);
        expect(resolveWaveLightHeldLine(lines, -1, 0)).toBeNull();
        expect(resolveWaveLightHeldLine([], -1, 99)).toBeNull();
    });
    it('normalizes persisted/imported settings without accepting non-finite numbers', () => {
        expect(normalizeWaveLightTuning({ brightness: 99, speed: NaN, textScale: -1, keyword: 'false' }))
            .toEqual({ ...DEFAULT_WAVE_LIGHT_TUNING, brightness: 2, textScale: 0.6 });
        expect(normalizeWaveLightTuning(null)).toEqual(DEFAULT_WAVE_LIGHT_TUNING);
    });
    it('round-trips all five settings through the shared config bundle and settings adapter', () => {
        const tuning = { waveSource: 'theme' as const, brightness: 1.4, speed: 0.6, keyword: false, textScale: 1.2 };
        const handleSetWaveLightTuning = vi.fn();
        const state = { waveLightTuning: tuning, handleSetWaveLightTuning };
        const visualizerTunings = collectVisualizerTunings(state);
        expect(visualizerTunings['wave-light']).toEqual(tuning);
        const decoded = decompressConfig(compressConfig({ visualizerMode: 'wave-light', visualizerTunings }));
        expect(decoded?.visualizerMode).toBe('wave-light');
        expect(decoded?.visualizerTunings['wave-light']).toEqual(tuning);
        applyVisualizerTuningsToSettings(state, decoded!.visualizerTunings);
        expect(handleSetWaveLightTuning).toHaveBeenCalledWith(tuning);
        const json = decompressConfig(JSON.stringify({ visualizerMode: 'wave-light', visualizerTunings }));
        expect(json?.visualizerTunings['wave-light']).toEqual(tuning);
    });
    it('derives readable text and dark fields for saturated and neutral colors', () => {
        for (const color of ['#683ca0', '#ffffff', '#000000']) {
            const palette = buildWaveLightPalette(color);
            expect(palette.tint).toMatch(/^#[0-9a-f]{6}$/);
            expect(palette.wave).toMatch(/^#[0-9a-f]{6}$/);
            expect(palette.deep).not.toBe(palette.tint);
        }
    });
});
