import {describe, expect, it} from 'vitest';

import {buildMonitoringData} from '../engines/monitoring';
import {loadEngine, peekEngine} from '../engines/registry';
import {buildSalesData} from '../engines/sales';
import {formatValue, limitSeries, resolveDataset} from '../data';
import type {EngineContext, TimeSeriesDataset} from '../types';

const ctx: EngineContext = {theme: 'light', colors: ['#2a78d6', '#eb6834', '#1baf7a'], lang: 'ru'};

const dataset: TimeSeriesDataset = {
    valueLabel: 'Выручка, тыс. ₽',
    unit: 'тыс. ₽',
    precision: 0,
    series: [
        {id: 'a', name: 'A', points: [{x: 1000, y: 10}, {x: 2000, y: 12}, {x: 3000, y: null}]},
        {id: 'b', name: 'B', points: [{x: 1000, y: 5}, {x: 2500, y: 7}]},
    ],
};

describe('resolveDataset / limitSeries', () => {
    it('uses one dataset for both modes when a plain dataset is passed', () => {
        expect(resolveDataset(dataset, 'sales')).toBe(dataset);
        expect(resolveDataset(dataset, 'monitoring')).toBe(dataset);
    });

    it('picks the per-mode dataset from a record', () => {
        const other: TimeSeriesDataset = {series: []};
        expect(resolveDataset({sales: dataset, monitoring: other}, 'monitoring')).toBe(other);
        expect(resolveDataset({sales: dataset}, 'monitoring')).toBeUndefined();
    });

    it('caps the number of series to the validated palette size', () => {
        const many: TimeSeriesDataset = {
            series: Array.from({length: 6}, (_, i) => ({id: String(i), name: String(i), points: []})),
        };
        expect(limitSeries(many).series).toHaveLength(3);
        expect(limitSeries(dataset)).toBe(dataset);
    });

    it('formats values with unit and placeholder for gaps', () => {
        expect(formatValue(null)).toBe('—');
        expect(formatValue(12.345, '%', 1)).toBe('12,3 %');
    });
});

describe('sales engine (gravity-charts)', () => {
    it('builds one 2px line series per input series with a label on the last point only', () => {
        const data = buildSalesData(dataset, ctx);
        expect(data.series.data).toHaveLength(2);
        const first = data.series.data[0];
        expect(first.type).toBe('line');
        expect(first).toMatchObject({lineWidth: 2, name: 'A'});
        const flags = (first as {data: {dataLabels?: {enabled?: boolean}}[]}).data.map(
            (p) => p.dataLabels?.enabled,
        );
        // Последняя точка — пропуск, значит подпись не ставится ни на одной.
        expect(flags).toEqual([false, false, false]);
        const second = data.series.data[1] as {data: {dataLabels?: {enabled?: boolean}}[]};
        expect(second.data.map((p) => p.dataLabels?.enabled)).toEqual([false, true]);
        expect(data.colors).toEqual(ctx.colors);
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.legend?.enabled).toBe(true);
    });

    it('hides the legend for a single series', () => {
        const single = {...dataset, series: dataset.series.slice(0, 1)};
        expect(buildSalesData(single, ctx).legend?.enabled).toBe(false);
    });
});

describe('monitoring engine (yagr)', () => {
    it('aligns all series on a shared sorted timeline and keeps gaps as null', () => {
        const data = buildMonitoringData(dataset, ctx);
        expect(data.data.timeline).toEqual([1000, 2000, 2500, 3000]);
        expect(data.data.graphs[0].data).toEqual([10, 12, null, null]);
        expect(data.data.graphs[1].data).toEqual([5, null, 7, null]);
        expect(data.data.graphs.map((g) => g.color)).toEqual(ctx.colors.slice(0, 2));
        expect(data.data.graphs[0]).toMatchObject({type: 'line', width: 2, id: 'a', name: 'A'});
        expect(data.libraryConfig.tooltip?.show).toBe(true);
        expect(data.libraryConfig.scales?.y?.min).toBe(0);
    });
});

describe('engine registry', () => {
    it('loads engines lazily, registers them once and caches the result', async () => {
        expect(peekEngine('sales')).toBeUndefined();
        const [a, b] = await Promise.all([loadEngine('sales'), loadEngine('sales')]);
        expect(a).toBe(b);
        expect(a.type).toBe('gravity-charts');
        expect(peekEngine('sales')).toBe(a);

        const monitoring = await loadEngine('monitoring');
        expect(monitoring.type).toBe('yagr');

        const {settings} = await import('@gravity-ui/chartkit');
        const types = settings.get('plugins').map((p) => p.type);
        expect(types).toContain('gravity-charts');
        expect(types).toContain('yagr');
        expect(new Set(types).size).toBe(types.length);
    });
});
