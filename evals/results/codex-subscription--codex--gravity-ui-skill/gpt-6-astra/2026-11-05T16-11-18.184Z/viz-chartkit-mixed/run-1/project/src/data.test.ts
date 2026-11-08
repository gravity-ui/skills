import {describe, expect, it} from 'vitest';
import {END, monitoringData, salesData, sum} from './data';

describe('sales data', () => {
  it.each([7, 30, 90])('keeps %i daily timestamps aligned across compared periods', days => {
    const series = salesData(days, 'revenue');
    expect(series[0].points).toHaveLength(days);
    expect(series[0].points.at(-1)?.timestamp).toBe(END);
    expect(series[0].points[0].timestamp).toBe(END - (days - 1) * 86400000);
    expect(series[0].points.map(p => p.timestamp)).toEqual(series[1].points.map(p => p.timestamp));
    expect(series[0].points.every(p => Number.isFinite(p.value) && p.value >= 0)).toBe(true);
  });
  it.each(['revenue', 'orders'] as const)('preserves %s totals when aggregated by week', metric => {
    const daily = salesData(30, metric);
    const weekly = salesData(30, metric, true);
    expect(weekly[0].points).toHaveLength(5);
    daily.forEach((s, i) => expect(sum(weekly[i].points)).toBe(sum(s.points)));
    expect(weekly[0].points.at(-1)?.value).toBe(sum(daily[0].points.slice(28)));
  });
  it('weights weekly average checks by order count', () => {
    const revenue = salesData(30, 'revenue', true);
    const orders = salesData(30, 'orders', true);
    salesData(30, 'average', true).forEach((s, index) => s.points.forEach((p, i) => {
      expect(p.value).toBe(Math.round(revenue[index].points[i].value / orders[index].points[i].value));
    }));
  });
  it('computes daily average checks from revenue and orders', () => {
    const revenue = salesData(30, 'revenue')[0].points;
    const orders = salesData(30, 'orders')[0].points;
    salesData(30, 'average')[0].points.forEach((p, i) => expect(p.value).toBe(Math.round(revenue[i].value / orders[i].value)));
  });
});

describe('monitoring data', () => {
  const end = 1_800_000_000_000;
  it.each([1, 6, 24])('provides a dense %i-hour window with finite, aligned samples', hours => {
    const [actual, baseline] = monitoringData(hours, end);
    expect(actual.points).toHaveLength(hours * 360);
    expect(baseline.points).toHaveLength(actual.points.length);
    expect(actual.points.at(-1)?.timestamp).toBe(end);
    actual.points.forEach((p, i) => {
      expect(p.timestamp).toBe(baseline.points[i].timestamp);
      expect(Number.isFinite(p.value)).toBe(true);
      if (i) expect(p.timestamp - actual.points[i - 1].timestamp).toBe(10000);
    });
  });
  it('preserves historical values as the live window advances', () => {
    const old = monitoringData(1, end);
    const next = monitoringData(1, end + 10000);
    old.forEach((s, i) => expect(s.points.slice(1)).toEqual(next[i].points.slice(0, -1)));
  });
});
