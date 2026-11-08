import {describe, expect, it} from 'vitest';
import {settings} from '@gravity-ui/chartkit';

import {ENGINE_BY_MODE, getLoadedEngine, loadEngine} from '../engines/registry';
import {resolveSeriesColors, SERIES_PALETTE} from '../palette';
import type {VizDataset} from '../types';

const dataset: VizDataset = {
    title: 'Тест',
    unit: 'мс',
    precision: 1,
    timeline: [0, 1000, 2000],
    series: [
        {id: 'a', name: 'A', values: [1, 2, 3]},
        {id: 'b', name: 'B', values: [4, null, 6]},
    ],
};

describe('registry', () => {
    it('maps each mode to an engine type', () => {
        expect(ENGINE_BY_MODE).toEqual({sales: 'gravity-charts', monitoring: 'yagr'});
    });

    it('is not loaded before first request', () => {
        expect(getLoadedEngine('gravity-charts')).toBeUndefined();
        expect(getLoadedEngine('yagr')).toBeUndefined();
        expect(settings.get('plugins').map((p) => p.type)).toEqual([]);
    });

    it('loads engines lazily and registers their plugins once', async () => {
        const gc = await loadEngine('gravity-charts');
        expect(gc.type).toBe('gravity-charts');
        expect(getLoadedEngine('gravity-charts')).toBe(gc);
        expect(settings.get('plugins').map((p) => p.type)).toEqual(['gravity-charts']);

        const again = await loadEngine('gravity-charts');
        expect(again).toBe(gc);
        expect(settings.get('plugins')).toHaveLength(1);

        const yagr = await loadEngine('yagr');
        expect(yagr.type).toBe('yagr');
        expect(settings.get('plugins').map((p) => p.type)).toEqual(['gravity-charts', 'yagr']);
    });
});

describe('gravity-charts engine', () => {
    it('builds line series with datetime x axis from the unified dataset', async () => {
        const engine = await loadEngine('gravity-charts');
        const props = engine.build(dataset, {theme: 'light', lang: 'ru', colors: ['#111111', '#222222']});
        expect(props.type).toBe('gravity-charts');
        if (props.type !== 'gravity-charts') throw new Error('unreachable');

        const {data} = props;
        expect(data.xAxis?.type).toBe('datetime');
        expect(data.series.data).toHaveLength(2);
        const [a, b] = data.series.data;
        expect(a).toMatchObject({type: 'line', name: 'A', color: '#111111', lineWidth: 2});
        expect(a.type === 'line' && a.data).toEqual([
            {x: 0, y: 1},
            {x: 1000, y: 2},
            {x: 2000, y: 3},
        ]);
        expect(b.type === 'line' && b.data[1]).toEqual({x: 1000, y: null});
        expect(data.legend?.enabled).toBe(true);
        expect(data.tooltip).toMatchObject({valueFormat: {type: 'number', precision: 1, postfix: ' мс'}});
    });
});

describe('yagr engine', () => {
    it('builds graphs + timeline and passes theme/locale to the library config', async () => {
        const engine = await loadEngine('yagr');
        const props = engine.build(dataset, {theme: 'dark', lang: 'ru', colors: ['#111111', '#222222']});
        expect(props.type).toBe('yagr');
        if (props.type !== 'yagr') throw new Error('unreachable');

        const {data} = props;
        expect(data.data.timeline).toEqual([0, 1000, 2000]);
        expect(data.data.graphs.map((g) => g.name)).toEqual(['A', 'B']);
        expect(data.data.graphs[1].data).toEqual([4, null, 6]);
        expect(data.data.graphs[0].color).toBe('#111111');
        expect(data.libraryConfig.chart?.appearance).toEqual({theme: 'dark', locale: 'ru'});
        expect(data.libraryConfig.legend?.show).toBe(true);
        expect(data.libraryConfig.axes?.y?.label).toBe('мс');

        const format = data.libraryConfig.tooltip?.value;
        expect(typeof format).toBe('function');
        if (typeof format === 'function') {
            expect(format(12.345)).toBe('12,3\u00a0мс');
            expect(format(null)).toBe('—');
        }
    });
});

describe('palette', () => {
    it('assigns colors by series position and respects explicit colors', () => {
        const colors = resolveSeriesColors(
            [
                {id: 'x', name: 'X', values: []},
                {id: 'y', name: 'Y', values: [], color: '#abcdef'},
                {id: 'z', name: 'Z', values: []},
            ],
            'light',
        );
        expect(colors).toEqual([SERIES_PALETTE.light[0], '#abcdef', SERIES_PALETTE.light[2]]);
    });

    it('has a distinct dark step for every slot', () => {
        expect(SERIES_PALETTE.dark).toHaveLength(SERIES_PALETTE.light.length);
    });
});
