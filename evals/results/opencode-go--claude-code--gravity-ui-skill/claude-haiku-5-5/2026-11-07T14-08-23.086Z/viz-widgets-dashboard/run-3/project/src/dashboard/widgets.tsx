import React from 'react';
import {Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {Chart} from '@gravity-ui/charts';
import {Bars, ChartLine, ChartPie, Persons, ShoppingCart} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';

import {KPI_METRICS, KpiMetricId, RECENT_EVENTS, REVENUE_BY_MONTH} from './mockData';

// Fills the dashkit grid cell: the cell has a definite height, the card stretches to it.
const WidgetFrame = ({children}: {children: React.ReactNode}) => (
  <Card view="outlined" size="m" style={{height: '100%', boxSizing: 'border-box', overflow: 'hidden'}}>
    <Flex direction="column" gap={3} style={{height: '100%', minHeight: 0}}>
      {children}
    </Flex>
  </Card>
);

const KPI_ICONS: Record<KpiMetricId, IconData> = {
  revenue: ChartLine,
  orders: ShoppingCart,
  customers: Persons,
  avgCheck: ChartPie,
};

export const KpiWidget = ({metric}: {metric: KpiMetricId}) => {
  const data = KPI_METRICS[metric];
  return (
    <WidgetFrame>
      <Flex alignItems="center" gap={2} style={{flexShrink: 0}}>
        <Icon data={KPI_ICONS[metric]} size={16} />
        <Text variant="subheader-1" color="secondary" ellipsis>
          {data.title}
        </Text>
      </Flex>
      <Flex direction="column" gap={1} style={{flex: 1, minHeight: 0, justifyContent: 'center'}}>
        <Text variant="display-1" ellipsis>
          {data.value}
        </Text>
        <Text variant="body-1" color={data.positive ? 'positive' : 'danger'}>
          {data.delta} к прошлому периоду
        </Text>
      </Flex>
    </WidgetFrame>
  );
};

const REVENUE_CHART_DATA = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Выручка, тыс. ₽',
        data: REVENUE_BY_MONTH.map((point) => ({x: point.month, y: point.revenue})),
      },
    ],
  },
  xAxis: {type: 'category' as const},
};

export const ChartWidget = () => (
  <WidgetFrame>
    <Flex alignItems="center" gap={2} style={{flexShrink: 0}}>
      <Icon data={Bars} size={16} />
      <Text variant="subheader-1" color="secondary" ellipsis>
        Динамика выручки
      </Text>
    </Flex>
    <div style={{flex: 1, minHeight: 0}}>
      <Chart data={REVENUE_CHART_DATA} />
    </div>
  </WidgetFrame>
);

export const ActivityWidget = () => (
  <WidgetFrame>
    <Text variant="subheader-1" color="secondary" style={{flexShrink: 0}}>
      Последние события
    </Text>
    <Flex direction="column" gap={2} style={{flex: 1, minHeight: 0, overflow: 'auto'}}>
      {RECENT_EVENTS.map((event) => (
        <Flex key={`${event.time}-${event.text}`} gap={3} alignItems="flex-start">
          <Text variant="caption-2" color="hint" style={{flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>
            {event.time}
          </Text>
          <Text variant="body-1" style={{flex: 1, minWidth: 0}}>
            {event.text}
          </Text>
        </Flex>
      ))}
    </Flex>
  </WidgetFrame>
);
