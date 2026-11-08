import {describe, expect, test} from 'vitest';

import {toChartKitConfig} from './adapters';
import type {ChartWidgetDataset} from './types';

const dataset: ChartWidgetDataset = {
    title: 'Test',
    unit: 'ms',
    series: [
        {id: 'a', name: 'A', points: [[1000, 1], [2000, 2], [3000, null]]},
        // Ряд с другим набором меток времени: должен выровняться по общему timeline.
        {id: 'b', name: 'B', points: [[2000, 20], [4000, 40]]},
    ],
};

describe('toChartKitConfig', () => {
    test('sales → gravity-charts line series', () => {
        const config = toChartKitConfig('sales', dataset, {colorScheme: 'light'});
        expect(config.type).toBe('gravity-charts');
        if (config.type !== 'gravity-charts') return;

        const [a, b] = config.data.series.data;
        expect(a).toMatchObject({type: 'line', id: 'a', color: '#2a78d6'});
        expect(b).toMatchObject({type: 'line', id: 'b', color: '#eb6834'});
        expect(a.data).toEqual([{x: 1000, y: 1}, {x: 2000, y: 2}, {x: 3000, y: null}]);
        expect(config.data.xAxis?.type).toBe('datetime');
    });

    test('monitoring → yagr with aligned timeline', () => {
        const config = toChartKitConfig('monitoring', dataset, {colorScheme: 'dark'});
        expect(config.type).toBe('yagr');
        if (config.type !== 'yagr') return;

        const {timeline, graphs} = config.data.data;
        expect(timeline).toEqual([1000, 2000, 3000, 4000]);
        expect(graphs.map((g) => g.data)).toEqual([
            [1, 2, null, null],
            [null, 20, null, 40],
        ]);
        expect(graphs.map((g) => g.color)).toEqual(['#3987e5', '#d95926']);
    });

    test('colors follow series position, not mode', () => {
        const sales = toChartKitConfig('sales', dataset, {colorScheme: 'light'});
        const monitoring = toChartKitConfig('monitoring', dataset, {colorScheme: 'light'});
        if (sales.type !== 'gravity-charts' || monitoring.type !== 'yagr') throw new Error('wrong type');
        expect(sales.data.series.data.map((s) => ('color' in s ? s.color : undefined))).toEqual(
            monitoring.data.data.graphs.map((g) => g.color),
        );
    });
});
