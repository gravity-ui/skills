import {describe, expect, it} from 'vitest';

import {toGravityChartsData, toYagrData, validateDataset} from './adapters';
import {getSeriesColor} from './palette';
import type {VizDataset} from './types';

const dataset: VizDataset = {
    timeline: [1000, 2000, 3000],
    series: [
        {id: 'a', name: 'A', values: [1, null, 3]},
        {id: 'b', name: 'B', values: [4, 5, 6], color: '#123456'},
    ],
    formatValue: (v) => `${v} ед.`,
};

describe('validateDataset', () => {
    it('rejects an empty timeline', () => {
        expect(() => validateDataset({timeline: [], series: []})).toThrow('Нет данных');
    });

    it('rejects a non-increasing timeline', () => {
        expect(() => validateDataset({timeline: [1, 1], series: []})).toThrow('строго возрастать');
    });

    it('rejects series misaligned with the timeline', () => {
        expect(() =>
            validateDataset({timeline: [1, 2], series: [{id: 'x', name: 'X', values: [1]}]}),
        ).toThrow('Серия «X»: 1 значений при 2 точках шкалы');
    });
});

describe('toGravityChartsData', () => {
    const result = toGravityChartsData(dataset, 'light');

    it('builds datetime line series with x/y points and gaps preserved', () => {
        expect(result.xAxis?.type).toBe('datetime');
        const [a] = result.series.data;
        expect(a).toMatchObject({type: 'line', id: 'a', name: 'A'});
        expect(a.data).toEqual([
            {x: 1000, y: 1},
            {x: 2000, y: null},
            {x: 3000, y: 3},
        ]);
    });

    it('takes palette slots in order and respects explicit colors', () => {
        const [a, b] = result.series.data;
        expect(a).toHaveProperty('color', getSeriesColor(0, 'light'));
        expect(b).toHaveProperty('color', '#123456');
    });

    it('wires formatValue into the tooltip', () => {
        const format = result.tooltip?.valueFormat;
        expect(format?.type).toBe('custom');
        if (format?.type === 'custom') {
            expect(format.formatter({value: 7})).toBe('7 ед.');
            expect(format.formatter({value: null})).toBe('—');
        }
    });
});

describe('toYagrData', () => {
    const result = toYagrData(dataset, 'dark');

    it('passes the timeline and value arrays through', () => {
        expect(result.data.timeline).toEqual([1000, 2000, 3000]);
        expect(result.data.graphs.map((g) => g.data)).toEqual([
            [1, null, 3],
            [4, 5, 6],
        ]);
    });

    it('uses the same palette slots as the sales mode, stepped for the theme', () => {
        expect(result.data.graphs[0].color).toBe(getSeriesColor(0, 'dark'));
        expect(result.data.graphs[1].color).toBe('#123456');
    });

    it('wires formatValue into the series formatter', () => {
        const formatter = result.data.graphs[0].formatter!;
        expect(formatter(7, {} as never)).toBe('7 ед.');
        expect(formatter(null, {} as never)).toBe('—');
    });

    it('does not share arrays with the input dataset', () => {
        expect(result.data.timeline).not.toBe(dataset.timeline);
        expect(result.data.graphs[0].data).not.toBe(dataset.series[0].values);
    });
});

describe('getSeriesColor', () => {
    it('never cycles hues past the last slot', () => {
        const slots = Array.from({length: 8}, (_, i) => getSeriesColor(i, 'light'));
        expect(new Set(slots).size).toBe(8);
        expect(slots).not.toContain(getSeriesColor(8, 'light'));
        expect(getSeriesColor(8, 'light')).toBe(getSeriesColor(20, 'light'));
    });
});
