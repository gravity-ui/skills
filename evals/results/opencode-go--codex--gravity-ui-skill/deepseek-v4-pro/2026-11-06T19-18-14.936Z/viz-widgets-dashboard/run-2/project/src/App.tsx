import { useCallback, useState } from 'react';
import {
  DashKit,
  DashKitDnDWrapper,
  ActionPanel,
  pluginTitle,
  pluginText,
} from '@gravity-ui/dashkit';
import { Heading, TextAlignLeft, ChartBar, ChartColumn } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import type {
  Config,
  ActionPanelItem,
  ItemDropProps,
  Plugin,
  PluginWidgetProps,
  SetConfigItem,
} from '@gravity-ui/dashkit';

import './App.css';

// ─── Plugin: StatsCard ──────────────────────────────────────────────────────

function StatsCard({ data }: PluginWidgetProps<{ label: string; value: string }>) {
  return (
    <div className="stats-card">
      <span className="stats-card__value">{String(data.value ?? '??')}</span>
      <span className="stats-card__label">{String(data.label ?? 'Metric')}</span>
    </div>
  );
}

const pluginStatsCard: Plugin = {
  type: 'statsCard',
  defaultLayout: { w: 10, h: 4, minW: 6, minH: 3 },
  renderer: (props) => <StatsCard {...props} />,
};

// ─── Plugin: ChartPlaceholder ───────────────────────────────────────────────

function ChartPlaceholder({ data }: PluginWidgetProps<{ chartType?: string }>) {
  return (
    <div className="chart-placeholder">
      <div className="chart-placeholder__box">
        <svg className="chart-placeholder__icon" viewBox="0 0 64 64" fill="none">
          <rect x="6" y="34" width="12" height="24" rx="2" fill="var(--g-color-base-brand)" opacity="0.6" />
          <rect x="26" y="18" width="12" height="40" rx="2" fill="var(--g-color-base-brand)" opacity="0.8" />
          <rect x="46" y="6" width="12" height="52" rx="2" fill="var(--g-color-base-brand)" />
        </svg>
        <span className="chart-placeholder__label">
          {String(data.chartType ?? 'Bar Chart')}
        </span>
      </div>
    </div>
  );
}

const pluginChartPlaceholder: Plugin = {
  type: 'chartPlaceholder',
  defaultLayout: { w: 14, h: 6, minW: 8, minH: 4 },
  renderer: (props) => <ChartPlaceholder {...props} />,
};

// ═════════════════════════════════════════════════════════════════════════════

DashKit.setSettings({
  gridLayout: { margin: [8, 8] },
});

DashKit.registerPlugins(
  pluginTitle,
  pluginText,
  pluginStatsCard,
  pluginChartPlaceholder,
);

// ── Initial config ──────────────────────────────────────────────────────────

function createInitialConfig(): Config {
  return {
    salt: String(Math.random()),
    counter: 6,
    items: [
      {
        id: 'title_1',
        type: 'title',
        namespace: 'default',
        orderId: 0,
        data: { text: 'Dashboard', size: 'l' as const, showInTOC: false },
      },
      {
        id: 'stats_1',
        type: 'statsCard',
        namespace: 'default',
        orderId: 1,
        data: { label: 'Active Users', value: '2,847' },
      },
      {
        id: 'stats_2',
        type: 'statsCard',
        namespace: 'default',
        orderId: 2,
        data: { label: 'Revenue', value: '$48.2K' },
      },
      {
        id: 'stats_3',
        type: 'statsCard',
        namespace: 'default',
        orderId: 3,
        data: { label: 'Conversion', value: '12.4%' },
      },
      {
        id: 'text_1',
        type: 'text',
        namespace: 'default',
        orderId: 4,
        data: {
          text: '### Overview\n\nWelcome to your dashboard. Drag, resize, and arrange widgets freely. '
              + 'Use the panel on the right to add new widgets.',
        },
      },
      {
        id: 'chart_1',
        type: 'chartPlaceholder',
        namespace: 'default',
        orderId: 5,
        data: { chartType: 'Bar Chart' },
      },
    ],
    layout: [
      { i: 'title_1', w: 36, h: 2, x: 0, y: 0 },
      { i: 'stats_1', w: 11, h: 4, x: 0, y: 2 },
      { i: 'stats_2', w: 11, h: 4, x: 12, y: 2 },
      { i: 'stats_3', w: 11, h: 4, x: 24, y: 2 },
      { i: 'text_1',  w: 18, h: 6, x: 0, y: 6 },
      { i: 'chart_1', w: 17, h: 6, x: 18, y: 6 },
    ],
    aliases: {},
    connections: [],
  };
}

// ── Action panel ────────────────────────────────────────────────────────────

const ACTION_ITEMS: ActionPanelItem[] = [
  {
    id: 'add-title',
    icon: <Icon data={Heading} />,
    title: 'Title',
    dragProps: { type: 'title' },
  },
  {
    id: 'add-text',
    icon: <Icon data={TextAlignLeft} />,
    title: 'Text',
    dragProps: { type: 'text' },
  },
  {
    id: 'add-stats',
    icon: <Icon data={ChartBar} />,
    title: 'Stats',
    dragProps: { type: 'statsCard' },
  },
  {
    id: 'add-chart',
    icon: <Icon data={ChartColumn} />,
    title: 'Chart',
    dragProps: { type: 'chartPlaceholder' },
  },
];

// ═════════════════════════════════════════════════════════════════════════════

export function App() {
  const [config, setConfig] = useState<Config>(createInitialConfig);

  const onChange = useCallback(
    (data: { config: Config }) => setConfig(data.config),
    [],
  );

  const onDrop = useCallback(
    (dropProps: ItemDropProps) => {
      const { dragProps, commit } = dropProps;

      const typeDefaults: Record<string, Pick<SetConfigItem, 'data'>> = {
        title:  { data: { text: 'New Title', size: 'm' as const, showInTOC: false } },
        text:   { data: { text: 'Write something…' } },
        statsCard: { data: { label: 'Metric', value: '0' } },
        chartPlaceholder: { data: { chartType: 'Line Chart' } },
      };

      const def = typeDefaults[dragProps.type]
        ?? ({ data: {} } as Pick<SetConfigItem, 'data'>);
      const item: SetConfigItem = { type: dragProps.type, ...def };

      const updated = DashKit.setItem({ item, config });
      setConfig(updated);
      commit();
    },
    [config],
  );

  return (
    <div className="dashboard-app">
      <DashKitDnDWrapper>
        <>
          <DashKit
            config={config}
            editMode={true}
            onChange={onChange}
            onDrop={onDrop}
            focusable
          />
          <ActionPanel items={ACTION_ITEMS} />
        </>
      </DashKitDnDWrapper>
    </div>
  );
}
