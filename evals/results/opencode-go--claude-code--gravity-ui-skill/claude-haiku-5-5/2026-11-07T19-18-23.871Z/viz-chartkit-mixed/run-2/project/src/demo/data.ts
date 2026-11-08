import type {TimeSeries, WidgetData} from '../widget';

/** Deterministic pseudo-random generator so the demo renders the same data on every load. */
function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 2 ** 32;
    };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SECOND_MS = 1000;

/** Daily sales for the last 365 days, one series per channel. */
function makeSalesSeries(): TimeSeries[] {
    const random = createRandom(42);
    const start = Date.UTC(2025, 10, 8);
    const days = 365;

    const channel = (id: string, name: string, color: string, base: number, amplitude: number): TimeSeries => ({
        id,
        name,
        color,
        points: Array.from({length: days}, (_, i) => {
            const weekly = i % 7 === 5 || i % 7 === 6 ? 1.15 : 1;
            const seasonal = 1 + 0.2 * Math.sin((2 * Math.PI * i) / 365);
            const noise = 1 + (random() - 0.5) * 0.12;
            return {t: start + i * DAY_MS, v: Math.round(base * weekly * seasonal * noise + amplitude * random())};
        }),
    });

    return [
        channel('online', 'Онлайн', '#4DA2F1', 1200, 80),
        channel('offline', 'Офлайн', '#FFC636', 900, 60),
    ];
}

/** Dense 1-second CPU load for three hosts over six hours (21 600 points per series). */
function makeMonitoringSeries(): TimeSeries[] {
    const random = createRandom(7);
    const start = Date.UTC(2026, 10, 7, 6, 0, 0);
    const samples = 6 * 60 * 60;

    const host = (id: string, name: string, color: string, phase: number): TimeSeries => ({
        id,
        name,
        color,
        points: Array.from({length: samples}, (_, i) => {
            const wave = 35 + 20 * Math.sin(i / 300 + phase) + 8 * Math.sin(i / 37 + phase * 2);
            const spike = random() < 0.002 ? 30 * random() : 0;
            // Simulate a telemetry outage on host-3 to show gaps in the dense view.
            const outage = id === 'host-3' && i > 9000 && i < 9300;
            return {
                t: start + i * SECOND_MS,
                v: outage ? null : Math.min(100, Math.max(0, wave + spike + (random() - 0.5) * 6)),
            };
        }),
    });

    return [
        host('host-1', 'CPU host-1, %', '#4DA2F1', 0),
        host('host-2', 'CPU host-2, %', '#8AD554', 1.3),
        host('host-3', 'CPU host-3, %', '#FF3D64', 2.6),
    ];
}

export const demoWidgetData: WidgetData = {
    sales: makeSalesSeries(),
    monitoring: makeMonitoringSeries(),
};
