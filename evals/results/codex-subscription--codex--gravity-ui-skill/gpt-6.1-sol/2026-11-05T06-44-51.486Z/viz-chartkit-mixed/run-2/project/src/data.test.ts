import {describe, expect, it} from 'vitest';
import {getSeries, SALES_END, sum} from './data';

describe('visualization demo data', () => {
  it.each([7, 14, 30])('keeps sales and comparison aligned for %i days', period => {
    const [current, previous] = getSeries('sales', period);
    expect(current.points).toHaveLength(period);
    expect(current.points.at(-1)?.timestamp).toBe(SALES_END);
    expect(previous.points.map(p => p.timestamp)).toEqual(current.points.map(p => p.timestamp));
    expect(sum(current.points)).toBeGreaterThan(sum(previous.points));
  });
  it('generates dense, aligned monitoring rows with a 500 ms step', () => {
    const rows = getSeries('monitoring', 30);
    expect(rows).toHaveLength(2);
    expect(rows[0].points).toHaveLength(3600);
    expect(rows[0].points[1].timestamp - rows[0].points[0].timestamp).toBe(500);
    expect(rows[0].points.map(p => p.timestamp)).toEqual(rows[1].points.map(p => p.timestamp));
    expect(rows.every(s => s.points.every(p => p.value >= 0 && p.value <= 100))).toBe(true);
  });
  it('preserves historical values when the monitoring window advances', () => {
    const before = getSeries('monitoring', 7, 0);
    const after = getSeries('monitoring', 7, 1);
    expect(after[0].points[0].timestamp - before[0].points[0].timestamp).toBe(5000);
    for (let i = 0; i < before.length; i++) {
      expect(before[i].points.slice(10)).toEqual(after[i].points.slice(0, -10));
    }
  });
});
