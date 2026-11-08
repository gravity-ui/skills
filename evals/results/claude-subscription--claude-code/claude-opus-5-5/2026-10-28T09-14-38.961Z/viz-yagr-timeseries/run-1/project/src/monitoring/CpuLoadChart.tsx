import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import * as React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, TooltipRenderOptions, YagrTheme} from '@gravity-ui/yagr';
import {Button, Card, Loader, Text, useThemeType, useThemeValue} from '@gravity-ui/uikit';

import {DAY_MS, EMPTY_STATS, appendToWindow, computeStats, createTimeSeries} from './cpuLoad';
import type {CpuLoadSource, CpuLoadStats, TimeSeries} from './cpuLoad';

const SERIES_ID = 'cpu';
/** Цвет линии задаётся в CSS по теме; Yagr сам разрешает `var(...)` через getComputedStyle. */
const LINE_COLOR = 'var(--cpu-load-chart-line)';

type Status = 'loading' | 'ready' | 'empty' | 'error';

const percentFormat = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});
const tooltipTimeFormat = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const axisTimeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const axisSecondsFormat = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
const axisDayFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});

/** Подписи оси X: секунды — только при сильном приближении, на полуночи — дата вместо «00:00». */
function formatTimeTicks(splits: number[], increment: number): string[] {
    return splits.map((ts) => {
        if (increment < 60_000) {
            return axisSecondsFormat.format(ts);
        }
        const date = new Date(ts);
        if (increment >= 3_600_000 && date.getHours() === 0 && date.getMinutes() === 0) {
            return axisDayFormat.format(date);
        }
        return axisTimeFormat.format(date);
    });
}

function formatPercent(value: number | null | undefined): string {
    return typeof value === 'number' ? `${percentFormat.format(value)} %` : '—';
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function renderTooltip({x, scales}: TooltipRenderOptions): string {
    const row = scales[0]?.rows[0];
    const value = typeof row?.dataValue === 'number' ? row.dataValue : null;
    return (
        `<div class="cpu-load-tooltip__time">${escapeHtml(tooltipTimeFormat.format(x))}</div>` +
        '<div class="cpu-load-tooltip__row">' +
        // Подсказка живёт в document.body, где переменная цвета линии недоступна.
        `<span class="cpu-load-tooltip__key" style="background:${escapeHtml(row?.color ?? '')}"></span>` +
        `<span class="cpu-load-tooltip__value">${escapeHtml(formatPercent(value))}</span>` +
        '<span class="cpu-load-tooltip__name">CPU</span>' +
        '</div>'
    );
}

function createChart(
    root: HTMLElement,
    data: TimeSeries,
    theme: YagrTheme,
    onScaleUpdate: (min: number, max: number) => void,
): Yagr {
    const font = `11px ${getComputedStyle(root).fontFamily}`;
    const config: MinimalValidConfig = {
        timeline: data.timestamps,
        series: [{id: SERIES_ID, name: 'CPU', data: data.values, color: LINE_COLOR}],
        chart: {
            series: {type: 'line', width: 1.5, spanGaps: false},
            // Размер отслеживаем сами (см. ResizeObserver в компоненте): так ресайз
            // синхронизирован с кадром, а не с debounce, и наблюдатель гарантированно отключается.
            size: {adaptive: false},
            appearance: {theme, locale: 'ru'},
            select: {zoom: true},
        },
        scales: {y: {min: 0, max: 100}},
        axes: {
            x: {
                font,
                values: (_u, splits, _axisIdx, _space, increment) => formatTimeTicks(splits, increment),
            },
            y: {
                font,
                splitsCount: 5,
                values: (_u, splits) => splits.map((value) => `${value} %`),
            },
        },
        cursor: {
            x: {visible: true, style: '1px solid var(--g-color-line-generic-accent)'},
            y: {visible: false},
        },
        legend: {show: false},
        markers: {show: false},
        tooltip: {
            show: true,
            className: 'cpu-load-tooltip',
            render: renderTooltip,
        },
        hooks: {
            scaleUpdate: [
                ({scales}) => {
                    const x = scales.x;
                    if (x) {
                        onScaleUpdate(x.min, x.max);
                    }
                },
            ],
        },
    };

    return new Yagr(root, config);
}

/**
 * Перерисовывает данные, изменённые на месте в `chart.config`.
 *
 * `setSeries` здесь не подходит: на каждое обновление он копирует весь ряд, сбрасывает
 * подсказку и всегда возвращает масштаб к полному диапазону.
 */
function redrawData(chart: Yagr, keepScales: boolean) {
    chart.batch((batch) => {
        batch.recalc = true;
        batch.fns.push(() => {
            chart.uplot.setData(chart.series, !keepScales);
            if (keepScales) {
                // Без пересчёта шкал uPlot сам не перерисовывается.
                chart.uplot.redraw();
            }
        });
    });
}

function applyTheme(chart: Yagr, theme: YagrTheme) {
    chart.batch(() => {
        chart.setTheme(theme);
        // Цвет линии разрешается один раз при настройке серии — перечитываем его для новой темы.
        chart.setSeries(SERIES_ID, {color: LINE_COLOR});
    });
}

export interface CpuLoadChartProps {
    /** Источник данных. Должен быть стабильным между рендерами, иначе график будет пересоздаваться. */
    source: CpuLoadSource;
    className?: string;
}

const YAGR_THEMES: readonly string[] = ['light', 'dark', 'light-hc', 'dark-hc'] satisfies YagrTheme[];

export function CpuLoadChart({source, className}: CpuLoadChartProps) {
    const themeValue = useThemeValue();
    const themeType = useThemeType();
    // У Gravity UI бывают и пользовательские темы — для них берём базовую светлую или тёмную.
    const theme = (YAGR_THEMES.includes(themeValue) ? themeValue : themeType) as YagrTheme;

    const plotRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);
    const themeRef = React.useRef(theme);
    const resetZoomRef = React.useRef<() => void>(() => {});

    const [status, setStatus] = React.useState<Status>('loading');
    const [stats, setStats] = React.useState<CpuLoadStats>(EMPTY_STATS);
    const [zoomed, setZoomed] = React.useState(false);
    const [attempt, setAttempt] = React.useState(0);

    React.useEffect(() => {
        const root = plotRef.current;
        if (!root) {
            return undefined;
        }

        const abort = new AbortController();
        let chart: Yagr | null = null;
        /** Ряд в окне; `null`, пока не загружена история. После создания графика — массивы из `chart.config`. */
        let data: TimeSeries | null = null;
        /** Точки, пришедшие между кадрами. Обновления копятся и применяются не чаще раза за кадр. */
        let pending = createTimeSeries();
        let frame = 0;
        let needsResize = false;
        let isZoomed = false;

        setStatus('loading');
        setStats(EMPTY_STATS);
        setZoomed(false);

        const onScaleUpdate = (min: number, max: number) => {
            const timeline = data?.timestamps;
            const next = Boolean(
                timeline?.length && (min > timeline[0] || max < timeline[timeline.length - 1]),
            );
            if (next !== isZoomed) {
                isZoomed = next;
                setZoomed(next);
            }
        };

        const render = () => {
            frame = 0;
            if (!data) {
                return;
            }

            const changed = pending.timestamps.length > 0 && appendToWindow(data, pending, DAY_MS);
            pending = createTimeSeries();

            if (!chart) {
                if (!data.timestamps.length) {
                    setStatus('empty');
                    return;
                }
                chart = createChart(root, data, themeRef.current, onScaleUpdate);
                chartRef.current = chart;
                data = {
                    timestamps: chart.config.timeline as number[],
                    values: chart.config.series[0].data as (number | null)[],
                };
                needsResize = false;
                setStatus('ready');
                setStats(computeStats(data.values));
                return;
            }

            if (needsResize) {
                needsResize = false;
                chart.plugins.tooltip?.reset();
                chart.reflow();
            }

            if (changed) {
                // Пока пользователь рассматривает выделенный фрагмент, не сбрасываем его масштаб.
                redrawData(chart, isZoomed);
                setStats(computeStats(data.values));
            }
        };

        const schedule = () => {
            if (!frame) {
                frame = requestAnimationFrame(render);
            }
        };

        resetZoomRef.current = () => {
            const timeline = data?.timestamps;
            if (chart && timeline?.length) {
                chart.uplot.setScale('x', {min: timeline[0], max: timeline[timeline.length - 1]});
            }
        };

        // Подписываемся до загрузки истории, чтобы не потерять точки, пришедшие во время запроса.
        const unsubscribe = source.subscribe((update) => {
            // Буфер тоже ограничен окном: в фоновой вкладке кадры не рисуются, а данные идут.
            appendToWindow(pending, update, DAY_MS);
            if (data) {
                schedule();
            }
        });

        const now = Date.now();
        source.fetchHistory({from: now - DAY_MS, to: now}, abort.signal).then(
            (history) => {
                if (abort.signal.aborted) {
                    return;
                }
                data = createTimeSeries();
                appendToWindow(data, history, DAY_MS);
                schedule();
            },
            () => {
                if (!abort.signal.aborted) {
                    setStatus('error');
                }
            },
        );

        const resizeObserver = new ResizeObserver(() => {
            if (chart) {
                needsResize = true;
                schedule();
            }
        });
        resizeObserver.observe(root);

        return () => {
            abort.abort();
            unsubscribe();
            resizeObserver.disconnect();
            cancelAnimationFrame(frame);
            resetZoomRef.current = () => {};
            chartRef.current = null;
            // Снимает обработчики uPlot и Yagr и удаляет подсказку из document.body.
            chart?.dispose();
            chart = null;
            data = null;
        };
    }, [source, attempt]);

    React.useEffect(() => {
        themeRef.current = theme;
        if (chartRef.current) {
            applyTheme(chartRef.current, theme);
        }
    }, [theme]);

    const handleResetZoom = React.useCallback(() => resetZoomRef.current(), []);
    const handleRetry = React.useCallback(() => setAttempt((value) => value + 1), []);

    return (
        <Card
            view="outlined"
            className={['cpu-load-chart', `cpu-load-chart_theme_${themeType}`, className]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="cpu-load-chart__header">
                <div>
                    <Text as="h2" variant="subheader-3" className="cpu-load-chart__title">
                        Загрузка CPU
                    </Text>
                    <Text variant="caption-2" color="secondary">
                        За последние 24 часа, обновляется в реальном времени
                    </Text>
                </div>
                {zoomed && (
                    <Button view="outlined" size="s" onClick={handleResetZoom}>
                        Сбросить масштаб
                    </Button>
                )}
            </div>

            <dl className="cpu-load-chart__stats">
                <Stat label="Сейчас" value={stats.current} accent />
                <Stat label="Среднее" value={stats.average} />
                <Stat label="Пик" value={stats.peak} />
            </dl>

            <div className="cpu-load-chart__plot">
                <div
                    ref={plotRef}
                    className="cpu-load-chart__canvas"
                    role="img"
                    aria-label={`График загрузки CPU за 24 часа. Сейчас ${formatPercent(stats.current)}, среднее ${formatPercent(stats.average)}, пик ${formatPercent(stats.peak)}.`}
                />
                {status !== 'ready' && (
                    <div className="cpu-load-chart__overlay">
                        {status === 'loading' && <Loader size="m" />}
                        {status === 'empty' && (
                            <Text color="secondary">Нет данных за последние сутки</Text>
                        )}
                        {status === 'error' && (
                            <>
                                <Text color="danger">Не удалось загрузить данные</Text>
                                <Button view="outlined" size="m" onClick={handleRetry}>
                                    Повторить
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <Text variant="caption-1" color="hint" className="cpu-load-chart__hint">
                Выделите участок мышью, чтобы приблизить; двойной клик возвращает полный масштаб.
            </Text>
        </Card>
    );
}

function Stat({label, value, accent}: {label: string; value: number | null; accent?: boolean}) {
    return (
        <div className="cpu-load-chart__stat">
            <Text as="dt" variant="caption-2" color="secondary">
                {label}
            </Text>
            <Text as="dd" variant={accent ? 'subheader-3' : 'subheader-2'} className="cpu-load-chart__stat-value">
                {formatPercent(value)}
            </Text>
        </div>
    );
}
