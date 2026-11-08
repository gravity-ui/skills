import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import * as React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import {Button, Flex, Loader, Text, useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadBatch, CpuLoadSource} from './cpuLoadSource';

const DAY_MS = 24 * 60 * 60 * 1000;
const SERIES_ID = 'cpu';
/** Gravity UI semantic token; Yagr resolves `var(--…)` against the chart root. */
const SERIES_COLOR = 'var(--g-color-line-info)';
const YAGR_THEMES: readonly YagrTheme[] = ['light', 'dark', 'light-hc', 'dark-hc'];
/** Larger live batches (e.g. after a long hidden tab) are applied via a full rebuild. */
const MAX_INCREMENTAL_BATCH = 5000;
/** How many samples older than the window we tolerate before rebuilding the chart. */
const STALE_TOLERANCE = 2;

type Status = 'loading' | 'empty' | 'ready' | 'error';

export interface CpuLoadSample {
    timestamp: number;
    value: number;
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Visible time window in ms (default: 24 h). */
    windowMs?: number;
    /** Called with the most recent sample after each applied update. */
    onLatestSample?: (sample: CpuLoadSample) => void;
    className?: string;
}

function toYagrTheme(theme: string): YagrTheme {
    if ((YAGR_THEMES as readonly string[]).includes(theme)) {
        return theme as YagrTheme;
    }
    return theme.startsWith('dark') ? 'dark' : 'light';
}

function formatPercent(value: string | number | null) {
    return typeof value === 'number' ? `${value.toFixed(1)} %` : '—';
}

/** True when the user has zoomed into a sub-range of the data. */
function isZoomed(chart: Yagr) {
    const u = chart.uplot;
    if (!u) {
        return false;
    }
    const xs = u.data[0];
    const {min, max} = u.scales.x ?? {};
    if (!xs || xs.length < 2 || min == null || max == null) {
        return false;
    }
    const first = xs[0];
    const last = xs[xs.length - 1];
    const eps = (last - first) * 1e-6;
    return min > first + eps || max < last - eps;
}

export function CpuLoadChart({
    source,
    windowMs = DAY_MS,
    onLatestSample,
    className,
}: CpuLoadChartProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);
    const zoomedRef = React.useRef(false);

    const [status, setStatus] = React.useState<Status>('loading');
    const [zoomed, setZoomed] = React.useState(false);
    const [attempt, setAttempt] = React.useState(0);

    const themeValue = useThemeValue();
    const themeRef = React.useRef(themeValue);
    themeRef.current = themeValue;

    const onLatestSampleRef = React.useRef(onLatestSample);
    onLatestSampleRef.current = onLatestSample;

    // Chart lifecycle: history load → chart creation → live incremental updates → disposal.
    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const abort = new AbortController();
        let historyLoaded = false;
        let rafId = 0;
        let pendingTimeline: number[] = [];
        let pendingValues: number[] = [];

        setStatus('loading');
        zoomedRef.current = false;
        setZoomed(false);

        const handleScaleUpdate = (chart: Yagr) => {
            const next = isZoomed(chart);
            if (next !== zoomedRef.current) {
                zoomedRef.current = next;
                setZoomed(next);
            }
        };

        const reportLatest = (timeline: number[], values: number[]) => {
            const last = timeline.length - 1;
            if (last >= 0) {
                onLatestSampleRef.current?.({timestamp: timeline[last], value: values[last]});
            }
        };

        const createChart = (timeline: number[], values: number[]) => {
            const config: MinimalValidConfig = {
                timeline,
                series: [
                    {
                        id: SERIES_ID,
                        name: 'CPU',
                        color: SERIES_COLOR,
                        data: values,
                    },
                ],
                chart: {
                    series: {type: 'line', width: 1.5},
                    size: {adaptive: true},
                    select: {zoom: true},
                    appearance: {theme: toYagrTheme(themeRef.current), locale: 'ru'},
                },
                scales: {y: {min: 0, max: 100}},
                axes: {
                    y: {values: (_u, splits) => splits.map((v) => `${v}%`)},
                },
                legend: {show: false},
                tooltip: {
                    className: 'yagr-tooltip_default cpu-load-chart__tooltip',
                    value: formatPercent,
                },
                hooks: {
                    scaleUpdate: [({chart}) => handleScaleUpdate(chart)],
                },
                // Keep the user's zoom while live data streams in: uPlot only auto-ranges
                // the x scale on `setData` when `auto` returns true.
                editUplotOptions: (opts) => {
                    const scales = opts.scales ?? {};
                    scales.x = {...scales.x, auto: () => !zoomedRef.current};
                    opts.scales = scales;
                    return opts;
                },
            };

            const chart = new Yagr(root, config);
            chartRef.current = chart;
            setStatus('ready');
            reportLatest(timeline, values);
            return chart;
        };

        /** Re-creates the chart from scratch, keeping the zoomed range if any. */
        const rebuildChart = (timeline: number[], values: number[]) => {
            const prev = chartRef.current;
            const range = prev && zoomedRef.current ? {...prev.uplot.scales.x} : null;
            prev?.dispose();
            chartRef.current = null;
            const next = createChart(timeline, values);
            if (range && range.min != null && range.max != null) {
                next.uplot.setScale('x', {min: range.min, max: range.max});
            }
        };

        const flush = () => {
            rafId = 0;
            if (!pendingTimeline.length) {
                return;
            }
            const newTimeline = pendingTimeline;
            const newValues = pendingValues;
            pendingTimeline = [];
            pendingValues = [];

            const chart = chartRef.current;
            if (!chart) {
                createChart(newTimeline, newValues);
                return;
            }

            const timeline = chart.config.timeline;
            const values = chart.config.series[0].data as number[];

            // Drop duplicates / out-of-order samples.
            const lastTs = timeline[timeline.length - 1];
            let start = 0;
            while (start < newTimeline.length && newTimeline[start] <= lastTs) {
                start++;
            }
            if (start === newTimeline.length) {
                return;
            }
            const addTimeline = start ? newTimeline.slice(start) : newTimeline;
            const addValues = start ? newValues.slice(start) : newValues;
            const added = addTimeline.length;

            const cutoff = addTimeline[added - 1] - windowMs;
            let expired = 0;
            while (expired < timeline.length && timeline[expired] < cutoff) {
                expired++;
            }

            // `splice` drops exactly `added` oldest points, so it is only usable when at least
            // that many have expired; whatever expired beyond that stays as "stale" points.
            const splice = expired >= added;
            const staleAfter = splice ? expired - added : expired;

            if (added > MAX_INCREMENTAL_BATCH || staleAfter > STALE_TOLERANCE) {
                // Irregular update (long gap or huge burst): rebuild with the trimmed window.
                const keepTimeline = timeline.slice(expired).concat(addTimeline);
                const keepValues = values.slice(expired).concat(addValues);
                let skip = 0;
                while (skip < keepTimeline.length && keepTimeline[skip] < cutoff) {
                    skip++;
                }
                rebuildChart(keepTimeline.slice(skip), keepValues.slice(skip));
                return;
            }

            // Fast path: append in place (sliding window) without re-creating the chart.
            chart.setSeries(addTimeline, [{id: SERIES_ID, data: addValues}], {incremental: true, splice});
            reportLatest(addTimeline, addValues);
        };

        const enqueue = ({timeline, values}: CpuLoadBatch) => {
            for (let i = 0; i < timeline.length; i++) {
                pendingTimeline.push(timeline[i]);
                pendingValues.push(values[i]);
            }
            // Coalesce bursts into one redraw per frame; also pauses while the tab is hidden.
            if (historyLoaded && !rafId) {
                rafId = requestAnimationFrame(flush);
            }
        };

        // Subscribe before loading history so no samples are lost in between.
        const unsubscribe = source.subscribe(enqueue);

        const now = Date.now();
        source
            .loadHistory(now - windowMs, now, abort.signal)
            .then(({timeline, values}) => {
                if (abort.signal.aborted) {
                    return;
                }
                historyLoaded = true;
                if (timeline.length) {
                    createChart(timeline, values);
                } else if (!pendingTimeline.length) {
                    setStatus('empty');
                }
                if (pendingTimeline.length) {
                    rafId = requestAnimationFrame(flush);
                }
            })
            .catch((error: unknown) => {
                if (!abort.signal.aborted) {
                    console.error('Failed to load CPU load history', error);
                    setStatus('error');
                }
            });

        return () => {
            abort.abort();
            unsubscribe();
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            chartRef.current?.dispose();
            chartRef.current = null;
            pendingTimeline = [];
            pendingValues = [];
        };
    }, [source, windowMs, attempt]);

    // Follow the Gravity UI theme without re-creating the chart.
    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }
        // ThemeProvider switches the root class in a layout effect, so the new `--g-*`
        // values are already computed here; re-resolve the series color against them.
        chart.batch((batch) => {
            chart.setTheme(toYagrTheme(themeValue));
            chart.setSeries(SERIES_ID, {color: SERIES_COLOR});
            batch.redraw = [true, true];
        });
    }, [themeValue]);

    const resetZoom = React.useCallback(() => {
        const u = chartRef.current?.uplot;
        const xs = u?.data[0];
        if (u && xs && xs.length) {
            u.setScale('x', {min: xs[0], max: xs[xs.length - 1]});
        }
    }, []);

    return (
        <div className={['cpu-load-chart', className].filter(Boolean).join(' ')}>
            <div ref={rootRef} className="cpu-load-chart__plot" />

            {status !== 'ready' && (
                <Flex className="cpu-load-chart__overlay" alignItems="center" justifyContent="center">
                    {status === 'loading' && <Loader size="m" />}
                    {status === 'empty' && (
                        <Text color="secondary">Нет данных за выбранный период</Text>
                    )}
                    {status === 'error' && (
                        <Flex direction="column" alignItems="center" gap={3}>
                            <Text color="danger">Не удалось загрузить данные</Text>
                            <Button view="outlined" onClick={() => setAttempt((n) => n + 1)}>
                                Повторить
                            </Button>
                        </Flex>
                    )}
                </Flex>
            )}

            {zoomed && (
                <Button
                    className="cpu-load-chart__reset"
                    view="outlined"
                    size="s"
                    onClick={resetZoom}
                >
                    Сбросить масштаб
                </Button>
            )}
        </div>
    );
}
