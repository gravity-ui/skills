import {describe, expect, it} from 'vitest';

import {MAX_INCREMENTAL_BATCH, countStale, planWindowUpdate} from './slidingWindow';

const WINDOW = 10_000;

function range(start: number, count: number, step: number): number[] {
  return Array.from({length: count}, (_, i) => start + i * step);
}

describe('countStale', () => {
  it('считает точки, вышедшие за окно (включая границу)', () => {
    const timeline = range(0, 11, 1000); // 0 … 10 000
    expect(countStale(timeline, 11_000, WINDOW)).toBe(2); // 0 и 1 000 ≤ 1 000
    expect(countStale(timeline, 10_000, WINDOW)).toBe(1); // только 0
    expect(countStale(timeline, 5_000, WINDOW)).toBe(0);
  });
});

describe('planWindowUpdate', () => {
  it('в установившемся режиме даёт инкрементальное обновление', () => {
    const timeline = range(1000, 10, 1000); // 1 000 … 10 000, ровно окно
    expect(planWindowUpdate(timeline, [11_000], WINDOW)).toEqual({mode: 'incremental'});
  });

  it('пачка после паузы, когда устарело больше точек, чем пришло, пересобирает окно', () => {
    const timeline = range(1000, 10, 1000);
    expect(planWindowUpdate(timeline, [15_000], WINDOW)).toEqual({mode: 'rebuild', stale: 5});
  });

  it('пачка из нескольких точек с совпадающим числом устаревших — инкрементальная', () => {
    const timeline = range(1000, 10, 1000);
    expect(planWindowUpdate(timeline, [11_000, 12_000, 13_000], WINDOW)).toEqual({mode: 'incremental'});
  });

  it('пустое окно и пустая пачка всегда пересобираются', () => {
    expect(planWindowUpdate([], [1, 2], WINDOW)).toEqual({mode: 'rebuild', stale: 0});
    expect(planWindowUpdate([1, 2], [], WINDOW)).toEqual({mode: 'rebuild', stale: 0});
  });

  it('слишком большая пачка идёт через пересборку', () => {
    const count = MAX_INCREMENTAL_BATCH + 1;
    const timeline = range(0, count, 1);
    const batch = range(count, count, 1);
    expect(planWindowUpdate(timeline, batch, count)).toEqual({mode: 'rebuild', stale: count});
  });
});
