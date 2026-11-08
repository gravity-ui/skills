import {useEffect, useRef} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {
    ExtendedSeriesOptions,
    LineSeriesOptions,
    MinimalValidConfig,
    RawSerieData,
    YagrTheme,
} from '@gravity-ui/yagr';
import 'uplot/dist/uPlot.min.css';
import '@gravity-ui/yagr/index.css';

import {
    createCpuSampler,
    extendWindow,
    generateHistory,
    STEP_MS,
    type CpuSample,
    type CpuWindow,
} from './cpuData';

const SERIES_ID = 'cpu';

/**
 * Цвет серии — слот 1 эталонной палитры dataviz, отдельные шаги для светлой
 * и тёмной темы. Оба прошли validate_palette.js (контраст ≥ 3:1 к фону
 * графика в своём режиме). Заливка под линией — тот же оттенок с ~10%
 * непрозрачности («wash», не насыщенный блок).
 */
const SERIES_COLOR = {light: '#2a78d6', dark: '#3987e5'} as const;
const SERIES_FILL = {light: 'rgba(42, 120, 214, 0.10)', dark: 'rgba(57, 135, 229, 0.14)'} as const;

const isDarkTheme = (theme: string) => theme.startsWith('dark');

const tooltipTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

export interface CpuLoadChartProps {
    /** Текущая тема приложения (из useThemeValue). */
    theme: YagrTheme;
    /**
     * Вызывается при создании графика и на каждой секундной точке.
     * Вторым аргументом отдаётся актуальное скользящее окно — из него
     * родитель считает статистику и табличное представление.
     */
    onTick?: (sample: CpuSample, window: CpuWindow) => void;
}

function buildConfig(theme: YagrTheme, {timeline, values}: CpuWindow): MinimalValidConfig {
    const mode = isDarkTheme(theme) ? 'dark' : 'light';

    // Явный тип: у RawSerieData по умолчанию только общие ключи всех
    // типов серий, поэтому width/fill/interpolation объявляем через
    // LineSeriesOptions (структурно совместимо с RawSerieData).
    const cpuSeries: ExtendedSeriesOptions & LineSeriesOptions = {
        id: SERIES_ID,
        name: 'Загрузка CPU',
        data: values,
        type: 'line',
        width: 2,
        color: SERIES_COLOR[mode],
        fill: SERIES_FILL[mode],
        interpolation: 'linear',
        spanGaps: true,
        precision: 1,
    };

    return {
        timeline,
        series: [cpuSeries],
        chart: {
            // adaptive: график сам следит за контейнером через ResizeObserver
            // и перерисовывается при изменении размеров (растягивается по ширине).
            size: {adaptive: true, resizeDebounceMs: 100},
            appearance: {theme, locale: 'ru'},
            // drag = приблизить выделенный диапазон, двойной клик = сброс.
            select: {zoom: true},
            timeMultiplier: 1,
        },
        axes: {
            x: {
                // На диапазоне суток yagr подписывает тики с секундами —
                // оставляем часы и минуты. Значения сплитов приходят в мс.
                values: (_u, splits) =>
                    splits.map((ts) => {
                        const ms = Number(ts) > 1e12 ? Number(ts) : Number(ts) * 1000;
                        const d = new Date(ms);
                        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    }),
            },
            y: {label: '%', precision: 0},
        },
        scales: {
            y: {min: 0, max: 100, range: 'nice'},
        },
        // Одна серия — легенда не нужна, её роль играет заголовок карточки.
        legend: {show: false},
        markers: {show: false},
        cursor: {
            // Вертикальная перекрестная линия следует за указателем,
            // горизонтальная не нужна — значение читается из тултипа.
            x: {visible: true},
            y: {visible: false},
            snapToValues: 'closest',
            markersSize: 8,
        },
        tooltip: {
            show: true,
            precision: 1,
            strategy: 'pin',
            // В заголовке — время точки (по умолчанию заголовка нет).
            title: (data) => {
                const x = Number(data.x);
                return tooltipTimeFormatter.format(x > 1e12 ? x : x * 1000);
            },
            value: (v) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(1)} %`),
        },
    };
}

/**
 * Интерактивный график загрузки CPU за последние 24 часа.
 *
 * Производительность:
 *  - рендер на canvas через uPlot (86k+ точек без виртуализации DOM);
 *  - обновление раз в секунду инкрементальное: новые точки добавляются,
 *    столько же вытесняется слева (скользящее окно фиксированного размера),
 *    без пересоздания графика и без роста массивов.
 *
 * Жизненный цикл: при размонтировании останавливается интервал, а
 * yagr.dispose() отключает ResizeObserver, плагины и canvas uPlot.
 */
export function CpuLoadChart({theme, onTick}: CpuLoadChartProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const yagrRef = useRef<Yagr | null>(null);
    const windowRef = useRef<CpuWindow | null>(null);
    const samplerRef = useRef(createCpuSampler());

    // Колбэки/пропы, которые не должны пересоздавать график.
    const onTickRef = useRef(onTick);
    onTickRef.current = onTick;
    const themeRef = useRef(theme);
    themeRef.current = theme;

    // Создание графика и цикла реального времени — один раз на монтирование.
    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return undefined;
        }

        const dataWindow = generateHistory();
        const sampler = createCpuSampler();
        windowRef.current = dataWindow;
        samplerRef.current = sampler;

        const yagr = new Yagr(root, buildConfig(themeRef.current, dataWindow));
        yagrRef.current = yagr;

        const notify = (time: number, value: number) =>
            onTickRef.current?.({time, value}, dataWindow);
        const lastIdx = dataWindow.values.length - 1;
        notify(dataWindow.timeline[lastIdx], dataWindow.values[lastIdx]);

        const intervalId = window.setInterval(() => {
            const added = extendWindow(dataWindow, sampler);
            if (!added) {
                return;
            }
            // Если пользователь приблизил диапазон drag'ом, предстоящий
            // setData сбросит масштаб на всё окно — запоминаем выбранный
            // диапазон и восстанавливаем его после обновления. Двойной клик
            // сам возвращает полный диапазон, и график снова следует за хвостом.
            const xScale = yagr.uplot.scales.x;
            const fullMin = dataWindow.timeline[0];
            const fullMax = dataWindow.timeline[dataWindow.timeline.length - 1];
            const userZoom =
                xScale.min != null &&
                xScale.max != null &&
                (xScale.min > fullMin + STEP_MS || xScale.max < fullMax - STEP_MS)
                    ? {min: xScale.min, max: xScale.max}
                    : null;

            // Инкрементальное обновление: дописать хвост, столько же срезать
            // слева — окно скользит, массивы не растут, полной пересборки нет.
            yagr.setSeries(added.timeline, [{id: SERIES_ID, data: added.values}], {
                incremental: true,
                splice: true,
            });
            if (userZoom) {
                yagr.uplot.setScale('x', userZoom);
            }
            notify(
                added.timeline[added.timeline.length - 1],
                added.values[added.values.length - 1],
            );
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
            yagr.dispose(); // ResizeObserver, тултип, легенда, canvas — всё освобождается
            yagrRef.current = null;
            windowRef.current = null;
        };
    }, []);

    // Смена темы — динамически, без пересоздания графика и потери данных.
    useEffect(() => {
        const yagr = yagrRef.current;
        if (!yagr || yagr.config.chart.appearance?.theme === theme) {
            return;
        }
        const mode = isDarkTheme(theme) ? 'dark' : 'light';
        yagr.setTheme(theme);
        // fill отсутствует в Partial<RawSerieData> (см. buildConfig), поэтому каст.
        yagr.setSeries(SERIES_ID, {
            color: SERIES_COLOR[mode],
            fill: SERIES_FILL[mode],
        } as Partial<RawSerieData>);
    }, [theme]);

    return <div ref={rootRef} className="cpu-chart" role="img" aria-label="График загрузки CPU за последние 24 часа" />;
}
