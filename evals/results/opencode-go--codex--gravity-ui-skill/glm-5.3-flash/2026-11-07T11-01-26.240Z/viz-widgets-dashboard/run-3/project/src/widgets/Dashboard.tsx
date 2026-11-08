import {
  ActionPanel,
  DashKit,
  DashKitDnDWrapper,
  pluginTitle,
  type ActionPanelItem,
  type Config,
  type ConfigItem,
  type DashKitProps,
  type ItemDropProps,
  type Plugin,
  type PluginWidgetProps,
} from '@gravity-ui/dashkit';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import {ChartColumn, SquareDashedText, Text} from '@gravity-ui/icons';
import {useMemo, useState} from 'react';

import {MetricWidget} from './MetricWidget';
import {NoteWidget} from './NoteWidget';
import type {MetricWidgetData, NoteWidgetData} from './types';
import styles from './Dashboard.module.css';

const metricPlugin: Plugin<PluginWidgetProps & {data: MetricWidgetData}> = {
  type: 'metric',
  defaultLayout: {w: 9, h: 4},
  renderer: ({data}) => <MetricWidget data={data} />,
};

const notePlugin: Plugin<PluginWidgetProps & {data: NoteWidgetData}> = {
  type: 'note',
  defaultLayout: {w: 18, h: 6},
  renderer: ({data}) => <NoteWidget data={data} />,
};

DashKit.registerPlugins(metricPlugin, notePlugin, pluginTitle);
DashKit.setSettings({gridLayout: {margin: [8, 8], rowHeight: 30}});

const initialConfig: Config = {
  salt: '4.715926354950229',
  counter: 4,
  items: [
    {
      id: 'title',
      type: 'title',
      namespace: 'default',
      data: {size: 'm', text: 'Обзор продукта', showInTOC: false},
    },
    {
      id: 'revenue',
      type: 'metric',
      namespace: 'default',
      data: {label: 'Выручка', value: '1 245 800 ₽', caption: '+12% к прошлой неделе', progress: 76},
    },
    {
      id: 'visits',
      type: 'metric',
      namespace: 'default',
      data: {label: 'Визиты', value: '28 640', caption: '+4% к прошлой неделе', progress: 62},
    },
    {
      id: 'summary',
      type: 'note',
      namespace: 'default',
      data: {
        title: 'Что произошло',
        content: 'Рост выручки поддержан мобильным трафиком. Доля возвратов остаётся стабильной.',
      },
    },
  ],
  layout: [
    {i: 'title', x: 0, y: 0, w: 36, h: 2},
    {i: 'revenue', x: 0, y: 2, w: 9, h: 4},
    {i: 'visits', x: 9, y: 2, w: 9, h: 4},
    {i: 'summary', x: 0, y: 6, w: 18, h: 6},
  ],
  aliases: {},
  connections: [],
};

const widgetTemplates: Record<string, ConfigItem['data']> = {
  metric: initialConfig.items[1].data,
  note: initialConfig.items[3].data,
};

const widgetMenuItems: Array<ActionPanelItem & {dragProps: {type: string}}> = [
  {
    id: 'metric',
    title: 'Метрика',
    qa: 'metric',
    icon: <Icon data={ChartColumn} />,
    dragProps: {type: 'metric'},
  },
  {
    id: 'note',
    title: 'Заметка',
    qa: 'note',
    icon: <Icon data={SquareDashedText} />,
    dragProps: {type: 'note'},
  },
  {
    id: 'title',
    title: 'Заголовок',
    qa: 'title',
    icon: <Icon data={Text} />,
    dragProps: {type: 'title'},
  },
];

export function Dashboard() {
  const [config, setConfig] = useState(initialConfig);
  const [editMode, setEditMode] = useState(true);

  const onChange = useMemo<DashKitProps['onChange']>(() => {
    return ({config: nextConfig}) => setConfig(nextConfig);
  }, []);

  const onDrop = (dropProps: ItemDropProps) => {
    const {dragProps, itemLayout} = dropProps;
    setConfig((currentConfig) =>
      DashKit.setItem({
        item: {
          type: dragProps.type,
          data: widgetTemplates[dragProps.type] ?? {},
          namespace: 'default',
          layout: itemLayout,
        },
        config: currentConfig,
      }),
    );

    dropProps.commit();
  };

  return (
    <div className={`${styles.root} ${editMode ? "" : styles.rootView}`}>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <h1 className={styles.heading}>Дашборд</h1>
        <Button onClick={() => setEditMode((value) => !value)}>
          {editMode ? 'Просмотр' : 'Редактирование'}
        </Button>
      </Flex>
      {editMode ? (
        <p className={styles.hint}>
          Перетаскивайте виджеты из панели, меняйте их размер и удаляйте через меню.
        </p>
      ) : null}
      <DashKitDnDWrapper>
        <>
          <DashKit
            config={config}
            editMode={editMode}
            onChange={onChange}
            onDrop={onDrop}
            itemsStateAndParams={{__meta__: {queue: [], version: 2}}}
            noOverlay={!editMode}
          />
          <ActionPanel items={widgetMenuItems} />
        </>
      </DashKitDnDWrapper>
    </div>
  );
}
