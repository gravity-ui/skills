import {afterEach, describe, expect, it, vi} from 'vitest';

import {DAY_MS, appendToWindow, computeStats, createTimeSeries} from './cpuLoad';
import {createMockCpuLoadSource} from './mockCpuLoadSource';

describe('appendToWindow', () => {
    it('дописывает точки и сообщает об изменении', () => {
        const target = {timestamps: [1, 2], values: [10, 20]};
        expect(appendToWindow(target, {timestamps: [3, 4], values: [30, null]}, 100)).toBe(true);
        expect(target).toEqual({timestamps: [1, 2, 3, 4], values: [10, 20, 30, null]});
    });

    it('отбрасывает повторы и точки не по порядку', () => {
        const target = {timestamps: [1, 2, 3], values: [1, 2, 3]};
        expect(appendToWindow(target, {timestamps: [2, 3], values: [9, 9]}, 100)).toBe(false);
        appendToWindow(target, {timestamps: [5, 4, 6], values: [5, 4, 6]}, 100);
        expect(target).toEqual({timestamps: [1, 2, 3, 5, 6], values: [1, 2, 3, 5, 6]});
    });

    it('отрезает точки старше окна от последней', () => {
        const target = {timestamps: [0, 10, 20], values: [0, 1, 2]};
        appendToWindow(target, {timestamps: [35], values: [3]}, 20);
        expect(target).toEqual({timestamps: [20, 35], values: [2, 3]});
    });

    it('меняет массивы на месте, не создавая новых', () => {
        const target = createTimeSeries();
        const {timestamps, values} = target;
        appendToWindow(target, {timestamps: [1, 2], values: [1, 2]}, 1);
        expect(target.timestamps).toBe(timestamps);
        expect(target.values).toBe(values);
        expect(timestamps).toEqual([1, 2]);
    });
});

describe('computeStats', () => {
    it('считает текущее, среднее и пик, пропуская null', () => {
        expect(computeStats([10, null, 30, 20, null])).toEqual({current: 20, average: 20, peak: 30});
    });

    it('возвращает пустую статистику без данных', () => {
        expect(computeStats([null])).toEqual({current: null, average: null, peak: null});
    });
});

describe('createMockCpuLoadSource', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('отдаёт десятки тысяч точек за сутки в диапазоне 0–100 %', async () => {
        const source = createMockCpuLoadSource({latencyMs: 0});
        const to = Date.now();
        const history = await source.fetchHistory({from: to - DAY_MS, to}, new AbortController().signal);

        expect(history.timestamps.length).toBe(DAY_MS / 2000);
        expect(history.timestamps.every((ts, i, all) => i === 0 || ts > all[i - 1])).toBe(true);
        expect(history.values.every((v) => v !== null && v >= 0 && v <= 100)).toBe(true);
    });

    it('отменяет запрос истории по AbortSignal', async () => {
        const source = createMockCpuLoadSource({latencyMs: 1000});
        const abort = new AbortController();
        const request = source.fetchHistory({from: 0, to: DAY_MS}, abort.signal);
        abort.abort();
        await expect(request).rejects.toMatchObject({name: 'AbortError'});
    });

    it('присылает новые точки и перестаёт после отписки', () => {
        vi.useFakeTimers({now: 1_000_000});
        const source = createMockCpuLoadSource({stepMs: 1000});
        const listener = vi.fn();
        const unsubscribe = source.subscribe(listener);

        vi.advanceTimersByTime(3000);
        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener.mock.calls[0][0].timestamps).toEqual([1_001_000]);

        unsubscribe();
        vi.advanceTimersByTime(5000);
        expect(listener).toHaveBeenCalledTimes(3);
        expect(vi.getTimerCount()).toBe(0);
    });
});
