import {useEffect, useRef} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {AreaSeriesOptions, MinimalValidConfig, RawSerieData, YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadSource, CpuSample, CpuWindow} from './types';

const SERIES_ID = 'cpu';
const SERIES_NAME = 'Загрузка CPU';

// Semantic uikit tokens, resolved by yagr through getComputedStyle, so the line follows the active theme.
// `base-info-heavy` is the only blue step that keeps >= 3:1 against both surfaces (light: ~3.6:1, dark: ~6:1).
const LINE_COLOR = 'var(--g-color-base-info-heavy)';
// Area wash: the line hue at ~12% opacity, per the dataviz area-fill spec.
const FILL_COLOR = 'color-mix(in srgb, var(--g-color-base-info-heavy) 12%, transparent)';

const YAGR_THEMES: readonly string[] = ['light', 'dark', 'light-hc', 'dark-hc'];

function toYagrTheme(value: string): YagrTheme {
    return YAGR_THEMES.includes(value) ? (value as YagrTheme) : 'light';
}

function formatPercent(value: string | number | null): string {
    return typeof value === 'number' ? `${value.toFixed(1)}%` : '—';
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
}

/**
 * Realtime CPU load chart for a sliding window of samples (tens of thousands of points).
 *
 * - Fills its parent: give the parent a definite height, the chart takes 100% of it.
 * - Follows the uikit theme (light / dark, incl. high-contrast variants).
 * - Updates are incremental (append + drop oldest) and batched per animation frame.
 * - Zoom (drag-select) is preserved across live updates; double-click resets it.
 * - Releases the chart, the source subscription and the pending frame on unmount.
 */
export function CpuLoadChart({source}: CpuLoadChartProps) {
    const theme = toYagrTheme(useThemeValue());

    const rootRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<Yagr | null>(null);
    const windowRef = useRef<CpuWindow | null>(null);
    // True while the user has zoomed in; makes the x-scale stop auto-fitting to the data.
    const zoomedRef = useRef(false);

    // Take the window from the source once per source instance. Theme changes must not reset it.
    useEffect(() => {
        windowRef.current = source.snapshot();
    }, [source]);

    // Create the chart, and re-create it on theme change: yagr resolves CSS-variable colors
    // when series are configured, so a theme switch needs a fresh instance.
    useEffect(() => {
        const host = rootRef.current;
        const win = windowRef.current;
        if (!host || !win) {
            return;
        }

        zoomedRef.current = false;

        // Typed against the area variant: the default RawSerieData type drops area-only fields such as `lineColor`.
        const cpuSeries: RawSerieData<AreaSeriesOptions> = {
            id: SERIES_ID,
            name: SERIES_NAME,
            type: 'area',
            data: win.values.slice(),
            color: FILL_COLOR,
            lineColor: LINE_COLOR,
            lineWidth: 2,
            formatter: formatPercent,
        };

        const config: MinimalValidConfig = {
            timeline: win.timeline.slice(),
            series: [cpuSeries],
            chart: {
                timeMultiplier: 1,
                appearance: {theme, locale: 'ru'},
            },
            // A single series needs no legend: the card title already names it.
            legend: {show: false},
            scales: {
                // CPU load is bounded: a fixed 0–100 range avoids the axis rescaling on every tick.
                y: {range: () => [0, 100]},
            },
            axes: {
                y: {values: (_u, splits) => splits.map((v) => `${v}%`)},
            },
            hooks: {
                onSelect: [
                    ({from, to}) => {
                        // A drag-zoom selection. Plain clicks produce no selection and never reach here.
                        if (to > from) {
                            zoomedRef.current = true;
                        }
                    },
                ],
            },
            editUplotOptions: (opts) => ({
                ...opts,
                scales: {
                    ...opts.scales,
                    x: {
                        ...opts.scales?.x,
                        // uPlot re-fits an `auto` x-scale on every setData, which would undo the user's zoom.
                        // While zoomed, keep the current range instead.
                        auto: () => !zoomedRef.current,
                    },
                },
            }),
        };

        const chart = new Yagr(host, config);
        chartRef.current = chart;

        // uPlot resets the x-scale on double-click; mirror that in our flag.
        const onDoubleClick = () => {
            zoomedRef.current = false;
        };
        host.addEventListener('dblclick', onDoubleClick);

        return () => {
            host.removeEventListener('dblclick', onDoubleClick);
            chartRef.current = null;
            chart.dispose();
        };
    }, [source, theme]);

    // Subscribe to live samples. Samples arriving within one frame are applied in a single update.
    useEffect(() => {
        const pending: CpuSample[] = [];
        let frame: number | null = null;

        const flush = () => {
            frame = null;
            const win = windowRef.current;
            const chart = chartRef.current;
            if (!win || pending.length === 0) {
                pending.length = 0;
                return;
            }

            const batch = pending.splice(0);
            const times = batch.map((s) => s.time);
            const values = batch.map((s) => s.value);

            // Keep the window size constant: append the new points, drop the same number from the front.
            win.timeline.push(...times);
            win.values.push(...values);
            win.timeline.splice(0, times.length);
            win.values.splice(0, values.length);

            // `splice: true` makes yagr drop as many points from its own buffer as it appends.
            chart?.setSeries(times, [{id: SERIES_ID, data: values}], {
                incremental: true,
                splice: true,
            });
        };

        const unsubscribe = source.subscribe((sample) => {
            pending.push(sample);
            if (frame === null) {
                frame = requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            pending.length = 0;
        };
    }, [source]);

    return (
        <div style={{position: 'relative', width: '100%', height: '100%', minHeight: 0}}>
            <div ref={rootRef} style={{position: 'absolute', inset: 0}} />
        </div>
    );
}
