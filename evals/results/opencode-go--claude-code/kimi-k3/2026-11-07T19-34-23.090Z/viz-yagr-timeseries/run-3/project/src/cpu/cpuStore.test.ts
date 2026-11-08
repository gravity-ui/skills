import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {CPU_STEP_MS, CPU_WINDOW_MS, MAX_POINTS, cpuStore} from './cpuStore';

describe('cpuStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cpuStore.stop();
    vi.useRealTimers();
  });

  it('хранит окно за последние 24 часа', () => {
    expect(cpuStore.timeline.length).toBeGreaterThan(MAX_POINTS - 2);
    expect(cpuStore.timeline.length).toBeLessThanOrEqual(MAX_POINTS);
    const span = cpuStore.timeline[cpuStore.timeline.length - 1] - cpuStore.timeline[0];
    expect(span).toBeLessThanOrEqual(CPU_WINDOW_MS);
  });

  it('значения — проценты от 0 до 100 либо разрывы (null)', () => {
    for (const v of cpuStore.values) {
      if (v === null) continue;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    // и разрывы в истории действительно есть
    expect(cpuStore.values.some((v) => v === null)).toBe(true);
  });

  it('рассылает новые точки и держит размер окна', () => {
    const batches: number[] = [];
    const unsubscribe = cpuStore.subscribe((b) => batches.push(b.timeline.length));

    cpuStore.start();
    const before = cpuStore.timeline.length;
    vi.advanceTimersByTime(CPU_STEP_MS * 5);
    cpuStore.stop();

    expect(batches.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    expect(cpuStore.timeline.length).toBeLessThanOrEqual(MAX_POINTS);
    expect(cpuStore.timeline.length).toBeGreaterThanOrEqual(before);
    unsubscribe();
  });

  it('останавливает таймер, когда не осталось подписчиков', () => {
    const unsubscribe = cpuStore.subscribe(() => {});
    cpuStore.start();
    unsubscribe();
    cpuStore.stop();

    const length = cpuStore.timeline.length;
    vi.advanceTimersByTime(CPU_STEP_MS * 10);
    expect(cpuStore.timeline.length).toBe(length);
  });
});
