import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import * as React from 'react';
import YagrChart, {type YagrReactRef} from '@gravity-ui/yagr/react';
import type {AreaSeriesOptions, MinimalValidConfig, RawSerieData, YagrTheme} from '@gravity-ui/yagr';
import {Label, Loader, Text, useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadHistory, CpuLoadSource} from './cpuLoadSource';
import {CPU_LOAD_WINDOW_MS} from './cpuLoadSource';

const SERIES_ID = 'cpu';
/* Цвета серии задаются CSS‑переменными темы: yagr резолвит их через
   getComputedStyle, поэтому в светлой и тёмной теме получаются разные значения. */
const AREA_COLOR = 'var(--g-color-base-info-light)';
const LINE_COLOR = 'var(--g-color-base-info-heavy)';

const YAGR_THEMES: ReadonlySet<string> = new Set<YagrTheme>(['light', 'dark', 'light-hc', 'dark-hc']);

function toYagrTheme(theme: string): YagrTheme {
    if (YAGR_THEMES.has(theme)) {
        return theme as YagrTheme;
    }
    return theme.includes('dark') ? 'dark' : 'light';
}

function formatPercent(value: string | number | null): string {
    if (value === null || value === '') {
        return '—';
    }
    return `${Number(value).toFixed(1)}%`;
}

function buildConfig(history: CpuLoadHistory, theme: YagrTheme): MinimalValidConfig {
    const series: RawSerieData<AreaSeriesOptions> = {
        id: SERIES_ID,
        name: 'CPU',
        type: 'area',
        color: AREA_COLOR,
        lineColor: LINE_COLOR,
        lineWidth: 1.5,
        precision: 1,
        data: history.values,
    };

    return {
        timeline: history.timeline,
        series: [series],
        chart: {
            // adaptive: ResizeObserver на корне → график растягивается по контейнеру
            size: {adaptive: true, resizeDebounceMs: 50},
            appearance: {theme, locale: 'ru'},
            // выделение диапазона мышью = zoom, двойной клик = сброс
            select: {zoom: true},
        },
        scales: {y: {min: 0, max: 100}},
        axes: {
            y: {values: (_u, splits) => splits.map((v) => `${v}%`)},
        },
        // одна серия: легенда и точки на 86k значений только тратят ресурсы
        legend: {show: false},
        markers: {show: false},
        cursor: {x: {visible: true}, y: {visible: false}, markersSize: 6},
        tooltip: {
            strategy: 'pin',
            // не прятать тултип при каждом realtime‑обновлении данных
            onUpdate: 'none',
            sum: false,
            maxLines: 1,
            value: formatPercent,
            className: 'cpu-load-chart__tooltip',
        },
    };
}

interface CpuLoadPlotProps {
    source: CpuLoadSource;
    history: CpuLoadHistory;
    theme: YagrTheme;
    height: number;
    onLatest: (value: number) => void;
}

/**
 * Собственно канвас. Монтируется один раз с готовой историей; дальше все
 * обновления идут мимо React — напрямую в инстанс Yagr через ref.
 */
const CpuLoadPlot = React.memo(function CpuLoadPlot({
    source,
    history,
    theme,
    height,
    onLatest,
}: CpuLoadPlotProps) {
    const chartRef = React.useRef<YagrReactRef | null>(null);
    // Конфиг создаётся ровно один раз: стабильная ссылка не даёт YagrChart
    // вызывать setConfig на каждом рендере.
    const [config] = React.useState(() => buildConfig(history, theme));
    const windowPoints = history.timeline.length;

    const onLatestRef = React.useRef(onLatest);
    onLatestRef.current = onLatest;

    // Смена темы приложения → тема yagr + перечитывание цветов серии из токенов.
    const appliedTheme = React.useRef(theme);
    React.useEffect(() => {
        if (appliedTheme.current === theme) {
            return;
        }
        appliedTheme.current = theme;
        const yagr = chartRef.current?.yagr();
        if (!yagr) {
            return;
        }
        const colors: Partial<RawSerieData<AreaSeriesOptions>> = {color: AREA_COLOR, lineColor: LINE_COLOR};
        yagr.batch((batch) => {
            yagr.setTheme(theme);
            yagr.setSeries(SERIES_ID, colors);
            batch.redraw = [true, true];
        });
    }, [theme]);

    // Realtime: точки копятся в буфере и сбрасываются в график не чаще одного
    // кадра (rAF). В фоновой вкладке rAF не тикает — буфер применится при возврате.
    React.useEffect(() => {
        let pendingTs: number[] = [];
        let pendingValues: number[] = [];
        let frame: number | null = null;

        const flush = () => {
            frame = null;
            const ts = pendingTs;
            const values = pendingValues;
            pendingTs = [];
            pendingValues = [];

            const yagr = chartRef.current?.yagr();
            if (!yagr || ts.length === 0) {
                return;
            }
            // splice удаляет столько же точек с начала, сколько добавлено в конец:
            // окно остаётся ровно сутки, память не растёт.
            const overflow = yagr.config.timeline.length + ts.length > windowPoints;
            yagr.setSeries(ts, [{id: SERIES_ID, data: values}], {incremental: true, splice: overflow});
            onLatestRef.current(values[values.length - 1]);
        };

        const unsubscribe = source.subscribe((samples) => {
            for (const sample of samples) {
                pendingTs.push(sample.ts);
                pendingValues.push(sample.value);
            }
            if (frame === null) {
                frame = window.requestAnimationFrame(flush);
            }
        });

        return () => {
            unsubscribe();
            if (frame !== null) {
                window.cancelAnimationFrame(frame);
                frame = null;
            }
            pendingTs = [];
            pendingValues = [];
        };
    }, [source, windowPoints]);

    // Размонтирование: YagrChart сам вызывает yagr.dispose() —
    // uPlot.destroy(), ResizeObserver.unobserve, тултип и легенда.
    return (
        <div className="cpu-load-chart__plot" style={{height}}>
            <YagrChart id="cpu-load-chart" ref={chartRef} config={config} />
        </div>
    );
});

export interface CpuLoadChartProps {
    source: CpuLoadSource;
    /** Заголовок виджета */
    title?: string;
    /** Высота области графика в px; ширина всегда 100% контейнера */
    height?: number;
    /** Длина окна, мс (по умолчанию сутки) */
    windowMs?: number;
}

export function CpuLoadChart({
    source,
    title = 'Загрузка CPU за последние сутки',
    height = 320,
    windowMs = CPU_LOAD_WINDOW_MS,
}: CpuLoadChartProps) {
    const theme = toYagrTheme(useThemeValue());
    const [history, setHistory] = React.useState<CpuLoadHistory | null>(null);
    const [error, setError] = React.useState<Error | null>(null);
    const [latest, setLatest] = React.useState<number | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        setHistory(null);
        setError(null);
        setLatest(null);
        source
            .loadHistory(windowMs)
            .then((data) => {
                if (cancelled) {
                    return;
                }
                setHistory(data);
                setLatest(data.values.length ? data.values[data.values.length - 1] : null);
            })
            .catch((e: unknown) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e : new Error(String(e)));
                }
            });
        return () => {
            cancelled = true;
        };
    }, [source, windowMs]);

    let body: React.ReactNode;
    if (error) {
        body = (
            <div className="cpu-load-chart__state" style={{height}}>
                <Text color="danger">Не удалось загрузить данные: {error.message}</Text>
            </div>
        );
    } else if (!history) {
        body = (
            <div className="cpu-load-chart__state" style={{height}}>
                <Loader size="m" />
            </div>
        );
    } else if (history.timeline.length === 0) {
        body = (
            <div className="cpu-load-chart__state" style={{height}}>
                <Text color="secondary">Нет данных за выбранный период</Text>
            </div>
        );
    } else {
        body = (
            <CpuLoadPlot
                source={source}
                history={history}
                theme={theme}
                height={height}
                onLatest={setLatest}
            />
        );
    }

    return (
        <section className="cpu-load-chart" aria-label={title}>
            <div className="cpu-load-chart__header">
                <Text variant="subheader-2" className="cpu-load-chart__title" ellipsis>
                    {title}
                </Text>
                {latest !== null && (
                    <Label theme="info" size="s" value={formatPercent(latest)}>
                        сейчас
                    </Label>
                )}
                <Text variant="caption-2" color="hint" whiteSpace="nowrap">
                    выделение — масштаб, двойной клик — сброс
                </Text>
            </div>
            {body}
        </section>
    );
}
