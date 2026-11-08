import type {VizDataset} from '../viz';

import {createRandom} from './random';

/** Задержка ответа API за сутки с шагом 5 секунд: 17 280 точек на серию, перцентили p50/p95/p99. */
export function buildMonitoringDataset(hours = 24, stepMs = 5_000): VizDataset {
    const random = createRandom(7);
    const now = Math.floor(Date.now() / stepMs) * stepMs;
    const points = Math.floor((hours * 3_600_000) / stepMs);
    const start = now - (points - 1) * stepMs;

    const timeline: number[] = new Array(points);
    const p50: Array<number | null> = new Array(points);
    const p95: Array<number | null> = new Array(points);
    const p99: Array<number | null> = new Array(points);

    let level = 1;
    let spike = 0;
    // Окно без данных, чтобы показать разрыв линии (spanGaps: false).
    const gapStart = Math.floor(points * 0.62);
    const gapEnd = gapStart + Math.floor(points * 0.01);

    for (let i = 0; i < points; i += 1) {
        const ts = start + i * stepMs;
        timeline[i] = ts;

        const hour = (ts / 3_600_000) % 24;
        const daily = 1 + 0.35 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
        level += (random() - 0.5) * 0.02;
        level = Math.min(1.4, Math.max(0.7, level));

        if (spike > 0) {
            spike -= 1;
        } else if (random() < 0.0015) {
            spike = 20 + Math.floor(random() * 60);
        }
        const spikeFactor = spike > 0 ? 1 + spike / 25 : 1;

        if (i >= gapStart && i < gapEnd) {
            p50[i] = null;
            p95[i] = null;
            p99[i] = null;
            continue;
        }

        const base = 42 * daily * level;
        const v50 = base + (random() - 0.5) * 6;
        const v95 = v50 * (2.1 + random() * 0.3) * spikeFactor;
        const v99 = v95 * (1.4 + random() * 0.4) * (spike > 0 ? 1.3 : 1);

        p50[i] = Math.round(v50 * 10) / 10;
        p95[i] = Math.round(v95 * 10) / 10;
        p99[i] = Math.round(v99 * 10) / 10;
    }

    return {
        title: 'Задержка API, перцентили',
        unit: 'мс',
        precision: 1,
        timeline,
        series: [
            {id: 'p50', name: 'p50', values: p50},
            {id: 'p95', name: 'p95', values: p95},
            {id: 'p99', name: 'p99', values: p99},
        ],
    };
}
