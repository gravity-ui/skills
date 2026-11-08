import {describe, expect, it} from 'vitest';

import {isDatasetEmpty, toGravityChartsData, toYagrData, validateDataset} from './adapters';
import type {TimeSeriesDataset} from './types';

const dataset: TimeSeriesDataset = {
    unit: 'шт.',
    timestamps: [1000, 2000, 3000],
    series: [{id: 'a', name: 'A', values: [1, null, 3]}],
};

describe('visualization adapters', () => {
    it('maps the shared dataset to gravity-charts line series on a datetime axis', () => {
        const data = toGravityChartsData(dataset);
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.yAxis?.[0]?.title?.text).toBe('шт.');
        expect(data.series.data[0]).toMatchObject({
            type: 'line',
            name: 'A',
            data: [
                {x: 1000, y: 1},
                {x: 2000, y: null},
                {x: 3000, y: 3},
            ],
        });
    });

    it('maps the same dataset to yagr timeline + graphs', () => {
        const {data, libraryConfig} = toYagrData(dataset);
        expect(data.timeline).toEqual([1000, 2000, 3000]);
        expect(data.graphs).toEqual([{id: 'a', name: 'A', data: [1, null, 3]}]);
        expect(libraryConfig.chart?.timeMultiplier).toBe(1);
    });

    it('detects length mismatch and empty datasets', () => {
        expect(validateDataset(dataset)).toBeNull();
        expect(validateDataset({...dataset, series: [{id: 'b', name: 'B', values: [1]}]})).toMatch('B');
        expect(isDatasetEmpty({timestamps: [], series: []})).toBe(true);
        expect(isDatasetEmpty(dataset)).toBe(false);
    });
});
