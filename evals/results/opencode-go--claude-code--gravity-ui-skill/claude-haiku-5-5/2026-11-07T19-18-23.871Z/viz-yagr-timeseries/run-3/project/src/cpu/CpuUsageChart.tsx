import {useEffect, useRef, useState} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';
import YagrChart, {type YagrReactRef} from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import {CPU_STEP_MS, type CpuSeries, cpuHistory, cpuPointsAfter} from './cpuMetrics';
import './CpuUsageChart.css';

const SERIES_ID = 'cpu';
const CHART_ID = 'cpu-usage-chart';
const BRAND_COLOR = 'var(--g-color-base-brand)';

function createChartConfig(history: CpuSeries, theme: ThemeType): MinimalValidConfig {
    return {
        // yagr keeps and mutates these arrays, so they must be owned by the chart.
        timeline: history.timeline,
        series: [
            {
                id: SERIES_ID,
                name: 'CPU',
                type: 'line',
                color: BRAND_COLOR,
                data: history.values,
                formatter: (value) => (value == null ? '—' : `${value}%`),
            },
        ],
        scales: {y: {min: 0, max: 100}},
        chart: {
            appearance: {theme},
        },
    };
}

/**
 * Интерактивный график загрузки CPU за последние 24 часа.
 *
 * - Растягивается по родительскому контейнеру (нужна задать высоту родителю).
 * - Новые точки дописываются через `setSeries(..., {incremental, splice})`:
 *   окно остаётся фиксированным, полная перерисовка не выполняется.
 * - Тема берётся из uikit: цвета фона/сетки — токены `--g-*`, при смене темы
 *   график переключается через `setTheme` без пересоздания.
 * - При размонтировании останавливается таймер; экземпляр yagr уничтожает обёртка `YagrChart`.
 */
export function CpuUsageChart() {
    const themeType = useThemeType();
    const chartRef = useRef<YagrReactRef | null>(null);

    // Initial state is created once per mount. The config is never recreated, so the
    // React wrapper never runs a full reinit when the parent re-renders.
    const [initial] = useState(() => {
        const history = cpuHistory(Date.now());
        return {
            config: createChartConfig(history, themeType),
            lastTs: history.timeline[history.timeline.length - 1],
        };
    });

    // Timestamp of the newest point the chart has received. It is a cursor, so a tick
    // that runs before the chart exists is not lost: the next tick catches up.
    const lastTsRef = useRef(initial.lastTs);

    useEffect(() => {
        // Runs after the wrapper's mount effect, so the chart instance already exists
        // on mount. On later theme changes the uikit class is already on <body>.
        const chart = chartRef.current?.yagr();
        if (!chart) {
            return;
        }
        // Series colors are resolved from CSS variables when the series is configured,
        // so re-apply them before setTheme, which redraws the chart.
        chart.setSeries(SERIES_ID, {color: BRAND_COLOR});
        chart.setTheme(themeType);
    }, [themeType]);

    useEffect(() => {
        const pull = () => {
            const chart = chartRef.current?.yagr();
            if (!chart) {
                return;
            }
            const fresh = cpuPointsAfter(lastTsRef.current, Date.now());
            if (fresh.timeline.length === 0) {
                return;
            }
            lastTsRef.current = fresh.timeline[fresh.timeline.length - 1];
            // incremental: append the new points; splice: drop the same number from
            // the head, so the 24-hour window stays a fixed size.
            chart.setSeries(fresh.timeline, [{id: SERIES_ID, data: fresh.values}], {
                incremental: true,
                splice: true,
            });
        };

        pull();
        const timer = window.setInterval(pull, CPU_STEP_MS);
        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return (
        <div className="cpu-chart">
            <YagrChart
                ref={chartRef}
                id={CHART_ID}
                config={initial.config}
                className="cpu-chart__plot"
            />
        </div>
    );
}
