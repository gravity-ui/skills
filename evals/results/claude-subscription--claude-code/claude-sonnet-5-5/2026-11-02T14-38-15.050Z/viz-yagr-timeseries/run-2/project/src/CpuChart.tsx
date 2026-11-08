import React from 'react';
import Yagr, {type MinimalValidConfig, type RawSerieData} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import './CpuChart.css';
import {useThemeType} from '@gravity-ui/uikit';

const SERIES_ID = 'cpu';

type ThemeType = 'light' | 'dark';

/**
 * Series colours are picked per theme (not inherited), so the line keeps
 * >= 3:1 contrast on both the light (#fff) and the dark (#2d2c33) chart surface.
 */
const SERIES_COLORS: Record<ThemeType, {line: string; fill: string}> = {
    light: {line: '#2a78d6', fill: 'rgba(42, 120, 214, 0.14)'},
    dark: {line: '#3987e5', fill: 'rgba(57, 135, 229, 0.20)'},
};

export interface CpuChartProps {
    /**
     * Sample timestamps in ms, strictly ascending.
     * Already delivered history is treated as immutable: when new arrays arrive the chart
     * detects a plain "window slid forward" update (N new points appended, N oldest dropped)
     * and applies it incrementally. Any other change re-initialises the chart.
     */
    timeline: readonly number[];
    /** CPU load in percent (0..100), one value per timestamp; `null` renders as a gap. */
    values: readonly (number | null)[];
    /** Chart height in px. Width always follows the container. */
    height?: number;
    className?: string;
}

/** First index in the ascending `arr` whose value is >= `x`. */
function lowerBound(arr: ArrayLike<number>, x: number): number {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

/**
 * If `next` is `prev` slid forward by k >= 0 points (k appended, k dropped from the head),
 * returns k, otherwise null. Only O(log n) probes: relies on the history being immutable.
 */
function getSlideSize(prev: ArrayLike<number>, next: ArrayLike<number>): number | null {
    if (!prev.length || prev.length !== next.length) {
        return null;
    }
    const dropped = lowerBound(prev, next[0]);
    if (dropped === prev.length) {
        // No overlap at all.
        return null;
    }
    // `prev[dropped..]` must be exactly the head of `next` (checked at both ends of the overlap).
    const overlap = prev.length - dropped;
    if (prev[dropped] !== next[0] || prev[prev.length - 1] !== next[overlap - 1]) {
        return null;
    }
    return dropped;
}

/**
 * Yagr's `RawSerieData` is built with `Omit<union, 'type'>`, which drops the area-only
 * options from the type even though they are supported at runtime.
 */
type CpuSeriesStyle = Partial<RawSerieData> & {
    lineColor?: string;
    lineWidth?: number;
    spanGaps?: boolean;
};

/** Hairline grid, quieter than Yagr's default (which is rather loud on the dark surface). */
const GRID_COLORS: Record<ThemeType, string> = {
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(255, 255, 255, 0.10)',
};

const timeFormat = new Intl.DateTimeFormat('ru', {hour: '2-digit', minute: '2-digit', hour12: false});
const timeSecFormat = new Intl.DateTimeFormat('ru', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});
const dayFormat = new Intl.DateTimeFormat('ru', {day: 'numeric', month: 'short'});

/** X ticks (ms): HH:mm, HH:mm:ss when zoomed below a minute step, date at local midnight. */
function formatTimeTicks(_u: unknown, ticks: number[]): string[] {
    const step = ticks.length > 1 ? ticks[1] - ticks[0] : 0;
    return ticks.map((ts) => {
        const date = new Date(ts);
        const midnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        if (midnight && step >= 60 * 60 * 1000) {
            return dayFormat.format(date);
        }
        return (step >= 60 * 1000 ? timeFormat : timeSecFormat).format(date);
    });
}

function buildAxes(theme: ThemeType): NonNullable<MinimalValidConfig['axes']> {
    const color = GRID_COLORS[theme];
    // Yagr calls `stroke` as a function (see its theme defaults).
    const grid = {show: true, stroke: () => color, width: 1};
    return {
        x: {values: formatTimeTicks, grid},
        y: {
            side: 'left',
            precision: 0,
            splitsCount: 5,
            values: (_u, ticks) => ticks.map((tick) => `${tick}%`),
            grid,
        },
    };
}

function buildConfig(
    timeline: readonly number[],
    values: readonly (number | null)[],
    theme: ThemeType,
): MinimalValidConfig {
    const colors = SERIES_COLORS[theme];
    const series: CpuSeriesStyle & {data: (number | null)[]} = {
        id: SERIES_ID,
        name: 'CPU',
        type: 'area',
        data: values.slice(),
        color: colors.fill,
        lineColor: colors.line,
        // Tooltip key uses the solid line colour, not the translucent fill.
        legendColorKey: 'lineColor',
        // ~40k points over ~1000px: a thin stroke keeps the per-pixel min/max envelope legible.
        lineWidth: 1,
        // Tens of thousands of points: a gap in data is a gap on the chart.
        spanGaps: false,
    };
    return {
        // Yagr mutates its own arrays when updating incrementally - never hand it ours.
        timeline: timeline.slice(),
        series: [series],
        chart: {
            appearance: {theme, locale: 'ru'},
            // Follows the container via ResizeObserver (debounced inside Yagr).
            size: {adaptive: true, resizeDebounceMs: 50},
        },
        scales: {y: {min: 0, max: 100}},
        axes: buildAxes(theme),
        // One series: the title/axis name it, a legend box would be noise.
        legend: {show: false},
        markers: {show: false},
        cursor: {
            // Neutral hairline that reads on both the light and the dark surface.
            x: {visible: true, style: '1px solid rgba(128, 128, 128, 0.85)'},
            y: {visible: false},
            markersSize: 8,
        },
        tooltip: {
            show: true,
            tracking: 'sticky',
            sum: false,
            strategy: 'none',
            precision: 1,
            className: 'yagr-tooltip_default cpu-chart-tooltip',
            value: (value) => (value === null || value === '' ? '—' : `${Number(value).toFixed(1)}%`),
        },
    };
}

/**
 * Interactive CPU-load chart (canvas, uPlot-based Yagr): hover crosshair + tooltip,
 * drag to zoom, double click to reset. Handles 10^4-10^5 points and live updates.
 */
export function CpuChart({timeline, values, height = 360, className}: CpuChartProps) {
    const themeType = useThemeType() as ThemeType;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr>();

    // Latest props for the mount effect and for the update effects, without re-subscribing.
    const latest = React.useRef({timeline, values, themeType});
    latest.current = {timeline, values, themeType};

    // Create once, dispose on unmount (also covers React.StrictMode's mount/unmount/mount).
    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }
        const {timeline: t, values: v, themeType: theme} = latest.current;
        const chart = new Yagr(root, buildConfig(t, v, theme));
        chartRef.current = chart;

        return () => {
            chartRef.current = undefined;
            // Stops ResizeObserver, unsubscribes sync, removes tooltip DOM and uPlot's
            // listeners/canvas.
            chart.dispose();
            root.replaceChildren();
        };
    }, []);

    // Live data.
    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart || !timeline.length) {
            return;
        }
        const applied = chart.config.timeline;
        const slide = getSlideSize(applied, timeline);

        if (slide === 0) {
            return; // Nothing new.
        }

        if (slide === null) {
            // Different dataset: rebuild from scratch.
            chart.setSeries(timeline.slice(), [{id: SERIES_ID, data: values.slice()}], {
                incremental: false,
            });
            return;
        }

        // Yagr's setData resets the x scale, which would silently drop the user's zoom on every
        // tick - remember it and put it back.
        const {uplot} = chart;
        const prevData = uplot.data[0];
        const {min, max} = uplot.scales.x;
        const zoomed =
            min != null &&
            max != null &&
            prevData.length > 0 &&
            (min > prevData[0] || max < prevData[prevData.length - 1]);

        const from = timeline.length - slide;
        chart.setSeries(
            timeline.slice(from),
            [{id: SERIES_ID, data: values.slice(from)}],
            {incremental: true, splice: true},
        );

        if (zoomed) {
            uplot.setScale('x', {min: min as number, max: max as number});
        }
    }, [timeline, values]);

    // Theme: switch Yagr's palette (axes, grid, tooltip) and our series colours in place.
    const appliedTheme = React.useRef(themeType);
    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart || appliedTheme.current === themeType) {
            return;
        }
        appliedTheme.current = themeType;
        const colors = SERIES_COLORS[themeType];
        chart.setTheme(themeType);
        chart.setAxes(buildAxes(themeType));
        const style: CpuSeriesStyle = {color: colors.fill, lineColor: colors.line};
        chart.setSeries(SERIES_ID, style);
    }, [themeType]);

    return (
        <div
            ref={rootRef}
            className={className}
            // Yagr paints its own surface per theme; make it transparent so the chart sits on
            // whatever the host card/page uses in either theme.
            style={{width: '100%', height, ['--yagr-background' as string]: 'transparent'}}
        />
    );
}
