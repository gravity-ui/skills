import {useEffect, useRef} from 'react';
import Yagr from 'yagr';
import type {AreaSeriesOptions, MinimalValidConfig, RawSerieData} from 'yagr';

import {MAX_POINTS, cpuStore} from './cpuStore';

import 'yagr/dist/index.css';
import './cpuLoadChart.css';

export type ChartTheme = 'light' | 'dark';

/** Цвета линии провалидированы на контраст/читаемость для обеих поверхностей. */
const LINE_COLOR: Record<ChartTheme, string> = {
  light: '#4776e6',
  dark: '#5e8ef5',
};

export interface CpuLoadChartProps {
  theme: ChartTheme;
  /** Колбэк с последним значением — для индикатора текущей загрузки. */
  onCurrentValue?: (value: number | null) => void;
}

function buildConfig(theme: ChartTheme): MinimalValidConfig {
  const color = LINE_COLOR[theme];

  return {
    chart: {
      appereance: {theme, locale: 'ru'},
      // 100% контейнера по ширине и высоте + встроенный ResizeObserver
      size: {adaptive: true, resizeDebounceMs: 80},
      select: {zoom: true},
      timeMultiplier: 1,
    },
    // копии: yagr мутирует эти массивы при инкрементальных апдейтах
    timeline: [...cpuStore.timeline],
    series: [
      {
        id: 'cpu',
        name: 'Загрузка CPU',
        type: 'area',
        color,
        lineColor: color,
        lineWidth: 1.5,
        data: [...cpuStore.values],
        precision: 1,
        formatter: (value) =>
          value === null || value === undefined ? '—' : `${Number(value).toFixed(1)} %`,
      } as RawSerieData<AreaSeriesOptions>,
    ],
    scales: {
      y: {min: 0, max: 100},
    },
    axes: {
      y: {precision: 0},
    },
    tooltip: {
      show: true,
    },
  };
}

export function CpuLoadChart({theme, onCurrentValue}: CpuLoadChartProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const yagrRef = useRef<Yagr | null>(null);
  const onCurrentValueRef = useRef(onCurrentValue);
  onCurrentValueRef.current = onCurrentValue;

  // Создание графика. Пересоздаём только при смене темы —
  // данные при этом не теряются, т.к. живут в сторе.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const yagr = new Yagr(root, buildConfig(theme));
    yagrRef.current = yagr;

    return () => {
      yagrRef.current = null;
      // освобождает uPlot, ResizeObserver, слушатели мыши и DOM
      yagr.dispose();
    };
  }, [theme]);

  // Поток реального времени: дописываем точки прямо в данные uPlot.
  // setData(data, /* resetScales */ false) сохраняет текущий зум пользователя.
  useEffect(() => {
    const unsubscribe = cpuStore.subscribe((batch) => {
      const yagr = yagrRef.current;
      const last = batch.values[batch.values.length - 1] ?? null;
      onCurrentValueRef.current?.(typeof last === 'number' ? last : null);
      if (!yagr) {
        return;
      }

      const data = yagr.uplot.data as unknown as [number[], (number | null)[]];
      data[0].push(...batch.timeline);
      data[1].push(...batch.values);

      const extra = data[0].length - MAX_POINTS;
      if (extra > 0) {
        data[0].splice(0, extra);
        data[1].splice(0, extra);
      }

      yagr.uplot.setData(data, false);
    });

    cpuStore.start();

    return () => {
      unsubscribe();
      cpuStore.stop();
    };
  }, []);

  return <div ref={rootRef} className="cpu-load-chart" />;
}
