import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {ChartTheme, CpuChart, CpuChartHandle} from './components/CpuChart';
import {generateHistory, subscribeCpuStream} from './lib/cpuStream';

import './styles.css';

interface Stats {
  current: number;
  avg: number;
  max: number;
}

function calcStats(values: ArrayLike<number>, current: number): Stats {
  let sum = 0;
  let max = -Infinity;
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    sum += v;
    if (v > max) max = v;
  }
  return {current: values[values.length - 1], avg: sum / values.length, max};
}

function getSystemTheme(): ChartTheme {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

interface MonitoringPageProps {
  theme: ChartTheme;
  onToggleTheme: () => void;
}

function MonitoringPage({theme, onToggleTheme}: MonitoringPageProps) {
  const chartRef = useRef<CpuChartHandle>(null);

  // Ленивая инициализация: 86 400 точек истории генерируются один раз.
  const dataRef = useRef<{timeline: number[]; values: number[]} | null>(null);
  if (dataRef.current === null) {
    dataRef.current = generateHistory(Date.now());
  }
  const {timeline, values} = dataRef.current;

  const [stats, setStats] = useState<Stats>(() => calcStats(values, values[values.length - 1]));

  // Реалтайм-поток: раз в секунду дозаписываем точку в график (скользящее
  // окно внутри yagr) и обновляем статистику. Отписка при размонтировании
  // останавливает таймер.
  useEffect(() => {
    const unsubscribe = subscribeCpuStream(({time, value}) => {
      values.push(value);
      values.shift();
      chartRef.current?.append([time], [value]);
      setStats(calcStats(values, value));
    });
    return unsubscribe;
    // values — стабильная ссылка на массив из dataRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__title">
          <Text variant="header-1">Мониторинг</Text>
          <Text variant="body-2" color="secondary">
            prod-api-01 · выборка раз в секунду
          </Text>
        </div>
        <Button
          view="flat-secondary"
          size="l"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
        >
          <Icon data={theme === 'light' ? Moon : Sun} size={18} />
        </Button>
      </header>

      <Card view="outlined" className="chart-card">
        <div className="chart-card__head">
          <Text variant="subheader-2">Загрузка CPU за последние 24 часа</Text>
          <div className="chart-card__stats">
            <div className="stat">
              <span className="stat__value">{stats.current.toFixed(1)} %</span>
              <Text variant="caption-2" color="secondary">
                сейчас
              </Text>
            </div>
            <div className="stat">
              <span className="stat__value">{stats.avg.toFixed(1)} %</span>
              <Text variant="caption-2" color="secondary">
                среднее за 24 ч
              </Text>
            </div>
            <div className="stat">
              <span className="stat__value">{stats.max.toFixed(1)} %</span>
              <Text variant="caption-2" color="secondary">
                максимум
              </Text>
            </div>
          </div>
        </div>

        <div className="chart-card__frame">
          <CpuChart ref={chartRef} theme={theme} timeline={timeline} values={values} />
        </div>

        <Text variant="caption-2" color="secondary">
          Наведите курсор, чтобы увидеть значение · потяните по графику для
          увеличения участка · двойной клик — сбросить масштаб
        </Text>
      </Card>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<ChartTheme>(getSystemTheme);

  return (
    <ThemeProvider theme={theme}>
      <MonitoringPage
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />
    </ThemeProvider>
  );
}
