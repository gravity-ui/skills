import {useEffect, useMemo, useRef} from 'react';
import YagrChart from '@gravity-ui/yagr/react';
import type {YagrReactRef} from '@gravity-ui/yagr/react';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';

import {TICK_MS, createInitialSeries, nextCpuValue} from '../lib/cpuData';

import './CpuLoadChart.css';

const SERIES_ID = 'cpu';

export interface CpuLoadChartProps {
    /** Current app theme; the chart repaints (incl. series colors) when it changes. */
    theme: YagrTheme;
}

/**
 * Interactive CPU load chart for the last 24h.
 *
 * Performance notes:
 * - rendered by yagr (uPlot-based, canvas) — handles ~86k points easily;
 * - realtime ticks bypass React: a new point is pushed straight into the chart
 *   via `setSeries(..., {incremental: true, splice: true})` (sliding window,
 *   no re-init, no React re-render);
 * - the React-side config is rebuilt only when the theme changes, so colors
 *   declared as `var(--g-color-…)` are re-resolved under the new theme.
 */
export function CpuLoadChart({theme}: CpuLoadChartProps) {
    const chartRef = useRef<YagrReactRef>(null);
    // Owner of the sliding window. Yagr keeps config arrays by reference and
    // mutates them during incremental updates, so the chart config below
    // always receives *copies* and this ref stays the single source of truth.
    const dataRef = useRef(createInitialSeries(Date.now()));

    const config = useMemo<MinimalValidConfig>(() => {
        const {timeline, values} = dataRef.current;
        return {
            timeline: [...timeline],
            series: [
                {
                    id: SERIES_ID,
                    name: 'CPU',
                    type: 'area',
                    data: [...values],
                    color: 'var(--g-color-base-info-light)',
                    lineColor: 'var(--g-color-text-info)',
                    lineWidth: 2,
                    interpolation: 'linear',
                    spanGaps: false,
                    precision: 1,
                    formatter: (value) =>
                        value === null ? '—' : `${Number(value).toFixed(1)} %`,
                },
            ],
            chart: {
                appearance: {theme, locale: 'ru'},
                // Stretch to the container and redraw when it resizes
                // (debounced ResizeObserver, owned and disposed by yagr).
                size: {adaptive: true, resizeDebounceMs: 100},
                select: {zoom: true},
            },
            scales: {
                y: {min: 0, max: 100},
            },
            axes: {
                y: {
                    splitsCount: 5,
                    values: (_u, splits) => splits.map((v) => `${v}%`),
                },
            },
            // Single series — the card title names it, no legend needed.
            legend: {show: false},
            // Hover crosshair + tooltip are on by default; stated explicitly.
            tooltip: {show: true},
        };
    }, [theme]);

    // Realtime feed: every second append one sample and drop the oldest one.
    useEffect(() => {
        const timer = setInterval(() => {
            const data = dataRef.current;
            const t = Date.now();
            const v = nextCpuValue(data.values[data.values.length - 1], t);

            data.timeline.push(t);
            data.timeline.shift();
            data.values.push(v);
            data.values.shift();

            chartRef.current
                ?.yagr()
                ?.setSeries([t], [{id: SERIES_ID, data: [v]}], {
                    incremental: true,
                    splice: true,
                });
        }, TICK_MS);

        return () => clearInterval(timer);
    }, []);

    return (
        <YagrChart ref={chartRef} id="cpu-load-chart" className="cpu-load-chart" config={config} />
    );
}
