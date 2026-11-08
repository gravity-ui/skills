import {describe, expect, it} from 'vitest';

import {isDatasetEmpty, toGravityChartsData, toYagrData} from './adapters';
import type {VisualizationDataset} from './types';

const dataset: VisualizationDataset = {
    yAxisTitle: 'мс',
    series: [
        {id: 'a', name: 'A', timestamps: [1000, 3000], values: [1, 3]},
        {id: 'b', name: 'B', timestamps: [2000, 3000], values: [20, null]},
    ],
};

describe('visualization adapters', () => {
    it('builds a datetime line chart for gravity-charts', () => {
        const data = toGravityChartsData(dataset);
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.series.data).toHaveLength(2);
        expect(data.series.data[0]).toMatchObject({
            type: 'line',
            name: 'A',
            data: [
                {x: 1000, y: 1},
                {x: 3000, y: 3},
            ],
        });
    });

    it('aligns series to a shared timeline for yagr, filling gaps with null', () => {
        const {data} = toYagrData(dataset);
        expect(data.timeline).toEqual([1000, 2000, 3000]);
        expect(data.graphs.map((g) => g.data)).toEqual([
            [1, null, 3],
            [null, 20, null],
        ]);
    });

    it('detects empty datasets', () => {
        expect(isDatasetEmpty({series: []})).toBe(true);
        expect(isDatasetEmpty({series: [{id: 'x', name: 'x', timestamps: [], values: []}]})).toBe(true);
        expect(isDatasetEmpty(dataset)).toBe(false);
    });
});
