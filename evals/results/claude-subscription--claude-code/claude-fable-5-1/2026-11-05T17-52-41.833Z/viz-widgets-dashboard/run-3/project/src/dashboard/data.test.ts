import {describe, expect, it} from 'vitest';

import {generateData, RANGE_DAYS} from './data';
import type {RangeKey} from './data';

const finite = (values: number[]) => values.every((v) => Number.isFinite(v));

describe('generateData', () => {
  for (const range of Object.keys(RANGE_DAYS) as RangeKey[]) {
    it(`builds a consistent ${range} dataset`, () => {
      const data = generateData(range, new Date(2026, 10, 5));
      const days = RANGE_DAYS[range];
      expect(data.dates).toHaveLength(days);
      expect(data.sessions).toHaveLength(3);
      for (const s of data.sessions) {
        expect(s.values).toHaveLength(days);
        expect(finite(s.values)).toBe(true);
      }
      for (const stat of Object.values(data.stats)) {
        expect(Number.isFinite(stat.value)).toBe(true);
        expect(Number.isFinite(stat.delta)).toBe(true);
        expect(stat.trend.length).toBeGreaterThan(1);
        expect(stat.trend.length).toBeLessThanOrEqual(12);
        expect(finite(stat.trend)).toBe(true);
      }
      expect(data.stats.conversion.value).toBeGreaterThan(0.01);
      expect(data.stats.conversion.value).toBeLessThan(0.05);
      expect(data.pages.map((p) => p.value)).toEqual([...data.pages.map((p) => p.value)].sort((a, b) => b - a));
      expect(data.sources).toHaveLength(5);
      expect(data.activity).toHaveLength(7);
      expect(data.activity.every((row) => row.length === 24 && finite(row))).toBe(true);
      expect(data.orders.length).toBeGreaterThan(0);
    });
  }

  it('is deterministic for the same range', () => {
    const a = generateData('30d', new Date(2026, 10, 5));
    const b = generateData('30d', new Date(2026, 10, 5));
    expect(a.sessions).toEqual(b.sessions);
    expect(a.orders.map((o) => o.id)).toEqual(b.orders.map((o) => o.id));
  });
});
