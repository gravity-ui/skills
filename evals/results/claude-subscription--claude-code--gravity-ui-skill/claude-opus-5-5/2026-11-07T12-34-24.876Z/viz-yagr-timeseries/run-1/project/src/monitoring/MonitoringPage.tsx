import './MonitoringPage.css';

import * as React from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {createMockCpuLoadSource} from './cpuLoadSource';
import type {CpuLoadSource} from './cpuLoadSource';

export interface MonitoringPageProps {
  /** Источник данных CPU; по умолчанию — мок. Замените на реальный API/WebSocket. */
  cpuLoadSource?: CpuLoadSource;
}

export function MonitoringPage({cpuLoadSource}: MonitoringPageProps) {
  // Источник должен быть стабильным: смена ссылки перезагружает историю и переподписывается.
  const defaultSource = React.useMemo(() => createMockCpuLoadSource(), []);
  const source = cpuLoadSource ?? defaultSource;

  return (
    <Flex direction="column" gap={5} className="monitoring-page">
      <Text variant="header-1">Мониторинг</Text>
      <Card view="outlined" spacing={{p: 4}} className="monitoring-page__cpu-card">
        <CpuLoadChart source={source} />
      </Card>
    </Flex>
  );
}
