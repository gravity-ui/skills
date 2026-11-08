import {useCallback, useEffect, useMemo, useState} from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, DashKitProps, ItemDropProps} from '@gravity-ui/dashkit';
import {ArrowRotateLeft, ChartColumn, Heading, LayoutHeaderCells, ListCheck, TextAlignLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon, Switch, Text} from '@gravity-ui/uikit';

import {WIDGET_TYPES, setupDashKit} from './dashkitSetup';
import type {WidgetType} from './dashkitSetup';
import {INITIAL_CONFIG} from './initialConfig';
import type {DashboardConfig} from './initialConfig';

import './dashboard.css';

setupDashKit();

const STORAGE_KEY = 'gravity-dashboard-config-v1';
const NAMESPACE = 'default';

type ItemsStateAndParams = NonNullable<DashKitProps['itemsStateAndParams']>;

/** Данные по умолчанию для виджета, добавленного из панели. */
const NEW_WIDGET_DATA: Record<WidgetType, Record<string, unknown>> = {
  [WIDGET_TYPES.title]: {size: 'm', text: 'Новый раздел', showInTOC: false},
  [WIDGET_TYPES.metric]: {title: 'Новая метрика', value: 0, delta: 0, caption: 'к прошлому периоду'},
  [WIDGET_TYPES.table]: {title: 'Таблица'},
  [WIDGET_TYPES.progress]: {
    title: 'Прогресс',
    items: [
      {name: 'Задача A', value: 35},
      {name: 'Задача B', value: 80},
    ],
  },
  [WIDGET_TYPES.note]: {title: 'Заметка', text: 'Текст заметки.'},
};

function loadConfig(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CONFIG;
    const parsed = JSON.parse(raw) as Partial<DashboardConfig>;
    if (!Array.isArray(parsed.items) || !Array.isArray(parsed.layout)) return INITIAL_CONFIG;
    return {...INITIAL_CONFIG, ...parsed} as DashboardConfig;
  } catch {
    return INITIAL_CONFIG;
  }
}

export function Dashboard() {
  const [editMode, setEditMode] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(loadConfig);
  const [itemsStateAndParams, setItemsStateAndParams] = useState<ItemsStateAndParams>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // хранилище недоступно (приватный режим и т.п.) — раскладка живёт только в памяти
    }
  }, [config]);

  const handleChange = useCallback<NonNullable<DashKitProps['onChange']>>((data) => {
    setConfig(data.config);
    setItemsStateAndParams(data.itemsStateAndParams);
  }, []);

  /** Виджет перетащили из панели на сетку: DashKit уже посчитал место, нам остаётся записать его в конфиг. */
  const handleDrop = useCallback((dropProps: ItemDropProps) => {
    const type = dropProps.dragProps.type as WidgetType;
    setConfig((current) =>
      DashKit.setItem({
        item: {
          type,
          namespace: NAMESPACE,
          data: {...NEW_WIDGET_DATA[type]},
          layout: {
            x: dropProps.itemLayout.x,
            y: dropProps.itemLayout.y,
            w: dropProps.itemLayout.w,
            h: dropProps.itemLayout.h,
          },
        },
        config: current,
        options: {updateLayout: dropProps.newLayout},
      }),
    );
    dropProps.commit();
  }, []);

  /** Клик по пункту панели: добавить виджет в конец сетки с размером по умолчанию. */
  const addWidget = useCallback((type: WidgetType) => {
    setConfig((current) =>
      DashKit.setItem({
        item: {type, namespace: NAMESPACE, data: {...NEW_WIDGET_DATA[type]}},
        config: current,
      }),
    );
  }, []);

  const resetLayout = useCallback(() => {
    setConfig(INITIAL_CONFIG);
    setItemsStateAndParams({});
  }, []);

  const actionPanelItems = useMemo<ActionPanelItem[]>(
    () => [
      {
        id: WIDGET_TYPES.title,
        title: 'Заголовок',
        icon: <Icon data={Heading} />,
        onClick: () => addWidget(WIDGET_TYPES.title),
        dragProps: {type: WIDGET_TYPES.title, layout: {w: 36, h: 2}},
      },
      {
        id: WIDGET_TYPES.metric,
        title: 'Метрика',
        icon: <Icon data={ChartColumn} />,
        onClick: () => addWidget(WIDGET_TYPES.metric),
        dragProps: {type: WIDGET_TYPES.metric, layout: {w: 9, h: 6}},
      },
      {
        id: WIDGET_TYPES.table,
        title: 'Таблица',
        icon: <Icon data={LayoutHeaderCells} />,
        onClick: () => addWidget(WIDGET_TYPES.table),
        dragProps: {type: WIDGET_TYPES.table, layout: {w: 18, h: 14}},
      },
      {
        id: WIDGET_TYPES.progress,
        title: 'Прогресс',
        icon: <Icon data={ListCheck} />,
        onClick: () => addWidget(WIDGET_TYPES.progress),
        dragProps: {type: WIDGET_TYPES.progress, layout: {w: 12, h: 12}},
      },
      {
        id: WIDGET_TYPES.note,
        title: 'Заметка',
        icon: <Icon data={TextAlignLeft} />,
        onClick: () => addWidget(WIDGET_TYPES.note),
        dragProps: {type: WIDGET_TYPES.note, layout: {w: 12, h: 8}},
      },
    ],
    [addWidget],
  );

  const isEmpty = config.items.length === 0;

  return (
    <div className="dashboard">
      <Flex alignItems="center" gap={4} wrap className="dashboard__header">
        <div style={{flex: 1, minWidth: 0}}>
          <Text variant="header-1" as="div" ellipsis>
            Дашборд
          </Text>
          <Text variant="body-1" color="secondary" as="div">
            {editMode
              ? 'Перетаскивайте виджеты за любое место, растягивайте за правый нижний угол.'
              : 'Включите режим редактирования, чтобы изменить расположение виджетов.'}
          </Text>
        </div>
        <Flex alignItems="center" gap={3} style={{flexShrink: 0}}>
          <Switch size="m" checked={editMode} onUpdate={setEditMode} content="Режим редактирования" />
          <Button view="outlined" size="m" onClick={resetLayout} disabled={!editMode}>
            <Icon data={ArrowRotateLeft} size={16} />
            Сбросить
          </Button>
        </Flex>
      </Flex>

      <div className="dashboard__grid">
        {isEmpty ? (
          <div className="dashboard__empty">
            <Text variant="body-2" color="secondary">
              {editMode
                ? 'Виджетов нет. Добавьте их с панели внизу.'
                : 'Виджетов нет. Включите режим редактирования, чтобы добавить.'}
            </Text>
          </div>
        ) : null}

        {/* DashKit и ActionPanel должны жить в одном DnD-контексте, иначе перетаскивание с панели не работает */}
        <DashKitDnDWrapper>
          <>
            <DashKit
              config={config}
              editMode={editMode}
              itemsStateAndParams={itemsStateAndParams}
              onChange={handleChange}
              onDrop={handleDrop}
              overlayMenuItems={['delete']}
            />
            {editMode ? <ActionPanel items={actionPanelItems} /> : null}
          </>
        </DashKitDnDWrapper>
      </div>
    </div>
  );
}
