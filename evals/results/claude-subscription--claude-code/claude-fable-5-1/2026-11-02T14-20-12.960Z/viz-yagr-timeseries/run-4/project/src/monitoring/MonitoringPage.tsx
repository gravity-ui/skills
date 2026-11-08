import './MonitoringPage.css';

import React from 'react';
import {Card, SegmentedRadioGroup, Text, useTheme, type Theme} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {DEFAULT_INTERVAL_MS, SimulatedCpuLoadSource, type CpuLoadSource} from './cpuLoadSource';
import {formatPercent, formatTime} from './format';

export interface MonitoringPageProps {
  /** Если передан, в шапке появляется переключатель темы. */
  onThemeChange?: (theme: Theme) => void;
}

/** Создаёт симулятор телеметрии на время жизни страницы. В проде сюда подставляется реальный транспорт. */
function useSimulatedSource(): SimulatedCpuLoadSource {
  const [source] = React.useState(() => new SimulatedCpuLoadSource({intervalMs: DEFAULT_INTERVAL_MS}));
  React.useEffect(() => {
    source.start();
    return () => source.stop();
  }, [source]);
  return source;
}

interface CpuLoadStats {
  current: number | null;
  updatedAt: number | null;
  average: number | null;
  peak: number | null;
}

/** Сводка по окну: значения доступны текстом, без наведения на график. */
function useCpuLoadStats(source: CpuLoadSource): CpuLoadStats {
  const compute = React.useCallback((): CpuLoadStats => {
    const {timeline, values} = source.getSnapshot();
    if (values.length === 0) {
      return {current: null, updatedAt: null, average: null, peak: null};
    }
    let sum = 0;
    let peak = -Infinity;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (values[i] > peak) {
        peak = values[i];
      }
    }
    return {
      current: values[values.length - 1],
      updatedAt: timeline[timeline.length - 1],
      average: sum / values.length,
      peak,
    };
  }, [source]);

  const [stats, setStats] = React.useState<CpuLoadStats>(compute);

  React.useEffect(() => {
    setStats(compute());
    // Пересчёт не чаще раза в секунду: сводка не должна конкурировать с отрисовкой графика.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = source.subscribe(() => {
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          setStats(compute());
        }, 1000);
      }
    });
    return () => {
      unsubscribe();
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [source, compute]);

  return stats;
}

export function MonitoringPage({onThemeChange}: MonitoringPageProps) {
  const theme = useTheme();
  const source = useSimulatedSource();
  const stats = useCpuLoadStats(source);

  return (
    <div className="monitoring-page">
      <header className="monitoring-page__header">
        <Text variant="header-2" as="h1" className="monitoring-page__title">
          Мониторинг
        </Text>
        {onThemeChange ? (
          <SegmentedRadioGroup<Theme> size="m" value={theme} onUpdate={onThemeChange} aria-label="Тема">
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
        ) : null}
      </header>

      <Card type="container" view="outlined" className="monitoring-page__card">
        <div className="monitoring-page__card-header">
          <div>
            <Text variant="subheader-3" as="h2" className="monitoring-page__card-title">
              Загрузка CPU
            </Text>
            <Text variant="body-1" color="secondary">
              Последние 24 часа, точка каждые {DEFAULT_INTERVAL_MS / 1000} с
            </Text>
          </div>
          <dl className="monitoring-page__stats">
            <div className="monitoring-page__stat">
              <dt>Сейчас</dt>
              <dd className="monitoring-page__stat-value_primary">{formatPercent(stats.current)}</dd>
            </div>
            <div className="monitoring-page__stat">
              <dt>Среднее</dt>
              <dd>{formatPercent(stats.average)}</dd>
            </div>
            <div className="monitoring-page__stat">
              <dt>Пик</dt>
              <dd>{formatPercent(stats.peak)}</dd>
            </div>
            <div className="monitoring-page__stat">
              <dt>Обновлено</dt>
              <dd>{stats.updatedAt === null ? '—' : formatTime(stats.updatedAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="monitoring-page__chart">
          <CpuLoadChart source={source} />
        </div>
      </Card>
    </div>
  );
}
