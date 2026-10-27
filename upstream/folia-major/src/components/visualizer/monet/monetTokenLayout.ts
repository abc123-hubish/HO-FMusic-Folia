import { layoutWithLines, prepareWithSegments, type LayoutCursor } from '@chenglou/pretext';
import { splitLyricGraphemes } from '../../../utils/lyrics/graphemeTiming';
import type { MonetDisplayToken } from './monetLyricsModel';

// src/components/visualizer/monet/monetTokenLayout.ts

/** Breaks oversized sweep boxes into rows, retaining source offsets and parser-derived timing. */
export const wrapMonetDisplayTokens = (
    tokens: MonetDisplayToken[],
    fontSpec: string,
    maxWidthPx: number,
): MonetDisplayToken[] => tokens.flatMap(token => {
    if (!token.timed) return [token];

    const prepared = prepareWithSegments(token.text, fontSpec, { whiteSpace: 'pre-wrap' });
    const rows = layoutWithLines(prepared, Math.max(1, maxWidthPx), 1).lines;
    if (rows.length <= 1) return [token];

    const textOffset = (cursor: LayoutCursor) => (
        prepared.segments.slice(0, cursor.segmentIndex).join('').length
        + splitLyricGraphemes(prepared.segments[cursor.segmentIndex] ?? '')
            .slice(0, cursor.graphemeIndex).join('').length
    );
    const parts: MonetDisplayToken[] = [];
    let startOffset = 0;
    let graphemeOffset = 0;
    for (const [index, row] of rows.entries()) {
        const endOffset = index === rows.length - 1 ? token.text.length : textOffset(row.end);
        const text = token.text.slice(startOffset, endOffset);
        const graphemeCount = splitLyricGraphemes(text).length;
        const graphemeTimings = token.graphemeTimings.slice(graphemeOffset, graphemeOffset + graphemeCount);
        parts.push({
            ...token,
            text,
            key: `${token.key}-wrap-${startOffset}`,
            startOffset: token.startOffset + startOffset,
            endOffset: token.startOffset + endOffset,
            startTime: graphemeTimings[0]?.startTime ?? token.startTime,
            endTime: graphemeTimings[graphemeTimings.length - 1]?.endTime ?? token.endTime,
            graphemeTimings,
        });
        startOffset = endOffset;
        graphemeOffset += graphemeCount;
    }
    return parts;
});
