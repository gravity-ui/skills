import {describe, expect, it} from 'vitest';

import {SERIES_COLORS, toMonitoringWidgetData, toSalesWidgetData} from './adapters';
import type {MonitoringData, SalesData} from './types';

const sales: SalesData = {
    yAxisTitle: 'млн ₽',
    series: [
        {
            name: 'Онлайн',
            points: [
                {t: Date.UTC(2025, 0, 1), value: 4.2},
                {t: Date.UTC(2025, 1, 1), value: 4.6},
            ],
        },
    ],
};

const monitoring: MonitoringData = {
    timeline: [1000, 2000, 3000],
    timeZone: 'Europe/Moscow',
    series: [
        {name: 'CPU, %', data: [10, 20, 30]},
        {name: 'Память, %', data: [40, null, 60]},
    ],
};

describe('toSalesWidgetData', () => {
    it('maps unified points onto a gravity-charts line config with a datetime axis', () => {
        const config = toSalesWidgetData(sales);

        expect(config.xAxis?.type).toBe('datetime');
        expect(config.legend?.enabled).toBe(true);
        expect(config.yAxis?.[0]?.title?.text).toBe('млн ₽');
        expect(config.series.data).toHaveLength(1);
        expect(config.series.data[0]?.type).toBe('line');
        expect(config.series.data[0]?.data).toEqual([
            {x: Date.UTC(2025, 0, 1), y: 4.2},
            {x: Date.UTC(2025, 1, 1), y: 4.6},
        ]);
    });
});

describe('toMonitoringWidgetData', () => {
    it('maps unified series onto a yagr config with timeline, legend and tooltip', () => {
        const config = toMonitoringWidgetData(monitoring);

        expect(config.data.timeline).toBe(monitoring.timeline);
        expect(config.data.timeZone).toBe('Europe/Moscow');
        expect(config.data.graphs.map((graph) => graph.name)).toEqual(['CPU, %', 'Память, %']);
        expect(config.data.graphs[1]?.data).toEqual([40, null, 60]);
        expect(config.libraryConfig.legend?.show).toBe(true);
        expect(config.libraryConfig.tooltip?.show).toBe(true);
    });

    it('assigns palette colors in fixed order and honors explicit overrides', () => {
        const config = toMonitoringWidgetData({
            ...monitoring,
            series: [...monitoring.series, {name: 'Диск, %', data: [1, 2, 3], color: '#6250d6'}],
        });

        expect(config.data.graphs.map((graph) => graph.color)).toEqual([
            SERIES_COLORS[0],
            SERIES_COLORS[1],
            '#6250d6',
        ]);
    });
});
