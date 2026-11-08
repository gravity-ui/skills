import { DashKit, ActionPanel, DashKitDnDWrapper } from '@gravity-ui/dashkit';
import type { DashKitProps, ItemDropProps, Plugin } from '@gravity-ui/dashkit';
import { ChartColumn, ChartPie, LayoutColumns, Plus, Text } from '@gravity-ui/icons';
import { Box, Flex, SegmentedRadioGroup, Text as GravityText } from '@gravity-ui/uikit';
import React from 'react';

import { getWidgetData, Widget } from './widgets';
import type { WidgetType } from './widget-types';

type WidgetCatalogEntry = {
  type: WidgetType;
  title: string;
  icon: React.ReactNode;
  width: number;
  height: number;
};

const widgetCatalog: WidgetCatalogEntry[] = [
  { type: 'usersMetric', title: 'Active users', icon: <ChartPie />, width: 6, height: 4 },
  { type: 'revenueMetric', title: 'Revenue', icon: <ChartColumn />, width: 6, height: 4 },
  { type: 'statusTable', title: 'Statuses', icon: <LayoutColumns />, width: 12, height: 8 },
  { type: 'text', title: 'Note', icon: <Text />, width: 6, height: 4 },
];

const widgetSettings: DashKitProps['settings'] = {
  autoupdateInterval: 0,
  silentLoading: true,
};

const context: DashKitProps['context'] = {
  ui: 'dashboard',
};

const initialConfig: DashKitProps['config'] = {
  salt: 'dashboard-widgets-v1',
  counter: 4,
  items: [
    {
      id: 'users',
      type: 'usersMetric',
      namespace: 'default',
      orderId: 0,
      data: getWidgetData('usersMetric'),
    },
    {
      id: 'revenue',
      type: 'revenueMetric',
      namespace: 'default',
      orderId: 1,
      data: getWidgetData('revenueMetric'),
    },
    {
      id: 'statuses',
      type: 'statusTable',
      namespace: 'default',
      orderId: 2,
      data: getWidgetData('statusTable'),
    },
    {
      id: 'note',
      type: 'text',
      namespace: 'default',
      orderId: 3,
      data: { text: 'Drag widgets from the palette. In edit mode you can move, resize, copy and delete them.' },
    },
  ],
  layout: [
    { i: 'users', x: 0, y: 0, w: 6, h: 4 },
    { i: 'revenue', x: 6, y: 0, w: 6, h: 4 },
    { i: 'statuses', x: 0, y: 4, w: 12, h: 8 },
    { i: 'note', x: 0, y: 12, w: 12, h: 4 },
  ],
  aliases: {},
  connections: [],
};

const actionPanelItems = widgetCatalog.map((widget) => ({
  id: widget.type,
  icon: widget.icon,
  title: widget.title,
  dragProps: { type: widget.type, layout: { w: widget.width, h: widget.height } },
}));

DashKit.setSettings({
  gridLayout: { margin: [12, 12] },
  isMobile: true,
});

DashKit.registerPlugins(
  ...widgetCatalog.map((widget) => ({
    type: widget.type,
    defaultLayout: { x: 0, y: 0, w: widget.width, h: widget.height },
    renderer: (pluginProps: { data: unknown }) => (
      <Widget type={widget.type} data={pluginProps.data as never} />
    ),
  })),
);

export function Dashboard() {
  const [config, setConfig] = React.useState(initialConfig);
  const [itemsStateAndParams, setItemsStateAndParams] = React.useState({});
  const [editMode, setEditMode] = React.useState(true);

  const handleDrop = React.useCallback(
    (dropProps: ItemDropProps) => {
      setConfig((currentConfig) => {
        const nextConfig = DashKit.setItem({
          item: {
            type: dropProps.dragProps.type as WidgetType,
            namespace: 'default',
            data: getWidgetData(dropProps.dragProps.type as WidgetType),
          },
          config: currentConfig,
        });

        return {
          ...nextConfig,
          layout: nextConfig.layout.map((layoutItem) => {
            const matchingLayout = dropProps.newLayout.find((newLayout) => newLayout.i === layoutItem.i);

            return matchingLayout ?? layoutItem;
          }),
        } as DashKitProps['config'];
      });
      dropProps.commit();
    },
    [],
  );

  return (
    <Flex direction="column" gap={4}>
      <Flex justifyContent="space-between" alignItems="center" gap={3}>
        <Box>
          <GravityText variant="header-2">Dashboard</GravityText>
          <GravityText color="secondary">Arrange widgets freely on the grid</GravityText>
        </Box>
        <SegmentedRadioGroup value={editMode ? 'edit' : 'view'} onUpdate={(value) => setEditMode(value === 'edit')}>
          <SegmentedRadioGroup.Option value="view">View</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="edit">Edit</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </Flex>

      <Flex gap={2} alignItems="center">
        <Plus />
        <GravityText>Palette</GravityText>
        {widgetCatalog.map((widget) => (
          <Flex key={widget.type} gap={1} alignItems="center">
            {widget.icon}
            <GravityText>{widget.title}</GravityText>
          </Flex>
        ))}
      </Flex>

      <DashKitDnDWrapper
        children={
          <>
          <DashKit
            key="dashboard"
            config={config}
            editMode={editMode}
            settings={widgetSettings}
            context={context}
            itemsStateAndParams={itemsStateAndParams}
            onItemEdit={() => setEditMode(true)}
            onChange={({ config: nextConfig, itemsStateAndParams: nextStateAndParams }) => {
              setConfig(nextConfig);
              setItemsStateAndParams(nextStateAndParams);
            }}
            onDrop={handleDrop}
          />
          <ActionPanel key="palette" items={actionPanelItems} />
          </>
        }
      />
    </Flex>
  );
}
