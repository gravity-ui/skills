import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createMockCpuLoadSource} from './cpuLoadSource';

describe('createMockCpuLoadSource', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('fills a full day window of points on a fixed step', () => {
        const source = createMockCpuLoadSource({stepMs: 2_000});
        const {timeline, values} = source.getSnapshot();
        expect(timeline).toHaveLength(43_200);
        expect(values).toHaveLength(43_200);
        for (let i = 1; i < timeline.length; i++) {
            expect(timeline[i] - timeline[i - 1]).toBe(2_000);
        }
        expect(values.every((v) => v >= 0 && v <= 100)).toBe(true);
        expect(timeline[timeline.length - 1]).toBe(Date.now());
    });

    it('emits points on the step grid and keeps window length constant', () => {
        const source = createMockCpuLoadSource({stepMs: 2_000});
        const received: number[] = [];
        const unsubscribe = source.subscribe((p) => received.push(p.ts));

        vi.advanceTimersByTime(6_000);
        expect(received).toEqual([Date.now() - 4_000, Date.now() - 2_000, Date.now()]);

        const {timeline} = source.getSnapshot();
        expect(timeline).toHaveLength(43_200);
        expect(timeline[timeline.length - 1]).toBe(Date.now());
        expect(source.getLatest()?.ts).toBe(Date.now());

        unsubscribe();
        vi.advanceTimersByTime(10_000);
        expect(received).toHaveLength(3);
    });

    it('catches up after a long pause with several points at once', () => {
        const source = createMockCpuLoadSource({stepMs: 2_000});
        const received: number[] = [];
        source.subscribe((p) => received.push(p.ts));
        // Вкладка «спала» 10 с, затем сработал очередной таймер: Date.now() ушёл на 12 с вперёд → 6 точек по 2 с.
        vi.setSystemTime(Date.now() + 10_000);
        vi.advanceTimersByTime(2_000);
        expect(received).toHaveLength(6);
        expect(received[received.length - 1]).toBe(Date.now());
    });
});
