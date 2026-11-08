import {describe, expect, it} from 'vitest';

import {toChartsData, toYagrConfig} from './adapters';
import {createMonitoringDataset, createSalesDataset} from './demoData';
import type {VizDataset} from './types';

const sample: VizDataset = {
  timestamps: [1000, 2000, 3000],
  series: [
    {id: 'a', name: 'A', values: [1, null, 3]},
    {id: 'b', name: 'B', values: [4, 5, 6]},
  ],
};

describe('toChartsData', () => {
  it('builds datetime x-axis and one line series per dataset series', () => {
    const data = toChartsData(sample);

    expect(data.xAxis).toEqual({type: 'datetime'});
    expect(data.series?.data).toHaveLength(2);
    expect(data.series?.data[1]).toEqual({
      type: 'line',
      name: 'B',
      data: [
        {x: 1000, y: 4},
        {x: 2000, y: 5},
        {x: 3000, y: 6},
      ],
    });
  });

  it('drops null values instead of plotting them', () => {
    const data = toChartsData(sample);

    expect(data.series?.data[0]).toMatchObject({
      data: [
        {x: 1000, y: 1},
        {x: 3000, y: 3},
      ],
    });
  });
});

describe('toYagrConfig', () => {
  it('passes the shared timeline and aligned series values through unchanged', () => {
    const config = toYagrConfig(sample, 'dark');

    expect(config.timeline).toEqual([1000, 2000, 3000]);
    expect(config.series).toHaveLength(2);
    expect(config.series[0]).toMatchObject({id: 'a', name: 'A', type: 'line', data: [1, null, 3]});
    expect(config.chart).toEqual({appearance: {theme: 'dark', locale: 'ru'}});
  });

  it('gives each series a color, cycling when there are more series than colors', () => {
    const many: VizDataset = {
      timestamps: [1],
      series: Array.from({length: 6}, (_, i) => ({id: `s${i}`, name: `S${i}`, values: [i]})),
    };
    const config = toYagrConfig(many, 'light');
    const colors = config.series.map((s) => s.color);

    expect(colors.every((c) => typeof c === 'string' && c.length > 0)).toBe(true);
    expect(colors[4]).toBe(colors[0]);
  });
});

describe('demo datasets', () => {
  it('keep every series aligned with the timestamps', () => {
    for (const dataset of [createSalesDataset(), createMonitoringDataset(500)]) {
      for (const serie of dataset.series) {
        expect(serie.values).toHaveLength(dataset.timestamps.length);
      }
    }
  });

  it('produce timestamps in ascending order', () => {
    const {timestamps} = createMonitoringDataset(500);
    expect(timestamps.every((t, i) => i === 0 || t > timestamps[i - 1])).toBe(true);
  });

  it('are deterministic across calls', () => {
    expect(createSalesDataset()).toEqual(createSalesDataset());
  });
});
