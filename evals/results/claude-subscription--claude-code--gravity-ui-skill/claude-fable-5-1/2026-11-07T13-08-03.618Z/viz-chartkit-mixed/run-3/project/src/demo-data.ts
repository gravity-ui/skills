import type {VizWidgetData} from './viz-widget';

const DAY = 24 * 60 * 60 * 1000;

/** Deterministic pseudo-random generator so the demo is stable between reloads. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** 90 days of daily sales for two channels. */
function buildSales(): VizWidgetData['sales'] {
    const rand = mulberry32(42);
    const end = Date.UTC(2026, 10, 7);
    const start = end - 89 * DAY;
    const online = [];
    const retail = [];

    for (let i = 0; i < 90; i += 1) {
        const x = start + i * DAY;
        const weekday = new Date(x).getUTCDay();
        const weekendDip = weekday === 0 || weekday === 6 ? 0.75 : 1;
        online.push({x, y: Math.round((180_000 + i * 900 + rand() * 40_000) * weekendDip)});
        retail.push({x, y: Math.round((120_000 + rand() * 25_000) * (weekday === 6 ? 1.3 : 1))});
    }

    return {
        unit: '₽',
        series: [
            {name: 'Онлайн', data: online},
            {name: 'Розница', data: retail},
        ],
    };
}

/** 2 hours of 5-second samples (1440 points) for three service latency metrics. */
function buildMonitoring(): VizWidgetData['monitoring'] {
    const rand = mulberry32(7);
    const STEP = 5_000;
    const POINTS = 1440;
    const end = Date.UTC(2026, 10, 7, 12, 0, 0);
    const start = end - (POINTS - 1) * STEP;

    const timeline: number[] = [];
    const p50: Array<number | null> = [];
    const p95: Array<number | null> = [];
    const p99: Array<number | null> = [];

    for (let i = 0; i < POINTS; i += 1) {
        timeline.push(start + i * STEP);
        const base = 40 + 10 * Math.sin(i / 60);
        const spike = i > 900 && i < 960 ? 120 : 0;
        const gap = i > 1200 && i < 1215;
        p50.push(gap ? null : Math.round(base + rand() * 6));
        p95.push(gap ? null : Math.round(base * 2.2 + rand() * 20 + spike * 0.6));
        p99.push(gap ? null : Math.round(base * 3.5 + rand() * 45 + spike));
    }

    return {
        unit: 'ms',
        timeline,
        series: [
            {name: 'p50', values: p50},
            {name: 'p95', values: p95},
            {name: 'p99', values: p99},
        ],
    };
}

export const demoData: VizWidgetData = {
    sales: buildSales(),
    monitoring: buildMonitoring(),
};
