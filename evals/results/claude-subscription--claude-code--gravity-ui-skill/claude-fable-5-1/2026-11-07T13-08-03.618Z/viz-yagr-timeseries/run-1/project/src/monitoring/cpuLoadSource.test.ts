import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createSimulatedCpuLoadSource} from './cpuLoadSource';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('createSimulatedCpuLoadSource', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('builds a full 24h history on a fixed step', () => {
        const source = createSimulatedCpuLoadSource({stepMs: 2000});
        const {timeline, values} = source.getHistory();

        expect(timeline).toHaveLength(DAY_MS / 2000);
        expect(values).toHaveLength(timeline.length);
        for (let i = 1; i < timeline.length; i++) {
            expect(timeline[i] - timeline[i - 1]).toBe(2000);
        }
        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...values)).toBeLessThanOrEqual(100);
    });

    it('is reproducible for the same seed', () => {
        const a = createSimulatedCpuLoadSource({stepMs: 60_000, seed: 7}).getHistory();
        const b = createSimulatedCpuLoadSource({stepMs: 60_000, seed: 7}).getHistory();
        expect(a.values).toEqual(b.values);
    });

    it('emits new points and keeps the window size constant', () => {
        const source = createSimulatedCpuLoadSource({stepMs: 1000});
        const before = source.getHistory();
        const listener = vi.fn();
        const unsubscribe = source.subscribe(listener);

        vi.advanceTimersByTime(3000);

        expect(listener).toHaveBeenCalledTimes(3);
        const emitted = listener.mock.calls.flatMap(([points]) => points as {ts: number}[]);
        expect(emitted).toHaveLength(3);
        expect(emitted[0].ts).toBe(before.timeline[before.timeline.length - 1] + 1000);

        const after = source.getHistory();
        expect(after.timeline).toHaveLength(before.timeline.length);
        expect(after.timeline[after.timeline.length - 1]).toBe(emitted[2].ts);
        expect(after.timeline[0]).toBe(before.timeline[3]);

        unsubscribe();
    });

    it('catches up after a throttled interval without gaps', () => {
        const source = createSimulatedCpuLoadSource({stepMs: 1000});
        const listener = vi.fn();
        source.subscribe(listener);

        // Таймер «проспал» 5 секунд: один вызов tick должен добить все точки.
        vi.setSystemTime(Date.now() + 5000);
        vi.advanceTimersByTime(1000);

        const points = listener.mock.calls[0][0] as {ts: number}[];
        expect(points.length).toBeGreaterThanOrEqual(5);
        for (let i = 1; i < points.length; i++) {
            expect(points[i].ts - points[i - 1].ts).toBe(1000);
        }
    });

    it('stops the timer when the last subscriber leaves', () => {
        const source = createSimulatedCpuLoadSource({stepMs: 1000});
        const listener = vi.fn();
        const unsubscribe = source.subscribe(listener);
        unsubscribe();

        vi.advanceTimersByTime(5000);

        expect(listener).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
