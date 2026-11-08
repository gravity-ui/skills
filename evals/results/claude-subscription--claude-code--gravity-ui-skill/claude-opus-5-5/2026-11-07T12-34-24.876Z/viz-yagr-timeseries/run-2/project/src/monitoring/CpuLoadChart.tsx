import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {
    ExtendedSeriesOptions,
    LineSeriesOptions,
    MinimalValidConfig,
    YagrTheme,
} from '@gravity-ui/yagr';
import {useThemeType, useThemeValue} from '@gravity-ui/uikit';

import type {CpuMetricsSource} from './cpuSource';

const SERIES_ID = 'cpu';
/** Цвета — семантические токены Gravity UI; `var(--…)` в `color` Yagr резолвит сам. */
const LINE_COLOR = 'var(--g-color-line-info)';
const FILL_TOKEN = '--g-color-base-info-light';
const YAGR_THEMES: readonly string[] = ['light', 'dark', 'light-hc', 'dark-hc'];

const formatPercent = (value: string | number | null) =>
    typeof value === 'number' ? `${value.toFixed(1)}%` : '—';

export interface CpuZoomRange {
    from: number;
    to: number;
}

export interface CpuLoadChartHandle {
    /** Вернуть полный суточный диапазон и «живой» режим. */
    resetZoom(): void;
}

export interface CpuLoadChartProps {
    source: CpuMetricsSource;
    className?: string;
    /** Последнее значение, вызывается не чаще одного раза за кадр. */
    onLatestValue?: (value: number | null, timestamp: number) => void;
    /** Пользователь приблизил участок (`range`) или вернулся к полному окну (`null`). */
    onZoomChange?: (range: CpuZoomRange | null) => void;
}

function useYagrTheme(): YagrTheme {
    const themeValue = useThemeValue();
    const themeType = useThemeType();
    return (YAGR_THEMES.includes(themeValue) ? themeValue : themeType) as YagrTheme;
}

/**
 * График загрузки CPU на Yagr (canvas, uPlot): десятки тысяч точек
 * и обновления в реальном времени без пересоздания графика.
 */
export const CpuLoadChart = React.forwardRef<CpuLoadChartHandle, CpuLoadChartProps>(
    function CpuLoadChart({source, className, onLatestValue, onZoomChange}, ref) {
        const rootRef = React.useRef<HTMLDivElement>(null);
        const chartRef = React.useRef<Yagr>();
        const zoomRef = React.useRef<CpuZoomRange | null>(null);
        const theme = useYagrTheme();

        // Колбэки держим в ref, чтобы их смена не пересоздавала график.
        const callbacksRef = React.useRef({onLatestValue, onZoomChange});
        callbacksRef.current = {onLatestValue, onZoomChange};
        // Тема на момент создания графика; дальнейшие смены — через setTheme.
        const themeRef = React.useRef(theme);
        themeRef.current = theme;

        const setZoom = React.useCallback((range: CpuZoomRange | null) => {
            const prev = zoomRef.current;
            if (prev === range || (prev && range && prev.from === range.from && prev.to === range.to)) {
                return;
            }
            zoomRef.current = range;
            callbacksRef.current.onZoomChange?.(range);
        }, []);

        React.useImperativeHandle(
            ref,
            () => ({
                resetZoom() {
                    const chart = chartRef.current;
                    const {timeline} = chart?.config ?? {};
                    setZoom(null);
                    if (chart && timeline?.length) {
                        chart.uplot.setScale('x', {min: timeline[0], max: timeline[timeline.length - 1]});
                    }
                },
            }),
            [setZoom],
        );

        // Создание графика, подписка на поток и освобождение ресурсов.
        React.useEffect(() => {
            const root = rootRef.current;
            if (!root) {
                return undefined;
            }

            const {timeline, values} = source.getSnapshot();
            const fontFamily =
                getComputedStyle(root).getPropertyValue('--g-font-family-sans').trim() || 'sans-serif';
            const axisFont = `11px ${fontFamily}`;

            const series: ExtendedSeriesOptions & LineSeriesOptions = {
                id: SERIES_ID,
                name: 'CPU',
                type: 'line',
                data: values,
                color: LINE_COLOR,
                width: 2,
                // Canvas не понимает CSS-переменные: читаем токен при каждой отрисовке,
                // поэтому заливка сама следует за темой.
                fill: () => getComputedStyle(root).getPropertyValue(FILL_TOKEN).trim(),
                spanGaps: false,
                formatter: formatPercent,
            };

            const config: MinimalValidConfig = {
                timeline,
                series: [series],
                chart: {
                    appearance: {theme: themeRef.current, locale: 'ru'},
                    size: {adaptive: true, resizeDebounceMs: 50},
                    select: {zoom: true},
                },
                scales: {
                    y: {min: 0, max: 100},
                },
                axes: {
                    x: {font: axisFont},
                    y: {
                        font: axisFont,
                        values: (_u, splits) => splits.map((v) => `${v}%`),
                    },
                },
                cursor: {
                    x: {visible: true, style: 'solid 1px var(--g-color-line-generic-accent)'},
                    y: {visible: false},
                },
                tooltip: {
                    // Не прятать тултип на каждом realtime-обновлении.
                    onUpdate: 'none',
                    className: 'yagr-tooltip_default cpu-load-chart__tooltip',
                    value: formatPercent,
                },
                hooks: {
                    onSelect: [({from, to}) => setZoom({from, to})],
                },
            };

            const chart = new Yagr(root, config);
            chartRef.current = chart;

            const latestIdx = values.length - 1;
            if (latestIdx >= 0) {
                callbacksRef.current.onLatestValue?.(values[latestIdx], timeline[latestIdx]);
            }

            // Новые точки копятся и сбрасываются в график не чаще раза за кадр;
            // в фоновой вкладке rAF не срабатывает, и всё накопленное уходит одним обновлением.
            const windowSize = timeline.length;
            let pendingTs: number[] = [];
            let pendingValues: (number | null)[] = [];
            let frame: number | undefined;

            const flush = () => {
                frame = undefined;
                if (!pendingTs.length) {
                    return;
                }
                let ts = pendingTs;
                let vals = pendingValues;
                pendingTs = [];
                pendingValues = [];
                if (windowSize && ts.length > windowSize) {
                    ts = ts.slice(-windowSize);
                    vals = vals.slice(-windowSize);
                }

                // incremental — дописать в конец, splice — столько же убрать с начала (скользящее окно).
                chart.setSeries(ts, [{id: SERIES_ID, data: vals}], {incremental: true, splice: true});

                const zoom = zoomRef.current;
                if (zoom) {
                    // setData сбрасывает масштаб — возвращаем выбранный пользователем участок.
                    chart.uplot.setScale('x', {min: zoom.from, max: zoom.to});
                }
                const last = ts.length - 1;
                callbacksRef.current.onLatestValue?.(vals[last], ts[last]);
            };

            const unsubscribe = source.subscribe((points) => {
                pendingTs.push(...points.timeline);
                pendingValues.push(...points.values);
                if (frame === undefined) {
                    frame = requestAnimationFrame(flush);
                }
            });

            // Двойной клик в uPlot сбрасывает зум к полному окну — синхронизируем состояние.
            const onDblClick = () => setZoom(null);
            root.addEventListener('dblclick', onDblClick);

            return () => {
                unsubscribe();
                if (frame !== undefined) {
                    cancelAnimationFrame(frame);
                }
                root.removeEventListener('dblclick', onDblClick);
                // Отключает ResizeObserver, удаляет тултип из body, уничтожает uPlot и canvas.
                chart.dispose();
                chartRef.current = undefined;
                pendingTs = [];
                pendingValues = [];
                setZoom(null);
            };
        }, [source, setZoom]);

        // Смена темы без пересоздания графика.
        React.useEffect(() => {
            const chart = chartRef.current;
            if (!chart || chart.utils.theme.theme === theme) {
                return;
            }
            chart.batch((batch) => {
                chart.setTheme(theme);
                // Цвета серии резолвятся из CSS-переменных при конфигурации — перечитываем под новую тему.
                chart.setSeries(SERIES_ID, {color: LINE_COLOR});
                batch.redraw = [true, true];
            });
        }, [theme]);

        return (
            <div
                ref={rootRef}
                className={['cpu-load-chart', className].filter(Boolean).join(' ')}
                role="img"
                aria-label="График загрузки CPU за последние 24 часа"
            />
        );
    },
);
