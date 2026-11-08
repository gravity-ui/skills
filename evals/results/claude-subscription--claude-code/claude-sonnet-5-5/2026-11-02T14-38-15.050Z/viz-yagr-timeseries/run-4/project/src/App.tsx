import * as React from 'react';
import {Switch, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart/CpuLoadChart';
import type {CpuLoadChartHandle} from './CpuLoadChart/CpuLoadChart';
import {createCpuSource} from './mock/cpuSource';

export type AppTheme = 'light' | 'dark';

interface AppProps {
  theme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
}

/** Страница мониторинга. */
export function App({theme = 'light', onThemeChange}: AppProps) {
  // Источник создаётся один раз; в проде здесь — подписка на реальные метрики.
  const [source] = React.useState(() => createCpuSource());
  const chartRef = React.useRef<CpuLoadChartHandle>(null);
  const [current, setCurrent] = React.useState<number | null>(
    () => source.history[source.history.length - 1]?.v ?? null,
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      const fresh = source.poll(Date.now());
      if (fresh.length) {
        chartRef.current?.append(fresh);
        setCurrent(fresh[fresh.length - 1].v);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [source]);

  return (
    <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
        <Text variant="header-1" style={{flex: 1}}>
          Мониторинг
        </Text>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange?.(checked ? 'dark' : 'light')}
          content="Тёмная тема"
        />
      </div>

      <div
        style={{
          border: '1px solid var(--g-color-line-generic)',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12}}>
          <Text variant="subheader-2">Загрузка CPU, последние 24 часа</Text>
          <Text variant="body-2" color="secondary">
            сейчас: {current === null ? '—' : `${current.toFixed(1)}%`}
          </Text>
        </div>
        <Text variant="caption-2" color="secondary">
          Выделите область мышью, чтобы приблизить; двойной клик — сбросить масштаб.
        </Text>

        <div style={{height: 360, marginTop: 8}}>
          <CpuLoadChart ref={chartRef} initialData={source.history} />
        </div>
      </div>
    </div>
  );
}
