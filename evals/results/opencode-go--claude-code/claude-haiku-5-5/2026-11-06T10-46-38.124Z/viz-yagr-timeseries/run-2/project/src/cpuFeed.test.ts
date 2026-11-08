import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SAMPLE_INTERVAL_MS, WINDOW_POINTS, createSimulatedCpuFeed } from './cpuFeed';

const START = 1_700_000_000_000;
const INTERVAL = 1_000;
const POINTS = 10;

describe('createSimulatedCpuFeed', () => {
  let clock: number;
  const now = () => clock;

  beforeEach(() => {
    vi.useFakeTimers();
    clock = START;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const make = () =>
    createSimulatedCpuFeed({ now, random: () => 0.5, intervalMs: INTERVAL, windowPoints: POINTS });

  it('заполняет окно историей, последняя точка — текущий момент', () => {
    const feed = make();
    expect(feed.timeline).toHaveLength(POINTS);
    expect(feed.values).toHaveLength(POINTS);
    expect(feed.timeline[POINTS - 1]).toBe(START);
    expect(feed.timeline[0]).toBe(START - (POINTS - 1) * INTERVAL);
    for (let i = 1; i < POINTS; i++) {
      expect(feed.timeline[i] - feed.timeline[i - 1]).toBe(INTERVAL);
    }
    for (const v of feed.values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('сутки по умолчанию дают 43 200 точек с шагом 2 с', () => {
    expect(WINDOW_POINTS).toBe(43_200);
    expect(SAMPLE_INTERVAL_MS).toBe(2_000);
    expect(createSimulatedCpuFeed().timeline).toHaveLength(WINDOW_POINTS);
  });

  it('на каждом тике добавляет точку, сохраняя длину окна, и уведомляет подписчиков', () => {
    const feed = make();
    const oldestBefore = feed.timeline[0];
    const listener = vi.fn();
    feed.subscribe(listener);

    feed.start();
    clock += INTERVAL;
    vi.advanceTimersByTime(INTERVAL);

    expect(feed.timeline).toHaveLength(POINTS);
    expect(feed.values).toHaveLength(POINTS);
    expect(feed.timeline[0]).toBe(oldestBefore + INTERVAL);
    expect(feed.timeline[POINTS - 1]).toBe(START + INTERVAL);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ t: START + INTERVAL, v: feed.values[POINTS - 1] });
    feed.stop();
  });

  it('повторный start() не создаёт второй таймер', () => {
    const feed = make();
    const listener = vi.fn();
    feed.subscribe(listener);
    feed.start();
    feed.start();
    clock += INTERVAL;
    vi.advanceTimersByTime(INTERVAL);
    expect(listener).toHaveBeenCalledTimes(1);
    feed.stop();
  });

  it('stop() останавливает опрос, а данные сохраняются', () => {
    const feed = make();
    const listener = vi.fn();
    feed.subscribe(listener);
    feed.start();
    feed.stop();
    clock += 5 * INTERVAL;
    vi.advanceTimersByTime(5 * INTERVAL);
    expect(listener).not.toHaveBeenCalled();
    expect(feed.timeline[POINTS - 1]).toBe(START);
  });

  it('отписавшийся слушатель больше не получает замеры', () => {
    const feed = make();
    const listener = vi.fn();
    const unsubscribe = feed.subscribe(listener);
    unsubscribe();
    feed.start();
    clock += INTERVAL;
    vi.advanceTimersByTime(INTERVAL);
    expect(listener).not.toHaveBeenCalled();
    feed.stop();
  });
});
