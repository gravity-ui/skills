import type {MonitoringData, SalesSeries} from './widgets/ChartWidget';

const DAY = 24 * 3600 * 1000;
const MINUTE = 60 * 1000;

// deterministic pseudo-random so the demo is stable between renders
function rng(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

export function makeSales(): SalesSeries[] {
    const end = Date.UTC(2026, 10, 1);
    return ['Online', 'Retail'].map((name, idx) => {
        const rand = rng(10 + idx);
        return {
            id: name.toLowerCase(),
            name,
            points: Array.from({length: 30}, (_, i) => ({
                x: end - (29 - i) * DAY,
                y: Math.round(40_000 * (idx + 1) + i * 600 + rand() * 8_000),
            })),
        };
    });
}

export function makeMonitoring(points = 2000): MonitoringData {
    const end = Date.UTC(2026, 10, 1);
    const timeline = Array.from({length: points}, (_, i) => end - (points - 1 - i) * MINUTE);
    const series = ['CPU', 'Memory', 'Latency'].map((name, idx) => {
        const rand = rng(100 + idx);
        return {
            id: name.toLowerCase(),
            name,
            values: timeline.map((_, i) =>
                i > 700 && i < 730 && idx === 2
                    ? null
                    : Math.round((50 + 30 * Math.sin(i / (40 + idx * 25)) + rand() * 15) * 10) / 10,
            ),
        };
    });
    return {timeline, series};
}
