import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import Yagr, {AreaSeriesOptions, MinimalValidConfig, RawSerieData} from 'yagr';

import 'yagr/dist/index.css';

export type ChartTheme = 'light' | 'dark';

/** Императивный API графика: дозапись точек без пересоздания инстанса. */
export interface CpuChartHandle {
  /**
   * Добавляет новые сэмплы в конец ряда и вытесняет такое же количество
   * самых старых (скользящее окно). O(размер порции) вместо полной замены
   * массива данных.
   */
  append(times: number[], values: (number | null)[]): void;
}

interface CpuChartProps {
  theme: ChartTheme;
  /** Начальный ряд: метки времени (мс) и значения (%). */
  timeline: number[];
  values: (number | null)[];
}

const SERIES_ID = 'cpu';

/**
 * Одна серия — величина (загрузка CPU), поэтому один оттенок синего;
 * шаги светлой/тёмной темы провалидированы на контраст к своим подложкам.
 * Линия 2px + лёгкая заливка area.
 */
const SERIES_COLORS: Record<ChartTheme, {line: string; fill: string}> = {
  light: {line: '#2a78d6', fill: 'rgba(42, 120, 214, 0.15)'},
  dark: {line: '#3987e5', fill: 'rgba(57, 135, 229, 0.22)'},
};

const tooltipTimeFmt = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const tickTimeFmt = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const tickDayFmt = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});

function buildConfig(theme: ChartTheme, timeline: number[], values: (number | null)[]): MinimalValidConfig {
  const colors = SERIES_COLORS[theme];

  // Явная типизация area-серии: дефолтный дженерик RawSerieData
  // теряет lineColor/lineWidth.
  const series: RawSerieData<AreaSeriesOptions>[] = [
    {
      id: SERIES_ID,
      name: 'CPU',
      type: 'area',
      color: colors.fill,
      lineColor: colors.line,
      lineWidth: 2,
      precision: 1,
      data: values,
    },
  ];

  return {
    chart: {
      series: {
        type: 'area',
        interpolation: 'linear',
        lineWidth: 2,
        spanGaps: false,
      },
      size: {
        // Подстройка под контейнер через ResizeObserver (по умолчанию и так
        // включена) с дебаунсом, чтобы не дёргать перерисовку на каждый кадр.
        adaptive: true,
        resizeDebounceMs: 100,
      },
      appereance: {
        theme,
        locale: 'ru',
      },
      select: {
        // drag — зум по диапазону, двойной клик — сброс (поведение uPlot).
        zoom: true,
      },
    },
    timeline,
    series,
    scales: {
      // CPU — всегда 0..100%, шкалу не «плаваем» за данными.
      y: {min: 0, max: 100},
    },
    axes: {
      x: {
        values: (_u, ticks) => {
          let prevDay = -1;
          return ticks.map((t) => {
            const d = new Date(t);
            const time = tickTimeFmt.format(d);
            // Первый тик новых суток подписываем датой (вторая строка).
            if (d.getDate() !== prevDay) {
              prevDay = d.getDate();
              return `${time}\n${tickDayFmt.format(d)}`;
            }
            return time;
          });
        },
      },
      y: {
        side: 'left',
        values: (_u, ticks) => ticks.map((v) => `${Math.round(v)} %`),
      },
    },
    cursor: {
      snapToValues: 'closest',
      x: {visible: true, style: '1px dashed rgba(140, 140, 140, 0.7)'},
      y: {visible: false},
    },
    tooltip: {
      show: true,
      // Для area по умолчанию tracking='area' (только над заливкой) — неудобно
      // при низких значениях; 'sticky' прилипает к ближайшей точке ряда.
      tracking: 'sticky',
      pinable: true,
      render: (data) => {
        const row = data.scales[0]?.rows[0];
        const raw = row && typeof row.originalValue === 'number' ? row.originalValue : row?.value;
        const value = typeof raw === 'number' ? `${raw.toFixed(1)} %` : 'нет данных';
        // Цвет маркера задаётся в CSS по теме страницы (тултип живёт в body,
        // вне класса темы yagr).
        return [
          `<div class="cpu-tooltip__time">${tooltipTimeFmt.format(data.x)}</div>`,
          '<div class="cpu-tooltip__row">',
          '<span class="cpu-tooltip__mark"></span>',
          `<span>CPU</span><span class="cpu-tooltip__value">${value}</span>`,
          '</div>',
        ].join('');
      },
    },
    legend: {show: false},
  };
}

/**
 * Интерактивный график загрузки CPU на yagr (canvas): десятки тысяч точек,
 * потоковая дозапись, авто-ресайз под контейнер, темы light/dark.
 */
export const CpuChart = forwardRef<CpuChartHandle, CpuChartProps>(function CpuChart(
  {theme, timeline, values},
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  // Исходные данные нужны только на момент создания инстанса.
  const initialDataRef = useRef({theme, timeline, values});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const {theme: initialTheme, timeline: t, values: v} = initialDataRef.current;
    const chart = new Yagr(root, buildConfig(initialTheme, t, v));
    chartRef.current = chart;

    return () => {
      // Освобождаем всё: ResizeObserver, слушатели событий, тултип, canvas.
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // Переключение темы без пересоздания графика и без потери данных.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.setTheme(theme);
    const colors = SERIES_COLORS[theme];
    const patch: Partial<RawSerieData<AreaSeriesOptions>> = {
      lineColor: colors.line,
      color: colors.fill,
    };
    chart.setSeries(SERIES_ID, patch);
    chart.redraw(true, false);
  }, [theme]);

  useImperativeHandle(
    ref,
    () => ({
      append(times, nextValues) {
        chartRef.current?.setSeries(times, [{id: SERIES_ID, data: nextValues}], {
          incremental: true,
          splice: true,
        });
      },
    }),
    [],
  );

  return <div className="yagr cpu-chart" ref={rootRef} />;
});
