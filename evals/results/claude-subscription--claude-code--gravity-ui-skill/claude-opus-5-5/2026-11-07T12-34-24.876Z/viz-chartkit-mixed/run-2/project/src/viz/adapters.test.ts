import {describe, expect, it} from 'vitest';

import {isEmptySet, toMonitoringYagrData, toSalesChartData} from './adapters';
import type {VisualizationView} from './types';

const view: VisualizationView = {
    label: 'Test',
    unit: '%',
    precision: 1,
    data: {
        timeline: [1000, 2000, 3000],
        series: [
            {id: 'a', name: 'A', values: [1, null, 3]},
            {id: 'b', name: 'B', values: [4, 5, 6]},
        ],
    },
};

describe('adapters', () => {
    it('maps the shared format to gravity-charts line series', () => {
        const chart = toSalesChartData(view);
        expect(chart.xAxis?.type).toBe('datetime');
        expect(chart.series.data).toHaveLength(2);
        expect(chart.series.data[0]).toMatchObject({
            type: 'line',
            name: 'A',
            data: [
                {x: 1000, y: 1},
                {x: 2000, y: null},
                {x: 3000, y: 3},
            ],
        });
    });

    it('maps the same format to yagr columnar data', () => {
        const yagr = toMonitoringYagrData(view);
        expect(yagr.data.timeline).toBe(view.data.timeline);
        expect(yagr.data.graphs.map((g) => g.data)).toEqual([
            [1, null, 3],
            [4, 5, 6],
        ]);
        expect(yagr.libraryConfig.chart?.timeMultiplier).toBe(1);
    });

    it('detects empty sets', () => {
        expect(isEmptySet({timeline: [], series: []})).toBe(true);
        expect(isEmptySet(view.data)).toBe(false);
    });
});
