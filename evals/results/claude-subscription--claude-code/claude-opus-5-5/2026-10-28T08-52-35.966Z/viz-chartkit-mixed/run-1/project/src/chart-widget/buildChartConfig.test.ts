import {describe, expect, it} from 'vitest';

import {buildChartConfig} from './buildChartConfig';
import type {ChartWidgetData} from './types';

const data: ChartWidgetData = {
  sales: {
    series: [
      {
        name: 'Онлайн',
        points: [
          {timestamp: 1, value: 100},
          {timestamp: 2, value: 120},
        ],
      },
    ],
    valueSuffix: ' ₽',
  },
  monitoring: {
    timeline: [1000, 2000, 3000],
    series: [
      {name: 'p50', values: [10, null, 12]},
      {name: 'p99', values: [40, null, 55]},
    ],
    unit: 'мс',
  },
};

describe('buildChartConfig', () => {
  it('maps sales to a gravity-charts line chart on a datetime axis', () => {
    const chart = buildChartConfig('sales', data, 'light');
    if (chart.type !== 'gravity-charts') throw new Error(`unexpected type ${chart.type}`);

    expect(chart.data.xAxis?.type).toBe('datetime');
    expect(chart.data.series.data).toEqual([
      expect.objectContaining({
        type: 'line',
        name: 'Онлайн',
        color: '#2a78d6',
        data: [
          {x: 1, y: 100},
          {x: 2, y: 120},
        ],
      }),
    ]);
  });

  it('maps monitoring to a yagr chart sharing one timeline', () => {
    const chart = buildChartConfig('monitoring', data, 'dark');
    if (chart.type !== 'yagr') throw new Error(`unexpected type ${chart.type}`);

    expect(chart.data.data.timeline).toBe(data.monitoring.timeline);
    expect(chart.data.data.graphs.map((g) => [g.name, g.color, g.data])).toEqual([
      ['p50', '#3987e5', [10, null, 12]],
      ['p99', '#d95926', [40, null, 55]],
    ]);
    const format = chart.data.libraryConfig.tooltip?.value as (v: number | null) => string;
    expect(format(12.345)).toBe('12.3 мс');
    expect(format(null)).toBe('—');
  });

  it('picks the palette step for the current theme', () => {
    const light = buildChartConfig('monitoring', data, 'light');
    const dark = buildChartConfig('monitoring', data, 'dark');
    if (light.type !== 'yagr' || dark.type !== 'yagr') throw new Error('expected yagr');
    expect(light.data.data.graphs[1].color).toBe('#eb6834');
    expect(dark.data.data.graphs[1].color).toBe('#d95926');
  });

  it('rejects a monitoring series whose length does not match the timeline', () => {
    const broken: ChartWidgetData = {
      ...data,
      monitoring: {...data.monitoring, series: [{name: 'p50', values: [1, 2]}]},
    };
    expect(() => buildChartConfig('monitoring', broken, 'light')).toThrow(/2 values for 3/);
  });

  it('rejects more series than the validated palette has slots', () => {
    const point = {timestamp: 1, value: 1};
    const tooMany: ChartWidgetData = {
      ...data,
      sales: {series: ['a', 'b', 'c', 'd'].map((name) => ({name, points: [point]}))},
    };
    expect(() => buildChartConfig('sales', tooMany, 'light')).toThrow(/at most 3 series/);
  });
});
