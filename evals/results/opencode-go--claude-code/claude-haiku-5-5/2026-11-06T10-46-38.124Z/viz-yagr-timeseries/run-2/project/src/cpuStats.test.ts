import { describe, expect, it } from 'vitest';

import { HOUR_MS, hourlyRows, summarize } from './cpuStats';

describe('summarize', () => {
  it('возвращает null для пустого окна', () => {
    expect(summarize([])).toBeNull();
  });

  it('считает текущее, среднее и пик', () => {
    expect(summarize([10, 20, 60])).toEqual({ current: 60, average: 30, peak: 60 });
  });
});

describe('hourlyRows', () => {
  it('группирует замеры по календарным часам', () => {
    const timeline = [0, 1_000, HOUR_MS + 5];
    const values = [10, 30, 50];
    expect(hourlyRows(timeline, values)).toEqual([
      { hourStart: 0, average: 20, peak: 30 },
      { hourStart: HOUR_MS, average: 50, peak: 50 },
    ]);
  });

  it('возвращает пустой список для пустого окна', () => {
    expect(hourlyRows([], [])).toEqual([]);
  });
});
