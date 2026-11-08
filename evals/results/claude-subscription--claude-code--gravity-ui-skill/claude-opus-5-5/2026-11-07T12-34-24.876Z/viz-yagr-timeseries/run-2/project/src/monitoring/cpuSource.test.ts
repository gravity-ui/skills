import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createSimulatedCpuSource} from './cpuSource';

describe('createSimulatedCpuSource', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('отдаёт полное окно за сутки с шагом 1 с', () => {
        const source = createSimulatedCpuSource();
        const {timeline, values} = source.getSnapshot();
        expect(timeline).toHaveLength(86_400);
        expect(values).toHaveLength(86_400);
        expect(timeline[timeline.length - 1] - timeline[0]).toBe(source.windowMs - 1000);
        expect(values.every((v) => v !== null && v >= 0 && v <= 100)).toBe(true);
    });

    it('шлёт новые точки после последней, держит окно и останавливается после отписки', () => {
        const source = createSimulatedCpuSource();
        const before = source.getSnapshot();
        const listener = vi.fn();
        const unsubscribe = source.subscribe(listener);

        vi.advanceTimersByTime(3000);
        expect(listener).toHaveBeenCalledTimes(3);
        const first = listener.mock.calls[0][0];
        expect(first.timeline[0]).toBe(before.timeline[before.timeline.length - 1] + 1000);

        const after = source.getSnapshot();
        expect(after.timeline).toHaveLength(before.timeline.length);
        expect(after.timeline[0]).toBe(before.timeline[3]);

        unsubscribe();
        vi.advanceTimersByTime(5000);
        expect(listener).toHaveBeenCalledTimes(3);
        expect(vi.getTimerCount()).toBe(0);
    });
});
