import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createSimulatedCpuMetrics} from './cpuMetrics';

const INTERVAL = 1_000;
const WINDOW = 60_000;

describe('createSimulatedCpuMetrics', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-02T12:00:00.500Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('заполняет окно историей с шагом интервала', () => {
        const source = createSimulatedCpuMetrics({windowMs: WINDOW, intervalMs: INTERVAL});
        const {timeline, values} = source.getSnapshot();

        expect(timeline).toHaveLength(WINDOW / INTERVAL);
        expect(values).toHaveLength(timeline.length);
        expect(timeline[timeline.length - 1]).toBe(Math.floor(Date.now() / INTERVAL) * INTERVAL);
        for (let i = 1; i < timeline.length; i++) {
            expect(timeline[i] - timeline[i - 1]).toBe(INTERVAL);
        }
        for (const v of values) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(100);
        }
        source.stop();
    });

    it('отдаёт подписчикам новые точки и сохраняет длину окна', () => {
        const source = createSimulatedCpuMetrics({windowMs: WINDOW, intervalMs: INTERVAL});
        const listener = vi.fn();
        source.subscribe(listener);

        vi.advanceTimersByTime(INTERVAL * 3);

        expect(listener).toHaveBeenCalledTimes(3);
        const [samples] = listener.mock.calls[2];
        expect(samples).toHaveLength(1);
        expect(samples[0].time).toBe(Math.floor(Date.now() / INTERVAL) * INTERVAL);

        const {timeline} = source.getSnapshot();
        expect(timeline).toHaveLength(WINDOW / INTERVAL);
        expect(timeline[timeline.length - 1]).toBe(samples[0].time);
        source.stop();
    });

    it('догоняет пропущенные интервалы одной пачкой', () => {
        const source = createSimulatedCpuMetrics({windowMs: WINDOW, intervalMs: INTERVAL});
        const listener = vi.fn();
        source.subscribe(listener);

        // Вкладка «спала»: таймер не срабатывал, но время ушло вперёд
        vi.setSystemTime(Date.now() + INTERVAL * 5);
        vi.advanceTimersByTime(INTERVAL);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toHaveLength(6);
        expect(source.getSnapshot().timeline).toHaveLength(WINDOW / INTERVAL);
        source.stop();
    });

    it('снимок — независимая копия, мутации не влияют на источник', () => {
        const source = createSimulatedCpuMetrics({windowMs: WINDOW, intervalMs: INTERVAL});
        const snapshot = source.getSnapshot();
        snapshot.timeline.length = 0;
        snapshot.values.push(999);

        expect(source.getSnapshot().timeline).toHaveLength(WINDOW / INTERVAL);
        expect(source.getSnapshot().values).not.toContain(999);
        source.stop();
    });

    it('после stop отписывает слушателей и останавливает таймер', () => {
        const source = createSimulatedCpuMetrics({windowMs: WINDOW, intervalMs: INTERVAL});
        const listener = vi.fn();
        const unsubscribe = source.subscribe(listener);

        vi.advanceTimersByTime(INTERVAL);
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        vi.advanceTimersByTime(INTERVAL);
        expect(listener).toHaveBeenCalledTimes(1);

        source.subscribe(listener);
        source.stop();
        vi.advanceTimersByTime(INTERVAL * 5);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });
});
