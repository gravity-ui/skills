import * as React from 'react';
import {useThemeType, useThemeValue} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import type {CpuLoadPoint, CpuLoadSource} from './cpuLoadSource';
import './CpuLoadChart.css';

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    className?: string;
}

const SERIES_ID = 'cpu';
/** Цвет линии задаётся семантическим токеном и пересчитывается при смене темы. */
const LINE_COLOR = 'var(--g-color-text-info)';
const YAGR_THEMES: readonly YagrTheme[] = ['light', 'dark', 'light-hc', 'dark-hc'];

function toYagrTheme(themeValue: string, themeType: 'light' | 'dark'): YagrTheme {
    return (YAGR_THEMES as readonly string[]).includes(themeValue) ? (themeValue as YagrTheme) : themeType;
}

function formatPercent(value: string | number | null): string {
    return value === null || value === undefined || value === '' ? '—' : `${Number(value).toFixed(1)}%`;
}

function buildConfig(source: CpuLoadSource, theme: YagrTheme): MinimalValidConfig {
    const {timeline, values} = source.getSnapshot();

    return {
        timeline,
        series: [
            {
                id: SERIES_ID,
                name: 'CPU',
                color: LINE_COLOR,
                data: values,
            },
        ],
        chart: {
            series: {type: 'line', width: 2},
            appearance: {theme, locale: 'ru'},
            size: {adaptive: true, resizeDebounceMs: 100},
            select: {zoom: true},
            timeMultiplier: 1,
        },
        scales: {
            y: {min: 0, max: 100},
        },
        axes: {
            y: {
                splitsCount: 5,
                values: (_u, splits) => splits.map((v) => `${v}%`),
            },
        },
        cursor: {
            snapToValues: 'closest',
            markersSize: 8,
            x: {visible: true, style: '1px solid var(--g-color-line-brand)'},
            y: {visible: false},
        },
        tooltip: {
            show: true,
            tracking: 'sticky',
            strategy: 'pin',
            className: 'cpu-load-chart__tooltip',
            value: formatPercent,
        },
        legend: {show: false},
        markers: {show: false},
    };
}

/**
 * Интерактивный график загрузки CPU на `@gravity-ui/yagr` (canvas, uPlot).
 *
 * - Экземпляр Yagr создаётся один раз и обновляется императивно: новые точки
 *   буферизуются и дописываются в скользящее окно одним `setSeries(..., {incremental, splice})`
 *   на кадр анимации, без ре-рендера React и без копирования конфига.
 * - Тема берётся из `ThemeProvider` uikit, при смене пересчитываются тема Yagr и цвет линии.
 * - Растягивается по контейнеру (ResizeObserver внутри Yagr), контейнер должен задавать высоту.
 * - При размонтировании снимается подписка, отменяется кадр, вызывается `dispose()`.
 */
export function CpuLoadChart({source, className}: CpuLoadChartProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);

    const themeValue = useThemeValue();
    const themeType = useThemeType();
    const theme = toYagrTheme(themeValue, themeType);
    const themeRef = React.useRef(theme);
    themeRef.current = theme;

    // Создание / уничтожение экземпляра и подписка на поток точек.
    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const chart = new Yagr(root, buildConfig(source, themeRef.current));
        chartRef.current = chart;

        const pending: CpuLoadPoint[] = [];
        let frame: number | null = null;

        const flush = () => {
            frame = null;
            if (pending.length === 0 || chartRef.current !== chart) {
                return;
            }
            const timeline = pending.map((p) => p.ts);
            const data = pending.map((p) => p.value);
            pending.length = 0;
            chart.setSeries(timeline, [{id: SERIES_ID, data}], {incremental: true, splice: true});
        };

        const unsubscribe = source.subscribe((point) => {
            pending.push(point);
            if (frame === null) {
                frame = requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            chartRef.current = null;
            chart.dispose();
            chart.resizeOb?.disconnect();
        };
    }, [source]);

    // Смена темы без пересоздания графика.
    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart || chart.utils.theme.theme === theme) {
            return;
        }
        chart.batch((batch) => {
            chart.setTheme(theme);
            // Цвет линии резолвится из CSS-переменной при конфигурации серии — перечитываем его под новую тему.
            chart.setSeries(SERIES_ID, {color: LINE_COLOR});
            batch.redraw = [true, true];
        });
    }, [theme]);

    return (
        <div
            ref={rootRef}
            className={`yagr cpu-load-chart${className ? ` ${className}` : ''}`}
            role="img"
            aria-label="График загрузки CPU за последние сутки"
        />
    );
}
