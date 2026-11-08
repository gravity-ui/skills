import {useEffect, useRef, useState} from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import {useThemeType} from '@gravity-ui/uikit';

/** Генерирует стартовые данные за последние 24 часа с шагом ~3 секунды */
function generateInitialData(): uPlot.AlignedData {
  const now = Math.floor(Date.now() / 1000);
  const points = 28800; // ~28 800 точек — по одной каждые 3 секунды за сутки
  const xs = new Float64Array(points);
  const ys = new Float64Array(points);

  let prev = 50 + Math.random() * 10;
  for (let i = 0; i < points; i++) {
    xs[i] = now - (points - 1 - i) * 3;
    // Моделируем плавно меняющуюся нагрузку с несколькими пиками
    const t = i / points;
    const wave = Math.sin(t * 20) * 10 + Math.sin(t * 7) * 15 + Math.sin(t * 3) * 8;
    const noise = (Math.random() - 0.5) * 6;
    prev = Math.max(0, Math.min(100, prev * 0.97 + wave * 0.03 + noise));
    ys[i] = Math.round(prev * 10) / 10;
  }
  return [Array.from(xs), Array.from(ys)];
}

const OPTS_BASE: uPlot.Options = {
  width: 0, // автоширина через контейнер
  height: 400,
  ms: 1, // разрешение по времени — 1 мс
  legend: {show: false},
  cursor: {
    drag: {x: true, y: false},
    points: {size: 6},
    focus: {prox: 8},
  },
  axes: [
    {
      stroke: '#888',
      grid: {show: true, stroke: '#ddd', width: 1},
      ticks: {show: true},
    },
    {
      stroke: '#888',
      grid: {show: true, stroke: '#ddd', width: 1},
      ticks: {show: true},
      scale: '%',
      values: (_self: uPlot, ticks: number[]) =>
        ticks.map((v) => (v === 0 || v === 50 || v === 100 ? v + '%' : '')),
    },
  ],
  scales: {
    '%': {
      auto: false,
      range: [0, 100],
    },
  },
  series: [
    {},
    {
      label: 'CPU',
      stroke: '#3b82f6',
      width: 1.5,
      fill: 'rgba(59,130,246,0.12)',
      points: {show: false},
    },
  ],
};

function buildOpts(dark: boolean): uPlot.Options {
  const gridColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const tickColor = dark ? '#9ca3af' : '#6b7280';
  return {
    ...OPTS_BASE,
    axes: [
      {...OPTS_BASE.axes![0], stroke: tickColor, grid: {...OPTS_BASE.axes![0].grid, stroke: gridColor}},
      {...OPTS_BASE.axes![1], stroke: tickColor, grid: {...OPTS_BASE.axes![1].grid, stroke: gridColor}},
    ],
    cursor: {
      ...OPTS_BASE.cursor,
    },
  };
}

export function CpuChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const dataRef = useRef<uPlot.AlignedData>(generateInitialData());

  const themeType = useThemeType();
  const dark = themeType === 'dark';

  // Параметры графика зависят от темы
  const [opts, setOpts] = useState(() => buildOpts(dark));

  useEffect(() => {
    setOpts(buildOpts(dark));
  }, [dark]);

  // Создание и уничтожение графика
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const plot = new uPlot(
      {...opts, width: container.clientWidth, height: Math.min(400, container.clientHeight || 400)},
      dataRef.current,
      container,
    );
    plotRef.current = plot;

    // Реакция на ресайз контейнера
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        if (width > 0 && height > 0) {
          plot.setSize({width, height});
        }
      }
    });
    ro.observe(container);

    // Симуляция потоковых данных — каждые 3 секунды
    const interval = setInterval(() => {
      const [xs, ys] = dataRef.current;
      const lastX = xs[xs.length - 1] as number;
      const lastY = ys[ys.length - 1] as number;
      const newX = lastX + 3;
      // Скользящее окно: удаляем точки старше 24 часов
      const cutoff = newX - 86400;
      const newXs: number[] = [];
      const newYs: number[] = [];
      for (let i = 0; i < xs.length; i++) {
        if ((xs[i] as number) >= cutoff) {
          newXs.push(xs[i] as number);
          newYs.push(ys[i] as number);
        }
      }
      const newY = Math.max(0, Math.min(100, lastY * 0.95 + (Math.random() - 0.5) * 10));
      newXs.push(newX);
      newYs.push(Math.round(newY * 10) / 10);
      dataRef.current = [newXs, newYs];
      plot.setData(dataRef.current);
    }, 3000);

    return () => {
      clearInterval(interval);
      ro.disconnect();
      plot.destroy();
      plotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: 300,
        borderRadius: 12,
        overflow: 'hidden',
        background: dark ? '#111827' : '#ffffff',
        border: dark ? '1px solid #1f2937' : '1px solid #e5e7eb',
        boxSizing: 'border-box',
      }}
    />
  );
}
