import React, { useMemo, useRef } from 'react';
import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext';
import type { VisualizerSharedProps } from '../definition';
import { DEFAULT_WAVE_LIGHT_TUNING } from '../../../types/waveLight';
import { resolveThemeFontStack, resolveThemeFontWeight, resolveThemeTranslationFontStack } from '../../../utils/fontStacks';
import { resolveLyricSubtitleTracks, resolveSubtitleContentMode } from '../../../utils/lyrics/alternateText';
import { useAppVisibility } from '../../../hooks/useAppVisibility';
import VisualizerShell from '../VisualizerShell';
import { useVisualizerRuntime } from '../runtime';
import { colorWithAlpha } from '../colorMix';
import { buildWaveLightPalette } from './waveLightPalette';
import { pickWaveLightKeyword, resolveWaveLightHeldLine } from './waveLightText';
import { useWaveLightCoverColor, useWaveLightSize } from './useWaveLightAppearance';
import WaveLightCanvas from './WaveLightCanvas';
import WaveLightLyrics from './WaveLightLyrics';
import './waveLight.css';

// src/components/visualizer/waveLight/VisualizerWaveLight.tsx
// Built-in port of wave-light 1.5.1, Copyright (c) 2026 pomepii (MIT; see LICENSE).
export default function VisualizerWaveLight(props: VisualizerSharedProps) {
    const { theme, subtitleTheme = theme, currentTime, currentLineIndex, lines, showText = true,
        staticMode = false, lyricsFontScale = 1, subtitleFontScale = 1 } = props;
    const tuning = props.waveLightTuning ?? DEFAULT_WAVE_LIGHT_TUNING;
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useWaveLightSize(ref);
    const appVisible = useAppVisibility();
    const runtime = useVisualizerRuntime({ currentTime, currentLineIndex, lines });
    const line = runtime.activeLine?.fullText.trim() ? runtime.activeLine
        : resolveWaveLightHeldLine(lines, currentLineIndex, runtime.currentTimeValue);
    const text = line?.fullText || props.songTitle || '♪';
    const keyword = useMemo(() => tuning.keyword ? pickWaveLightKeyword(line, text) : '', [line, text, tuning.keyword]);
    const coverColor = useWaveLightCoverColor(props.coverUrl, tuning.waveSource === 'cover');
    const palette = useMemo(() => buildWaveLightPalette(coverColor || theme.accentColor), [coverColor, theme.accentColor]);
    const fontFamily = resolveThemeFontStack(theme);
    const fontWeight = resolveThemeFontWeight(theme, 700);
    const subtitleWeight = resolveThemeFontWeight(subtitleTheme, 400);
    const fontPx = Math.max(18, Math.min(height * 0.085, width * 0.11, 110)) * tuning.textScale * lyricsFontScale;
    const keywordPx = useMemo(() => {
        if (!keyword) return height * 0.336;
        const prepared = prepareWithSegments(keyword, `${fontWeight} 100px ${fontFamily}`, { whiteSpace: 'pre-wrap' });
        const naturalWidth = layoutWithLines(prepared, 99999, 120).lines[0]?.width || 100;
        return Math.max(12, Math.min(height * 0.336 * (0.55 + 0.45 * tuning.textScale), width * 0.8 * 100 / naturalWidth));
    }, [keyword, fontWeight, fontFamily, height, width, tuning.textScale]);
    const subtitleMode = props.hideTranslationSubtitle ? 'none'
        : resolveSubtitleContentMode(props.subtitleContentMode, props.showSubtitleTranslation);
    const tracks = resolveLyricSubtitleTracks(line, subtitleMode);
    const frozen = staticMode || !!props.backgroundStaticMode;
    const hasBackground = !props.background?.transparent;
    const textKey = `${props.seed ?? ''}:${line?.startTime ?? 'intro'}:${text}`;

    return <VisualizerShell theme={theme} audioPower={props.audioPower} audioBands={props.audioBands}
        sharedProps={props} renderBackground={false}>
        <div ref={ref} className="wave-light-stage" data-wave-light data-wave-light-static={frozen}
            data-wave-light-visible={appVisible} style={{
                background: hasBackground ? `radial-gradient(135% 100% at 50% 44%, ${palette.mid} 0%, ${palette.edge} 58%, ${palette.deep} 100%)` : 'transparent',
                color: palette.tint, fontFamily, fontWeight,
            }}>
            {hasBackground && <WaveLightCanvas wave={palette.wave} brightness={tuning.brightness} speed={tuning.speed} frozen={frozen} />}
            {showText && <>
                {keyword && <div key={`keyword:${textKey}`} className="wave-light-keyword" aria-hidden="true" style={{
                    color: colorWithAlpha(palette.keyword, 0.88), fontSize: keywordPx, fontWeight,
                    '--wave-keyword-blur': `${Math.max(2, Math.round(keywordPx * 0.025))}px`,
                } as React.CSSProperties}>{keyword}</div>}
                <div className="wave-light-line-position">
                    <WaveLightLyrics key={textKey} line={line} text={text} currentTime={currentTime}
                        fontSize={fontPx} accent={palette.wave} frozen={frozen} visible={appVisible} />
                </div>
                {tracks.length > 0 && <div key={`translation:${textKey}`} className="wave-light-translation" data-wave-light-translation style={{
                    top: `min(${height * 0.75 + keywordPx / 4}px, calc(100% - ${props.isPlayerChromeHidden || props.isPreviewMode ? 24 : 104}px))`,
                    fontFamily: resolveThemeTranslationFontStack(subtitleTheme), fontWeight: subtitleWeight,
                    fontSize: Math.max(12, fontPx * 0.4) * subtitleFontScale, color: colorWithAlpha(palette.tint, 0.68),
                    opacity: props.subtitleOverlayOpacity ?? 1,
                }}>{tracks.map(track => <div key={track.role}>{track.text}</div>)}</div>}
            </>}
        </div>
    </VisualizerShell>;
}
