import {describe, expect, it} from 'vitest';

import {assertValidDataset, countPoints, isEmptyDataset, toGravityChartsData, toYagrData} from './adapters';
import type {VisualizationView} from './types';

const view: VisualizationView = {
    id: 'v',
    label: 'View',
    engine: 'line',
    yAxisTitle: 'Units',
    precision: 1,
    data: {
        timestamps: [1000, 2000, 3000],
        series: [
            {id: 'a', name: 'A', values: [1, null, 3]},
            {id: 'b', name: 'B', values: [4, 5, 6]},
        ],
    },
};

describe('adapters', () => {
    it('maps the unified dataset to gravity-charts line series', () => {
        const data = toGravityChartsData(view);
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.yAxis?.[0]?.title?.text).toBe('Units');
        expect(data.series.data).toHaveLength(2);
        expect(data.series.data[0]).toMatchObject({
            type: 'line',
            name: 'A',
            data: [
                {x: 1000, y: 1},
                {x: 2000, y: null},
                {x: 3000, y: 3},
            ],
        });
        expect(data.legend?.enabled).toBe(true);
    });

    it('maps the same dataset to a yagr timeline + graphs', () => {
        const {data, libraryConfig} = toYagrData({...view, engine: 'timeseries'});
        expect(data.timeline).toEqual([1000, 2000, 3000]);
        expect(data.graphs.map((g) => g.data)).toEqual([
            [1, null, 3],
            [4, 5, 6],
        ]);
        expect(libraryConfig.axes?.y?.label).toBe('Units');
        expect(libraryConfig.legend?.show).toBe(true);
    });

    it('hides the legend for a single series', () => {
        const single = {...view, data: {...view.data, series: [view.data.series[1]]}};
        expect(toGravityChartsData(single).legend?.enabled).toBe(false);
        expect(toYagrData(single).libraryConfig.legend?.show).toBe(false);
    });

    it('validates series length and detects empty data', () => {
        expect(() => assertValidDataset(view.data)).not.toThrow();
        expect(() =>
            assertValidDataset({timestamps: [1, 2], series: [{id: 'x', name: 'X', values: [1]}]}),
        ).toThrow(/X/);
        expect(isEmptyDataset({timestamps: [], series: []})).toBe(true);
        expect(countPoints(view.data)).toBe(6);
    });
});
