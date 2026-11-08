import {useCallback, useEffect, useMemo, useRef} from 'react';
import {Text, useThemeValue} from '@gravity-ui/uikit';
import YagrChart from '@gravity-ui/yagr/react';
import type Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, RawSerieData, YagrTheme} from '@gravity-ui/yagr';

import '@gravity-ui/yagr/index.css';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const STEP_MS = 1000;
const POINT_COUNT = WINDOW_MS / STEP_MS + 1;
const CPU_SERIES_ID = 'cpu';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildInitialData() {
  const now = Date.now();
  const timeline = new Array<number>(POINT_COUNT);
  const data = new Array<number>(POINT_COUNT);

  let value = 55;

  for (let index = 0; index < POINT_COUNT; index += 1) {
    timeline[index] = now - (POINT_COUNT - 1 - index) * STEP_MS;
    value = clamp(
      value + (Math.random() - 0.5) * 8 + Math.sin(index / 1200) * 2,
      2,
      98,
    );
    data[index] = Math.round(value * 10) / 10;
  }

  return {
    timeline,
    series: [
      {
        id: CPU_SERIES_ID,
        name: 'CPU',
        type: 'line',
        data,
      } satisfies RawSerieData,
    ],
  };
}

export function CpuLoadChart() {
  const themeValue = useThemeValue();
  const chartRef = useRef<Yagr | null>(null);
  const lastValueRef = useRef(55);

  const initialData = useMemo(() => {
    const data = buildInitialData();
    lastValueRef.current = data.series[0].data[data.series[0].data.length - 1] as number;
    return data;
  }, []);

  const config = useMemo<MinimalValidConfig>(
    () => ({
      timeline: initialData.timeline,
      series: initialData.series,
      chart: {
        size: {
          adaptive: true,
          height: 320,
        },
        timeMultiplier: 1,
        appearance: {
          theme: themeValue as YagrTheme,
          locale: 'ru',
        },
      },
      axes: {
        x: {
          precision: 0,
        },
        y: {
          precision: 0,
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
        },
      },
    }),
    [themeValue, initialData],
  );

  const handleChartLoad = useCallback((chart: Yagr) => {
    chartRef.current = chart;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }

      const previous = lastValueRef.current;
      const value = Math.round(clamp(previous + (Math.random() - 0.5) * 8, 0, 100) * 10) / 10;
      lastValueRef.current = value;

      chart.setSeries(
        [Date.now()],
        [
          {
            id: CPU_SERIES_ID,
            data: [value],
          },
        ],
        {
          incremental: true,
          splice: true,
        },
      );
    }, STEP_MS);

    return () => {
      window.clearInterval(timer);
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="cpu-load-chart">
      <div className="cpu-load-chart__header">
        <Text variant="subheader-2" color="secondary">
          Загрузка CPU
        </Text>
        <Text variant="caption-2" color="hint">
          за последние сутки
        </Text>
      </div>
      <div className="cpu-load-chart__canvas">
        <YagrChart
          id="cpu-load-chart"
          config={config}
          update="dynamic"
          onChartLoad={handleChartLoad}
          className="cpu-load-chart__yagr"
        />
      </div>
    </div>
  );
}
