import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {DAY_MS, SlidingWindowBuffer, createCpuLoadModel, createSimulatedCpuLoadSource} from './cpuLoadSource';

describe('SlidingWindowBuffer', () => {
    it('keeps points inside the window and reports how many were dropped', () => {
        const buffer = new SlidingWindowBuffer(10);

        expect(buffer.push(0, 1)).toBe(0);
        expect(buffer.push(5, 2)).toBe(0);
        expect(buffer.push(10, 3)).toBe(1); // 0 <= 10 - 10 → вытеснена
        expect(buffer.timeline).toEqual([5, 10]);

        expect(buffer.push(30, 4)).toBe(2);
        expect(buffer.timeline).toEqual([30]);
        expect(buffer.values).toEqual([4]);
    });

    it('never drops the point that was just pushed', () => {
        const buffer = new SlidingWindowBuffer(1);
        buffer.push(0, 1);
        expect(buffer.push(1000, 2)).toBe(1);
        expect(buffer.length).toBe(1);
    });

    it('returns copies from snapshot and correct stats', () => {
        const buffer = new SlidingWindowBuffer(DAY_MS);
        buffer.push(1, 10);
        buffer.push(2, 30);

        const snapshot = buffer.snapshot();
        snapshot.timeline.push(99);
        expect(buffer.length).toBe(2);

        expect(buffer.stats()).toEqual({current: 30, average: 20, max: 30, points: 2});
        expect(new SlidingWindowBuffer(1).stats()).toEqual({current: null, average: null, max: null, points: 0});
    });
});

describe('createCpuLoadModel', () => {
    it('is deterministic for a seed and stays within 0..100', () => {
        const a = createCpuLoadModel(7);
        const b = createCpuLoadModel(7);
        for (let i = 0; i < 5000; i++) {
            const ts = i * 2000;
            const va = a(ts);
            expect(va).toBe(b(ts));
            expect(va).toBeGreaterThanOrEqual(0);
            expect(va).toBeLessThanOrEqual(100);
        }
    });
});

describe('createSimulatedCpuLoadSource', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('prefills a full window on a uniform grid', () => {
        const source = createSimulatedCpuLoadSource({intervalMs: 2000});
        const {timeline, values} = source.getSnapshot();

        expect(timeline.length).toBe(DAY_MS / 2000);
        expect(values.length).toBe(timeline.length);
        expect(timeline[timeline.length - 1]).toBe(Date.now());
        expect(timeline[timeline.length - 1] - timeline[0]).toBe(DAY_MS - 2000);
        for (let i = 1; i < 200; i++) {
            expect(timeline[i] - timeline[i - 1]).toBe(2000);
        }
        source.dispose();
    });

    it('emits one new point per interval and drops one old point (window stays constant)', () => {
        const source = createSimulatedCpuLoadSource({intervalMs: 2000});
        const before = source.getStats().points;
        const listener = vi.fn();
        source.subscribe(listener);

        vi.advanceTimersByTime(2000);

        expect(listener).toHaveBeenCalledTimes(1);
        const batch = listener.mock.calls[0][0];
        expect(batch.timeline).toEqual([Date.now()]);
        expect(batch.values).toHaveLength(1);
        expect(batch.dropped).toBe(1);
        expect(source.getStats().points).toBe(before);
        source.dispose();
    });

    it('catches up after a long pause with a single multi-point batch', () => {
        const source = createSimulatedCpuLoadSource({intervalMs: 2000});
        const listener = vi.fn();
        source.subscribe(listener);

        // Таймер «не тикал» 10 секунд (фоновая вкладка), затем сработал один раз.
        vi.setSystemTime(Date.now() + 10_000);
        vi.advanceTimersByTime(2000);

        const batch = listener.mock.calls[0][0];
        expect(batch.timeline).toHaveLength(6);
        expect(batch.dropped).toBe(6);
        source.dispose();
    });

    it('stops notifying after dispose and unsubscribe', () => {
        const source = createSimulatedCpuLoadSource({intervalMs: 1000});
        const a = vi.fn();
        const b = vi.fn();
        const unsubscribeA = source.subscribe(a);
        source.subscribe(b);

        unsubscribeA();
        vi.advanceTimersByTime(1000);
        expect(a).not.toHaveBeenCalled();
        expect(b).toHaveBeenCalledTimes(1);

        source.dispose();
        vi.advanceTimersByTime(5000);
        expect(b).toHaveBeenCalledTimes(1);
    });
});
