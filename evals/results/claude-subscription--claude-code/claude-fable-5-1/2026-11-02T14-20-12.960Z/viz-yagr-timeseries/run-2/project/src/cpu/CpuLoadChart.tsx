import * as React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {useThemeType, useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadSnapshot, CpuLoadSource} from './cpuLoadSource';

import './CpuLoadChart.css';

const SERIES_ID = 'cpu';

/**
 * Один ряд → один цвет (слот 1 категориальной палитры), отдельный шаг под каждую тему.
 * Оба значения проходят проверку контраста ≥ 3:1 на фоне своей темы.
 */
const SERIES_COLOR: Record<'light' | 'dark', string> = {
    light: '#2a78d6',
    dark: '#3987e5',
};

const AXIS_FONT = '11px Inter, "Helvetica Neue", Helvetica, Arial, sans-serif';

const tooltipDateFormat = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const formatPercent = (value: unknown, precision = 1) =>
    typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(precision)} %` : '—';

function createConfig(snapshot: CpuLoadSnapshot, theme: YagrTheme, seriesColor: string): MinimalValidConfig {
    return {
        timeline: snapshot.timeline,
        series: [
            {
                id: SERIES_ID,
                name: 'Загрузка CPU',
                color: seriesColor,
                data: snapshot.values,
                precision: 1,
            },
        ],
        chart: {
            // Тонкая линия 2px без заливки: на десятках тысяч точек это самый дешёвый путь отрисовки.
            series: {type: 'line', width: 2},
            appearance: {theme, locale: 'ru'},
            // Растягивается по контейнеру; Yagr сам вешает ResizeObserver на корневой элемент.
            size: {adaptive: true, resizeDebounceMs: 50},
            // Данные приходят постоянно — зум выделением сбрасывался бы каждым обновлением.
            select: {zoom: false},
            timeMultiplier: 1,
        },
        // Один ряд: его называет заголовок карточки, легенда не нужна.
        legend: {show: false},
        scales: {
            y: {min: 0, max: 100},
        },
        axes: {
            x: {font: AXIS_FONT},
            y: {
                font: AXIS_FONT,
                splitsCount: 5,
                values: (_u, splits) => splits.map((v) => `${v}%`),
            },
        },
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
            className: 'cpu-load-chart__tooltip',
            title: ({x}) => tooltipDateFormat.format(x),
            value: (value) => formatPercent(value),
            precision: 1,
            sum: false,
            showIndicies: false,
        },
    };
}

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    className?: string;
}

/**
 * Интерактивный график загрузки CPU на canvas (uPlot через Yagr).
 *
 * - Данные живут вне React: компонент один раз строит график по снимку источника,
 *   а дальше применяет только приращения, сгруппированные в один вызов на кадр.
 * - Тема берётся из ThemeProvider и переключается без пересоздания графика.
 * - При размонтировании отписывается от источника, отменяет отложенный кадр
 *   и уничтожает экземпляр графика вместе с его ResizeObserver и тултипом.
 */
export const CpuLoadChart = React.memo(function CpuLoadChart({source, className}: CpuLoadChartProps) {
    const themeValue = useThemeValue() as YagrTheme; // light | dark | light-hc | dark-hc — имена совпадают с темами Yagr
    const themeType = useThemeType();

    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);
    const themeRef = React.useRef({themeValue, themeType});
    themeRef.current = {themeValue, themeType};

    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        const {themeValue: initialTheme, themeType: initialType} = themeRef.current;
        const chart = new Yagr(root, createConfig(source.getSnapshot(), initialTheme, SERIES_COLOR[initialType]));
        chartRef.current = chart;

        // Буфер приращений: сколько бы порций ни пришло между кадрами, график перерисуется один раз.
        const pendingTimeline: number[] = [];
        const pendingValues: number[] = [];
        let pendingDropped = 0;
        let frame = 0;

        const flush = () => {
            frame = 0;
            if (pendingTimeline.length === 0) return;

            const timeline = pendingTimeline.splice(0);
            const values = pendingValues.splice(0);
            const dropped = pendingDropped;
            pendingDropped = 0;

            if (dropped === timeline.length) {
                // Окно заполнено: добавить новые точки и отбросить столько же старых одним проходом.
                chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {incremental: true, splice: true});
            } else if (dropped === 0) {
                // Окно ещё заполняется: просто дописать.
                chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {incremental: true});
            } else {
                // Неравномерная выборка — редкий путь, полная синхронизация со снимком источника.
                const snapshot = source.getSnapshot();
                chart.setSeries(snapshot.timeline, [{id: SERIES_ID, data: snapshot.values}], {incremental: false});
            }
        };

        const unsubscribe = source.subscribe((batch) => {
            for (let i = 0; i < batch.timeline.length; i++) {
                pendingTimeline.push(batch.timeline[i]);
                pendingValues.push(batch.values[i]);
            }
            pendingDropped += batch.dropped;
            if (!frame) {
                frame = requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            chartRef.current = null;
            chart.dispose();
            // dispose() снимает наблюдение с корня, но сам ResizeObserver оставляет — отключаем явно.
            chart.resizeOb?.disconnect();
        };
    }, [source]);

    React.useEffect(() => {
        const chart = chartRef.current;
        if (!chart || chart.utils.theme.theme === themeValue) return;

        chart.batch((batch) => {
            chart.setTheme(themeValue);
            chart.setSeries(SERIES_ID, {color: SERIES_COLOR[themeType]});
            batch.redraw = [true, true];
        });
    }, [themeValue, themeType]);

    return (
        <div
            ref={rootRef}
            className={['cpu-load-chart', className].filter(Boolean).join(' ')}
            role="img"
            aria-label="График загрузки CPU за последние 24 часа"
        />
    );
});
