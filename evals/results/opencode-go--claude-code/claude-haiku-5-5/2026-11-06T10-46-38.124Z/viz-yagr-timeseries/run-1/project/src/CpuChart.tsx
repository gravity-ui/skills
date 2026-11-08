import {useEffect, useRef} from 'react';
import Yagr, {
  type AreaSeriesOptions,
  type ExtendedSeriesOptions,
  type MinimalValidConfig,
} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {useThemeType} from '@gravity-ui/uikit';

import {CHART_PALETTE, type ChartPalette, type ChartThemeType} from './chartPalette';
import type {CpuFeed} from './cpuFeed';

const SERIES_ID = 'cpu';
const Y_TICKS = [0, 25, 50, 75, 100];
// Окно — сутки: достаточно часов и минут без секунд.
const HOUR_MINUTE = new Intl.DateTimeFormat('ru', {hour: '2-digit', minute: '2-digit'});

function axisStyle(palette: ChartPalette) {
  return {
    stroke: palette.axisText,
    grid: {show: true, stroke: palette.grid, width: 1},
    ticks: {show: true, stroke: palette.axisBaseline, width: 1, size: 4},
  };
}

function cpuSeries(
  palette: ChartPalette,
  values: number[],
): AreaSeriesOptions & ExtendedSeriesOptions {
  return {
    id: SERIES_ID,
    name: 'Загрузка CPU',
    type: 'area',
    data: values,
    // Для area: color — заливка, lineColor/lineWidth — линия поверх.
    color: palette.seriesFill,
    lineColor: palette.seriesLine,
    lineWidth: 2,
    formatter: (value) => (value === null ? '—' : `${Number(value).toFixed(1)}%`),
  };
}

function buildConfig(
  palette: ChartPalette,
  theme: ChartThemeType,
  times: number[],
  values: number[],
): MinimalValidConfig {
  return {
    chart: {
      appearance: {theme, locale: 'ru'},
      // Ресайз ведём сами (см. эффект ниже): встроенный debounce Yagr не отменяется в dispose().
      size: {adaptive: false},
      // Таймстемпы в миллисекундах.
      timeMultiplier: 1,
      // Для потока в реальном времени зум по умолчанию мешает: авто-диапазон сбрасывает его.
      select: {zoom: false},
    },
    legend: {show: false},
    tooltip: {show: true},
    // Курсор: вертикальный hairline к ближайшей точке по X; маркер на линии — 8px.
    cursor: {
      markersSize: 8,
      x: {visible: true, style: `1px solid ${palette.crosshair}`},
      y: {visible: false},
    },
    markers: {show: false},
    scales: {y: {min: 0, max: 100}},
    axes: {
      x: {
        ...axisStyle(palette),
        values: (_u, ticks) => ticks.map((t) => HOUR_MINUTE.format(t)),
      },
      y: {
        ...axisStyle(palette),
        splits: Y_TICKS,
        values: (_u, splits) => splits.map((v) => `${v}%`),
      },
    },
    timeline: times,
    series: [cpuSeries(palette, values)],
  };
}

export interface CpuChartProps {
  feed: CpuFeed;
}

export function CpuChart({feed}: CpuChartProps) {
  const themeType = useThemeType();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const palette = CHART_PALETTE[themeType];
    const {times, values} = feed.getHistory();
    const chart = new Yagr(host, buildConfig(palette, themeType, times, values));

    // Новые сэмплы дописываются в скользящее окно без пересоздания графика.
    const unsubscribe = feed.subscribe(({time, value}) => {
      chart.setSeries([time], [{id: SERIES_ID, data: [value]}], {
        incremental: true,
        splice: true,
      });
    });

    // Размер берём из контейнера; перерисовка — один раз за кадр.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        chart.reflow();
      });
    });
    observer.observe(host);

    return () => {
      observer.disconnect();
      if (frame) {
        cancelAnimationFrame(frame);
      }
      unsubscribe();
      chart.dispose();
    };
  }, [feed, themeType]);

  return <div ref={hostRef} className="cpu-chart" />;
}
