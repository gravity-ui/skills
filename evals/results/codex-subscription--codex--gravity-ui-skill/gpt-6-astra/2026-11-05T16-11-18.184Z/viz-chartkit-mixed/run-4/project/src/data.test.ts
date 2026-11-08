import {describe, expect, it} from 'vitest';
import {createDemoData, DEMO_END, toCsv} from './data';

describe('widget data contract', () => {
  it('keeps sales periods aligned and preserves daily granularity', () => {
    for (const days of [7, 30, 90]) {
      const {series} = createDemoData('sales', days);
      expect(series[0].points).toHaveLength(days);
      expect(series[0].points.at(-1)?.x).toBe(DEMO_END);
      expect(series[0].points[1].x - series[0].points[0].x).toBe(86_400_000);
      expect(series[1].points.map(p => p.x)).toEqual(series[0].points.map(p => p.x));
    }
  });
  it('provides dense, aligned monitoring samples covering the requested interval', () => {
    for (const hours of [1, 6, 24]) {
      const {series} = createDemoData('monitoring', hours);
      expect(series[0].points).toHaveLength(2880);
      expect(series[0].points.at(-1)!.x - series[0].points[0].x).toBe(hours * 3_600_000);
      expect(series[1].points.map(p => p.x)).toEqual(series[0].points.map(p => p.x));
      expect(series.every(s => s.points.every(p => p.y !== null && p.y >= 0 && p.y <= 100))).toBe(true);
    }
  });
  it('advances the monitoring window while keeping sample count bounded', () => {
    const before = createDemoData('monitoring', 24, 0);
    const after = createDemoData('monitoring', 24, 1);
    expect(after.series[0].points.at(-1)!.x - before.series[0].points.at(-1)!.x).toBe(5000);
    expect(after.series[0].points).toHaveLength(before.series[0].points.length);
    expect(after.series[0].points[0].y).not.toBe(before.series[0].points[0].y);
  });
  it('exports nulls as empty cells and safely quotes commas and quotes', () => {
    const csv = toCsv({unit: '%', series: [{id: 'a', name: 'CPU, "main"', points: [{x: 0, y: null}, {x: 1000, y: 40}]}]});
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('1970-01-01T00:00:00.000Z,"CPU, ""main""",,"%"');
    expect(csv.split('\r\n')).toHaveLength(3);
  });
});
