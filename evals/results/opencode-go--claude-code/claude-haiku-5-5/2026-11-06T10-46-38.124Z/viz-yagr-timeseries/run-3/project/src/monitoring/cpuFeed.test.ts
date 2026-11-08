import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createSimulatedCpuFeed} from './cpuFeed';

const STEP = 2000;
const WINDOW = 24 * 60 * 60 * 1000;
const CAPACITY = WINDOW / STEP;
const START = Date.UTC(2026, 10, 6, 0, 0, 0);

describe('createSimulatedCpuFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers({now: START});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pre-fills a full 24h window with evenly spaced points', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});

    expect(feed.timeline.length).toBe(CAPACITY);
    expect(feed.values.length).toBe(CAPACITY);
    for (let i = 1; i < feed.timeline.length; i++) {
      expect(feed.timeline[i] - feed.timeline[i - 1]).toBe(STEP);
    }
    expect(feed.timeline[feed.timeline.length - 1]).toBeLessThan(START);
  });

  it('keeps values within 0..100', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: Math.random});
    for (const v of feed.values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('does not produce points until started', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});
    const listener = vi.fn();
    feed.subscribe(listener);

    vi.advanceTimersByTime(STEP * 10);

    expect(listener).not.toHaveBeenCalled();
    expect(feed.timeline.length).toBe(CAPACITY);
  });

  it('appends a point per tick and slides the window, keeping its length fixed', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});
    const oldestBefore = feed.timeline[0];
    const listener = vi.fn();
    feed.subscribe(listener);

    feed.start();
    vi.advanceTimersByTime(STEP * 3);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(feed.timeline.length).toBe(CAPACITY);
    expect(feed.values.length).toBe(CAPACITY);
    expect(feed.timeline[0]).toBe(oldestBefore + STEP * 3);
    expect(feed.timeline[feed.timeline.length - 1]).toBe(START + STEP * 3);
    feed.stop();
  });

  it('starting twice does not double the tick rate', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});
    const listener = vi.fn();
    feed.subscribe(listener);

    feed.start();
    feed.start();
    vi.advanceTimersByTime(STEP);

    expect(listener).toHaveBeenCalledTimes(1);
    feed.stop();
  });

  it('stop() halts ticks and start() resumes them', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});
    const listener = vi.fn();
    feed.subscribe(listener);

    feed.start();
    vi.advanceTimersByTime(STEP);
    feed.stop();
    vi.advanceTimersByTime(STEP * 5);
    expect(listener).toHaveBeenCalledTimes(1);

    feed.start();
    vi.advanceTimersByTime(STEP);
    expect(listener).toHaveBeenCalledTimes(2);
    feed.stop();
  });

  it('unsubscribed listeners are not called', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});
    const listener = vi.fn();
    const unsubscribe = feed.subscribe(listener);

    feed.start();
    unsubscribe();
    vi.advanceTimersByTime(STEP * 2);

    expect(listener).not.toHaveBeenCalled();
    feed.stop();
  });

  it('passes the same timestamp and value that was stored', () => {
    const feed = createSimulatedCpuFeed({windowMs: WINDOW, stepMs: STEP, random: () => 0.5});
    let received: [number, number] | undefined;
    feed.subscribe((t, v) => {
      received = [t, v];
    });

    feed.start();
    vi.advanceTimersByTime(STEP);
    feed.stop();

    expect(received).toBeDefined();
    expect(feed.timeline[feed.timeline.length - 1]).toBe(received![0]);
    expect(feed.values[feed.values.length - 1]).toBe(received![1]);
  });
});
