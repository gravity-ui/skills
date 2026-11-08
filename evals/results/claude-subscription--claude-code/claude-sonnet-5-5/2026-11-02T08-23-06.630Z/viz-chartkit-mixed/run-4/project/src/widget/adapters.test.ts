import {describe, expect, it} from 'vitest';

import {alignSeries} from './adapters';
import {buildSalesConfig} from './engines/salesConfig';
import {buildMonitoringConfig} from './engines/monitoringConfig';
import type {TimeSeries} from './types';

const s = (id: string, points: [number, number | null][]): TimeSeries => ({id, name: id, points});

describe('alignSeries', () => {
  it('returns empty result for no series', () => {
    expect(alignSeries([])).toEqual({timeline: [], columns: []});
  });

  it('keeps the shared grid as is', () => {
    const r = alignSeries([
      s('a', [[1, 10], [2, 20]]),
      s('b', [[1, 1], [2, null]]),
    ]);
    expect(r.timeline).toEqual([1, 2]);
    expect(r.columns).toEqual([[10, 20], [1, null]]);
  });

  it('merges different grids and fills gaps with null', () => {
    const r = alignSeries([
      s('a', [[1, 10], [3, 30]]),
      s('b', [[2, 2], [3, 3]]),
    ]);
    expect(r.timeline).toEqual([1, 2, 3]);
    expect(r.columns).toEqual([[10, null, 30], [null, 2, 3]]);
  });
});

describe('engine configs', () => {
  const fmt = (v: number) => `${v}!`;

  it('sales: one line series per input series with stable colors', () => {
    const cfg = buildSalesConfig([{...s('a', [[1, 5]]), color: '#123456'}, s('b', [[1, 6]])], fmt);
    const series = cfg.series.data;
    expect(series).toHaveLength(2);
    expect(series[0]).toMatchObject({type: 'line', name: 'a', color: '#123456'});
    expect(series[1]).toMatchObject({color: '#eb6834'});
    expect(cfg.legend?.enabled).toBe(true);
  });

  it('sales: single series has no legend', () => {
    expect(buildSalesConfig([s('a', [[1, 5]])], fmt).legend?.enabled).toBe(false);
  });

  it('monitoring: shared timeline and aligned graph data', () => {
    const cfg = buildMonitoringConfig([s('a', [[1, 1], [3, 3]]), s('b', [[2, 2]])], fmt);
    expect(cfg.data.timeline).toEqual([1, 2, 3]);
    expect(cfg.data.graphs.map((g) => g.data)).toEqual([[1, null, 3], [null, 2, null]]);
  });
});
