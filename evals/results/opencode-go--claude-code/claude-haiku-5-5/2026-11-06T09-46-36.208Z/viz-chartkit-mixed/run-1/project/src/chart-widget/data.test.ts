import {describe, expect, it} from 'vitest';

import {alignForUplot, capSeries, defaultFormatValue, summarize} from './data';
import {MAX_SERIES, seriesColors} from './palette';
import type {ChartSeries} from './types';

const series = (id: string, points: [number, number][]): ChartSeries => ({
    id,
    name: id,
    points: points.map(([x, y]) => ({x, y})),
});

describe('capSeries', () => {
    it('keeps the first MAX_SERIES and reports how many were hidden', () => {
        const all = ['a', 'b', 'c', 'd', 'e'].map((id) => series(id, []));
        const {visible, hiddenCount} = capSeries(all);
        expect(visible.map((s) => s.id)).toEqual(['a', 'b', 'c']);
        expect(hiddenCount).toBe(2);
    });

    it('hides nothing under the cap', () => {
        const {visible, hiddenCount} = capSeries([series('a', [])]);
        expect(visible).toHaveLength(1);
        expect(hiddenCount).toBe(0);
    });
});

describe('seriesColors', () => {
    it('never returns more colors than the cap, and keeps the validated slot order', () => {
        expect(seriesColors('light', 10)).toHaveLength(MAX_SERIES);
        expect(seriesColors('light', 2)).toEqual(['#2a78d6', '#eb6834']);
        expect(seriesColors('dark', 1)).toEqual(['#3987e5']);
    });
});

describe('summarize', () => {
    it('returns nulls for an empty series', () => {
        expect(summarize([])).toEqual({count: 0, last: null, min: null, max: null, avg: null});
    });

    it('computes count, last, min, max and mean', () => {
        const stats = summarize([
            {x: 1, y: 4},
            {x: 2, y: 10},
            {x: 3, y: 1},
        ]);
        expect(stats).toEqual({count: 3, last: 1, min: 1, max: 10, avg: 5});
    });
});

describe('alignForUplot', () => {
    it('merges timestamps into one ascending seconds column with nulls for gaps', () => {
        const aligned = alignForUplot([
            series('a', [
                [2000, 1],
                [4000, 3],
            ]),
            series('b', [
                [1000, 7],
                [2000, 8],
            ]),
        ]);
        expect(aligned).toEqual([
            [1, 2, 4],
            [null, 1, 3],
            [7, 8, null],
        ]);
    });

    it('drops non-finite values instead of plotting them', () => {
        const aligned = alignForUplot([series('a', [[1000, Number.NaN]])]);
        expect(aligned).toEqual([[1], [null]]);
    });

    it('handles no series', () => {
        expect(alignForUplot([])).toEqual([[]]);
    });
});

describe('defaultFormatValue', () => {
    it('appends the unit when there is one', () => {
        expect(defaultFormatValue(1234.5, '₽')).toMatch(/^1\s?234,5 ₽$/u);
    });

    it('formats without a unit', () => {
        expect(defaultFormatValue(12, '')).toBe('12');
    });
});
