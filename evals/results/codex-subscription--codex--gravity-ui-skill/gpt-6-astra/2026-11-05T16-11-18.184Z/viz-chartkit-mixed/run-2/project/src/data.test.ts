import {describe, expect, it} from 'vitest';
import {createMonitoringData, createSalesData, salesEnd, summarize, toCsv} from './data';

describe('Visualization data contract', () => {
  it.each([7, 30, 90])('returns %i daily sales points and an aligned comparison', (days) => {
    const {series} = createSalesData(days);
    expect(series[0].points).toHaveLength(days);
    expect(series[0].points.at(-1)?.timestamp).toBe(salesEnd);
    expect(series[0].points[0].timestamp).toBe(salesEnd - (days - 1) * 86_400_000);
    expect(series[1].points.map((p) => p.timestamp)).toEqual(series[0].points.map((p) => p.timestamp));
    expect(series[0].points.every((p) => Number.isFinite(p.value) && p.value >= 0)).toBe(true);
  });
  it('preserves overlapping monitoring samples when the live window advances', () => {
    const before = createMonitoringData(24, salesEnd).series[0].points;
    const after = createMonitoringData(24, salesEnd + 10_000).series[0].points;
    expect(before).toHaveLength(8640);
    expect(after.slice(0, -1)).toEqual(before.slice(1));
    expect(after.at(-1)!.timestamp - before.at(-1)!.timestamp).toBe(10_000);
    expect(before.every((p) => p.value >= 0 && p.value < 85)).toBe(true);
  });
  it('computes metrics from the supplied data and handles empty data', () => {
    expect(summarize({unit: '₽', series: [
      {id: 'now', name: 'now', points: [{timestamp: 0, value: 100}, {timestamp: 1, value: 200}]},
      {id: 'previous', name: 'previous', points: [{timestamp: 0, value: 80}, {timestamp: 1, value: 120}]},
    ]})).toEqual({total: 300, average: 150, max: 200, last: 200, count: 2, growth: 50});
    expect(summarize({unit: '₽', series: []})).toEqual({total: 0, average: 0, max: 0, last: 0, count: 0, growth: 0});
  });
  it('exports all supplied points and escapes CSV delimiters and quotes', () => {
    const csv = toCsv({unit: '₽', series: [{id: '1', name: 'Магазин; "Центр"', points: [{timestamp: 0, value: 123}]}]});
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Магазин; ""Центр"""');
    expect(csv).toContain('"1970-01-01T00:00:00.000Z"');
    expect(toCsv(createSalesData(30)).split('\n')).toHaveLength(61);
  });
});
