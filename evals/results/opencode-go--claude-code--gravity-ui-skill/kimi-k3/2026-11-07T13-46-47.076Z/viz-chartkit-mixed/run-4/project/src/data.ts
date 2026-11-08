import type {VizWidgetData} from './widget/types';

/** Deterministic pseudo-random generator so the demo data is stable between reloads. */
function createLcg(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function buildSalesData(): VizWidgetData['sales'] {
    const month = (index: number) => Date.UTC(2025, index, 1);
    // Two channels with different seasonal shapes, млн ₽ per month.
    const online = [4.2, 4.6, 5.1, 4.9, 5.6, 6.3, 6.8, 6.5, 7.4, 8.1, 9.2, 9.8];
    const retail = [6.1, 5.8, 6.4, 6.0, 5.7, 5.2, 4.9, 5.1, 5.6, 5.9, 6.7, 7.3];

    return {
        yAxisTitle: 'млн ₽',
        series: [
            {name: 'Онлайн', points: online.map((value, i) => ({t: month(i), value}))},
            {name: 'Розница', points: retail.map((value, i) => ({t: month(i), value}))},
        ],
    };
}

function buildMonitoringData(): VizWidgetData['monitoring'] {
    // 24 hours at a 1-minute step = 1440 points per series — a dense series
    // that the yagr (uPlot canvas) engine renders without breaking a sweat.
    const STEP = 60 * 1000;
    const end = Date.UTC(2026, 10, 7, 0, 0, 0);
    const timeline = Array.from({length: 1440}, (_, i) => end - (1439 - i) * STEP);

    const rand = createLcg(42);
    const wave = (base: number, amp: number, phase: number, noise: number) =>
        timeline.map(
            (t, i) =>
                base +
                amp * Math.sin((i / 1440) * Math.PI * 4 + phase) +
                // daily spike around 14:00
                12 * Math.exp(-Math.pow((i - 840) / 90, 2)) +
                noise * (rand() - 0.5) +
                (t % 1 === 0 ? 0 : 0),
        );

    return {
        timeline,
        timeZone: 'Europe/Moscow',
        series: [
            {name: 'CPU, %', data: wave(38, 12, 0, 6)},
            {name: 'Память, %', data: wave(55, 6, 1.2, 3)},
            {name: 'Диск, %', data: wave(24, 8, 2.4, 8)},
        ],
    };
}

export const demoWidgetData: VizWidgetData = {
    sales: buildSalesData(),
    monitoring: buildMonitoringData(),
};
