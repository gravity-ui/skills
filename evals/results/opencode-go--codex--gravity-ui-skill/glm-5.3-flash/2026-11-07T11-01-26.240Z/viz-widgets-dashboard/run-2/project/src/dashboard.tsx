import { Button, Flex, Text } from '@gravity-ui/uikit';
import {
  ActionPanel,
  DashKit,
  DashKitDnDWrapper,
} from '@gravity-ui/dashkit';
import type { DashKitProps } from '@gravity-ui/dashkit';
import { ChartColumn, ChartDonut, ListCheck, Signal, Text as TextIcon } from '@gravity-ui/icons';
import React, { useCallback, useState } from 'react';

import {
  MetricsWidget,
  NotesWidget,
  PerformanceWidget,
  TableWidget,
  WidgetFrame,
} from './widgets';

type WidgetType = 'metrics' | 'performance' | 'table' | 'notes';

type WidgetDefinition = {
  type: WidgetType;
  title: string;
  renderer: () => React.ReactNode;
  defaultLayout: { w: number; h: number; minW: number; minH: number };
};

const widgetDefinitions: WidgetDefinition[] = [
  {
    type: 'metrics',
    title: 'Metrics',
    renderer: () => (
      <WidgetFrame title="Core metrics">
        <MetricsWidget />
      </WidgetFrame>
    ),
    defaultLayout: { w: 3, h: 7, minW: 2, minH: 4 },
  },
  {
    type: 'performance',
    title: 'Performance',
    renderer: () => (
      <WidgetFrame title="Service health">
        <PerformanceWidget />
      </WidgetFrame>
    ),
    defaultLayout: { w: 3, h: 6, minW: 2, minH: 4 },
  },
  {
    type: 'table',
    title: 'Projects',
    renderer: () => (
      <WidgetFrame title="Project progress">
        <TableWidget />
      </WidgetFrame>
    ),
    defaultLayout: { w: 3, h: 6, minW: 2, minH: 4 },
  },
  {
    type: 'notes',
    title: 'Notes',
    renderer: () => (
      <WidgetFrame title="How to edit">
        <NotesWidget />
      </WidgetFrame>
    ),
    defaultLayout: { w: 3, h: 5, minW: 2, minH: 3 },
  },
];

const createWidgetConfig = (): DashKitProps['config'] => {
  let counter = 0;
  const items = widgetDefinitions.map((definition, index) => {
    counter += 1;
    return {
      id: `widget-${definition.type}`,
      data: {},
      type: definition.type,
      namespace: 'dashboard',
      orderId: index + 1,
    };
  });
  const layout = [
    { i: 'widget-metrics', x: 0, y: 0, ...widgetDefinitions[0].defaultLayout },
    { i: 'widget-performance', x: 3, y: 0, ...widgetDefinitions[1].defaultLayout },
    { i: 'widget-table', x: 6, y: 0, ...widgetDefinitions[2].defaultLayout },
    { i: 'widget-notes', x: 9, y: 0, ...widgetDefinitions[3].defaultLayout },
  ];

  return {
    salt: 'dashboard',
    counter,
    items,
    layout,
    aliases: {},
    connections: [],
  };
};

const initialConfig = createWidgetConfig();

DashKit.registerPlugins(
  ...widgetDefinitions.map((definition) => ({
    type: definition.type,
    defaultLayout: definition.defaultLayout,
    renderer: () => definition.renderer(),
  })),
);
DashKit.setSettings({ gridLayout: { margin: [16, 16], rowHeight: 36 } });

const iconByType: Record<WidgetType, React.ReactNode> = {
  metrics: <ChartColumn width={20} height={20} />,
  performance: <ChartDonut width={20} height={20} />,
  table: <ListCheck width={20} height={20} />,
  notes: <TextIcon width={20} height={20} />,
};

export function Dashboard() {
  const [editMode, setEditMode] = useState(true);
  const [config, setConfig] = useState(initialConfig);
  const [itemsStateAndParams, setItemsStateAndParams] =
    useState<DashKitProps['itemsStateAndParams']>({});

  const handleChange = useCallback(
    (change: { config: DashKitProps['config']; itemsStateAndParams: DashKitProps['itemsStateAndParams'] }) => {
      setConfig(change.config);
      setItemsStateAndParams(change.itemsStateAndParams);
    },
    [],
  );

  const addItem = useCallback((type: WidgetType) => {
    setConfig((currentConfig) =>
      DashKit.setItem({
        item: { data: {}, type, namespace: 'dashboard' },
        config: currentConfig,
      }),
    );
  }, []);

  const paletteItems = widgetDefinitions.map((definition) => ({
    id: definition.type,
    title: definition.title,
    icon: iconByType[definition.type],
    dragProps: { type: definition.type },
    onClick: () => addItem(definition.type),
  }));

  return (
    <Flex direction="column" gap="4">
      <Flex
        className="dashboard-header"
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        gap="4"
        wrap
      >
        <Flex direction="column" gap="1">
          <Text as="h1" className="dashboard-title" variant="header-1">
            Operations dashboard
          </Text>
          <Text className="dashboard-description">
            Drag the widget header to arrange the grid. Resize from the lower-right
            corner, or remove a widget in edit mode.
          </Text>
        </Flex>
        <Flex className="dashboard-actions" direction="row" gap="2" wrap>
          <Button
            view={editMode ? 'normal' : 'action'}
            size="m"
            onClick={() => setEditMode((previousMode) => !previousMode)}
          >
            {editMode ? 'View mode' : 'Edit mode'}
          </Button>
          <Button
            view="outlined-action"
            size="m"
            onClick={() => {
              setConfig(createWidgetConfig());
              setItemsStateAndParams({});
            }}
          >
            Reset layout
          </Button>
        </Flex>
      </Flex>

      <DashKitDnDWrapper>
        <Flex direction="row" alignItems="flex-start" gap="4">
          <DashKit
            config={config}
            editMode={editMode}
            itemsStateAndParams={itemsStateAndParams}
            onChange={handleChange}
            onDrop={(dropProps) => {
              const type = dropProps.dragProps.type;
              setConfig((currentConfig) => {
                const nextConfig = DashKit.setItem({
                  item: {
                    data: {},
                    type,
                    namespace: 'dashboard',
                    layout: dropProps.itemLayout,
                  },
                  config: currentConfig,
                });
                return nextConfig;
              });
              dropProps.commit();
            }}
          />
          <ActionPanel items={paletteItems} />
        </Flex>
      </DashKitDnDWrapper>
    </Flex>
  );
}
