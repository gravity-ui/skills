import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createMonitoringDataset} from '../../data/monitoring';
import {createSalesDataset} from '../../data/sales';
import {monitoringTimeseriesEngine} from '../engines/monitoringTimeseries';
import {salesLineEngine} from '../engines/salesLine';
import {getSeriesColors} from '../palette';
import type {VizDataset} from '../types';

const loads = vi.hoisted(() => ({gravity: 0, yagr: 0}));

vi.mock('@gravity-ui/date-utils', () => ({
    settings: {loadLocale: async () => undefined, setLocale: () => undefined},
}));
vi.mock('@gravity-ui/chartkit', () => ({
    settings: {set: vi.fn(), get: vi.fn()},
}));
vi.mock('@gravity-ui/chartkit/gravity-charts', () => {
    loads.gravity += 1;
    return {GravityChartsPlugin: {type: 'gravity-charts', renderer: {}}};
});
vi.mock('@gravity-ui/chartkit/yagr', () => {
    loads.yagr += 1;
    return {YagrPlugin: {type: 'yagr', renderer: {}}};
});

const dataset: VizDataset = {
    timeline: [1_000, 2_000, 3_000],
    series: [
        {id: 'a', name: 'A', values: [1, null, 3]},
        {id: 'b', name: 'B', values: [4, 5, 6]},
    ],
    unit: 'шт',
    precision: 1,
    timeZone: 'Europe/Moscow',
};

const ctx = {theme: 'light' as const, colors: getSeriesColors('light', 2)};

describe('адаптеры движков', () => {
    it('salesLineEngine строит ChartData с датами на оси X и точками (x, y)', () => {
        const data = salesLineEngine.buildData(dataset, ctx);

        expect(salesLineEngine.type).toBe('gravity-charts');
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.colors).toEqual(ctx.colors);
        expect(data.series.data).toHaveLength(2);
        expect(data.series.data[0]).toMatchObject({type: 'line', name: 'A', color: ctx.colors[0]});
        expect((data.series.data[0] as {data: unknown[]}).data).toEqual([
            {x: 1_000, y: 1},
            {x: 2_000, y: null},
            {x: 3_000, y: 3},
        ]);
        expect(data.legend?.enabled).toBe(true);
    });

    it('monitoringTimeseriesEngine передаёт общий timeline и значения серий как есть', () => {
        const data = monitoringTimeseriesEngine.buildData(dataset, ctx);

        expect(monitoringTimeseriesEngine.type).toBe('yagr');
        expect(data.data.timeline).toBe(dataset.timeline);
        expect(data.data.timeZone).toBe('Europe/Moscow');
        expect(data.data.graphs.map((g) => g.id)).toEqual(['a', 'b']);
        expect(data.data.graphs[0].data).toBe(dataset.series[0].values);
        expect(data.data.graphs[1].color).toBe(ctx.colors[1]);
        expect(data.libraryConfig.chart?.select?.zoom).toBe(true);
        expect(data.libraryConfig.tooltip?.show).toBe(true);
    });

    it('форматтер значений тултипа мониторинга подставляет единицу и обрабатывает null', () => {
        const data = monitoringTimeseriesEngine.buildData(dataset, ctx);
        const format = data.libraryConfig.tooltip?.value as (v: number | null) => string;

        expect(format(null)).toBe('—');
        expect(format(1234.56)).toMatch(/1\s?234,6 шт/);
    });

    it('одна серия — без легенды в обоих движках', () => {
        const single: VizDataset = {...dataset, series: dataset.series.slice(0, 1)};
        const singleCtx = {...ctx, colors: getSeriesColors('light', 1)};

        expect(salesLineEngine.buildData(single, singleCtx).legend?.enabled).toBe(false);
        expect(monitoringTimeseriesEngine.buildData(single, singleCtx).libraryConfig.legend?.show).toBe(false);
    });
});

describe('палитра', () => {
    it('не зацикливает цвета: больше 8 серий — ошибка', () => {
        expect(getSeriesColors('dark', 8)).toHaveLength(8);
        expect(() => getSeriesColors('light', 9)).toThrow(/не более 8/);
    });
});

describe('реестр движков (ленивая загрузка)', () => {
    beforeEach(() => {
        vi.resetModules();
        loads.gravity = 0;
        loads.yagr = 0;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('грузит только движок запрошенного режима и регистрирует плагин один раз', async () => {
        const {settings} = await import('@gravity-ui/chartkit');
        const registry = await import('../engines/registry');
        registry.resetEngineRegistry();

        expect(registry.isEngineLoaded('sales')).toBe(false);
        expect(loads.gravity).toBe(0);

        await Promise.all([registry.loadEngine('sales'), registry.loadEngine('sales')]);
        await registry.loadEngine('sales');

        expect(registry.isEngineLoaded('sales')).toBe(true);
        expect(registry.isEngineLoaded('monitoring')).toBe(false);
        expect(loads.gravity).toBe(1);
        expect(loads.yagr).toBe(0);
        expect(settings.set).toHaveBeenCalledTimes(1);
        expect(settings.set).toHaveBeenCalledWith({
            plugins: [expect.objectContaining({type: 'gravity-charts'})],
        });
    });

    it('загрузка второго режима подтягивает его движок отдельно', async () => {
        const {settings} = await import('@gravity-ui/chartkit');
        const registry = await import('../engines/registry');
        registry.resetEngineRegistry();

        await registry.loadEngine('monitoring');

        expect(registry.isEngineLoaded('monitoring')).toBe(true);
        expect(loads.yagr).toBe(1);
        expect(settings.set).toHaveBeenCalledWith({
            plugins: [expect.objectContaining({type: 'yagr'})],
        });
    });
});

describe('демо-данные', () => {
    it('продажи: 24 месяца, 3 канала, значения выровнены по timeline', () => {
        const sales = createSalesDataset();
        expect(sales.timeline).toHaveLength(24);
        expect(sales.series).toHaveLength(3);
        for (const serie of sales.series) {
            expect(serie.values).toHaveLength(24);
            expect(serie.values.every((v) => typeof v === 'number' && v > 0)).toBe(true);
        }
        expect(sales.timeline[1] - sales.timeline[0]).toBeGreaterThan(27 * 24 * 3600 * 1000);
    });

    it('мониторинг: шаг в 1 секунду, тысячи точек, есть разрыв данных', () => {
        const monitoring = createMonitoringDataset();
        expect(monitoring.timeline.length).toBeGreaterThan(7000);
        expect(monitoring.timeline[1] - monitoring.timeline[0]).toBe(1000);
        expect(monitoring.series.some((s) => s.values.includes(null))).toBe(true);
        for (const serie of monitoring.series) {
            expect(serie.values).toHaveLength(monitoring.timeline.length);
        }
    });

    it('генераторы детерминированы', () => {
        expect(createSalesDataset()).toEqual(createSalesDataset());
        expect(createMonitoringDataset().series[0].values.slice(0, 50)).toEqual(
            createMonitoringDataset().series[0].values.slice(0, 50),
        );
    });
});
