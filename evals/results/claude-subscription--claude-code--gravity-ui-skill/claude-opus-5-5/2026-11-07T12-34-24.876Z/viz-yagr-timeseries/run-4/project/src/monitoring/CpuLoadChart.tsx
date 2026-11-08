import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {AreaSeriesOptions, ExtendedSeriesOptions, MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import {Button, Card, Flex, Label, Loader, Text, useThemeValue} from '@gravity-ui/uikit';

import {SAMPLE_STEP_MS, WINDOW_POINTS} from './cpuLoadSource';
import type {CpuLoadBatch, CpuLoadSource} from './cpuLoadSource';

import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

const SERIES_ID = 'cpu';

/**
 * Colors are semantic Gravity UI tokens. Yagr resolves `var(--…)` into a real color
 * via getComputedStyle, so the values follow the current theme. Canvas does not pick
 * up a CSS-variable change on its own, so on a theme change the colors are re-resolved
 * (see the effect with `setTheme`).
 */
const SERIES_COLORS = {
    color: 'var(--g-color-base-info-light)', // area fill
    lineColor: 'var(--g-color-line-info)', // line
} satisfies Partial<AreaSeriesOptions>;

const valueFormat = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});
const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const formatPercent = (value: string | number | null | undefined) =>
    typeof value === 'number' ? `${valueFormat.format(value)} %` : '—';

type Status = 'loading' | 'ready' | 'error';

const YAGR_THEMES: readonly YagrTheme[] = ['light', 'light-hc', 'dark', 'dark-hc'];

/** uikit allows custom themes (RealTheme is an open string), so map them to the nearest Yagr theme. */
function toYagrTheme(theme: string): YagrTheme {
    if ((YAGR_THEMES as readonly string[]).includes(theme)) {
        return theme as YagrTheme;
    }
    return theme.startsWith('dark') ? 'dark' : 'light';
}

interface LatestSample {
    t: number;
    v: number | null;
}

function lastSample(timeline: number[], values: (number | null)[]): LatestSample | null {
    const i = timeline.length - 1;
    return i >= 0 ? {t: timeline[i], v: values[i] ?? null} : null;
}

/** Whether the X scale is narrower than the loaded data (the user zoomed in). */
function isZoomedIn(timeline: number[], x: {min: number; max: number} | undefined) {
    if (!x || timeline.length < 2 || x.min == null || x.max == null) {
        return false;
    }
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    const tolerance = Math.max((last - first) * 1e-3, SAMPLE_STEP_MS);
    return x.min > first + tolerance || x.max < last - tolerance;
}

function createConfig(
    history: CpuLoadBatch,
    theme: YagrTheme,
    onZoomChange: (zoomed: boolean) => void,
): MinimalValidConfig {
    // In Yagr's types, RawSerieData only knows the fields shared by all chart types,
    // so area-specific options (lineColor, lineWidth) are typed via AreaSeriesOptions.
    const cpuSeries: ExtendedSeriesOptions & AreaSeriesOptions = {
        id: SERIES_ID,
        name: 'CPU',
        type: 'area',
        data: history.values,
        ...SERIES_COLORS,
        lineWidth: 2,
        // Missing samples are drawn as gaps instead of being bridged with a line.
        spanGaps: false,
        legendColorKey: 'lineColor',
    };

    return {
        // Yagr takes ownership of these arrays and mutates them during incremental updates.
        timeline: history.timeline,
        series: [cpuSeries],
        chart: {
            appearance: {theme, locale: 'ru'},
            size: {adaptive: true, resizeDebounceMs: 50},
            select: {zoom: true, minWidth: 10},
        },
        scales: {
            y: {min: 0, max: 100},
        },
        axes: {
            y: {values: (_u, splits) => splits.map((v) => `${v} %`)},
        },
        cursor: {
            x: {visible: true},
            y: {visible: false},
            markersSize: 8,
        },
        markers: {show: false},
        legend: {show: false},
        tooltip: {
            // No pinning on click, so it does not conflict with drag-to-zoom.
            strategy: 'none',
            // By default the tooltip hides on every data update, which makes it
            // flicker in realtime. 'none' keeps it under the cursor.
            onUpdate: 'none',
            // Replaces the default class, so the base `yagr-tooltip_default` is kept.
            className: 'yagr-tooltip_default cpu-load-chart__tooltip',
            title: ({x}) => timeFormat.format(x),
            value: (v) => formatPercent(v),
        },
        hooks: {
            scaleUpdate: [
                ({chart, scales}) => onZoomChange(isZoomedIn(chart.config.timeline, scales.x)),
            ],
        },
    };
}

/** Appends a batch of samples to the chart, keeping a fixed-size window. */
function appendSamples(chart: Yagr, timeline: number[], values: (number | null)[]) {
    if (chart.isEmpty) {
        // Incremental mode needs initialized series, so an empty chart is fully replaced.
        const allTimeline = chart.config.timeline.concat(timeline).slice(-WINDOW_POINTS);
        const allValues = (chart.config.series[0]?.data ?? [])
            .concat(values)
            .slice(-WINDOW_POINTS);
        chart.setSeries(
            allTimeline,
            [{...chart.config.series[0], id: SERIES_ID, data: allValues}],
            {incremental: false},
        );
        return;
    }

    // `incremental` appends to the end; `splice` drops the same number of points
    // from the start. Metrics have a fixed step, so a fixed point count means a
    // fixed 24-hour window, and the chart is not rebuilt.
    const overflow = chart.config.timeline.length + timeline.length > WINDOW_POINTS;
    chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {
        incremental: true,
        splice: overflow,
    });
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
}

export function CpuLoadChart({source}: CpuLoadChartProps) {
    const theme = toYagrTheme(useThemeValue());
    const themeRef = React.useRef(theme);
    themeRef.current = theme;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);
    const resumeRef = React.useRef<() => void>(() => {});

    const [status, setStatus] = React.useState<Status>('loading');
    const [attempt, setAttempt] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const [latest, setLatest] = React.useState<LatestSample | null>(null);

    // Chart lifecycle: load history → create Yagr → subscribe to the stream.
    // Everything is released on unmount (and on source change or retry).
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const abort = new AbortController();
        let root: HTMLDivElement | null = null;
        let chart: Yagr | null = null;
        let unsubscribe: (() => void) | null = null;
        let frame = 0;
        let isPaused = false;
        let pendingTimeline: number[] = [];
        let pendingValues: (number | null)[] = [];

        // Samples are buffered and applied at most once per frame: a burst of
        // messages costs one redraw, and nothing is drawn in a hidden tab
        // (requestAnimationFrame does not fire there).
        const flush = () => {
            frame = 0;
            if (!chart || isPaused || pendingTimeline.length === 0) {
                return;
            }
            const timeline = pendingTimeline;
            const values = pendingValues;
            pendingTimeline = [];
            pendingValues = [];
            appendSamples(chart, timeline, values);
            setLatest(lastSample(timeline, values));
        };

        const scheduleFlush = () => {
            if (!frame && !isPaused) {
                frame = requestAnimationFrame(flush);
            }
        };

        const setPausedState = (next: boolean) => {
            if (isPaused === next) {
                return;
            }
            isPaused = next;
            setPaused(next);
            if (!next) {
                scheduleFlush();
            }
        };

        const onBatch = ({timeline, values}: CpuLoadBatch) => {
            for (let i = 0; i < timeline.length; i++) {
                pendingTimeline.push(timeline[i]);
                pendingValues.push(values[i]);
            }
            // The buffer never needs to hold more than one window.
            const extra = pendingTimeline.length - WINDOW_POINTS;
            if (extra > 0) {
                pendingTimeline.splice(0, extra);
                pendingValues.splice(0, extra);
            }
            scheduleFlush();
        };

        resumeRef.current = () => {
            if (!chart) {
                return;
            }
            if (frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            isPaused = false;
            setPaused(false);
            if (pendingTimeline.length) {
                // setData inside the update also resets the zoom.
                flush();
            } else if (chart.config.timeline.length > 1) {
                const {timeline} = chart.config;
                chart.uplot.setScale('x', {min: timeline[0], max: timeline[timeline.length - 1]});
            }
        };

        source
            .loadHistory(abort.signal)
            .then((history) => {
                if (abort.signal.aborted) {
                    return;
                }
                // Yagr mounts into its own element rather than a React-managed node,
                // so React re-renders never touch its DOM or its classes.
                root = document.createElement('div');
                root.className = 'cpu-load-chart__yagr';
                container.appendChild(root);

                const initialLatest = lastSample(history.timeline, history.values);
                chart = new Yagr(root, createConfig(history, themeRef.current, setPausedState));
                chartRef.current = chart;
                setLatest(initialLatest);
                setStatus('ready');
                unsubscribe = source.subscribe(onBatch);
            })
            .catch((error: unknown) => {
                if (abort.signal.aborted) {
                    return;
                }
                console.error('Failed to load CPU load history', error);
                setStatus('error');
            });

        return () => {
            abort.abort();
            unsubscribe?.();
            cancelAnimationFrame(frame);
            // dispose() disconnects the ResizeObserver, removes the tooltip from
            // document.body, and destroys uPlot along with its listeners.
            chart?.dispose();
            root?.remove();
            chartRef.current = null;
            resumeRef.current = () => {};
            pendingTimeline = [];
            pendingValues = [];
        };
    }, [source, attempt]);

    // Theme sync without recreating the chart.
    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }
        // The effect runs after ThemeProvider has updated the theme class, so the
        // CSS variables already hold the new theme's values. setSeries re-resolves
        // the series colors.
        chart.batch(() => {
            chart.setTheme(theme);
            chart.setSeries(SERIES_ID, SERIES_COLORS);
        });
    }, [theme]);

    const retry = () => {
        setStatus('loading');
        setPaused(false);
        setLatest(null);
        setAttempt((a) => a + 1);
    };

    const ariaLabel =
        status === 'ready' && latest
            ? `График загрузки CPU за последние 24 часа. Текущее значение ${formatPercent(latest.v)}`
            : 'График загрузки CPU за последние 24 часа';

    return (
        <Card view="outlined" className="cpu-load-chart">
            <Flex
                className="cpu-load-chart__header"
                alignItems="center"
                justifyContent="space-between"
                gap={3}
                wrap
            >
                <Flex direction="column" className="cpu-load-chart__heading">
                    <Text variant="subheader-3" as="h2">
                        Загрузка CPU
                    </Text>
                    <Text variant="caption-2" color="secondary">
                        Последние 24 часа · шаг {SAMPLE_STEP_MS / 1000} с
                    </Text>
                </Flex>

                {status === 'ready' && (
                    <Flex alignItems="center" gap={3} wrap className="cpu-load-chart__status">
                        <Text variant="subheader-3" className="cpu-load-chart__value">
                            {formatPercent(latest?.v)}
                        </Text>
                        {paused ? (
                            <>
                                <Label theme="warning">Пауза</Label>
                                <Button view="outlined" size="s" onClick={() => resumeRef.current()}>
                                    Вернуться к live
                                </Button>
                            </>
                        ) : (
                            <Label theme="success">Live</Label>
                        )}
                    </Flex>
                )}
            </Flex>

            <div className="cpu-load-chart__plot">
                <div
                    ref={containerRef}
                    className="cpu-load-chart__canvas"
                    role="img"
                    aria-label={ariaLabel}
                />
                {status === 'loading' && (
                    <Flex className="cpu-load-chart__overlay" centerContent>
                        <Loader size="m" />
                    </Flex>
                )}
                {status === 'error' && (
                    <Flex
                        className="cpu-load-chart__overlay"
                        direction="column"
                        centerContent
                        gap={3}
                    >
                        <Text color="danger">Не удалось загрузить данные</Text>
                        <Button view="outlined" onClick={retry}>
                            Повторить
                        </Button>
                    </Flex>
                )}
            </div>

            <Text as="p" variant="caption-2" color="secondary" className="cpu-load-chart__hint">
                Выделите область мышью, чтобы приблизить. Пока график приближен, live-обновления
                на паузе. Двойной клик сбрасывает масштаб.
            </Text>
        </Card>
    );
}
