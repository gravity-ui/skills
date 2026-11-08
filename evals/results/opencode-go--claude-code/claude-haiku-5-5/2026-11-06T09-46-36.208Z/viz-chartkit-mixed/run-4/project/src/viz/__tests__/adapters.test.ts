import {describe, expect, it} from 'vitest';

import {toMonitoringChart} from '../adapters/monitoring';
import {toSalesChart} from '../adapters/sales';
import {SERIES_COLORS_LIGHT} from '../palette';
import {buildTimeline, summarize, validateSeries} from '../series';
import type {VizSeries} from '../types';

const series: VizSeries[] = [
  {
    id: 'site',
    name: 'Сайт',
    points: [
      {t: 1000, v: 10},
      {t: 2000, v: 20},
      {t: 3000, v: null},
    ],
  },
  {
    id: 'app',
    name: 'Приложение',
    points: [
      {t: 2000, v: 5},
      {t: 4000, v: 7},
    ],
  },
];

describe('buildTimeline', () => {
  it('returns the sorted union of all timestamps', () => {
    expect(buildTimeline(series)).toEqual([1000, 2000, 3000, 4000]);
  });
});

describe('toMonitoringChart (yagr)', () => {
  const config = toMonitoringChart(series, {unit: '₽'});

  it('aligns every series to the shared timeline with nulls for missing samples', () => {
    expect(config.data.timeline).toEqual([1000, 2000, 3000, 4000]);
    expect(config.data.graphs[0].data).toEqual([10, 20, null, null]);
    expect(config.data.graphs[1].data).toEqual([null, 5, null, 7]);
  });

  it('declares epoch milliseconds, the same unit as the sales mode', () => {
    expect(config.libraryConfig.chart?.timeMultiplier).toBe(1);
  });

  it('assigns colors by position in the fixed categorical order', () => {
    expect(config.data.graphs.map((g) => g.color)).toEqual(SERIES_COLORS_LIGHT.slice(0, 2));
  });

  it('shows the legend only for two or more series', () => {
    expect(config.libraryConfig.legend?.show).toBe(true);
    expect(toMonitoringChart([series[0]]).libraryConfig.legend?.show).toBe(false);
  });

  it('formats tooltip values with the unit and shows an em dash for gaps', () => {
    const format = config.libraryConfig.tooltip?.value as (v: number | null) => string;
    // ru-RU groups thousands with a no-break space (U+00A0), which is the intended typography.
    expect(format(1234.4)).toBe('1 234 ₽');
    expect(format(null)).toBe('—');
  });
});

describe('toSalesChart (gravity-charts)', () => {
  const config = toSalesChart(series, {unit: '₽'});

  it('keeps gaps as points with null y, not zeros', () => {
    const [site] = config.series.data;
    expect(site.data).toEqual([
      {x: 1000, y: 10},
      {x: 2000, y: 20},
      {x: 3000, y: null},
    ]);
  });

  it('uses one datetime x-axis and the fixed series colors', () => {
    expect(config.xAxis).toMatchObject({type: 'datetime'});
    // ChartSeries is a union over all chart kinds; every series in this adapter is a line.
    expect(config.series.data.map((s) => (s as {color?: string}).color)).toEqual(SERIES_COLORS_LIGHT.slice(0, 2));
  });

  it('enables the legend only for two or more series', () => {
    expect(config.legend).toEqual({enabled: true});
    expect(toSalesChart([series[0]]).legend).toEqual({enabled: false});
  });
});

describe('validateSeries', () => {
  it('accepts up to the three-series limit', () => {
    expect(validateSeries([series[0], series[1]])).toBeNull();
  });

  it('refuses a fourth series instead of cycling hues', () => {
    const four = [...series, {id: 'x', name: 'X', points: []}, {id: 'y', name: 'Y', points: []}];
    expect(validateSeries(four)).toMatch(/Серий больше 3/);
  });

  it('rejects duplicate ids', () => {
    expect(validateSeries([series[0], {...series[1], id: 'site'}])).toMatch(/Повторяющийся id/);
  });

  it('rejects points that are not in ascending time order', () => {
    const unsorted: VizSeries = {id: 'u', name: 'U', points: [{t: 2, v: 1}, {t: 1, v: 1}]};
    expect(validateSeries([unsorted])).toMatch(/возрастанию времени/);
  });
});

describe('summarize', () => {
  it('ignores gaps for min/max/avg/last and counts them separately', () => {
    const [site] = summarize(series);
    expect(site).toMatchObject({count: 2, gaps: 1, last: 20, min: 10, max: 20, avg: 15});
  });

  it('returns nulls for a series with no real values', () => {
    const [empty] = summarize([{id: 'e', name: 'E', points: [{t: 1, v: null}]}]);
    expect(empty).toMatchObject({count: 0, gaps: 1, last: null, min: null, max: null, avg: null});
  });
});
