import {describe, expect, it} from 'vitest';

import {generateHistory, STEP_MS, WINDOW_MS, WINDOW_POINTS} from './cpuStream';

describe('generateHistory', () => {
  it('генерирует ровно WINDOW_POINTS точек за сутки', () => {
    const now = 1_762_500_000_000;
    const {timeline, values} = generateHistory(now);

    expect(WINDOW_POINTS).toBeGreaterThan(10_000); // «несколько десятков тысяч»
    expect(timeline).toHaveLength(WINDOW_POINTS);
    expect(values).toHaveLength(WINDOW_POINTS);
  });

  it('timeline равномерный, выровнен по шагу и покрывает ровно сутки', () => {
    const now = 1_762_500_000_000;
    const {timeline} = generateHistory(now);

    expect(timeline[0] % STEP_MS).toBe(0);
    expect(timeline[timeline.length - 1] - timeline[0]).toBe(WINDOW_MS - STEP_MS);
    for (let i = 1; i < timeline.length; i += 1) {
      expect(timeline[i] - timeline[i - 1]).toBe(STEP_MS);
    }
  });

  it('значения загрузки в допустимых пределах', () => {
    const {values} = generateHistory(Date.now());
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(1.5);
      expect(v).toBeLessThanOrEqual(99);
    }
  });
});
