import {useEffect, useRef, useState} from 'react';
import {useThemeValue} from '@gravity-ui/uikit';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import YagrChart, {type YagrReactRef} from '@gravity-ui/yagr/react';
import '@gravity-ui/yagr/index.css';

import {type CpuBatch, cpuFeed} from './cpuFeed';

const SERIES_ID = 'cpu';
/** Semantic uikit token; Yagr resolves it against the active theme when the series is configured. */
const LINE_COLOR = 'var(--g-color-line-brand)';

const YAGR_THEMES: readonly string[] = ['light', 'dark', 'light-hc', 'dark-hc'];

function toYagrTheme(themeValue: string): YagrTheme {
    return YAGR_THEMES.includes(themeValue) ? (themeValue as YagrTheme) : 'light';
}

function createChartConfig(batch: CpuBatch, theme: YagrTheme): MinimalValidConfig {
    return {
        // Yagr keeps references to these arrays and mutates them on incremental updates.
        // The caller must pass copies (cpuFeed.snapshot() returns copies).
        timeline: batch.timestamps,
        series: [
            {
                id: SERIES_ID,
                name: 'CPU',
                type: 'line',
                color: LINE_COLOR,
                data: batch.values,
                formatter: (value) => (value === null ? '—' : `${Number(value).toFixed(1)}%`),
            },
        ],
        chart: {
            appearance: {theme, locale: 'ru'},
            // A zoom would be reset by every realtime update (setData resets scales),
            // so zoom is disabled. Hover tooltip and crosshair stay enabled.
            select: {zoom: false},
        },
        scales: {
            x: {time: true},
            y: {min: 0, max: 100},
        },
        axes: {
            y: {values: (_u, splits) => splits.map((value) => `${value}%`)},
        },
        legend: {show: false},
        tooltip: {show: true},
    };
}

/**
 * Realtime CPU load chart for the last 24 hours. Fills the parent (the parent must
 * give it a size; it is positioned absolutely inside a relatively positioned box).
 *
 * - Samples are pushed straight into the Yagr instance, not through React state,
 *   so a tick does not re-render React.
 * - Theme changes are applied to the existing instance (`setTheme`).
 * - Unmounting unsubscribes from the feed; the Yagr wrapper disposes the instance.
 */
export function CpuLoadChart() {
    const yagrTheme = toYagrTheme(useThemeValue());
    const chartRef = useRef<YagrReactRef>(null);
    const appliedThemeRef = useRef<YagrTheme>(yagrTheme);

    // Created once per mount. Stable identity keeps the Yagr wrapper from calling setConfig on re-render.
    const [initial] = useState(() => {
        const snapshot = cpuFeed.snapshot();
        return {
            config: createChartConfig(snapshot, yagrTheme),
            lastTimestamp: snapshot.timestamps[snapshot.timestamps.length - 1] ?? 0,
        };
    });

    useEffect(() => {
        // The chart is already created here: child effects (the Yagr wrapper) run before this one.
        return cpuFeed.subscribe(initial.lastTimestamp, (batch) => {
            chartRef.current?.yagr()?.setSeries(batch.timestamps, [{id: SERIES_ID, data: batch.values}], {
                incremental: true,
                splice: true,
            });
        });
    }, [initial]);

    useEffect(() => {
        if (appliedThemeRef.current === yagrTheme) {
            return;
        }
        appliedThemeRef.current = yagrTheme;

        const yagr = chartRef.current?.yagr();
        if (!yagr) {
            return;
        }
        yagr.setTheme(yagrTheme);
        // Series colors are resolved from CSS variables when the series is configured,
        // so re-set the color for the new theme and redraw.
        yagr.setSeries(SERIES_ID, {color: LINE_COLOR});
        yagr.redraw();
    }, [yagrTheme]);

    return (
        <div style={{position: 'relative', width: '100%', height: '100%', minHeight: 240}}>
            <div style={{position: 'absolute', inset: 0}}>
                <YagrChart id="cpu-load-chart" ref={chartRef} config={initial.config} />
            </div>
        </div>
    );
}
