import {describe, expect, it} from 'vitest';
import {alignSeries, capSeries, nearestIndex, niceScale} from './math';
import type {Series} from './types';

describe('niceScale', () => {
  it('выравнивает границы по шагу и покрывает данные', () => {
    const scale = niceScale(0, 987, 4);
    expect(scale.lo).toBe(0);
    expect(scale.hi).toBeGreaterThanOrEqual(987);
    expect(scale.ticks[0]).toBe(0);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(scale.hi);
  });

  it('не делит на ноль при одинаковых границах', () => {
    const scale = niceScale(5, 5, 4);
    expect(scale.hi).toBeGreaterThan(scale.lo);
    expect(scale.ticks.every(Number.isFinite)).toBe(true);
  });
});

describe('alignSeries', () => {
  it('строит общую временную ось и ставит null там, где точки нет', () => {
    const a: Series = {
      id: 'a',
      name: 'A',
      points: [
        {t: 1000, v: 1},
        {t: 3000, v: 3},
      ],
    };
    const b: Series = {
      id: 'b',
      name: 'B',
      points: [
        {t: 2000, v: 20},
        {t: 3000, v: 30},
      ],
    };
    const {times, columns} = alignSeries([a, b]);
    expect(times).toEqual([1000, 2000, 3000]);
    expect(columns[0]).toEqual([1, null, 3]);
    expect(columns[1]).toEqual([null, 20, 30]);
  });

  it('сохраняет явный null как значение, а не пропуск', () => {
    const a: Series = {
      id: 'a',
      name: 'A',
      points: [
        {t: 1, v: null},
        {t: 2, v: 5},
      ],
    };
    expect(alignSeries([a]).columns[0]).toEqual([null, 5]);
  });
});

describe('nearestIndex', () => {
  it('находит ближайшую точку с обеих сторон', () => {
    const times = [0, 10, 20, 30];
    expect(nearestIndex(times, -5)).toBe(0);
    expect(nearestIndex(times, 14)).toBe(1);
    expect(nearestIndex(times, 16)).toBe(2);
    expect(nearestIndex(times, 99)).toBe(3);
  });

  it('возвращает -1 для пустого массива', () => {
    expect(nearestIndex([], 1)).toBe(-1);
  });
});

describe('capSeries', () => {
  it('не меняет цвета оставшихся серий: порядок сохраняется', () => {
    const series = Array.from({length: 10}, (_, i) => ({id: `s${i}`, name: `S${i}`, points: []}));
    const {shown, hidden} = capSeries(series, 8);
    expect(shown.map((s) => s.id)).toEqual(series.slice(0, 8).map((s) => s.id));
    expect(hidden).toHaveLength(2);
  });
});
