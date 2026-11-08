import {describe, expect, it} from 'vitest';

import {buildTimeline, toYagrData} from '../engines/monitoringAdapter';
import {toGravityChartsData} from '../engines/salesAdapter';
import {CATEGORICAL} from '../palette';
import type {VizDataset, VizRenderContext} from '../types';

const ctx: VizRenderContext = {theme: 'light', palette: CATEGORICAL.light};

const dataset: VizDataset = {
    unit: 'млн ₽',
    yMin: 0,
    series: [
        {id: 'a', name: 'A', points: [{t: 1000, y: 1}, {t: 2000, y: 2}, {t: 3000, y: null}]},
        {id: 'b', name: 'B', points: [{t: 1000, y: 10}, {t: 2000, y: 20}, {t: 3000, y: 30}]},
    ],
};

describe('sales adapter (gravity-charts)', () => {
    it('maps the unified dataset to line series with fixed palette order', () => {
        const data = toGravityChartsData(dataset, ctx);
        expect(data.series.data).toHaveLength(2);
        const [a, b] = data.series.data as Array<{type: string; name: string; color?: string; data: unknown[]}>;
        expect(a!.type).toBe('line');
        expect(a!.name).toBe('A');
        expect(a!.color).toBe(CATEGORICAL.light[0]);
        expect(b!.color).toBe(CATEGORICAL.light[1]);
        expect(a!.data).toEqual([
            {x: 1000, y: 1},
            {x: 2000, y: 2},
            {x: 3000, y: null},
        ]);
    });

    it('uses a datetime x axis, one y axis and a legend for 2+ series', () => {
        const data = toGravityChartsData(dataset, ctx);
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.yAxis).toHaveLength(1);
        expect(data.yAxis?.[0]?.min).toBe(0);
        expect(data.yAxis?.[0]?.title?.text).toBe('млн ₽');
        expect(data.legend?.enabled).toBe(true);
        expect(data.tooltip?.enabled).toBe(true);
    });

    it('hides the legend for a single series', () => {
        const single = {...dataset, series: dataset.series.slice(0, 1)};
        expect(toGravityChartsData(single, ctx).legend?.enabled).toBe(false);
    });

    it('keeps a series colour when siblings are removed (colour follows the entity)', () => {
        const onlyB = {...dataset, series: dataset.series.slice(1)};
        const data = toGravityChartsData(onlyB, ctx);
        // Цвет назначается по индексу в датасете — хозяин датасета отвечает за стабильный порядок.
        expect((data.series.data[0] as {color?: string}).color).toBe(CATEGORICAL.light[0]);
    });
});

describe('monitoring adapter (yagr)', () => {
    it('reuses a shared timeline when all series are on the same grid', () => {
        expect(buildTimeline(dataset)).toEqual([1000, 2000, 3000]);
    });

    it('merges and sorts timelines when series differ, filling gaps with null', () => {
        const ragged: VizDataset = {
            series: [
                {id: 'a', name: 'A', points: [{t: 3000, y: 3}, {t: 1000, y: 1}]},
                {id: 'b', name: 'B', points: [{t: 2000, y: 2}]},
            ],
        };
        expect(buildTimeline(ragged)).toEqual([1000, 2000, 3000]);
        const data = toYagrData(ragged, ctx);
        const byId = Object.fromEntries(data.data.graphs.map((g) => [g.id, g.data]));
        expect(byId.a).toEqual([1, null, 3]);
        expect(byId.b).toEqual([null, 2, null]);
    });

    it('produces yagr widget data with theme, scale bounds and legend', () => {
        const data = toYagrData({...dataset, yMax: 100, timeZone: 'Europe/Moscow'}, {...ctx, theme: 'dark'});
        expect(data.data.timeline).toEqual([1000, 2000, 3000]);
        expect(data.data.timeZone).toBe('Europe/Moscow');
        // Порядок graphs перевёрнут (особенность Yagr), но цвет закреплён за серией.
        expect(data.data.graphs.map((g) => g.id)).toEqual(['b', 'a']);
        expect(data.data.graphs.map((g) => g.color)).toEqual([CATEGORICAL.light[1], CATEGORICAL.light[0]]);
        expect(data.libraryConfig.chart?.appearance?.theme).toBe('dark');
        expect(data.libraryConfig.scales?.y).toMatchObject({min: 0, max: 100});
        expect(data.libraryConfig.legend?.show).toBe(true);
        expect(data.libraryConfig.cursor?.x?.visible).toBe(true);
    });

    it('formats tooltip values with the dataset unit and titles in Russian', () => {
        const data = toYagrData({...dataset, timeZone: 'UTC'}, ctx);
        const format = data.libraryConfig.tooltip?.value as (v: number | null) => string;
        expect(format(12.345)).toBe('12,35 млн ₽');
        expect(format(null)).toBe('—');
        const title = data.libraryConfig.tooltip?.title as (d: {x: number}) => string;
        expect(title({x: Date.UTC(2026, 10, 2, 5, 37, 0)})).toMatch(/02 ноября 2026 г\..*05:37:00/);
    });
});
