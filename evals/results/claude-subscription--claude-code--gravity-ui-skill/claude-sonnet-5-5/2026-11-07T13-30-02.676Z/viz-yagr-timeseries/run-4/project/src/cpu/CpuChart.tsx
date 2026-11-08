import './CpuChart.css';
import '@gravity-ui/yagr/index.css';

import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {RawSerieData, YagrTheme} from '@gravity-ui/yagr';
import {useThemeType, useThemeValue} from '@gravity-ui/uikit';

import {DAY_MS} from './cpuSource';
import type {CpuPoints, CpuSource} from './cpuSource';

const SERIES_ID = 'cpu';
/** Окно обрезается пачкой, а не на каждый тик — иначе пришлось бы перерисовывать всё каждый кадр. */
const TRIM_SLACK_MS = 60_000;

const YAGR_THEMES: readonly string[] = ['light', 'dark', 'light-hc', 'dark-hc'];

export interface CpuChartProps {
  source: CpuSource;
  className?: string;
}

function resolveYagrTheme(themeValue: string, themeType: 'light' | 'dark'): YagrTheme {
  return YAGR_THEMES.includes(themeValue) ? (themeValue as YagrTheme) : themeType;
}

/** Канвас не понимает CSS-переменные — резолвим токен в конкретный цвет текущей темы. */
function readSeriesColor(element: HTMLElement): string {
  return getComputedStyle(element).getPropertyValue('--g-color-line-brand').trim() || 'currentColor';
}

function buildConfig(points: CpuPoints, theme: YagrTheme, color: string) {
  return {
    timeline: points.timeline,
    series: [
      {
        id: SERIES_ID,
        name: 'CPU',
        type: 'area' as const,
        data: points.values,
        color,
        lineColor: color,
        lineWidth: 1.5,
        precision: 1,
        formatter: (v: string | number | null) => (v === null ? '—' : `${v}%`),
      },
    ],
    scales: {y: {min: 0, max: 100}},
    axes: {
      y: {
        values: (_u: unknown, ticks: number[]) => ticks.map((v) => `${v}%`),
      },
    },
    legend: {show: false},
    chart: {
      size: {adaptive: true},
      appearance: {theme},
    },
  };
}

export function CpuChart({source, className}: CpuChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<Yagr | null>(null);

  const themeValue = useThemeValue();
  const themeType = useThemeType();
  const yagrTheme = resolveYagrTheme(themeValue, themeType);
  // Актуальная тема нужна эффекту создания графика, но смена темы не должна его пересоздавать.
  const yagrThemeRef = React.useRef(yagrTheme);
  yagrThemeRef.current = yagrTheme;

  // Создание графика, подписка на поток и полное освобождение ресурсов.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return undefined;
    }

    // Зеркало данных у нас: Yagr мутирует переданные массивы при инкрементальных обновлениях.
    const history = source.getHistory();
    let timeline = history.timeline;
    let values = history.values;

    const chart = new Yagr(
      canvas,
      buildConfig(
        {timeline: timeline.slice(), values: values.slice()},
        yagrThemeRef.current,
        readSeriesColor(container),
      ),
    );
    chartRef.current = chart;

    let pendingTimeline: number[] = [];
    let pendingValues: number[] = [];
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (!pendingTimeline.length) {
        return;
      }
      const addT = pendingTimeline;
      const addV = pendingValues;
      pendingTimeline = [];
      pendingValues = [];

      // Конкатенация/срез дешевле, чем push(...big) — спред больших массивов может переполнить стек.
      timeline = timeline.concat(addT);
      values = values.concat(addV);

      const lastT = timeline[timeline.length - 1];
      const windowStart = lastT - DAY_MS;
      if (timeline[0] < windowStart - TRIM_SLACK_MS) {
        // Редкий путь: сдвигаем окно суток и перерисовываем целиком.
        let cut = 0;
        while (cut < timeline.length && timeline[cut] < windowStart) {
          cut++;
        }
        timeline = timeline.slice(cut);
        values = values.slice(cut);
        chart.setSeries(timeline.slice(), [{id: SERIES_ID, data: values.slice()}], {
          incremental: false,
        });
      } else {
        // Частый путь: дописываем только новые точки.
        chart.setSeries(addT, [{id: SERIES_ID, data: addV}], {incremental: true});
      }
    };

    // Пачка точек за кадр -> одна перерисовка, независимо от частоты входящих данных.
    const unsubscribe = source.subscribe((points) => {
      for (let i = 0; i < points.timeline.length; i++) {
        pendingTimeline.push(points.timeline[i]);
        pendingValues.push(points.values[i]);
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
      pendingTimeline = [];
      pendingValues = [];
      chartRef.current = null;
      // Снимает ResizeObserver, tooltip в document.body, легенду и uPlot (канвас + слушатели).
      chart.dispose();
    };
  }, [source]);

  // Смена темы: ждём кадр, чтобы ThemeProvider успел применить класс темы и токены резолвились верно.
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const chart = chartRef.current;
      const container = containerRef.current;
      if (!chart || !container) {
        return;
      }
      const color = readSeriesColor(container);
      chart.setTheme(yagrTheme);
      // lineColor есть только у area-серий и отсутствует в общем типе RawSerieData.
      const patch = {color, lineColor: color} as Partial<RawSerieData>;
      chart.setSeries(SERIES_ID, patch);
    });
    return () => cancelAnimationFrame(frame);
  }, [yagrTheme, source]);

  return (
    <div ref={containerRef} className={['cpu-chart', className].filter(Boolean).join(' ')}>
      <div ref={canvasRef} className="cpu-chart__canvas" />
    </div>
  );
}
