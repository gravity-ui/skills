import {memo, useEffect, useRef} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import {useThemeType} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';
import '@gravity-ui/yagr/index.css';

import type {CpuMetricsSource, CpuSnapshot} from './cpuMetrics';
import './CpuLoadChart.css';

export interface CpuLoadChartProps {
    /** Источник данных. При смене источника график пересоздаётся. */
    source: CpuMetricsSource;
    className?: string;
}

const SERIES_ID = 'cpu';

/** Один ряд → один цвет; шаги подобраны отдельно под светлую и тёмную поверхности */
const SERIES_COLOR: Record<ThemeType, string> = {
    light: '#2a78d6',
    dark: '#3987e5',
};

const TOOLTIP_CLASS = 'cpu-load-chart__tooltip';

const titleFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Допустимые шаги делений оси времени, мс: uPlot выбирает первый, при котором подписи не теснятся */
const X_AXIS_INCRS = [
    SECOND, 2 * SECOND, 5 * SECOND, 10 * SECOND, 15 * SECOND, 30 * SECOND,
    MINUTE, 2 * MINUTE, 5 * MINUTE, 10 * MINUTE, 15 * MINUTE, 30 * MINUTE,
    HOUR, 2 * HOUR, 3 * HOUR, 4 * HOUR, 6 * HOUR, 12 * HOUR,
    DAY,
];

const timeTickFormats = {
    date: new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: 'short'}),
    minutes: new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'}),
    seconds: new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'}),
};

/** Подпись деления по шагу: дата для суточных шагов и полуночи, иначе время без лишних секунд */
function formatTimeTick(value: number, incr: number): string {
    const date = new Date(value);
    if (incr >= DAY) {
        return timeTickFormats.date.format(date);
    }
    if (incr >= MINUTE) {
        const isMidnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        return isMidnight ? timeTickFormats.date.format(date) : timeTickFormats.minutes.format(date);
    }
    return timeTickFormats.seconds.format(date);
}

const formatPercent = (value: string | number | null): string =>
    value === null || value === '' || Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(1)} %`;

function buildConfig(snapshot: CpuSnapshot, theme: YagrTheme, fontFamily: string): MinimalValidConfig {
    const axisFont = `11px ${fontFamily}`;
    return {
        timeline: snapshot.timeline,
        series: [
            {
                id: SERIES_ID,
                name: 'CPU',
                color: SERIES_COLOR[theme.startsWith('dark') ? 'dark' : 'light'],
                data: snapshot.values,
                precision: 1,
            },
        ],
        chart: {
            // Общие параметры ряда: `width`/`spanGaps` для линии типизированы только здесь
            series: {type: 'line', width: 2, spanGaps: false, interpolation: 'linear'},
            appearance: {theme, locale: 'ru'},
            size: {adaptive: true, resizeDebounceMs: 50},
            select: {zoom: true},
            timeMultiplier: 1,
        },
        scales: {
            y: {min: 0, max: 100, range: 'nice'},
        },
        axes: {
            x: {
                font: axisFont,
                // Не меньше 96px между подписями, чтобы они не наезжали друг на друга на узких экранах
                space: 96,
                incrs: X_AXIS_INCRS,
                values: (_u, splits, _axisIdx, _space, incr) => splits.map((v) => formatTimeTick(v, incr)),
            },
            y: {
                font: axisFont,
                splitsCount: 5,
                values: (_u, splits) => splits.map((v) => `${v}%`),
            },
        },
        // Сетка не задаётся явно: тогда Yagr берёт цвет из --yagr-grid, который привязан к теме
        legend: {show: false},
        markers: {show: false},
        cursor: {
            snapToValues: 'closest',
            markersSize: 8,
            x: {visible: true, style: '1px solid var(--g-color-line-generic-accent)'},
            y: {visible: false},
        },
        tooltip: {
            show: true,
            tracking: 'sticky',
            strategy: 'pin',
            precision: 1,
            value: formatPercent,
            title: ({x}) => titleFormatter.format(x),
            className: TOOLTIP_CLASS,
            // Не сбрасывать тултип при каждом поступлении данных — иначе он мигает под курсором
            onUpdate: 'none',
        },
    };
}

/** Текущий зум по X, если пользователь выделил диапазон; иначе null */
function getUserZoom(chart: Yagr): {min: number; max: number} | null {
    const x = chart.uplot.scales.x;
    const timeline = chart.uplot.data[0];
    if (!timeline.length || x.min === undefined || x.max === undefined) {
        return null;
    }
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    return x.min > first || x.max < last ? {min: x.min, max: x.max} : null;
}

function CpuLoadChartComponent({source, className}: CpuLoadChartProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<Yagr | null>(null);
    const themeType = useThemeType();
    const themeRef = useRef<ThemeType>(themeType);
    themeRef.current = themeType;

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const fontFamily = getComputedStyle(root).getPropertyValue('--g-font-family-sans').trim() || 'sans-serif';
        const chart = new Yagr(root, buildConfig(source.getSnapshot(), themeRef.current, fontFamily));
        chartRef.current = chart;

        // Новые точки копятся в буфере и применяются одним вызовом на кадр:
        // источник может присылать данные чаще, чем имеет смысл перерисовывать.
        let pendingTime: number[] = [];
        let pendingValue: number[] = [];
        let frame = 0;

        const flush = () => {
            frame = 0;
            if (!pendingTime.length) {
                return;
            }
            const time = pendingTime;
            const value = pendingValue;
            pendingTime = [];
            pendingValue = [];

            const zoom = getUserZoom(chart);
            // incremental + splice: добавляем точки справа и отрезаем столько же слева —
            // окно скользит без пересоздания uPlot и без копирования всего массива в React
            chart.setSeries(time, [{id: SERIES_ID, data: value}], {incremental: true, splice: true});
            if (zoom) {
                // setData сбрасывает масштаб — возвращаем выделенный пользователем диапазон
                chart.uplot.setScale('x', zoom);
            }
        };

        const unsubscribe = source.subscribe((samples) => {
            for (const sample of samples) {
                pendingTime.push(sample.time);
                pendingValue.push(sample.value);
            }
            if (!frame) {
                frame = requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (frame) {
                cancelAnimationFrame(frame);
            }
            // dispose: снимает ResizeObserver, слушатели мыши, тултип из body и uPlot
            chart.dispose();
            chartRef.current = null;
        };
    }, [source]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }
        chart.batch((batch) => {
            chart.setTheme(themeType);
            chart.setSeries(SERIES_ID, {color: SERIES_COLOR[themeType]});
            batch.redraw = [true, true];
        });
    }, [themeType]);

    return (
        <div
            ref={rootRef}
            className={className ? `cpu-load-chart ${className}` : 'cpu-load-chart'}
            role="img"
            aria-label="График загрузки CPU за последние 24 часа"
        />
    );
}

export const CpuLoadChart = memo(CpuLoadChartComponent);
