import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {VizWidgetMode} from './types';

/** Labels and titles per widget mode (RU UI). */
export const VIZ_MODE_META: Record<VizWidgetMode, {option: string; title: string}> = {
    sales: {
        option: 'Продажи',
        title: 'Продажи по каналам',
    },
    monitoring: {
        option: 'Мониторинг',
        title: 'Нагрузка серверов — последние 24 часа',
    },
};

/* ---------------------------------- sales --------------------------------- */

const SALES_CHANNELS: {name: string; values: number[]}[] = [
    {
        name: 'Онлайн',
        values: [
            320, 345, 390, 410, 455, 480, 520, 505, 560, 590, 640, 720, 610, 655, 700, 745, 790,
            830, 860, 845, 905, 950, 1010, 1120,
        ],
    },
    {
        name: 'Розница',
        values: [
            480, 460, 495, 510, 530, 505, 545, 520, 550, 565, 600, 690, 540, 520, 555, 570, 590,
            565, 600, 580, 610, 630, 660, 750,
        ],
    },
];

const SALES_START_YEAR = 2024;

/**
 * Line chart of monthly sales revenue (thousand ₽) per channel,
 * rendered by @gravity-ui/charts through the 'gravity-charts' plugin.
 */
export function getSalesChartData(): ChartData {
    return {
        series: {
            data: SALES_CHANNELS.map(({name, values}) => ({
                type: 'line' as const,
                name,
                data: values.map((y, index) => ({x: Date.UTC(SALES_START_YEAR, index, 1), y})),
            })),
        },
        xAxis: {
            type: 'datetime',
            title: {text: 'Месяц'},
        },
        yAxis: [{title: {text: 'Выручка, тыс. ₽'}}],
        legend: {enabled: true},
    };
}

/* ------------------------------- monitoring ------------------------------- */

const MONITORING_POINTS = 24 * 60; // one day with a 1-minute step — dense series
const MONITORING_STEP_S = 60;

/** Deterministic PRNG (mulberry32) so the mock series is stable between renders. */
function mulberry32(seed: number): () => number {
    let state = seed;
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/** Random walk with mean reversion and a diurnal wave — looks like real telemetry. */
function generateMetricSeries(seed: number, base: number, wave: number, noise: number): number[] {
    const rand = mulberry32(seed);
    let drift = 0;
    return Array.from({length: MONITORING_POINTS}, (_, index) => {
        drift = clamp(drift + (rand() - 0.5) * 1.6 - drift * 0.02, -14, 14);
        const dayWave = Math.sin(((index / MONITORING_POINTS) * Math.PI * 2 - Math.PI / 2) * 2);
        const value = base + dayWave * wave + drift + (rand() - 0.5) * noise;
        return Math.round(clamp(value, 0, 100) * 10) / 10;
    });
}

/**
 * Dense minute-by-minute time series of host metrics, rendered by the
 * high-performance uPlot-based @gravity-ui/yagr engine through the 'yagr' plugin.
 * Series colors reuse Gravity UI semantic tokens (yagr resolves CSS variables).
 */
export function getMonitoringChartData(nowSeconds: number): YagrWidgetData {
    const start = nowSeconds - MONITORING_POINTS * MONITORING_STEP_S;
    const timeline = Array.from({length: MONITORING_POINTS}, (_, index) => start + index * MONITORING_STEP_S);

    return {
        data: {
            timeline,
            graphs: [
                {
                    id: 'cpu',
                    name: 'CPU, %',
                    color: 'var(--g-color-text-info)',
                    data: generateMetricSeries(11, 42, 18, 6),
                },
                {
                    id: 'memory',
                    name: 'Память, %',
                    color: 'var(--g-color-text-positive)',
                    data: generateMetricSeries(23, 62, 10, 3),
                },
                {
                    id: 'disk',
                    name: 'Диск I/O, %',
                    color: 'var(--g-color-text-warning)',
                    data: generateMetricSeries(37, 28, 14, 9),
                },
            ],
        },
        libraryConfig: {
            chart: {
                series: {type: 'line'},
            },
            legend: {show: true, behaviour: 'basic'},
            tooltip: {show: true},
        },
    };
}
