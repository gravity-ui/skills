import {describe, expect, it} from 'vitest';

import {formatValue, toGravityChartsData, toYagrData} from './adapters';
import {SERIES_COLORS} from './palette';
import type {TimeSeriesData} from './types';

const data: TimeSeriesData = {
    timeline: [1000, 2000, 3000],
    series: [
        {id: 'a', name: 'A', values: [1, null, 3]},
        {id: 'b', name: 'B', values: [4, 5, 6], color: '#000000'},
    ],
};

describe('toGravityChartsData', () => {
    const cfg = toGravityChartsData(data, {unit: '₽', title: 'T'});
    const series = cfg.series.data as any[];

    it('maps shared timeline to {x, y} points and keeps gaps as null', () => {
        expect(series[0].data).toEqual([
            {x: 1000, y: 1},
            {x: 2000, y: null},
            {x: 3000, y: 3},
        ]);
    });

    it('assigns palette colors by series index, explicit color wins', () => {
        expect(series[0].color).toBe(SERIES_COLORS[0]);
        expect(series[1].color).toBe('#000000');
    });

    it('uses a datetime x axis, zero baseline and a legend for multi-series', () => {
        expect(cfg.xAxis?.type).toBe('datetime');
        expect(cfg.yAxis?.[0].min).toBe(0);
        expect(cfg.legend?.enabled).toBe(true);
    });

    it('hides the legend for a single series', () => {
        const one = toGravityChartsData({...data, series: [data.series[0]]});
        expect(one.legend?.enabled).toBe(false);
    });
});

describe('toYagrData', () => {
    const cfg = toYagrData(data, {unit: '%', timeZone: 'UTC', yMax: 100});

    it('passes the columnar data through without copying per-point objects', () => {
        expect(cfg.data.timeline).toBe(data.timeline);
        expect(cfg.data.graphs[0].data).toBe(data.series[0].values);
        expect(cfg.data.timeZone).toBe('UTC');
    });

    it('keeps the same series colors as the other engine', () => {
        const gc = (toGravityChartsData(data).series.data as any[]).map((s) => s.color);
        expect(cfg.data.graphs.map((g: any) => g.color)).toEqual(gc);
    });

    it('applies y range and disables markers for dense data', () => {
        expect(cfg.libraryConfig.scales?.y).toMatchObject({min: 0, max: 100});
        expect(cfg.libraryConfig.markers?.show).toBe(false);
    });
});

describe('formatValue', () => {
    it('appends the unit with a non-breaking space', () => {
        expect(formatValue(12.34, '%')).toBe('12,3 %');
        expect(formatValue(5)).toBe('5');
    });
});
