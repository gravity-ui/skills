import React from 'react';
import {DashKit} from '@gravity-ui/dashkit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import {Card, Flex, Icon, Lang, Text, configure} from '@gravity-ui/uikit';

import {
  KPI_DATA,
  ORDERS_BY_CHANNEL,
  RECENT_ACTIVITY,
  REVENUE_BY_MONTH,
} from './data';
import type {KpiMetric} from './data';

// Widget type identifiers stored in the dashboard config.
export const WIDGET_TYPES = {
  kpi: 'kpi',
  revenueChart: 'revenue-chart',
  channelsChart: 'channels-chart',
  activity: 'activity',
} as const;

// ---------- Shared frame -------------------------------------------------

function WidgetFrame({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Card view="outlined" size="l" spacing={{p: 4}} style={{height: '100%', boxSizing: 'border-box', overflow: 'hidden'}}>
      <Flex direction="column" gap={3} style={{height: '100%', minHeight: 0}}>
        <Text variant="subheader-2" ellipsisLines={1} style={{flexShrink: 0}}>
          {title}
        </Text>
        <Flex direction="column" gap={2} style={{flex: 1, minHeight: 0}}>
          {children}
        </Flex>
      </Flex>
    </Card>
  );
}

// ---------- Widgets ------------------------------------------------------

const ruNumber = new Intl.NumberFormat('ru-RU', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
});

function KpiWidget({metric}: {metric: KpiMetric}) {
  const kpi = KPI_DATA[metric];
  const isUp = kpi.delta >= 0;
  // Direction is conveyed by the arrow icon and the signed text, not by color alone.
  return (
    <WidgetFrame title={kpi.label}>
      <Text variant="header-1" ellipsisLines={1}>
        {kpi.value}
      </Text>
      <Flex alignItems="center" gap={1} style={{flexShrink: 0}}>
        <Icon data={isUp ? ArrowUp : ArrowDown} size={14} />
        <Text variant="body-2" color="secondary" ellipsisLines={1}>
          {`${ruNumber.format(kpi.delta)} % к прошлому периоду`}
        </Text>
      </Flex>
    </WidgetFrame>
  );
}

const REVENUE_CHART_DATA: ChartData = {
  xAxis: {type: 'category', categories: REVENUE_BY_MONTH.map((d) => d.month)},
  series: {
    data: [
      {
        type: 'line',
        name: 'Выручка, млн ₽',
        data: REVENUE_BY_MONTH.map((d) => ({x: d.month, y: d.revenue})),
      },
    ],
  },
};

function RevenueChartWidget() {
  return (
    <WidgetFrame title="Выручка по месяцам">
      <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
        <Chart data={REVENUE_CHART_DATA} />
      </div>
    </WidgetFrame>
  );
}

const CHANNELS_CHART_DATA: ChartData = {
  xAxis: {type: 'category', categories: ORDERS_BY_CHANNEL.map((d) => d.channel)},
  series: {
    data: [
      {
        type: 'bar-x',
        name: 'Заказы',
        data: ORDERS_BY_CHANNEL.map((d) => ({x: d.channel, y: d.orders})),
      },
    ],
  },
};

function ChannelsChartWidget() {
  return (
    <WidgetFrame title="Заказы по каналам">
      <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
        <Chart data={CHANNELS_CHART_DATA} />
      </div>
    </WidgetFrame>
  );
}

function ActivityWidget() {
  return (
    <WidgetFrame title="Последние события">
      {RECENT_ACTIVITY.map((entry) => (
        <Flex key={`${entry.time}-${entry.text}`} alignItems="baseline" gap={2}>
          <Text variant="caption-2" color="secondary" style={{flexShrink: 0}}>
            {entry.time}
          </Text>
          <Text variant="body-1" ellipsisLines={1} style={{flex: 1, minWidth: 0}}>
            {entry.text}
          </Text>
        </Flex>
      ))}
    </WidgetFrame>
  );
}

// ---------- DashKit registration ----------------------------------------

/**
 * Configures DashKit and Gravity UI language, and registers the widget plugins.
 * Must run once before the first <DashKit> render.
 */
export function setupDashboard() {
  configure({lang: Lang.Ru});

  DashKit.setSettings({
    gridLayout: {margin: [12, 12]},
  });

  DashKit.registerPlugins(
    {
      type: WIDGET_TYPES.kpi,
      defaultLayout: {w: 9, h: 4},
      renderer: (props: PluginWidgetProps) => (
        <KpiWidget metric={props.data.metric as KpiMetric} />
      ),
    },
    {
      type: WIDGET_TYPES.revenueChart,
      defaultLayout: {w: 22, h: 10},
      renderer: () => <RevenueChartWidget />,
    },
    {
      type: WIDGET_TYPES.channelsChart,
      defaultLayout: {w: 14, h: 10},
      renderer: () => <ChannelsChartWidget />,
    },
    {
      type: WIDGET_TYPES.activity,
      defaultLayout: {w: 18, h: 8},
      renderer: () => <ActivityWidget />,
    },
  );
}
