import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import {Button, Loader, Text, useThemeValue} from '@gravity-ui/uikit';

import {DAY_MS} from './cpuLoadSource';
import type {CpuLoadSource, CpuSeries} from './cpuLoadSource';

const SERIES_ID = 'cpu';
// Тематический токен Gravity: Yagr резолвит var(...) через getComputedStyle при (пере)настройке серии.
const LINE_COLOR = 'var(--g-color-text-info)';
const YAGR_THEMES: YagrTheme[] = ['light', 'dark', 'light-hc', 'dark-hc'];

interface Stats {
    current: number | null;
    avg: number | null;
    max: number | null;
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Ширина скользящего окна, по умолчанию сутки. */
    windowMs?: number;
    className?: string;
}

const toYagrTheme = (theme: string): YagrTheme =>
    YAGR_THEMES.includes(theme as YagrTheme) ? (theme as YagrTheme) : theme.startsWith('dark') ? 'dark' : 'light';

const formatPercent = (value: number | string | null | undefined) =>
    typeof value === 'number' ? `${value.toFixed(1)} %` : '—';

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

function computeStats(values: Array<number | string | null>): Stats {
    let sum = 0;
    let count = 0;
    let max: number | null = null;
    let current: number | null = null;
    for (const value of values) {
        if (typeof value !== 'number') {
            continue;
        }
        sum += value;
        count++;
        current = value;
        if (max === null || value > max) {
            max = value;
        }
    }
    return {current, avg: count ? sum / count : null, max};
}

/** Добавляет chunk в target (in place), отбрасывая точки не новее последней уже имеющейся. */
function appendNewer(target: CpuSeries, chunk: CpuSeries) {
    const last = target.timeline.length ? target.timeline[target.timeline.length - 1] : -Infinity;
    for (let i = 0; i < chunk.timeline.length; i++) {
        if (chunk.timeline[i] > last) {
            target.timeline.push(chunk.timeline[i]);
            target.values.push(chunk.values[i]);
        }
    }
}

/** Индекс первой точки, попадающей в окно (time > cutoff). */
function firstInWindow(timeline: number[], cutoff: number) {
    let lo = 0;
    let hi = timeline.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (timeline[mid] <= cutoff) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

function isZoomed(u: Yagr['uplot']) {
    const x = u.data[0];
    const {min, max} = u.scales.x;
    if (!x.length || min === undefined || max === undefined) {
        return false;
    }
    return min > x[0] || max < x[x.length - 1];
}

function createConfig(root: HTMLElement, history: CpuSeries, theme: YagrTheme, hooks: MinimalValidConfig['hooks']) {
    const font = `11px ${getComputedStyle(root).fontFamily}`;
    const config: MinimalValidConfig = {
        timeline: history.timeline,
        series: [{id: SERIES_ID, name: 'CPU', data: history.values, color: LINE_COLOR}],
        chart: {
            series: {type: 'line', width: 2, spanGaps: false},
            // Ресайз обслуживаем сами: см. ResizeObserver в эффекте.
            size: {adaptive: false},
            appearance: {theme, locale: 'ru'},
            select: {zoom: true},
        },
        scales: {y: {min: 0, max: 100}},
        axes: {
            x: {font},
            y: {font, values: (_u, ticks) => ticks.map((tick) => `${tick} %`)},
        },
        legend: {show: false},
        // Это CSS border DOM-элемента, поэтому var(...) пересчитывается при смене темы сам.
        cursor: {x: {style: '1px solid var(--g-color-line-generic-accent-hover)'}},
        tooltip: {
            // Не сбрасывать (в т.ч. закреплённый) тултип на каждом обновлении данных.
            onUpdate: 'none',
            className: 'cpu-load-chart-tooltip',
            value: formatPercent,
            title: ({x}) => timeFormat.format(x),
        },
        hooks,
    };
    return config;
}

export function CpuLoadChart({source, windowMs = DAY_MS, className}: CpuLoadChartProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const yagrRef = React.useRef<Yagr | null>(null);
    const theme = toYagrTheme(useThemeValue());
    const themeRef = React.useRef(theme);
    themeRef.current = theme;

    const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [zoomed, setZoomed] = React.useState(false);

    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const controller = new AbortController();
        let yagr: Yagr | null = null;
        // Точки, пришедшие между кадрами: копятся и применяются одним setData за кадр.
        let pending: CpuSeries = {timeline: [], values: []};
        let needsReflow = false;
        let frame = 0;

        const flush = () => {
            frame = 0;
            if (!yagr) {
                return;
            }
            if (needsReflow) {
                needsReflow = false;
                yagr.reflow();
            }
            if (!pending.timeline.length) {
                return;
            }

            const chunk = pending;
            pending = {timeline: [], values: []};
            const {timeline} = yagr.config;
            const newest = chunk.timeline[chunk.timeline.length - 1];
            const cutoff = newest - windowMs;
            // Если вкладка долго была скрыта, в chunk может оказаться больше окна.
            const chunkStart = firstInWindow(chunk.timeline, cutoff);
            const drop = firstInWindow(timeline, cutoff);

            const u = yagr.uplot;
            let zoom = isZoomed(u) ? {min: u.scales.x.min!, max: u.scales.x.max!} : null;
            if (zoom && zoom.max <= cutoff) {
                // Выбранный участок целиком уехал за пределы окна.
                zoom = null;
            }

            const chart = yagr;
            chart.batch((batch) => {
                chart.setSeries(
                    chunk.timeline.slice(chunkStart),
                    [{id: SERIES_ID, data: chunk.values.slice(chunkStart)}],
                    {incremental: true, splice: false},
                );
                if (drop) {
                    chart.config.timeline.splice(0, drop);
                    chart.config.series[0].data.splice(0, drop);
                }
                if (zoom) {
                    // setData сбрасывает шкалы; восстанавливаем зум в том же uPlot-батче — одна перерисовка.
                    const range = zoom;
                    batch.fns.push(() => chart.uplot.setScale('x', range));
                }
            });

            setStats(computeStats(chart.config.series[0].data));
        };

        const schedule = () => {
            if (!frame && yagr) {
                frame = requestAnimationFrame(flush);
            }
        };

        const unsubscribe = source.subscribe((chunk) => {
            appendNewer(pending, chunk);
            schedule();
        });

        const resizeObserver = new ResizeObserver(() => {
            needsReflow = true;
            schedule();
        });

        source.fetchHistory(windowMs, controller.signal).then(
            (history) => {
                if (controller.signal.aborted) {
                    return;
                }
                const initial: CpuSeries = {timeline: [], values: []};
                appendNewer(initial, history);
                appendNewer(initial, pending);
                pending = {timeline: [], values: []};

                yagr = new Yagr(
                    root,
                    createConfig(root, initial, themeRef.current, {
                        scaleUpdate: [({chart}) => setZoomed(isZoomed(chart.uplot))],
                    }),
                );
                yagrRef.current = yagr;
                resizeObserver.observe(root);
                setStats(computeStats(initial.values));
                setStatus('ready');
            },
            () => {
                if (!controller.signal.aborted) {
                    setStatus('error');
                }
            },
        );

        return () => {
            controller.abort();
            unsubscribe();
            resizeObserver.disconnect();
            cancelAnimationFrame(frame);
            // dispose снимает слушатели uPlot/тултипа и удаляет тултип из document.body.
            yagr?.dispose();
            yagr = null;
            yagrRef.current = null;
        };
    }, [source, windowMs]);

    React.useEffect(() => {
        const yagr = yagrRef.current;
        if (!yagr) {
            return;
        }
        // Тема body уже переключена (layout-эффект ThemeProvider), поэтому цвет серии резолвится заново.
        yagr.batch((batch) => {
            yagr.setTheme(theme);
            yagr.setSeries(SERIES_ID, {color: LINE_COLOR});
            batch.redraw = [true, true];
        });
    }, [theme]);

    const resetZoom = React.useCallback(() => {
        const u = yagrRef.current?.uplot;
        const x = u?.data[0];
        if (u && x?.length) {
            u.setScale('x', {min: x[0], max: x[x.length - 1]});
        }
    }, []);

    return (
        <section className={['cpu-load-chart', className].filter(Boolean).join(' ')}>
            <header className="cpu-load-chart__header">
                <Text variant="subheader-2">Загрузка CPU за сутки</Text>
                <div className="cpu-load-chart__stats" aria-live="off">
                    <Text color="secondary">
                        Сейчас <Text variant="body-2">{formatPercent(stats?.current)}</Text>
                    </Text>
                    <Text color="secondary">
                        Среднее <Text variant="body-2">{formatPercent(stats?.avg)}</Text>
                    </Text>
                    <Text color="secondary">
                        Пик <Text variant="body-2">{formatPercent(stats?.max)}</Text>
                    </Text>
                    <Button size="s" view="flat-secondary" disabled={!zoomed} onClick={resetZoom}>
                        Сбросить масштаб
                    </Button>
                </div>
            </header>
            <div className="cpu-load-chart__plot">
                <div
                    ref={rootRef}
                    className="cpu-load-chart__canvas"
                    role="img"
                    aria-label="График загрузки CPU за последние сутки. Выделите участок мышью, чтобы приблизить; двойной клик — сбросить масштаб."
                />
                {status !== 'ready' && (
                    <div className="cpu-load-chart__overlay">
                        {status === 'loading' ? (
                            <Loader size="m" />
                        ) : (
                            <Text color="danger">Не удалось загрузить данные</Text>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
