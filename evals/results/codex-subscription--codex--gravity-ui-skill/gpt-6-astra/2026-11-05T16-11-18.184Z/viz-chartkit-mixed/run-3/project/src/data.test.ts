import {describe, expect, it} from 'vitest';
import {createMonitoring, createSales} from './data';

describe('Time series contract', () => {
  it('keeps sales values and timestamps consistent when the range changes', () => {
    const week = createSales(7);
    const quarter = createSales(90);
    week.forEach((series, i) => expect(series.points).toEqual(quarter[i].points.slice(-7)));
  });
  it('aligns the comparison series with the current period', () => {
    const [current, previous] = createSales(30);
    expect(current.points.map((p) => p.x)).toEqual(previous.points.map((p) => p.x));
    expect(current.points.every((p) => Number.isFinite(p.y) && p.y >= 0)).toBe(true);
    expect(current.points.at(-1)!.x - current.points[0].x).toBe(29 * 86_400_000);
  });
  it('produces dense, aligned monitoring series in milliseconds', () => {
    const end = Date.UTC(2026, 10, 5, 12);
    const [p95, p50] = createMonitoring(180, end);
    expect(p95.points).toHaveLength(10800);
    expect(p95.points.at(-1)!.x).toBe(end);
    expect(p95.points.every((p, i) => p.x === end - (10799 - i) * 1000 && p.y >= p50.points[i].y)).toBe(true);
    expect(p95.points.map((p) => p.x)).toEqual(p50.points.map((p) => p.x));
  });
  it('preserves historical samples when live updates advance the window', () => {
    const end = Date.UTC(2026, 10, 5, 12);
    const initial = createMonitoring(15, end);
    const next = createMonitoring(15, end + 5000);
    initial.forEach((series, i) => expect(series.points.slice(5)).toEqual(next[i].points.slice(0, -5)));
  });
});
