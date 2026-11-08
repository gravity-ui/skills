import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitWidget} from '@gravity-ui/chartkit';
import {Card, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

export type SalesWidgetMode = 'sales' | 'monitoring';

export interface SalesWidgetProps {
  mode?: SalesWidgetMode;
  onModeChange?: (mode: SalesWidgetMode) => void;
}

const salesData = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Продажи, руб.',
        data: [
          {x: 'Jan', y: 420000},
          {x: 'Feb', y: 510000},
          {x: 'Mar', y: 480000},
          {x: 'Apr', y: 640000},
          {x: 'May', y: 730000},
          {x: 'Jun', y: 690000},
        ],
      },
    ],
  },
  yAxis: [
    {
      type: 'linear',
      title: {text: 'Сумма, руб.'},
    },
  ],
} satisfies ChartKitWidget['gravity-charts']['data'];

const monitoringTimeline: number[] = [];
const monitoringValues: number[] = [];
const now = Date.now();

for (let i = 0; i < 120; i += 1) {
  monitoringTimeline.push(now - (120 - i) * 1000);
  monitoringValues.push(50 + Math.sin(i / 8) * 12 + (i % 13));
}

const monitoringData = {
  data: {
    graphs: [
      {
        id: 'requests',
        name: 'RPS',
        color: '#528BFF',
        data: monitoringValues,
      },
    ],
    timeline: monitoringTimeline,
  },
  libraryConfig: {
    title: {
      text: 'Нагрузка, запросов/сек',
    },
  },
} satisfies ChartKitWidget['yagr']['data'];

export function SalesWidget({mode = 'sales', onModeChange}: SalesWidgetProps) {
  return (
    <Card view="outlined" style={{padding: 16}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text variant="header-1">Виджет визуализации</Text>
        <SegmentedRadioGroup
          value={mode}
          onUpdate={(value) => onModeChange?.(value as SalesWidgetMode)}
        >
          <SegmentedRadioGroup.Option value="sales" content="Продажи" />
          <SegmentedRadioGroup.Option value="monitoring" content="Мониторинг" />
        </SegmentedRadioGroup>
      </div>
      <div style={{height: 360}}>
        <ChartKit
          type={mode === 'sales' ? 'gravity-charts' : 'yagr'}
          data={mode === 'sales' ? salesData : monitoringData}
        />
      </div>
    </Card>
  );
}
