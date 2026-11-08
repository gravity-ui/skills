import * as React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {AreaSeriesOptions, MinimalValidConfig, RawSerieData, TooltipRenderOptions} from '@gravity-ui/yagr';
import {useThemeType} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import type {CpuLoadSnapshot, CpuLoadSource, CpuSample} from './cpuLoadSource';
import {DAY_MS, countExpired} from './window';

export interface CpuLoadChartProps {
    /** Поток измерений; компонент подписывается на него и отписывается при размонтировании. */
    source: CpuLoadSource;
    /** Окно, которое показывает график (по умолчанию сутки). */
    windowMs?: number;
    className?: string;
    /** Вызывается после создания экземпляра yagr (например, для синхронизации курсоров). */
    onChartInit?: (chart: Yagr) => void;
}

const SERIES_ID = 'cpu';
const SERIES_NAME = 'Загрузка CPU';

/**
 * Пакет из большего числа точек дешевле применить полной переинициализацией uPlot,
 * чем инкрементально (например, после долгого пребывания вкладки в фоне).
 */
const FULL_RESET_THRESHOLD = 5000;

/** Страховка от бесконечного роста очереди, если вкладка очень долго не получает кадров. */
const MAX_QUEUE = 100_000;

/** Слот 1 категориальной палитры, отдельные шаги для светлой и тёмной поверхности. */
const SERIES_COLORS: Record<ThemeType, {line: string; fill: string}> = {
    light: {line: '#2a78d6', fill: 'rgba(42, 120, 214, 0.10)'},
    dark: {line: '#3987e5', fill: 'rgba(57, 135, 229, 0.12)'},
};

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

export function formatLoad(value: unknown): string {
    return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(1)} %` : '—';
}

function renderTooltip(data: TooltipRenderOptions): string {
    const row = data.scales[0]?.rows[0];
    if (!row) {
        return data.yagr.utils.i18n('nodata');
    }
    const raw = typeof row.dataValue === 'number' ? row.dataValue : row.y;
    // Разметка собирается только из собственных значений: число и цвет серии из конфига.
    return (
        `<div class="cpu-load-chart__tooltip-value">` +
        `<span class="cpu-load-chart__tooltip-key" style="background:${row.color}"></span>` +
        `${formatLoad(raw)}</div>` +
        `<div class="cpu-load-chart__tooltip-time">${dateTimeFormatter.format(data.x)}</div>`
    );
}

type CpuSeries = RawSerieData<AreaSeriesOptions>;

function buildSeries(values: readonly number[], theme: ThemeType): CpuSeries {
    const colors = SERIES_COLORS[theme];
    return {
        id: SERIES_ID,
        name: SERIES_NAME,
        type: 'area',
        color: colors.fill,
        lineColor: colors.line,
        lineWidth: 2,
        interpolation: 'linear',
        spanGaps: false,
        precision: 1,
        data: values.slice(),
    };
}

function buildConfig(snapshot: CpuLoadSnapshot, theme: ThemeType): MinimalValidConfig {
    return {
        chart: {
            appearance: {theme, locale: 'ru'},
            size: {adaptive: true, resizeDebounceMs: 50},
            select: {zoom: false},
            timeMultiplier: 1,
        },
        timeline: snapshot.timeline.slice(),
        series: [buildSeries(snapshot.values, theme)],
        scales: {
            x: {time: true},
            y: {min: 0, max: 100, range: 'offset', offset: 0},
        },
        axes: {
            x: {
                values: (_u, ticks) => ticks.map((ts) => timeFormatter.format(ts)),
            },
            y: {
                splitsCount: 5,
                values: (_u, ticks) => ticks.map((v) => `${v}%`),
                ticks: {show: false},
            },
        },
        markers: {show: false},
        legend: {show: false},
        cursor: {
            snapToValues: 'closest',
            markersSize: 8,
            x: {visible: true, style: '1px solid var(--g-color-line-generic-accent)'},
            y: {visible: false},
        },
        tooltip: {
            strategy: 'none',
            onUpdate: 'none',
            className: 'cpu-load-chart__tooltip',
            render: renderTooltip,
        },
    };
}

function applyTheme(chart: Yagr, theme: ThemeType) {
    const colors = SERIES_COLORS[theme];
    chart.batch((state) => {
        chart.setTheme(theme);
        // setTheme не трогает конфиг — держим его актуальным, чтобы не применять тему повторно.
        chart.config.chart.appearance = {...chart.config.chart.appearance, theme};
        const update: Partial<CpuSeries> = {color: colors.fill, lineColor: colors.line};
        chart.setSeries(SERIES_ID, update);
        // Цвет серии читается при пересборке путей, поэтому перерисовываем и серии, и оси.
        state.redraw = [true, true];
    });
}

function appendSamples(chart: Yagr, samples: CpuSample[], windowMs: number) {
    const latestTs = samples[samples.length - 1].ts;
    // Пакет, целиком старше окна, бессмысленно даже прогонять через график.
    const fresh = samples.slice(countExpired(samples.map((s) => s.ts), latestTs, windowMs));
    const ts = fresh.map((s) => s.ts);
    const values = fresh.map((s) => s.load);
    const current = chart.config.series[0];

    if (chart.isEmpty || fresh.length > FULL_RESET_THRESHOLD) {
        const timeline = chart.config.timeline.concat(ts);
        const data = (current.data as (number | null)[]).concat(values);
        const expired = countExpired(timeline, latestTs, windowMs);
        // setSeries на пустом графике не подхватывает данные, поэтому заменяем конфиг целиком.
        chart.setConfig(
            {timeline: timeline.slice(expired), series: [{...current, data: data.slice(expired)}]},
            true,
        );
        return;
    }

    chart.batch(() => {
        chart.setSeries(ts, [{id: SERIES_ID, data: values}], {incremental: true});
        // Срезаем устаревшие точки в том же батче: пересчёт и setData случатся один раз.
        const timeline = chart.config.timeline;
        const expired = countExpired(timeline, latestTs, windowMs);
        if (expired > 0) {
            timeline.splice(0, expired);
            chart.config.series.forEach((serie) => serie.data.splice(0, expired));
        }
    });
}

export function CpuLoadChart({source, windowMs = DAY_MS, className, onChartInit}: CpuLoadChartProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);
    const themeType = useThemeType();
    const themeRef = React.useRef(themeType);
    themeRef.current = themeType;
    const onChartInitRef = React.useRef(onChartInit);
    onChartInitRef.current = onChartInit;

    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const chart = new Yagr(root, buildConfig(source.getSnapshot(), themeRef.current));
        chartRef.current = chart;
        onChartInitRef.current?.(chart);

        // Точки копятся в очереди и применяются одним батчем на кадр анимации:
        // при частых обновлениях график перерисовывается не чаще частоты экрана,
        // а в фоновой вкладке rAF не тикает и перерисовки не тратят CPU вовсе.
        let queue: CpuSample[] = [];
        let frame = 0;
        const flush = () => {
            frame = 0;
            if (queue.length === 0) {
                return;
            }
            const batch = queue;
            queue = [];
            appendSamples(chart, batch, windowMs);
        };
        const unsubscribe = source.subscribe((sample) => {
            queue.push(sample);
            if (queue.length > MAX_QUEUE) {
                queue.splice(0, queue.length - MAX_QUEUE);
            }
            if (frame === 0) {
                frame = requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (frame !== 0) {
                cancelAnimationFrame(frame);
            }
            queue = [];
            chartRef.current = null;
            // Снимает ResizeObserver, тултип, обработчики uPlot и удаляет canvas.
            chart.dispose();
        };
    }, [source, windowMs]);

    React.useEffect(() => {
        const chart = chartRef.current;
        if (chart && chart.config.chart.appearance?.theme !== themeType) {
            applyTheme(chart, themeType);
        }
    }, [themeType]);

    return (
        <div
            className={['cpu-load-chart', className].filter(Boolean).join(' ')}
            role="img"
            aria-label="График загрузки CPU за последние сутки"
        >
            <div ref={rootRef} className="cpu-load-chart__canvas" />
        </div>
    );
}
