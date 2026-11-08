import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import {Loader, Text, useThemeType, useThemeValue} from '@gravity-ui/uikit';

import {type CpuSeries, PendingSamples, lowerBound, trimToWindow} from './series';
import {type CpuLoadSource, DAY, MINUTE} from './source';

const SERIES_ID = 'cpu';
// Resolved by Yagr against the chart root, so it picks up the current Gravity theme.
const SERIES_COLOR = 'var(--g-color-text-info)';
const AXIS_FONT = '11px Inter, "Helvetica Neue", Arial, sans-serif';
/** Keeps `push(...items)` inside Yagr below engine argument limits. */
const MAX_APPEND_CHUNK = 10_000;

const YAGR_THEMES: readonly string[] = ['light', 'light-hc', 'dark', 'dark-hc'] satisfies YagrTheme[];

const percentFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});
const tooltipDateFormat = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
const axisMinutesFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const axisSecondsFormat = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
const axisDayFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});

/** `HH:mm` ticks (seconds only when zoomed that far), with the date at midnight. */
function formatTimeTicks(_u: unknown, ticks: number[], _axisIdx: number, _space: number, step: number) {
    return ticks.map((tick) => {
        const date = new Date(tick);
        if (step >= MINUTE && date.getHours() === 0 && date.getMinutes() === 0) {
            return axisDayFormat.format(date);
        }
        return (step < MINUTE ? axisSecondsFormat : axisMinutesFormat).format(date);
    });
}

export interface CpuLoadSample {
    timestamp: number;
    value: number | null;
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Visible time window, ms (default: 24 hours). */
    windowMs?: number;
    className?: string;
    /** Called after each redraw with the newest sample. */
    onLatestSample?: (sample: CpuLoadSample) => void;
    /** Called when the user zooms in or resets the zoom. */
    onZoomChange?: (zoomed: boolean) => void;
}

export interface CpuLoadChartHandle {
    resetZoom: () => void;
}

type Status = 'loading' | 'empty' | 'error' | 'ready';
type Zoom = {min: number; max: number};

/**
 * CPU load line chart on top of Yagr (uPlot canvas).
 *
 * Data never goes through React state: live samples are buffered and applied
 * to the chart at most once per animation frame, so a busy stream does not
 * re-render the component tree and a hidden tab does not draw at all.
 */
export const CpuLoadChart = React.forwardRef<CpuLoadChartHandle, CpuLoadChartProps>(
    function CpuLoadChart({source, windowMs = DAY, className, onLatestSample, onZoomChange}, ref) {
        const plotRef = React.useRef<HTMLDivElement>(null);
        const yagrRef = React.useRef<Yagr | null>(null);
        const zoomRef = React.useRef<Zoom | null>(null);
        const [status, setStatus] = React.useState<Status>('loading');

        const theme = useChartTheme();
        const themeRef = React.useRef(theme);
        themeRef.current = theme;

        // Callbacks are read through a ref so new handlers don't recreate the chart.
        const callbacksRef = React.useRef({onLatestSample, onZoomChange});
        callbacksRef.current = {onLatestSample, onZoomChange};

        const setZoom = React.useCallback((zoom: Zoom | null) => {
            const wasZoomed = zoomRef.current !== null;
            zoomRef.current = zoom;
            if (wasZoomed !== (zoom !== null)) {
                callbacksRef.current.onZoomChange?.(zoom !== null);
            }
        }, []);

        React.useImperativeHandle(
            ref,
            () => ({
                resetZoom() {
                    const yagr = yagrRef.current;
                    setZoom(null);
                    if (yagr) {
                        const timeline = yagr.config.timeline;
                        yagr.uplot.setScale('x', {min: timeline[0], max: timeline[timeline.length - 1]});
                    }
                },
            }),
            [setZoom],
        );

        React.useEffect(() => {
            const root = plotRef.current;
            if (!root) {
                return undefined;
            }

            const abort = new AbortController();
            const pending = new PendingSamples(windowMs);
            let yagr: Yagr | null = null;
            let flushFrame = 0;
            let resizeFrame = 0;
            // History came back empty: the first live samples will create the chart.
            let awaitingFirstSample = false;

            const reportLatest = () => {
                const timeline = yagr?.config.timeline;
                if (yagr && timeline?.length) {
                    const last = timeline.length - 1;
                    const value = yagr.config.series[0].data[last];
                    callbacksRef.current.onLatestSample?.({
                        timestamp: timeline[last],
                        value: typeof value === 'number' ? value : null,
                    });
                }
            };

            const createChart = (initial: CpuSeries) => {
                yagr = new Yagr(root, createConfig(initial, themeRef.current, setZoom));
                yagrRef.current = yagr;
                // Yagr's own `adaptive` mode leaves a debounced timer behind on dispose;
                // a frame-aligned observer is both snappier and fully cancellable.
                observer.observe(root);
                // uPlot resets the x-scale on double click; keep our zoom state in sync.
                yagr.uplot.over.addEventListener('dblclick', onDoubleClick);
                setStatus('ready');
                reportLatest();
            };

            const flush = () => {
                flushFrame = 0;
                if (!yagr) {
                    return;
                }
                const timeline = yagr.config.timeline;
                const fresh = pending.take(timeline.length ? timeline[timeline.length - 1] : -Infinity);
                if (!fresh.timestamps.length) {
                    return;
                }

                const chart = yagr;
                chart.batch((batch) => {
                    for (let i = 0; i < fresh.timestamps.length; i += MAX_APPEND_CHUNK) {
                        chart.setSeries(
                            fresh.timestamps.slice(i, i + MAX_APPEND_CHUNK),
                            [{id: SERIES_ID, data: fresh.values.slice(i, i + MAX_APPEND_CHUNK)}],
                            {incremental: true, splice: false},
                        );
                    }

                    // Slide the window by time rather than by point count (Yagr's `splice`),
                    // so irregular sampling and gaps don't distort the visible period.
                    // This runs before the batch recalculates and redraws the data.
                    const {timeline: updated, series} = chart.config;
                    const drop = lowerBound(updated, updated[updated.length - 1] - windowMs);
                    if (drop > 0) {
                        updated.splice(0, drop);
                        for (const serie of series) {
                            serie.data.splice(0, drop);
                        }
                    }

                    // `setData` autoscales x; restore the user's zoom unless it slid out of the window.
                    const zoom = zoomRef.current;
                    if (zoom && zoom.max > updated[0]) {
                        batch.fns.push(() => chart.uplot.setScale('x', zoom));
                    } else if (zoom) {
                        setZoom(null);
                    }
                });
                reportLatest();
            };

            const onDoubleClick = () => setZoom(null);

            const observer = new ResizeObserver(() => {
                if (!resizeFrame) {
                    resizeFrame = requestAnimationFrame(() => {
                        resizeFrame = 0;
                        yagr?.reflow();
                    });
                }
            });

            // Subscribe before loading history so nothing between the two is lost;
            // overlapping samples are dropped by timestamp.
            const unsubscribe = source.subscribe((samples) => {
                pending.push(samples);
                if (!yagr && awaitingFirstSample) {
                    createChart(pending.take(-Infinity));
                } else if (yagr && !flushFrame) {
                    flushFrame = requestAnimationFrame(flush);
                }
            });

            setStatus('loading');
            setZoom(null);

            const to = Date.now();
            source
                .fetchHistory(to - windowMs, to, abort.signal)
                .then((history) => {
                    if (abort.signal.aborted) {
                        return;
                    }
                    const initial = trimToWindow(history, windowMs);
                    if (initial.timestamps.length) {
                        createChart(initial);
                        flush();
                    } else if (pending.size) {
                        createChart(pending.take(-Infinity));
                    } else {
                        awaitingFirstSample = true;
                        setStatus('empty');
                    }
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
                unsubscribe();
                cancelAnimationFrame(flushFrame);
                cancelAnimationFrame(resizeFrame);
                observer.disconnect();
                if (yagr) {
                    yagr.uplot.over.removeEventListener('dblclick', onDoubleClick);
                    // Destroys uPlot, removes the tooltip from <body> and its document listeners.
                    yagr.dispose();
                }
                yagr = null;
                yagrRef.current = null;
            };
        }, [source, windowMs, setZoom]);

        React.useEffect(() => {
            const yagr = yagrRef.current;
            if (!yagr || yagr.utils.theme.theme === theme) {
                return;
            }
            // Grid and axes re-read CSS variables on draw, but the series color is resolved
            // once, so re-apply it in the same batch to get one redraw.
            yagr.batch(() => {
                yagr.setTheme(theme);
                yagr.setSeries(SERIES_ID, {color: SERIES_COLOR});
            });
        }, [theme]);

        return (
            <div className={['cpu-load-chart', className].filter(Boolean).join(' ')}>
                <div
                    ref={plotRef}
                    className="cpu-load-chart__plot"
                    role="img"
                    aria-label="График загрузки CPU за выбранный период"
                />
                {status !== 'ready' && (
                    <div className="cpu-load-chart__status">
                        {status === 'loading' && <Loader size="m" />}
                        {status === 'empty' && <Text color="secondary">Нет данных за последние сутки</Text>}
                        {status === 'error' && <Text color="danger">Не удалось загрузить данные</Text>}
                    </div>
                )}
            </div>
        );
    },
);

function useChartTheme(): YagrTheme {
    const themeValue = useThemeValue();
    const themeType = useThemeType();
    return YAGR_THEMES.includes(themeValue) ? (themeValue as YagrTheme) : themeType;
}

function createConfig(
    {timestamps, values}: CpuSeries,
    theme: YagrTheme,
    setZoom: (zoom: Zoom | null) => void,
): MinimalValidConfig {
    return {
        // Yagr appends to these arrays in place; never hand it arrays owned by someone else.
        timeline: timestamps.slice(),
        series: [
            {
                id: SERIES_ID,
                name: 'CPU',
                type: 'line',
                color: SERIES_COLOR,
                data: values.slice(),
            },
        ],
        chart: {
            appearance: {theme, locale: 'ru'},
            size: {adaptive: false},
            select: {zoom: true, minWidth: 8},
        },
        scales: {
            y: {min: 0, max: 100},
        },
        axes: {
            x: {font: AXIS_FONT, values: formatTimeTicks},
            y: {
                font: AXIS_FONT,
                splitsCount: 5,
                values: (_u, ticks) => ticks.map((tick) => `${tick} %`),
            },
        },
        cursor: {
            x: {style: 'solid 1px var(--g-color-line-generic-accent)'},
        },
        tooltip: {
            className: 'yagr-tooltip_default cpu-load-chart__tooltip',
            // Don't hide the tooltip under the pointer on every live update.
            onUpdate: 'none',
            strategy: 'pin',
            title: ({x}) => tooltipDateFormat.format(x),
            value: (value) => (typeof value === 'number' ? `${percentFormat.format(value)} %` : '—'),
        },
        legend: {show: false},
        hooks: {
            onSelect: [({from, to}) => setZoom({min: from, max: to})],
        },
    };
}
