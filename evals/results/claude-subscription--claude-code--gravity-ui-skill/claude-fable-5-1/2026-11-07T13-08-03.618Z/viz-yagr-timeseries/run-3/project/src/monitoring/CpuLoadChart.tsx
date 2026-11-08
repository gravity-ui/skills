import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import * as React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import {Button, useThemeValue} from '@gravity-ui/uikit';

import {DAY_MS} from './cpuLoadSource';
import type {CpuLoadPoint, CpuLoadSource} from './cpuLoadSource';

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Ширина скользящего окна, мс (по умолчанию — сутки) */
    windowMs?: number;
    className?: string;
}

const SERIES_ID = 'cpu';
/** Семантический токен: Yagr умеет резолвить `var(--…)` в цветах серий. */
const SERIES_COLOR = 'var(--g-color-base-info-heavy)';
/** Сколько «лишних» старых точек терпим до полной перестройки датасета. */
const COMPACT_THRESHOLD = 2000;

const YAGR_THEMES: readonly YagrTheme[] = ['light', 'dark', 'light-hc', 'dark-hc'];

function toYagrTheme(themeValue: string): YagrTheme {
    return (YAGR_THEMES as readonly string[]).includes(themeValue)
        ? (themeValue as YagrTheme)
        : themeValue.startsWith('dark')
          ? 'dark'
          : 'light';
}

function formatPercent(value: string | number | null): string {
    return value === null || value === '' ? '—' : `${Number(value).toFixed(1)} %`;
}

function buildConfig(timeline: number[], values: number[], theme: YagrTheme): MinimalValidConfig {
    return {
        timeline,
        series: [{id: SERIES_ID, name: 'CPU', color: SERIES_COLOR, data: values}],
        chart: {
            size: {adaptive: true, resizeDebounceMs: 100},
            select: {zoom: true},
            appearance: {theme, locale: 'ru'},
            series: {type: 'line', width: 2, spanGaps: false},
            timeMultiplier: 1,
        },
        scales: {y: {min: 0, max: 100}},
        axes: {y: {precision: 0}},
        cursor: {snapToValues: 'closest', markersSize: 8, x: {visible: true}, y: {visible: false}},
        tooltip: {show: true, sum: false, precision: 1, value: formatPercent},
        legend: {show: false},
        markers: {show: false},
    };
}

/** Индекс первой точки, попадающей в окно `[cutoff, +∞)`. */
function countStale(timeline: number[], cutoff: number): number {
    let i = 0;
    while (i < timeline.length && timeline[i] < cutoff) {
        i++;
    }
    return i;
}

export function CpuLoadChart({source, windowMs = DAY_MS, className}: CpuLoadChartProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr>();
    const theme = toYagrTheme(useThemeValue());
    const themeRef = React.useRef(theme);
    themeRef.current = theme;
    /** Тема, реально применённая к инстансу (Yagr не хранит её в config после setTheme). */
    const appliedThemeRef = React.useRef<YagrTheme | null>(null);

    // Live-режим выключается при зуме выделением: иначе каждое обновление
    // данных сбрасывало бы масштаб. Входящие точки копятся в буфере.
    const [live, setLive] = React.useState(true);
    const liveRef = React.useRef(true);
    const pendingRef = React.useRef<CpuLoadPoint[]>([]);

    /** Полная перестройка датасета по текущему окну (сбрасывает зум). */
    const rebuild = React.useCallback(
        (chart: Yagr, extra: CpuLoadPoint[]) => {
            const timeline = chart.config.timeline.concat(extra.map((p) => p.timestamp));
            const values = (chart.config.series[0].data as (number | null)[]).concat(
                extra.map((p) => p.value),
            );
            const stale = countStale(timeline, timeline[timeline.length - 1] - windowMs);
            chart.setSeries(
                timeline.slice(stale),
                [{id: SERIES_ID, name: 'CPU', color: SERIES_COLOR, data: values.slice(stale)}],
                {incremental: false},
            );
        },
        [windowMs],
    );

    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const history = source.getHistory();
        const chart = new Yagr(root, {
            ...buildConfig(history.timeline, history.values, themeRef.current),
            hooks: {
                onSelect: [
                    () => {
                        liveRef.current = false;
                        setLive(false);
                    },
                ],
            },
        });
        chartRef.current = chart;
        appliedThemeRef.current = themeRef.current;

        let rafId = 0;

        // Сбрасываем буфер в график не чаще одного кадра: при частых апдейтах
        // это одна отрисовка на кадр вместо отрисовки на каждую точку.
        const flush = () => {
            rafId = 0;
            if (!liveRef.current || pendingRef.current.length === 0) {
                return;
            }
            const batch = pendingRef.current;
            pendingRef.current = [];

            const timeline = batch.map((p) => p.timestamp);
            const values = batch.map((p) => p.value);
            const current = chart.config.timeline;
            const stale = countStale(current, timeline[timeline.length - 1] - windowMs);
            // `splice: true` удаляет ровно столько старых точек, сколько добавлено —
            // дешёвое скользящее окно без переаллокации массивов.
            const splice = stale >= timeline.length;

            chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {incremental: true, splice});

            const leftover = stale - (splice ? timeline.length : 0);
            if (leftover > COMPACT_THRESHOLD) {
                rebuild(chart, []);
            }
        };

        const unsubscribe = source.subscribe((point) => {
            pendingRef.current.push(point);
            // В паузе буфер не должен расти бесконечно: держим не больше окна.
            if (!liveRef.current) {
                const cutoff = point.timestamp - windowMs;
                const stale = countStale(
                    pendingRef.current.map((p) => p.timestamp),
                    cutoff,
                );
                if (stale > 0) {
                    pendingRef.current.splice(0, stale);
                }
                return;
            }
            if (rafId === 0) {
                rafId = requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (rafId !== 0) {
                cancelAnimationFrame(rafId);
            }
            pendingRef.current = [];
            chart.dispose();
            chartRef.current = undefined;
            appliedThemeRef.current = null;
        };
    }, [source, windowMs, rebuild]);

    // Синхронизация с темой Gravity UI. ThemeProvider обновляет класс на body
    // в layout-эффекте, поэтому здесь токены уже актуальны; цвет серии
    // перечитываем, так как Yagr резолвит `var(--…)` один раз при настройке.
    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart || appliedThemeRef.current === theme) {
            return;
        }
        appliedThemeRef.current = theme;
        chart.setTheme(theme);
        chart.setSeries(SERIES_ID, {color: SERIES_COLOR});
        chart.redraw(true, true);
    }, [theme]);

    const resumeLive = React.useCallback(() => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }
        const extra = pendingRef.current;
        pendingRef.current = [];
        liveRef.current = true;
        setLive(true);
        rebuild(chart, extra);
    }, [rebuild]);

    return (
        <div className={['cpu-load-chart', className].filter(Boolean).join(' ')}>
            <div ref={rootRef} className="cpu-load-chart__canvas" />
            {!live && (
                <Button
                    className="cpu-load-chart__resume"
                    view="outlined"
                    size="s"
                    onClick={resumeLive}
                >
                    Вернуться к live
                </Button>
            )}
        </div>
    );
}
