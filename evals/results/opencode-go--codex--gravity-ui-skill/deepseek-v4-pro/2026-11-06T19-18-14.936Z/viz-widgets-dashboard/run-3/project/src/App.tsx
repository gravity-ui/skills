import React, { useCallback, useRef, useState } from 'react';
import {
  DashKit,
  DashKitDnDWrapper,
  ActionPanel,
  pluginTitle,
  pluginText,
} from '@gravity-ui/dashkit';
import type {
  ActionPanelItem,
  Config,
  ItemsStateAndParams,
  ItemDropProps,
  Plugin,
  PluginWidgetProps,
} from '@gravity-ui/dashkit';
import {
  configure,
  Lang,
  Button,
  Card,
  Flex,
  Text,
  Icon,
} from '@gravity-ui/uikit';
import { Text as TextIcon } from '@gravity-ui/icons';
import { ChartColumn } from '@gravity-ui/icons';
import { Speedometer } from '@gravity-ui/icons';
import { LayoutCells } from '@gravity-ui/icons';
import { ListUl } from '@gravity-ui/icons';
import { SquareChartBar } from '@gravity-ui/icons';

configure({ lang: Lang.En });

// ── Custom plugins ────────────────────────────────────────────────

const metricPlugin: Plugin = {
  type: 'metric',
  defaultLayout: { w: 8, h: 4 },
  renderer(props: PluginWidgetProps) {
    const { data } = props;
    return (
      <Card style={{ height: '100%', padding: 16 }}>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">{String(data.label || 'Metric')}</Text>
          <Text variant="display-1">{String(data.value ?? '\u2014')}</Text>
          {Boolean(data.delta) && (
            <Text variant="body-1" color="secondary">
              {String(data.delta)}
            </Text>
          )}
        </Flex>
      </Card>
    );
  },
};

const chartWidgetPlugin: Plugin = {
  type: 'chart-widget',
  defaultLayout: { w: 12, h: 6 },
  renderer(props: PluginWidgetProps) {
    const { data } = props;
    return (
      <Card style={{ height: '100%', padding: 16 }}>
        <Flex direction="column" gap={2} style={{ height: '100%' }}>
          <Text variant="subheader-1">{String(data.title || 'Chart')}</Text>
          <Flex
            style={{ flex: 1, minHeight: 0 }}
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="body-2" color="hint">
              {String(data.description || 'Chart placeholder')}
            </Text>
          </Flex>
        </Flex>
      </Card>
    );
  },
};

const tableWidgetPlugin: Plugin = {
  type: 'table-widget',
  defaultLayout: { w: 12, h: 6 },
  renderer(props: PluginWidgetProps) {
    const { data } = props;
    return (
      <Card style={{ height: '100%', padding: 16 }}>
        <Flex direction="column" gap={2} style={{ height: '100%' }}>
          <Text variant="subheader-1">{String(data.title || 'Table')}</Text>
          <Flex
            style={{ flex: 1, minHeight: 0 }}
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="body-2" color="hint">
              {String(data.description || 'Table placeholder')}
            </Text>
          </Flex>
        </Flex>
      </Card>
    );
  },
};

const listWidgetPlugin: Plugin = {
  type: 'list-widget',
  defaultLayout: { w: 8, h: 5 },
  renderer(props: PluginWidgetProps) {
    const { data } = props;
    return (
      <Card style={{ height: '100%', padding: 16 }}>
        <Flex direction="column" gap={2} style={{ height: '100%' }}>
          <Text variant="subheader-1">{String(data.title || 'List')}</Text>
          <Flex
            style={{ flex: 1, minHeight: 0 }}
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="body-2" color="hint">
              {String(data.description || 'List placeholder')}
            </Text>
          </Flex>
        </Flex>
      </Card>
    );
  },
};

// ── DashKit configuration ─────────────────────────────────────────

DashKit.setSettings({
  gridLayout: { margin: [12, 12] },
  isMobile: false,
});

DashKit.registerPlugins(
  pluginTitle,
  pluginText,
  metricPlugin,
  chartWidgetPlugin,
  tableWidgetPlugin,
  listWidgetPlugin,
);

// Pre-build icon elements
const titleIcon = <Icon data={TextIcon} />;
const textIcon = <Icon data={ListUl} />;
const metricIcon = <Icon data={Speedometer} />;
const chartIcon = <Icon data={ChartColumn} />;
const tableIcon = <Icon data={LayoutCells} />;
const listIcon = <Icon data={SquareChartBar} />;

// ── Action panel items ────────────────────────────────────────────

const actionPanelItems: ActionPanelItem[] = [
  { id: 'title', icon: titleIcon, title: 'Title', dragProps: { type: 'title' } },
  { id: 'text', icon: textIcon, title: 'Text', dragProps: { type: 'text' } },
  { id: 'metric', icon: metricIcon, title: 'Metric', dragProps: { type: 'metric' } },
  {
    id: 'chart',
    icon: chartIcon,
    title: 'Chart',
    dragProps: { type: 'chart-widget' },
  },
  {
    id: 'table',
    icon: tableIcon,
    title: 'Table',
    dragProps: { type: 'table-widget' },
  },
  {
    id: 'list',
    icon: listIcon,
    title: 'List',
    dragProps: { type: 'list-widget' },
  },
];

// ── Initial config ────────────────────────────────────────────────

const initialConfig: Config = {
  salt: '0.123456',
  counter: 6,
  items: [
    {
      id: 'title1',
      data: { size: 'm', text: 'Welcome Dashboard', showInTOC: true },
      type: 'title',
      namespace: 'default',
      orderId: 1,
    },
    {
      id: 'metric1',
      data: {
        label: 'Revenue',
        value: '$18,245',
        delta: '+12.5% vs last month',
      },
      type: 'metric',
      namespace: 'default',
      orderId: 2,
    },
    {
      id: 'metric2',
      data: {
        label: 'Active Users',
        value: '2,847',
        delta: '+5.3% vs last month',
      },
      type: 'metric',
      namespace: 'default',
      orderId: 3,
    },
    {
      id: 'metric3',
      data: {
        label: 'Conversion',
        value: '3.24%',
        delta: '\u22120.8% vs last month',
      },
      type: 'metric',
      namespace: 'default',
      orderId: 4,
    },
    {
      id: 'chart1',
      data: {
        title: 'Sales Overview',
        description: 'Bar chart \u2014 monthly sales',
      },
      type: 'chart-widget',
      namespace: 'default',
      orderId: 5,
    },
    {
      id: 'table1',
      data: {
        title: 'Recent Orders',
        description: 'Table of recent orders',
      },
      type: 'table-widget',
      namespace: 'default',
      orderId: 6,
    },
  ],
  layout: [
    { h: 2, i: 'title1', w: 36, x: 0, y: 0 },
    { h: 4, i: 'metric1', w: 12, x: 0, y: 2 },
    { h: 4, i: 'metric2', w: 12, x: 12, y: 2 },
    { h: 4, i: 'metric3', w: 12, x: 24, y: 2 },
    { h: 6, i: 'chart1', w: 18, x: 0, y: 6 },
    { h: 6, i: 'table1', w: 18, x: 18, y: 6 },
  ],
  aliases: {},
  connections: [],
};

const initialItemsStateAndParams: ItemsStateAndParams = {};

// ── App component ─────────────────────────────────────────────────

export function App() {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [editMode, setEditMode] = useState(true);
  const [itemsStateAndParams, setItemsStateAndParams] =
    useState<ItemsStateAndParams>(initialItemsStateAndParams);

  const configRef = useRef(config);
  configRef.current = config;

  const onChange = useCallback(
    (data: { config: Config; itemsStateAndParams: ItemsStateAndParams }) => {
      setConfig(data.config);
      configRef.current = data.config;
      setItemsStateAndParams(data.itemsStateAndParams);
    },
    [],
  );

  const onDrop = useCallback(
    (dropProps: ItemDropProps) => {
      const { dragProps, newLayout, commit } = dropProps;
      const newConfig = DashKit.setItem({
        item: { data: {}, namespace: 'default', type: dragProps.type },
        config: configRef.current,
        options: { updateLayout: newLayout },
      });
      setConfig(newConfig);
      configRef.current = newConfig;
      commit();
    },
    [],
  );

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Flex
        style={{
          flexShrink: 0,
          padding: '12px 20px',
          borderBottom: '1px solid var(--g-color-line-generic)',
        }}
        alignItems="center"
        gap={3}
      >
        <Text variant="header-1">Dashboard</Text>
        <Flex style={{ flex: 1, minWidth: 0 }} />
        <Button
          view={editMode ? 'action' : 'normal'}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Edit mode ON' : 'Edit mode OFF'}
        </Button>
      </Flex>

      {/* DashKit grid */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <DashKitDnDWrapper>
          <div>
            <DashKit
              config={config}
              editMode={editMode}
              onChange={onChange}
              onDrop={onDrop}
              onItemEdit={() => {}}
              defaultGlobalParams={{}}
              globalParams={{}}
              itemsStateAndParams={itemsStateAndParams}
              settings={{ autoupdateInterval: 0, silentLoading: false }}
              context={{}}
            />
            {editMode && <ActionPanel items={actionPanelItems} />}
          </div>
        </DashKitDnDWrapper>
      </div>
    </div>
  );
}
