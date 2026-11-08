import {describe, expect, it} from 'vitest';

import {
    CPU_STEP_MS,
    CPU_WINDOW_POINTS,
    cpuHistory,
    cpuPointsAfter,
    cpuValueAt,
} from './cpuMetrics';

const NOW = Date.UTC(2026, 10, 7, 12, 0, 1); // not aligned to the 2 s grid on purpose

describe('cpuHistory', () => {
    it('returns 24 h of grid points ending at the last grid node before now', () => {
        const {timeline, values} = cpuHistory(NOW);
        expect(timeline).toHaveLength(CPU_WINDOW_POINTS);
        expect(values).toHaveLength(CPU_WINDOW_POINTS);
        expect(timeline[timeline.length - 1]).toBe(Math.floor(NOW / CPU_STEP_MS) * CPU_STEP_MS);
        expect(timeline[timeline.length - 1] - timeline[0]).toBe(24 * 60 * 60 * 1000 - CPU_STEP_MS);
    });

    it('keeps timestamps strictly increasing on the step grid', () => {
        const {timeline} = cpuHistory(NOW);
        for (let i = 1; i < timeline.length; i++) {
            expect(timeline[i] - timeline[i - 1]).toBe(CPU_STEP_MS);
        }
    });

    it('keeps values within 0–100 %', () => {
        const {values} = cpuHistory(NOW);
        for (const v of values) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(100);
        }
    });
});

describe('cpuPointsAfter', () => {
    it('returns nothing when the cursor is already current', () => {
        const aligned = Math.floor(NOW / CPU_STEP_MS) * CPU_STEP_MS;
        expect(cpuPointsAfter(aligned, NOW).timeline).toEqual([]);
    });

    it('continues the history without gaps or duplicates', () => {
        const history = cpuHistory(NOW);
        const cursor = history.timeline[history.timeline.length - 1];
        const later = NOW + 10 * CPU_STEP_MS;
        const fresh = cpuPointsAfter(cursor, later);

        expect(fresh.timeline).toHaveLength(10);
        expect(fresh.timeline[0]).toBe(cursor + CPU_STEP_MS);
        expect(fresh.values[0]).toBe(cpuValueAt(cursor + CPU_STEP_MS));
    });

    it('catches up after a long pause (e.g. a background tab)', () => {
        const history = cpuHistory(NOW);
        const cursor = history.timeline[history.timeline.length - 1];
        const hourLater = NOW + 60 * 60 * 1000;
        expect(cpuPointsAfter(cursor, hourLater).timeline).toHaveLength(60 * 60 * 1000 / CPU_STEP_MS);
    });

    it('caps catch-up at the window size after a very long pause', () => {
        const history = cpuHistory(NOW);
        const cursor = history.timeline[history.timeline.length - 1];
        const weekLater = NOW + 7 * 24 * 60 * 60 * 1000;
        const fresh = cpuPointsAfter(cursor, weekLater);
        expect(fresh.timeline).toHaveLength(CPU_WINDOW_POINTS);
        expect(fresh.timeline[fresh.timeline.length - 1]).toBe(Math.floor(weekLater / CPU_STEP_MS) * CPU_STEP_MS);
    });

    it('is deterministic, so history and live points agree', () => {
        const ts = Math.floor(NOW / CPU_STEP_MS) * CPU_STEP_MS;
        expect(cpuValueAt(ts)).toBe(cpuValueAt(ts));
    });
});
