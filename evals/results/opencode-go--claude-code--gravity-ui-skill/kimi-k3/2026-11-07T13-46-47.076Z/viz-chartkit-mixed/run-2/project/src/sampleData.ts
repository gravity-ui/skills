import type {MonitoringModeData, SalesModeData} from './viz-widget';

/** Deterministic PRNG so the demo data is stable between reloads. */
function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 7); // 2026-11-07

/** ~90 days of daily sales for two channels — a regular business line chart. */
export function buildSalesData(): SalesModeData {
    const random = mulberry32(42);
    const days = 90;
    const start = NOW - (days - 1) * DAY;

    const makePoints = (base: number, amplitude: number, trend: number) =>
        Array.from({length: days}, (_, i) => ({
            t: start + i * DAY,
            value: Math.round(
                base +
                    trend * i +
                    amplitude * Math.sin((i / days) * Math.PI * 4) +
                    random() * amplitude * 0.6,
            ),
        }));

    return {
        yAxisTitle: 'Выручка, ₽',
        series: [
            {name: 'Онлайн', points: makePoints(120_000, 30_000, 500)},
            {name: 'Розница', points: makePoints(80_000, 20_000, -150)},
        ],
    };
}

/** 24h at 30s resolution (2880 points) per metric — a dense monitoring series. */
export function buildMonitoringData(): MonitoringModeData {
    const random = mulberry32(7);
    const step = 30 * 1000;
    const points = 2880;
    const start = NOW - (points - 1) * step;

    const timeline = Array.from({length: points}, (_, i) => start + i * step);

    const makeValues = (base: number, wave: number, noise: number, spikeEvery: number) =>
        Array.from({length: points}, (_, i) => {
            const spike = i % spikeEvery === 0 ? wave * (1 + random()) : 0;
            const value =
                base +
                wave * Math.sin((i / points) * Math.PI * 8) +
                (random() - 0.5) * noise +
                spike;
            return Math.round(value * 10) / 10;
        });

    return {
        timeline,
        series: [
            {id: 'cpu', name: 'CPU, %', values: makeValues(45, 15, 6, 379)},
            {id: 'mem', name: 'Память, %', values: makeValues(62, 8, 2, 641)},
            {id: 'net', name: 'Сеть, Мбит/с', values: makeValues(120, 60, 25, 173)},
        ],
    };
}
