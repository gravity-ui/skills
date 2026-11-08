import {describe, expect, it} from 'vitest';

import {toMonitoringConfig, toSalesChartData, unionTimeline} from './transform';
import type {TimeSeries} from './types';

const a: TimeSeries = {
    id: 'a',
    name: 'A',
    color: '#111',
    points: [
        {t: 1000, v: 1},
        {t: 2000, v: null},
        {t: 4000, v: 4},
    ],
};

const b: TimeSeries = {
    id: 'b',
    name: 'B',
    points: [
        {t: 2000, v: 20},
        {t: 3000, v: 30},
    ],
};

describe('unionTimeline', () => {
    it('returns sorted unique timestamps across all series', () => {
        expect(unionTimeline([a, b])).toEqual([1000, 2000, 3000, 4000]);
    });

    it('returns an empty timeline for no series', () => {
        expect(unionTimeline([])).toEqual([]);
    });
});

describe('toSalesChartData', () => {
    it('builds datetime line series with x/y pairs, keeping gaps as null', () => {
        const data = toSalesChartData([a]);

        expect(data.xAxis).toEqual({type: 'datetime'});
        expect(data.series.data).toEqual([
            {
                type: 'line',
                name: 'A',
                color: '#111',
                data: [
                    {x: 1000, y: 1},
                    {x: 2000, y: null},
                    {x: 4000, y: 4},
                ],
            },
        ]);
    });
});

describe('toMonitoringConfig', () => {
    it('aligns every series to the shared timeline and fills missing samples with null', () => {
        const config = toMonitoringConfig([a, b], 'dark');

        expect(config.timeline).toEqual([1000, 2000, 3000, 4000]);
        expect(config.series).toHaveLength(2);
        expect(config.series[0]).toMatchObject({id: 'a', type: 'line', data: [1, null, null, 4]});
        expect(config.series[1]).toMatchObject({id: 'b', type: 'line', data: [null, 20, 30, null]});
    });

    it('keeps timestamps in milliseconds and applies the requested theme', () => {
        const config = toMonitoringConfig([a], 'dark');

        expect(config.chart).toEqual({timeMultiplier: 1, appearance: {theme: 'dark'}});
    });

    it('does not mutate the input series', () => {
        const snapshot = JSON.stringify([a, b]);
        toMonitoringConfig([a, b], 'light');
        expect(JSON.stringify([a, b])).toBe(snapshot);
    });
});
