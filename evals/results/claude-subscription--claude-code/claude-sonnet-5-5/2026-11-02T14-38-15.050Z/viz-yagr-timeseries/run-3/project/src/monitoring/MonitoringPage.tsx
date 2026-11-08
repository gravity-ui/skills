import React from 'react';
import {Card, Switch, Text} from '@gravity-ui/uikit';

import {CpuChart, type CpuChartLatest} from './CpuChart';
import {createMockCpuSource} from './cpuSource';

import './MonitoringPage.css';

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'});

export interface MonitoringPageProps {
  /** Тёмная ли тема. Переключатель показывается, только если передан onDarkChange. */
  dark?: boolean;
  onDarkChange?: (dark: boolean) => void;
}

export function MonitoringPage({dark = false, onDarkChange}: MonitoringPageProps) {
  // В реальном приложении здесь будет источник поверх API/WebSocket.
  const source = React.useMemo(() => createMockCpuSource({stepMs: 2000}), []);
  const [latest, setLatest] = React.useState<CpuChartLatest | null>(null);

  return (
    <div className="monitoring-page">
      <header className="monitoring-page__header">
        <Text variant="header-1" as="h1">
          Мониторинг
        </Text>
        {onDarkChange && (
          <Switch checked={dark} onUpdate={onDarkChange} content="Тёмная тема" />
        )}
      </header>

      <Card className="monitoring-page__card" type="container" view="outlined">
        <div className="monitoring-page__card-header">
          <div>
            <Text variant="subheader-2" as="h2" className="monitoring-page__title">
              Загрузка CPU
            </Text>
            <Text variant="body-1" color="secondary">
              За последние 24 часа · перетащите по графику, чтобы приблизить, двойной клик —
              сбросить
            </Text>
          </div>
          <div className="monitoring-page__latest">
            <Text variant="display-1">{latest ? `${latest.v.toFixed(1)}%` : '—'}</Text>
            <Text variant="caption-2" color="secondary">
              {latest ? `на ${timeFormatter.format(latest.t)}` : 'загрузка…'}
            </Text>
          </div>
        </div>

        <div className="monitoring-page__chart">
          <CpuChart source={source} onLatest={setLatest} />
        </div>
      </Card>
    </div>
  );
}
