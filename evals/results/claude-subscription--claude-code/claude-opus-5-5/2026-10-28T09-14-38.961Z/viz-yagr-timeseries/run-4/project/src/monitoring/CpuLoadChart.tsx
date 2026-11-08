import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {AreaSeriesOptions, MinimalValidConfig, RawSerieData, YagrTheme} from '@gravity-ui/yagr';
import {Button, Card, Loader, Text, useThemeType, useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadSource} from './cpuLoadSource';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const SERIES_ID = 'cpu';
/**
 * Если между отрисовками накопилось больше точек (например, вкладка долго была скрыта),
 * дешевле пересобрать график целиком, чем дописывать хвост.
 */
const FULL_RESET_THRESHOLD = 10_000;

/** Синий первого категориального слота; для тёмной темы — отдельная ступень, а не инверсия. */
const COLORS = {
    light: {line: '#2a78d6', fill: 'rgba(42, 120, 214, 0.14)'},
    dark: {line: '#3987e5', fill: 'rgba(57, 135, 229, 0.22)'},
};

const percentFormat = new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 1, maximumFractionDigits: 1});
const tickTimeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const tickSecondsFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
const tickDateFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});
const tooltipDateFormat = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const formatPercent = (value: number | string | null | undefined) =>
    value === null || value === undefined || value === '' ? '—' : `${percentFormat.format(Number(value))} %`;

function formatTimeTicks(_u: unknown, splits: number[]) {
    const step = splits.length > 1 ? splits[1] - splits[0] : Infinity;
    const format = step < 60_000 ? tickSecondsFormat : tickTimeFormat;
    return splits.map((ts) => {
        const date = new Date(ts);
        const isMidnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        return step >= 3_600_000 && isMidnight ? tickDateFormat.format(date) : format.format(date);
    });
}

const YAGR_THEMES: string[] = ['light', 'dark', 'light-hc', 'dark-hc'] satisfies YagrTheme[];

/** Кастомные темы приложения сводим к светлой или тёмной теме Yagr. */
function useYagrTheme(): YagrTheme {
    const theme = useThemeValue();
    const themeType = useThemeType();
    return YAGR_THEMES.includes(theme) ? (theme as YagrTheme) : themeType;
}

function getColors(theme: YagrTheme) {
    return theme.startsWith('dark') ? COLORS.dark : COLORS.light;
}

function buildSeries(theme: YagrTheme, data: (number | null)[]): RawSerieData<AreaSeriesOptions> {
    const {line, fill} = getColors(theme);
    return {
        id: SERIES_ID,
        name: 'CPU',
        type: 'area',
        color: fill,
        lineColor: line,
        lineWidth: 2,
        legendColorKey: 'lineColor',
        spanGaps: false,
        data,
    };
}

/** Индекс первого элемента >= value в отсортированном массиве. */
function lowerBound(sorted: number[], value: number) {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (sorted[mid] < value) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

interface Stats {
    current: number | null;
    avg: number | null;
    max: number | null;
}

function computeStats(values: ArrayLike<number | string | null>): Stats {
    let sum = 0;
    let count = 0;
    let max = -Infinity;
    let current: number | null = null;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value === 'number') {
            sum += value;
            count++;
            if (value > max) {
                max = value;
            }
            current = value;
        }
    }
    return count ? {current, avg: sum / count, max} : {current: null, avg: null, max: null};
}

interface View {
    min: number;
    max: number;
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Высота области графика. Ширина всегда равна ширине контейнера. */
    height?: number | string;
    /** Минимальный интервал между перерисовками при поступлении live-данных, мс. */
    updateIntervalMs?: number;
    className?: string;
}

export function CpuLoadChart({source, height = 360, updateIntervalMs = 1000, className}: CpuLoadChartProps) {
    const theme = useYagrTheme();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);
    /** null — график следует за live-окном последних суток, иначе — зафиксированный пользователем зум. */
    const viewRef = React.useRef<View | null>(null);
    const themeRef = React.useRef(theme);
    themeRef.current = theme;
    const updateIntervalRef = React.useRef(updateIntervalMs);
    updateIntervalRef.current = updateIntervalMs;

    const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
    const [attempt, setAttempt] = React.useState(0);
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [zoomed, setZoomed] = React.useState(false);

    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const abort = new AbortController();
        let chart: Yagr | null = null;
        let pendingTs: number[] = [];
        let pendingValues: (number | null)[] = [];
        let flushTimer: ReturnType<typeof setTimeout> | null = null;
        let frame: number | null = null;
        let lastFlush = 0;

        setStatus('loading');

        const resetView = () => {
            viewRef.current = null;
            setZoomed(false);
        };

        const flush = () => {
            if (!chart || pendingTs.length === 0) {
                return;
            }
            lastFlush = performance.now();

            const timeline = chart.config.timeline;
            let lastTs = timeline.length ? timeline[timeline.length - 1] : -Infinity;
            const ts: number[] = [];
            const values: (number | null)[] = [];
            for (let i = 0; i < pendingTs.length; i++) {
                // Дубли и точки не по порядку отбрасываем: временная ось должна быть монотонной.
                if (pendingTs[i] > lastTs) {
                    lastTs = pendingTs[i];
                    ts.push(lastTs);
                    values.push(pendingValues[i]);
                }
            }
            pendingTs = [];
            pendingValues = [];
            if (ts.length === 0) {
                return;
            }

            const cutoff = lastTs - WINDOW_MS;
            if (viewRef.current && viewRef.current.max < cutoff) {
                // Приближенный участок целиком ушёл за пределы суток.
                resetView();
            }

            const data = chart.config.series[0].data;
            if (chart.isEmpty || ts.length > FULL_RESET_THRESHOLD) {
                const keep = lowerBound(timeline, cutoff);
                const fullTs = timeline.slice(keep).concat(ts);
                const fullValues = (data.slice(keep) as (number | null)[]).concat(values);
                const start = lowerBound(fullTs, cutoff);
                // setSeries на пустом графике данные не применяет, поэтому полная замена — через setConfig.
                chart.setConfig(
                    {
                        timeline: fullTs.slice(start),
                        series: [buildSeries(themeRef.current, fullValues.slice(start))],
                    },
                    true,
                );
            } else {
                const target = chart;
                // Один batch: дописываем хвост, обрезаем голову, uPlot пересчитывается один раз.
                target.batch(() => {
                    target.setSeries(ts, [{id: SERIES_ID, data: values}], {incremental: true, splice: false});
                    const tl = target.config.timeline;
                    const drop = lowerBound(tl, cutoff);
                    if (drop > 0) {
                        tl.splice(0, drop);
                        target.config.series[0].data.splice(0, drop);
                    }
                });
            }

            setStats(computeStats(chart.config.series[0].data));
        };

        const scheduleFlush = () => {
            if (!chart || flushTimer !== null || frame !== null) {
                return;
            }
            const wait = Math.max(0, lastFlush + updateIntervalRef.current - performance.now());
            flushTimer = setTimeout(() => {
                flushTimer = null;
                // rAF не срабатывает в фоновой вкладке — точки копятся и рисуются разом при возврате.
                frame = requestAnimationFrame(() => {
                    frame = null;
                    flush();
                });
            }, wait);
        };

        // Подписываемся до загрузки истории, чтобы не потерять точки, пришедшие во время запроса.
        const unsubscribe = source.subscribe(({timestamps, values}) => {
            pendingTs.push(...timestamps);
            pendingValues.push(...values);
            if (pendingTs.length > FULL_RESET_THRESHOLD) {
                // Пока вкладка в фоне, буфер не должен расти дольше суток: старее всё равно отрежется.
                const drop = lowerBound(pendingTs, pendingTs[pendingTs.length - 1] - WINDOW_MS);
                if (drop > 0) {
                    pendingTs.splice(0, drop);
                    pendingValues.splice(0, drop);
                }
            }
            scheduleFlush();
        });

        // Двойной клик в uPlot сбрасывает зум; ловим его на фазе захвата, до обработчика uPlot,
        // чтобы автомасштаб сразу вернулся к live-окну.
        root.addEventListener('dblclick', resetView, true);

        const config: MinimalValidConfig = {
            timeline: [],
            series: [],
            chart: {
                appearance: {theme: themeRef.current, locale: 'ru'},
                size: {adaptive: true, resizeDebounceMs: 50},
                select: {zoom: true},
            },
            scales: {y: {min: 0, max: 100}},
            axes: {
                // Минимальное расстояние между подписями, чтобы на узком контейнере они не слипались.
                x: {values: formatTimeTicks, space: 72},
                y: {values: (_u: unknown, splits: number[]) => splits.map((v) => `${v} %`)},
            },
            legend: {show: false},
            tooltip: {
                // Не прячем подсказку при каждом live-обновлении, пока пользователь её читает.
                onUpdate: 'none',
                value: formatPercent,
                title: ({x}) => tooltipDateFormat.format(x),
            },
            hooks: {
                onSelect: [
                    ({from, to}) => {
                        if (to - from >= 1000) {
                            viewRef.current = {min: from, max: to};
                            setZoomed(true);
                        }
                    },
                ],
            },
            editUplotOptions: (opts) => {
                const scales = opts.scales ?? {};
                scales.x = {
                    ...scales.x,
                    // Вызывается uPlot при каждом автомасштабе, в том числе после setData.
                    range: (u, min, max) => {
                        const view = viewRef.current;
                        if (view) {
                            return [view.min, view.max];
                        }
                        const xs = u.data[0];
                        const last = xs.length ? xs[xs.length - 1] : (max ?? Date.now());
                        return [last - WINDOW_MS, last];
                    },
                };
                opts.scales = scales;
                return opts;
            },
        };

        const now = Date.now();
        source.loadHistory(now - WINDOW_MS, now, abort.signal).then(
            (history) => {
                if (abort.signal.aborted) {
                    return;
                }
                config.timeline = history.timestamps.slice();
                config.series = [buildSeries(themeRef.current, history.values.slice())];
                chart = new Yagr(root, config);
                chartRef.current = chart;
                setStats(computeStats(history.values));
                setStatus('ready');
                scheduleFlush();
            },
            () => {
                if (!abort.signal.aborted) {
                    setStatus('error');
                }
            },
        );

        return () => {
            abort.abort();
            unsubscribe();
            root.removeEventListener('dblclick', resetView, true);
            if (flushTimer !== null) {
                clearTimeout(flushTimer);
            }
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            chart?.resizeOb?.disconnect();
            chart?.dispose();
            chart = null;
            chartRef.current = null;
            viewRef.current = null;
        };
    }, [source, attempt]);

    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }
        const {line, fill} = getColors(theme);
        const colors: Partial<RawSerieData<AreaSeriesOptions>> = {color: fill, lineColor: line};
        chart.batch(() => {
            chart.setTheme(theme);
            chart.setSeries(SERIES_ID, colors);
        });
    }, [theme]);

    const resetZoom = React.useCallback(() => {
        viewRef.current = null;
        setZoomed(false);
        // Конкретные min/max не важны: range-функция шкалы вернёт live-окно.
        chartRef.current?.uplot.setScale('x', {min: 0, max: 1});
    }, []);

    return (
        <Card view="outlined" className={['cpu-load-chart', className].filter(Boolean).join(' ')}>
            <div className="cpu-load-chart__header">
                <div>
                    <Text as="h2" variant="subheader-3" className="cpu-load-chart__title">
                        Загрузка CPU
                    </Text>
                    <Text color="secondary">Последние 24 часа, обновляется в реальном времени</Text>
                </div>
                <dl className="cpu-load-chart__stats">
                    <Stat label="Сейчас" value={stats?.current} />
                    <Stat label="Среднее" value={stats?.avg} />
                    <Stat label="Пик" value={stats?.max} />
                </dl>
            </div>
            <div className="cpu-load-chart__toolbar">
                <Text variant="caption-2" color="secondary">
                    Выделите участок, чтобы приблизить. Двойной клик — вернуться к суткам.
                </Text>
                {zoomed && (
                    <Button size="s" view="outlined" onClick={resetZoom}>
                        Показать сутки
                    </Button>
                )}
            </div>
            <div className="cpu-load-chart__plot" style={{height}}>
                <div
                    ref={rootRef}
                    className="cpu-load-chart__canvas"
                    role="img"
                    aria-label="График загрузки CPU за последние 24 часа"
                />
                {status !== 'ready' && (
                    <div className="cpu-load-chart__overlay">
                        {status === 'loading' ? (
                            <Loader size="m" />
                        ) : (
                            <>
                                <Text color="danger">Не удалось загрузить данные</Text>
                                <Button size="m" onClick={() => setAttempt((n) => n + 1)}>
                                    Повторить
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

function Stat({label, value}: {label: string; value: number | null | undefined}) {
    return (
        <div className="cpu-load-chart__stat">
            <Text as="dt" variant="caption-2" color="secondary">
                {label}
            </Text>
            <Text as="dd" variant="subheader-2" className="cpu-load-chart__stat-value">
                {formatPercent(value)}
            </Text>
        </div>
    );
}
