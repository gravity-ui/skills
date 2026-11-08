import {describe, expect, it} from 'vitest';

import {alignSeries, buildTimeline, toChartsData, toYagrConfig} from './adapters';
import {getSeriesColors, MAX_SERIES} from './palette';
import type {WidgetSeries} from './types';

const A: WidgetSeries = {
    id: 'a',
    name: 'A',
    points: [
        {t: 3000, v: 30},
        {t: 1000, v: 10},
        {t: 2000, v: null},
    ],
};
const B: WidgetSeries = {
    id: 'b',
    name: 'B',
    points: [
        {t: 2000, v: 20},
        {t: 4000, v: 40},
    ],
};

describe('buildTimeline', () => {
    it('объединяет метки всех рядов, сортирует и убирает дубли', () => {
        expect(buildTimeline([A, B])).toEqual([1000, 2000, 3000, 4000]);
    });

    it('возвращает пустую шкалу без рядов', () => {
        expect(buildTimeline([])).toEqual([]);
    });
});

describe('alignSeries', () => {
    it('ставит null там, где у ряда нет метки, и сохраняет явные null', () => {
        const timeline = buildTimeline([A, B]);
        // Шкала [1000, 2000, 3000, 4000]: у A нет 4000, явный null на 2000 сохраняется.
        expect(alignSeries(A, timeline)).toEqual([10, null, 30, null]);
        expect(alignSeries(B, timeline)).toEqual([null, 20, null, 40]);
    });
});

describe('toChartsData', () => {
    it('строит линейные серии с временной осью и цветами по индексу', () => {
        const colors = getSeriesColors('light');
        const data = toChartsData([A, B], colors);
        expect(data.xAxis).toEqual({type: 'datetime'});
        expect(data.legend).toEqual({enabled: true});
        const series = data.series?.data as Array<{type: string; name: string; color: string; data: unknown[]}>;
        expect(series.map((s) => [s.type, s.name, s.color])).toEqual([
            ['line', 'A', colors[0]],
            ['line', 'B', colors[1]],
        ]);
        expect(series[0].data).toEqual([
            {x: 3000, y: 30},
            {x: 1000, y: 10},
            {x: 2000, y: null},
        ]);
    });

    it('скрывает легенду для одного ряда', () => {
        expect(toChartsData([A], getSeriesColors('light')).legend).toEqual({enabled: false});
    });
});

describe('toYagrConfig', () => {
    it('выравнивает все ряды по общему timeline в миллисекундах', () => {
        const colors = getSeriesColors('dark');
        const config = toYagrConfig([A, B], colors, 'dark');
        expect(config.timeline).toEqual([1000, 2000, 3000, 4000]);
        const series = config.series as Array<{id: string; data: unknown[]; color: string}>;
        expect(series.map((s) => s.id)).toEqual(['a', 'b']);
        expect(series[0].data).toEqual([10, null, 30, null]);
        expect(series[1].data).toEqual([null, 20, null, 40]);
        expect(series[0].color).toBe(colors[0]);
        expect(config.chart).toEqual({appearance: {theme: 'dark'}});
    });
});

describe('palette', () => {
    it('даёт разные наборы цветов для светлой и тёмной темы, одинаковой длины', () => {
        const light = getSeriesColors('light');
        const dark = getSeriesColors('dark');
        expect(light).toHaveLength(MAX_SERIES);
        expect(dark).toHaveLength(MAX_SERIES);
        expect(light).not.toEqual(dark);
    });
});
