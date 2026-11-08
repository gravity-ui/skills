import { afterEach, describe, expect, it, vi } from "vitest";
import { CpuHistory, createDemoSource, DAY_MS, SAMPLE_MS } from "./telemetry";

afterEach(() => vi.useRealTimers());

describe("CpuHistory", () => {
  it("keeps a chronological, aligned, bounded day after the ring wraps", () => {
    const history = new CpuHistory();
    for (let i = 0; i < 90_000; i++) history.append(i * SAMPLE_MS, i % 101);
    const snapshot = history.snapshot();
    expect(snapshot.timeline).toHaveLength(DAY_MS / SAMPLE_MS + 1);
    expect(snapshot.timeline[0]).toBe(snapshot.updatedAt - DAY_MS);
    snapshot.timeline.forEach((time, index) => {
      expect(snapshot.values[index]).toBe((time / SAMPLE_MS) % 101);
    });
  });

  it("expires stale history after a gap and rejects invalid/out-of-order samples", () => {
    const history = new CpuHistory();
    history.append(100, 20);
    history.append(99, 40);
    history.append(100, 50);
    history.append(NaN, 20);
    history.append(200, Infinity);
    expect(history.snapshot().values).toEqual([20]);
    history.append(DAY_MS + 101, 150);
    history.append(DAY_MS + 102, -10);
    expect(history.snapshot().values).toEqual([100, 0]);
  });

  it("computes summary values without sorting the full data set", () => {
    const history = new CpuHistory();
    for (let i = 1; i <= 100; i++) history.append(i, i);
    expect(history.snapshot()).toMatchObject({
      current: 100,
      average: 50.5,
      maximum: 100,
      p95: 95,
    });
  });
});

describe("demo source lifecycle", () => {
  it("uses one timer for all subscribers and stops it after the last unsubscribe", () => {
    vi.useFakeTimers();
    const source = createDemoSource();
    const first = vi.fn();
    const second = vi.fn();
    expect(vi.getTimerCount()).toBe(0);
    const unsubscribeFirst = source.subscribe(first);
    const unsubscribeSecond = source.subscribe(second);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(SAMPLE_MS);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    unsubscribeFirst();
    vi.advanceTimersByTime(SAMPLE_MS);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledTimes(2);
    unsubscribeSecond();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("caches snapshots and catches up within a bounded day after resubscription", () => {
    vi.useFakeTimers();
    const source = createDemoSource();
    const before = source.getSnapshot();
    expect(source.getSnapshot()).toBe(before);
    const stop = source.subscribe(() => {});
    stop();
    vi.advanceTimersByTime(2 * DAY_MS);
    const stopAgain = source.subscribe(() => {});
    vi.advanceTimersByTime(SAMPLE_MS);
    const after = source.getSnapshot();
    expect(after.timeline).toHaveLength(DAY_MS / SAMPLE_MS + 1);
    expect(after.timeline[0]).toBe(after.updatedAt - DAY_MS);
    expect(after.updatedAt).toBeGreaterThan(before.updatedAt + DAY_MS);
    stopAgain();
    expect(vi.getTimerCount()).toBe(0);
  });
});
