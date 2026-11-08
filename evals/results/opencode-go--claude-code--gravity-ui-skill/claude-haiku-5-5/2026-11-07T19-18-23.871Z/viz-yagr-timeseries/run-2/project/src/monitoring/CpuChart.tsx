import {useEffect, useRef} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import Yagr, {type MinimalValidConfig} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import type {CpuSampleSource, CpuSamples} from './cpuSource';
import './CpuChart.css';

const SERIES_ID = 'cpu';

interface CpuChartProps {
  source: CpuSampleSource;
}

/**
 * Интерактивный график загрузки CPU на canvas (yagr). Растягивается по контейнеру.
 * Новые точки добавляются в уже созданный график, без полной перерисовки.
 */
export function CpuChart({source}: CpuChartProps) {
  const theme = useThemeType();
  // yagr задаёт цвета при конфигурации, поэтому при смене темы график пересоздаётся.
  // Ключ по теме заставляет React полностью размонтировать старый график (dispose) и смонтировать новый.
  return <CpuChartInstance key={theme} source={source} theme={theme} />;
}

interface CpuChartInstanceProps {
  source: CpuSampleSource;
  theme: 'light' | 'dark';
}

function CpuChartInstance({source, theme}: CpuChartInstanceProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    // snapshot() возвращает копии, поэтому yagr может безопасно изменять свои массивы.
    const chart = new Yagr(root, buildConfig(source.snapshot(), theme));

    // Подписка сразу после создания графика: в одном синхронном блоке дельты не теряются.
    const unsubscribe = source.subscribe((appended: CpuSamples) => {
      // incremental + splice: дописываем точки в конец и удаляем столько же из начала.
      // Окно остаётся постоянным, uPlot не пересоздаётся.
      chart.setSeries(
        appended.timeline,
        [{id: SERIES_ID, data: appended.values}],
        {incremental: true, splice: true},
      );
    });

    return () => {
      unsubscribe();
      chart.dispose();
    };
  }, [source, theme]);

  return <div ref={rootRef} className="cpu-chart" />;
}

function buildConfig(samples: CpuSamples, theme: 'light' | 'dark'): MinimalValidConfig {
  return {
    chart: {
      appearance: {theme, locale: 'ru'},
    },
    timeline: samples.timeline,
    series: [
      {
        id: SERIES_ID,
        name: 'CPU',
        type: 'line',
        // Токен темы Gravity UI: yagr резолвит var(--…) через computed style, цвет совпадает с темой.
        color: 'var(--g-color-line-brand)',
        data: samples.values,
        formatter: (value) => (value === null || value === '' ? '—' : `${Number(value).toFixed(1)}%`),
      },
    ],
    scales: {
      y: {min: 0, max: 100},
    },
    legend: {show: false},
  };
}
