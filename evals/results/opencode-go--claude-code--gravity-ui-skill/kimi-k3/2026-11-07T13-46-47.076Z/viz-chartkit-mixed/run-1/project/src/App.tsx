import React from 'react';

import {Card, Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {createMonitoringData, createSalesData} from './data/mockData';
import {VizWidget} from './widget/VizWidget';
import type {VizWidgetMode} from './widget/types';

const MODE_OPTIONS = [
  {value: 'sales' as const, content: 'Продажи'},
  {value: 'monitoring' as const, content: 'Мониторинг'},
];

const MODE_TITLE: Record<VizWidgetMode, string> = {
  sales: 'Продажи по категориям за 2025 год',
  monitoring: 'Загрузка CPU узлов кластера',
};

export function App() {
  const [mode, setMode] = React.useState<VizWidgetMode>('sales');
  const salesData = React.useMemo(createSalesData, []);
  const monitoringData = React.useMemo(createMonitoringData, []);

  return (
    <div style={{maxWidth: 960, margin: '0 auto', padding: 'var(--g-spacing-6)'}}>
      <Card spacing={{p: 5}}>
        <Flex direction="column" gap={4}>
          <Flex alignItems="center" gap={3} wrap="wrap">
            <div style={{flex: 1, minWidth: 0}}>
              <Text variant="header-1" as="h1">
                Виджет визуализации
              </Text>
            </div>
            <div style={{flexShrink: 0}}>
              <SegmentedRadioGroup
                value={mode}
                onUpdate={setMode}
                options={MODE_OPTIONS}
                aria-label="Режим виджета"
              />
            </div>
          </Flex>
          {mode === 'sales' ? (
            <VizWidget mode="sales" title={MODE_TITLE.sales} data={salesData} />
          ) : (
            <VizWidget mode="monitoring" title={MODE_TITLE.monitoring} data={monitoringData} />
          )}
        </Flex>
      </Card>
    </div>
  );
}
