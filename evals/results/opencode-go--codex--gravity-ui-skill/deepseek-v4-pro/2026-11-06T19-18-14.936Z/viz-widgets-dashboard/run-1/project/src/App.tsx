import React, { useState, useCallback } from 'react';
import { configure, Lang, Text } from '@gravity-ui/uikit';
import {
  DashKit,
  DashKitDnDWrapper,
  ActionPanel,
} from '@gravity-ui/dashkit';
import type {
  Config,
  ItemDropProps,
  GlobalParams,
  ItemsStateAndParams,
} from '@gravity-ui/dashkit';
import { Icon } from '@gravity-ui/uikit';
import {
  ChartColumn,
  Database,
  Bulb,
  BarsAscendingAlignLeft,
} from '@gravity-ui/icons';

import {
  pluginMetric,
  pluginChart,
  pluginInfo,
  pluginDataTable,
} from './plugins';

configure({ lang: Lang.En });

DashKit.setSettings({
  gridLayout: { margin: [8, 8], cols: 12, rowHeight: 100 },
});

DashKit.registerPlugins(pluginMetric, pluginChart, pluginInfo, pluginDataTable);

const INITIAL_CONFIG: Config = {
  salt: 'dash-salt',
  counter: 7,
  items: [
    {
      id: 'm1',
      data: { label: 'Revenue', value: '$48.2K', severity: 'success' },
      type: 'metric',
      namespace: 'default',
      orderId: 0,
    },
    {
      id: 'm2',
      data: { label: 'Users', value: '2,847', severity: 'normal' },
      type: 'metric',
      namespace: 'default',
      orderId: 1,
    },
    {
      id: 'm3',
      data: { label: 'CPU Load', value: '87%', severity: 'warning' },
      type: 'metric',
      namespace: 'default',
      orderId: 2,
    },
    {
      id: 'm4',
      data: { label: 'Errors', value: '12', severity: 'danger' },
      type: 'metric',
      namespace: 'default',
      orderId: 3,
    },
    {
      id: 'ch1',
      data: { title: 'Weekly Activity' },
      type: 'chart',
      namespace: 'default',
      orderId: 4,
    },
    {
      id: 't1',
      data: {
        title: 'Key Metrics',
        rows: [
          { name: 'Page Views', value: '128,450' },
          { name: 'Conversions', value: '3,240' },
          { name: 'Avg. Order', value: '$84.50' },
          { name: 'Churn Rate', value: '2.1%' },
        ],
      },
      type: 'datatable',
      namespace: 'default',
      orderId: 5,
    },
    {
      id: 'i1',
      data: {
        title: 'About This Dashboard',
        text: 'Built with @gravity-ui/dashkit. Drag any widget to reposition it. Resize from the bottom-right corner. Use the action panel below to add new widgets.',
      },
      type: 'info',
      namespace: 'default',
      orderId: 6,
    },
  ],
  layout: [
    { i: 'm1', h: 3, w: 3, x: 0, y: 0 },
    { i: 'm2', h: 3, w: 3, x: 3, y: 0 },
    { i: 'm3', h: 3, w: 3, x: 6, y: 0 },
    { i: 'm4', h: 3, w: 3, x: 9, y: 0 },
    { i: 'ch1', h: 4, w: 6, x: 0, y: 3 },
    { i: 't1', h: 4, w: 6, x: 6, y: 3 },
    { i: 'i1', h: 2, w: 12, x: 0, y: 7 },
  ],
  aliases: {},
  connections: [],
};

const EMPTY_ITEMS_STATE: ItemsStateAndParams = {};
const EMPTY_GLOBALS: GlobalParams = {};

const ACTION_PANEL_ITEMS = [
  {
    id: 'metric',
    icon: <Icon data={BarsAscendingAlignLeft} size={16} />,
    title: 'Metric',
    dragProps: { type: 'metric' },
  },
  {
    id: 'chart',
    icon: <Icon data={ChartColumn} size={16} />,
    title: 'Chart',
    dragProps: { type: 'chart' },
  },
  {
    id: 'datatable',
    icon: <Icon data={Database} size={16} />,
    title: 'Data Table',
    dragProps: { type: 'datatable' },
  },
  {
    id: 'info',
    icon: <Icon data={Bulb} size={16} />,
    title: 'Info',
    dragProps: { type: 'info' },
  },
];

function defaultDataForType(type: string): Record<string, unknown> {
  switch (type) {
    case 'metric':
      return { label: 'New Metric', value: '0', severity: 'normal' };
    case 'chart':
      return { title: 'New Chart' };
    case 'datatable':
      return { title: 'New Table', rows: [{ name: 'Item', value: '0' }] };
    case 'info':
      return { title: 'Note', text: 'Edit this widget.' };
    default:
      return {};
  }
}

export function App() {
  const [config, setConfig] = useState<Config>(INITIAL_CONFIG);
  const [editMode, setEditMode] = useState(true);

  const onChange = useCallback(
    (data: { config: Config; itemsStateAndParams: ItemsStateAndParams }) => {
      setConfig(data.config);
    },
    [],
  );

  const handleDrop = useCallback(
    (dropProps: ItemDropProps) => {
      const newType = dropProps.dragProps.type;
      const newConfig = DashKit.setItem({
        item: {
          data: defaultDataForType(newType),
          namespace: 'default',
          type: newType,
          layout: {
            h: dropProps.itemLayout.h,
            w: dropProps.itemLayout.w,
            x: dropProps.itemLayout.x,
            y: dropProps.itemLayout.y,
          },
        },
        config,
      });
      setConfig(newConfig);
      dropProps.commit();
    },
    [config],
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--g-color-base-background)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--g-color-line-generic)',
          background: 'var(--g-color-base-background)',
        }}
      >
        <Text variant="header-1">Dashboard</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text variant="body-2" color="secondary">
            {editMode ? 'Edit mode' : 'View mode'}
          </Text>
          <button
            onClick={() => setEditMode((e) => !e)}
            style={{
              padding: '6px 16px',
              border: '1px solid var(--g-color-line-generic)',
              borderRadius: 'var(--g-border-radius-m)',
              background: editMode
                ? 'var(--g-color-base-brand)'
                : 'var(--g-color-base-generic)',
              color: editMode
                ? 'var(--g-color-text-brand-contrast)'
                : 'var(--g-color-text-primary)',
              cursor: 'pointer',
              fontSize: 'var(--g-text-body-2-font-size)',
              fontWeight: 500,
            }}
          >
            {editMode ? 'Lock Layout' : 'Edit Layout'}
          </button>
        </div>
      </header>

      <DashKitDnDWrapper>
        <div>
          <DashKit
            config={config}
            editMode={editMode}
            onChange={onChange}
            onDrop={handleDrop}
            onItemEdit={({ id }) => console.log('Edit:', id)}
            defaultGlobalParams={EMPTY_GLOBALS}
            globalParams={EMPTY_GLOBALS}
            itemsStateAndParams={EMPTY_ITEMS_STATE}
            settings={{ autoupdateInterval: 0, silentLoading: false }}
            context={{}}
            noOverlay={false}
          />

          {editMode && (
            <div style={{ padding: '0 24px 24px' }}>
              <ActionPanel items={ACTION_PANEL_ITEMS} disable={!editMode} />
            </div>
          )}
        </div>
      </DashKitDnDWrapper>
    </div>
  );
}
