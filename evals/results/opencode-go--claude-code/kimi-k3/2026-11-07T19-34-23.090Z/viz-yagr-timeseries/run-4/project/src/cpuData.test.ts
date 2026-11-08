import {describe, expect, it} from 'vitest';

import {
  WINDOW_SIZE,
  computeStats,
  createCpuFeed,
  formatPercent,
  generateInitialWindow,
} from './cpuData';

describe('cpuData', () => {
  it('backfills a full 24h window at 1s resolution', () => {
    const feed = createCpuFeed();
    const now = 1_700_000_000_000;
    const {timeline, values} = generateInitialWindow(feed, now);

    expect(timeline).toHaveLength(WINDOW_SIZE);
    expect(values).toHaveLength(WINDOW_SIZE);
    expect(WINDOW_SIZE).toBe(86_400);
    expect(timeline[0]).toBe(now - (WINDOW_SIZE - 1) * 1000);
    expect(timeline[WINDOW_SIZE - 1]).toBe(now);
    // strictly increasing, uniform 1s step
    for (let i = 1; i < timeline.length; i += 4096) {
      expect(timeline[i] - timeline[i - 1]).toBe(1000);
    }
  });

  it('keeps samples within plausible CPU bounds', () => {
    const feed = createCpuFeed();
    for (let i = 0; i < 10_000; i++) {
      const v = feed(i * 1000);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(99);
    }
  });

  it('computes stats over the window', () => {
    const stats = computeStats([10, 20, 30, null, 40]);
    expect(stats.current).toBe(40);
    expect(stats.avg).toBeCloseTo(25);
    expect(stats.max).toBe(40);

    const empty = computeStats([null, null]);
    expect(empty.current).toBeNull();
    expect(empty.avg).toBeNull();
    expect(empty.max).toBeNull();
  });

  it('formats percents', () => {
    expect(formatPercent(12.34)).toBe('12.3%');
    expect(formatPercent(null)).toBe('—');
  });
});
