import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createMockCpuLoadSource} from './cpuLoadSource';
import {DAY_MS, countExpired} from './window';

describe('countExpired', () => {
    it('returns the number of leading points older than the window', () => {
        const timeline = [0, 10, 20, 30, 40, 50];
        expect(countExpired(timeline, 50, 30)).toBe(2); // 0 и 10 старше 50 - 30
        expect(countExpired(timeline, 50, 100)).toBe(0);
        expect(countExpired(timeline, 50, 0)).toBe(5); // остаётся только последняя точка
        expect(countExpired([], 50, 10)).toBe(0);
    });
});

describe('createMockCpuLoadSource', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('builds a full day of history at the given cadence', () => {
        const source = createMockCpuLoadSource({intervalMs: 2000});
        const {timeline, values} = source.getSnapshot();
        expect(timeline).toHaveLength(DAY_MS / 2000 + 1);
        expect(values).toHaveLength(timeline.length);
        expect(timeline[timeline.length - 1]).toBe(Date.now());
        expect(timeline[0]).toBe(Date.now() - DAY_MS);
        for (let i = 1; i < timeline.length; i++) {
            expect(timeline[i]).toBeGreaterThan(timeline[i - 1]);
        }
        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...values)).toBeLessThanOrEqual(100);
        source.dispose();
    });

    it('is reproducible for the same seed', () => {
        const a = createMockCpuLoadSource({seed: 7}).getSnapshot().values.slice(0, 50);
        const b = createMockCpuLoadSource({seed: 7}).getSnapshot().values.slice(0, 50);
        expect(a).toEqual(b);
    });

    it('emits samples only while subscribed and keeps the window bounded', () => {
        const source = createMockCpuLoadSource({intervalMs: 1000, windowMs: 10_000});
        const initialLength = source.getSnapshot().timeline.length;
        const listener = vi.fn();

        vi.advanceTimersByTime(5000);
        expect(listener).not.toHaveBeenCalled();

        const unsubscribe = source.subscribe(listener);
        vi.advanceTimersByTime(3000);
        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener.mock.calls[2][0]).toEqual({ts: Date.now(), load: expect.any(Number)});
        const {timeline} = source.getSnapshot();
        expect(timeline.length).toBeLessThanOrEqual(initialLength);
        expect(timeline[0]).toBeGreaterThanOrEqual(Date.now() - 10_000);
        expect(timeline[timeline.length - 1]).toBe(Date.now());

        unsubscribe();
        vi.advanceTimersByTime(3000);
        expect(listener).toHaveBeenCalledTimes(3);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('stops the timer on dispose', () => {
        const source = createMockCpuLoadSource({intervalMs: 1000});
        const listener = vi.fn();
        source.subscribe(listener);
        source.dispose();
        vi.advanceTimersByTime(5000);
        expect(listener).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
