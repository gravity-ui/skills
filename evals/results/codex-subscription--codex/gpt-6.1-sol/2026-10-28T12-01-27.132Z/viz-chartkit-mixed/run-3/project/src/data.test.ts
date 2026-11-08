import {describe, expect, it} from 'vitest';
import {createData, END_DATE} from './data';
import type {ChartMode, TimeRange} from './components/charts/types';

describe('data shared by both chart engines', () => {
  it.each<[ChartMode, TimeRange, number]>([
    ['sales', '7d', 7], ['sales', '30d', 30], ['sales', '90d', 90],
    ['monitoring', '7d', 3600], ['monitoring', '30d', 7200], ['monitoring', '90d', 14400],
  ])('%s / %s produces %i ordered, valid points', (mode, range, count) => {
    const data = createData(mode, range);
    expect(data).toHaveLength(count);
    expect(data.at(-1)?.timestamp).toBe(END_DATE);
    expect(data.every((d, i) => Number.isFinite(d.value) && d.value > 0 && Number.isFinite(d.comparison) && d.comparison > 0 && (!i || d.timestamp > data[i - 1].timestamp))).toBe(true);
  });
  it('uses the selected end date for both engines', () => {
    const end = Date.UTC(2026, 8, 10);
    expect(createData('sales', '30d', end).at(-1)?.timestamp).toBe(end);
    expect(createData('monitoring', '30d', end).at(-1)?.timestamp).toBe(end);
  });
  it('moves monitoring forward while keeping sales historical', () => {
    const before = createData('monitoring', '7d');
    const after = createData('monitoring', '7d', END_DATE, 3);
    expect(after.at(-1)!.timestamp - before.at(-1)!.timestamp).toBe(3000);
    expect(after[0].value).not.toBe(before[0].value);
    expect(createData('sales', '7d', END_DATE, 3)).toEqual(createData('sales', '7d'));
  });
  it.each<[TimeRange, number]>([['7d', 1], ['30d', 3], ['90d', 6]])('preserves monitoring history for %s', (range, seconds) => {
    const before = createData('monitoring', range);
    const after = createData('monitoring', range, END_DATE, seconds);
    expect(after.slice(0, -1)).toEqual(before.slice(1));
  });
});
