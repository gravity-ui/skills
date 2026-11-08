import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import {useEffect, useRef, useState} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {LineSeriesOptions, MinimalValidConfig, RawSerieData, YagrTheme} from '@gravity-ui/yagr';
import {Label, useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadPoint, CpuLoadSource} from './cpuLoadSource';

/** Тип инстанса uPlot берём у Yagr, чтобы не зависеть от транзитивного пакета `uplot` */
type UPlotInstance = Yagr['uplot'];

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Высота области графика, px (ширина — 100% контейнера) */
    height?: number;
    className?: string;
}

const SERIES_ID = 'cpu';
/** Цвет линии — семантический токен, Yagr резолвит `var(--g-*)` сам */
const SERIES_COLOR = 'var(--g-color-text-info)';
const YAGR_THEMES: readonly YagrTheme[] = ['light', 'dark', 'light-hc', 'dark-hc'];

function toYagrTheme(themeValue: string): YagrTheme {
    if ((YAGR_THEMES as readonly string[]).includes(themeValue)) {
        return themeValue as YagrTheme;
    }
    return themeValue.includes('dark') ? 'dark' : 'light';
}

function formatPercent(value: string | number | null): string {
    return typeof value === 'number' ? `${value.toFixed(1)} %` : '—';
}

/** Выбран ли на оси X диапазон уже данных (пользователь приблизил график) */
function isZoomedIn(u: UPlotInstance): boolean {
    const xs = u.data[0];
    if (!xs || xs.length === 0) {
        return false;
    }
    const {min, max} = u.scales.x;
    if (min == null || max == null) {
        return false;
    }
    return min > xs[0] || max < xs[xs.length - 1];
}

function buildConfig(
    source: CpuLoadSource,
    theme: YagrTheme,
    onZoomChange: (zoomed: boolean) => void,
): MinimalValidConfig {
    const {timeline, values} = source.getHistory();
    // Типизируем явно как линию: у `RawSerieData` по умолчанию остаются только
    // общие для всех типов серий поля, и `width` (только у line) теряется.
    const cpuSeries: RawSerieData<LineSeriesOptions> = {
        id: SERIES_ID,
        name: 'Загрузка CPU',
        type: 'line',
        color: SERIES_COLOR,
        width: 1.5,
        data: values,
        precision: 1,
        formatter: formatPercent,
    };
    return {
        timeline,
        series: [cpuSeries],
        chart: {
            // adaptive: ResizeObserver внутри Yagr подгоняет canvas под контейнер
            size: {adaptive: true, resizeDebounceMs: 100},
            appearance: {theme, locale: 'ru'},
            select: {zoom: true},
            timeMultiplier: 1,
        },
        scales: {
            y: {min: 0, max: 100},
        },
        axes: {
            y: {splitsCount: 5},
        },
        // На десятках тысяч точек маркеры на каждой точке — лишняя работа и шум.
        markers: {show: false},
        cursor: {
            snapToValues: 'closest',
            x: {visible: true},
            y: {visible: false},
        },
        tooltip: {
            show: true,
            tracking: 'sticky',
            maxLines: 1,
        },
        legend: {show: false},
        hooks: {
            setScale: [
                (u: UPlotInstance, key: string) => {
                    if (key === 'x') {
                        onZoomChange(isZoomedIn(u));
                    }
                },
            ],
        },
    };
}

/**
 * Интерактивный график загрузки CPU на `@gravity-ui/yagr` (canvas, uPlot).
 *
 * Производительность:
 * - новые точки накапливаются в буфере и применяются не чаще одного кадра
 *   через инкрементальный `setSeries` (без пересоздания uPlot);
 * - окно данных скользящее: сколько точек добавили, столько же отбросили с начала;
 * - пока пользователь приблизил участок, живые обновления копятся в буфере и
 *   применяются после сброса масштаба (двойной клик) — иначе каждое обновление
 *   сбрасывало бы выбранный диапазон.
 *
 * При размонтировании: отписка от источника, отмена отложенного кадра,
 * `yagr.dispose()` (снимает ResizeObserver, уничтожает uPlot, тултип, легенду).
 */
export function CpuLoadChart({source, height = 320, className}: CpuLoadChartProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<Yagr | null>(null);
    const zoomedRef = useRef(false);
    const pendingRef = useRef<CpuLoadPoint[]>([]);
    const frameRef = useRef<number | null>(null);

    const themeValue = useThemeValue();
    const yagrTheme = toYagrTheme(themeValue);
    const appliedThemeRef = useRef<YagrTheme>(yagrTheme);

    const [zoomed, setZoomed] = useState(false);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const flush = () => {
            frameRef.current = null;
            const chart = chartRef.current;
            const pending = pendingRef.current;
            if (!chart || pending.length === 0 || zoomedRef.current) {
                return;
            }
            pendingRef.current = [];
            const timeline = new Array<number>(pending.length);
            const data = new Array<number>(pending.length);
            for (let i = 0; i < pending.length; i++) {
                timeline[i] = pending[i].ts;
                data[i] = pending[i].value;
            }
            chart.setSeries(timeline, [{id: SERIES_ID, data}], {
                incremental: true,
                splice: true,
            });
        };

        const scheduleFlush = () => {
            if (frameRef.current === null) {
                frameRef.current = requestAnimationFrame(flush);
            }
        };

        const onZoomChange = (next: boolean) => {
            if (zoomedRef.current === next) {
                return;
            }
            zoomedRef.current = next;
            setZoomed(next);
            if (!next) {
                scheduleFlush();
            }
        };

        const chart = new Yagr(root, buildConfig(source, appliedThemeRef.current, onZoomChange));
        chartRef.current = chart;

        const unsubscribe = source.subscribe((points) => {
            const pending = pendingRef.current;
            for (let i = 0; i < points.length; i++) {
                pending.push(points[i]);
            }
            scheduleFlush();
        });

        return () => {
            unsubscribe();
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            pendingRef.current = [];
            zoomedRef.current = false;
            setZoomed(false);
            chartRef.current = null;
            chart.dispose();
        };
    }, [source]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart || appliedThemeRef.current === yagrTheme) {
            return;
        }
        appliedThemeRef.current = yagrTheme;
        // ThemeProvider меняет класс темы на <body> в layout-эффекте, поэтому
        // к этому моменту `var(--g-*)` уже резолвятся в значения новой темы.
        // Один batch — одна перерисовка: тема (сетка, оси) + цвет линии.
        chart.batch(() => {
            chart.setTheme(yagrTheme);
            chart.setSeries(SERIES_ID, {color: SERIES_COLOR});
        });
    }, [yagrTheme]);

    const rootClassName = className ? `cpu-load-chart ${className}` : 'cpu-load-chart';

    return (
        <div className={rootClassName} style={{height}}>
            <div
                ref={rootRef}
                className="cpu-load-chart__canvas"
                role="img"
                aria-label="График загрузки CPU за последние сутки"
            />
            {zoomed ? (
                <div className="cpu-load-chart__badge">
                    <Label size="xs" theme="info">
                        Обновления на паузе — двойной клик сбросит масштаб
                    </Label>
                </div>
            ) : null}
        </div>
    );
}
