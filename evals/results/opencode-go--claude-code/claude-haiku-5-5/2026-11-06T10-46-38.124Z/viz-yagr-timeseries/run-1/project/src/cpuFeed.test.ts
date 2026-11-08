import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createCpuFeed, HISTORY_POINTS, SAMPLE_INTERVAL_MS, type CpuSample} from './cpuFeed';

describe('createCpuFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('держит окно ровно из HISTORY_POINTS равномерно расставленных точек', () => {
    const {times, values} = createCpuFeed().getHistory();

    expect(times).toHaveLength(HISTORY_POINTS);
    expect(values).toHaveLength(HISTORY_POINTS);
    for (let i = 1; i < times.length; i++) {
      expect(times[i] - times[i - 1]).toBe(SAMPLE_INTERVAL_MS);
    }
    expect(times[times.length - 1]).toBeLessThanOrEqual(Date.now());
    expect(Date.now() - times[0]).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + SAMPLE_INTERVAL_MS);
    expect(values.every((v) => v >= 0 && v <= 100)).toBe(true);
  });

  it('возвращает копии: мутация снаружи не затрагивает фид', () => {
    const feed = createCpuFeed();
    const first = feed.getHistory();
    first.times.length = 0;
    first.values.length = 0;

    expect(feed.getHistory().times).toHaveLength(HISTORY_POINTS);
  });

  it('запускает таймер с первым подписчиком и сдвигает окно без роста', () => {
    const feed = createCpuFeed();
    const received: CpuSample[] = [];
    const unsubscribe = feed.subscribe((s) => received.push(s));

    vi.advanceTimersByTime(SAMPLE_INTERVAL_MS * 3);

    expect(received).toHaveLength(3);
    expect(feed.getHistory().times).toHaveLength(HISTORY_POINTS);
    expect(feed.getHistory().times.at(-1)).toBe(Date.now());

    unsubscribe();
  });

  it('останавливает таймер после отписки последнего подписчика', () => {
    const feed = createCpuFeed();
    const a = vi.fn();
    const b = vi.fn();
    const unsubA = feed.subscribe(a);
    const unsubB = feed.subscribe(b);

    unsubA();
    vi.advanceTimersByTime(SAMPLE_INTERVAL_MS);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);

    unsubB();
    expect(vi.getTimerCount()).toBe(0);

    vi.advanceTimersByTime(SAMPLE_INTERVAL_MS * 10);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('догоняет пропущенные интервалы, если таймера не было', () => {
    const feed = createCpuFeed();
    vi.setSystemTime(Date.now() + 60 * 60 * 1000); // час без подписчиков

    const {times} = feed.getHistory();

    expect(times).toHaveLength(HISTORY_POINTS);
    // Догоняем до отставания не больше 1.5 интервала: точка «впритык» дала бы дубликат перед тиком таймера.
    expect(Date.now() - times[times.length - 1]).toBeLessThanOrEqual(SAMPLE_INTERVAL_MS * 1.5);
  });
});
