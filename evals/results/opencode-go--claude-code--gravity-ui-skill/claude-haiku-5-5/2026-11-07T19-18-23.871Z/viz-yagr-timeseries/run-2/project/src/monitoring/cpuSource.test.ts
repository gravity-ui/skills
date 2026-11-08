import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  CPU_SAMPLE_INTERVAL_MS,
  CPU_WINDOW_SIZE,
  type CpuSamples,
  createSimulatedCpuSource,
} from './cpuSource';

// Начинаем ровно на границе шага, чтобы число тиков было предсказуемым.
const START = Math.floor(Date.UTC(2026, 0, 1) / CPU_SAMPLE_INTERVAL_MS) * CPU_SAMPLE_INTERVAL_MS;

/** Применяет дельту так же, как yagr при setSeries(..., {incremental: true, splice: true}). */
function applyAppendSplice(window: CpuSamples, appended: CpuSamples): void {
  window.timeline.push(...appended.timeline);
  window.values.push(...appended.values);
  window.timeline.splice(0, appended.timeline.length);
  window.values.splice(0, appended.values.length);
}

describe('createSimulatedCpuSource', () => {
  beforeEach(() => {
    vi.useFakeTimers({toFake: ['Date', 'setInterval', 'clearInterval']});
    vi.setSystemTime(START);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a full window of evenly spaced points ending at the current step', () => {
    const source = createSimulatedCpuSource();
    const {timeline, values} = source.snapshot();
    source.dispose();

    expect(timeline).toHaveLength(CPU_WINDOW_SIZE);
    expect(values).toHaveLength(CPU_WINDOW_SIZE);
    expect(timeline[timeline.length - 1]).toBe(START);
    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i] - timeline[i - 1]).toBe(CPU_SAMPLE_INTERVAL_MS);
    }
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it('snapshot returns copies that do not affect the source', () => {
    const source = createSimulatedCpuSource();
    const first = source.snapshot();
    first.values.fill(-1);
    first.timeline.length = 0;
    const second = source.snapshot();
    source.dispose();

    expect(second.timeline).toHaveLength(CPU_WINDOW_SIZE);
    expect(second.values.every((v) => v >= 0)).toBe(true);
  });

  it('emits one point per tick and keeps the window size constant', () => {
    const source = createSimulatedCpuSource();
    const window = source.snapshot();
    const listener = vi.fn((appended: CpuSamples) => applyAppendSplice(window, appended));
    source.subscribe(listener);

    // advanceTimersByTime сдвигает и часы, и таймер вместе, поэтому setSystemTime здесь не нужен.
    vi.advanceTimersByTime(5 * CPU_SAMPLE_INTERVAL_MS);
    const latest = source.snapshot();
    source.dispose();

    expect(listener).toHaveBeenCalledTimes(5);
    for (const [appended] of listener.mock.calls) {
      expect(appended.timeline).toHaveLength(1);
      expect(appended.values).toHaveLength(1);
    }
    expect(window.timeline).toHaveLength(CPU_WINDOW_SIZE);
    expect(window.values).toHaveLength(CPU_WINDOW_SIZE);
    // Окно, которое "видит" график, совпадает с внутренним состоянием источника.
    expect(window).toEqual(latest);
    expect(window.timeline[window.timeline.length - 1]).toBe(START + 5 * CPU_SAMPLE_INTERVAL_MS);
  });

  it('catches up missed points after a long pause without growing the window', () => {
    const source = createSimulatedCpuSource();
    const window = source.snapshot();
    const listener = vi.fn((appended: CpuSamples) => applyAppendSplice(window, appended));
    source.subscribe(listener);

    // Имитируем сон устройства на 10 минут: таймер сработал один раз.
    const pause = 10 * 60 * 1000;
    vi.setSystemTime(START + pause);
    vi.advanceTimersByTime(CPU_SAMPLE_INTERVAL_MS);
    const latest = source.snapshot();
    source.dispose();

    expect(listener).toHaveBeenCalledTimes(1);
    const [appended] = listener.mock.calls[0];
    // Пауза + один шаг, который добавил сам advanceTimersByTime.
    expect(appended.timeline).toHaveLength(pause / CPU_SAMPLE_INTERVAL_MS + 1);
    expect(appended.timeline[appended.timeline.length - 1]).toBe(START + pause + CPU_SAMPLE_INTERVAL_MS);
    expect(window).toEqual(latest);
    expect(window.timeline).toHaveLength(CPU_WINDOW_SIZE);
  });

  it('stops emitting after unsubscribe and after dispose', () => {
    const source = createSimulatedCpuSource();
    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);
    unsubscribe();

    vi.setSystemTime(START + CPU_SAMPLE_INTERVAL_MS);
    vi.advanceTimersByTime(CPU_SAMPLE_INTERVAL_MS);
    expect(listener).not.toHaveBeenCalled();

    const other = vi.fn();
    source.subscribe(other);
    source.dispose();
    vi.setSystemTime(START + 3 * CPU_SAMPLE_INTERVAL_MS);
    vi.advanceTimersByTime(3 * CPU_SAMPLE_INTERVAL_MS);
    expect(other).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
