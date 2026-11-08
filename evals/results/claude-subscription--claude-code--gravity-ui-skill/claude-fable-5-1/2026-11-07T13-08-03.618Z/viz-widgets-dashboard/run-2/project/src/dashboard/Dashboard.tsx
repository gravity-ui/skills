import React from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, Config, ItemDropProps} from '@gravity-ui/dashkit';
import {ArrowsRotateLeft, ChartColumn, Heading, LayoutHeaderCellsLarge, ListCheck, TextAlignLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon, Lang, Switch, Text, configure} from '@gravity-ui/uikit';

import {initialConfig, widgetPresets} from './config';
import {registerDashboardPlugins} from './plugins';
import {WidgetType} from './types';

import './dashboard.css';

const STORAGE_KEY = 'gravity-dashboard-config';

// DashKit нужно сконфигурировать до первого рендера.
configure({lang: Lang.Ru});
DashKit.setSettings({gridLayout: {margin: [12, 12], rowHeight: 18}});
registerDashboardPlugins();

function loadConfig(): Config {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialConfig;
    const parsed = JSON.parse(raw) as Partial<Config>;
    if (Array.isArray(parsed.items) && Array.isArray(parsed.layout)) {
      return {...initialConfig, ...parsed} as Config;
    }
  } catch {
    // Повреждённое сохранение — показываем раскладку по умолчанию.
  }
  return initialConfig;
}

const actionPanelItems: ActionPanelItem[] = [
  {id: WidgetType.Stat, title: 'Показатель', icon: <Icon data={ChartColumn} />, dragProps: {type: WidgetType.Stat}},
  {id: WidgetType.Meter, title: 'Нагрузка', icon: <Icon data={LayoutHeaderCellsLarge} />, dragProps: {type: WidgetType.Meter}},
  {id: WidgetType.Table, title: 'Таблица', icon: <Icon data={LayoutHeaderCellsLarge} />, dragProps: {type: WidgetType.Table}},
  {id: WidgetType.Tasks, title: 'Задачи', icon: <Icon data={ListCheck} />, dragProps: {type: WidgetType.Tasks}},
  {id: WidgetType.Title, title: 'Заголовок', icon: <Icon data={Heading} />, dragProps: {type: WidgetType.Title}},
  {id: WidgetType.Text, title: 'Текст', icon: <Icon data={TextAlignLeft} />, dragProps: {type: WidgetType.Text}},
];

export function Dashboard() {
  const [config, setConfig] = React.useState<Config>(loadConfig);
  const [editMode, setEditMode] = React.useState(false);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const handleChange = React.useCallback(({config: next}: {config: Config}) => {
    setConfig(next);
  }, []);

  /** Виджет перетащили из ActionPanel в сетку: добавляем его в вычисленное место. */
  const handleDrop = React.useCallback((dropProps: ItemDropProps) => {
    const {type} = dropProps.dragProps;
    const preset = widgetPresets[type];
    if (!preset) return;
    const {i: _i, ...layout} = dropProps.itemLayout;
    setConfig((prev) =>
      DashKit.setItem({
        item: {type, data: preset(), namespace: 'default', layout},
        config: prev,
        options: {updateLayout: dropProps.newLayout},
      }),
    );
    dropProps.commit();
  }, []);

  /** Клик по пункту панели — виджет добавляется в конец сетки с размером по умолчанию. */
  const items = React.useMemo<ActionPanelItem[]>(
    () =>
      actionPanelItems.map((item) => ({
        ...item,
        onClick: () => {
          const preset = widgetPresets[item.id];
          if (!preset) return;
          setConfig((prev) => DashKit.setItem({item: {type: item.id, data: preset(), namespace: 'default'}, config: prev}));
        },
      })),
    [],
  );

  const resetLayout = () => {
    setConfig(initialConfig);
  };

  return (
    <div className={editMode ? "dashboard dashboard_editing" : "dashboard"}>
      <Flex alignItems="center" gap={4} className="dashboard__toolbar">
        <div className="dashboard__toolbar-title">
          <Text variant="header-1">Дашборд</Text>
        </div>
        <Switch
          size="m"
          checked={editMode}
          onUpdate={setEditMode}
          content="Режим редактирования"
          style={{flexShrink: 0}}
        />
        <Button view="outlined" size="m" onClick={resetLayout} style={{flexShrink: 0}}>
          <Icon data={ArrowsRotateLeft} size={16} />
          Сбросить раскладку
        </Button>
      </Flex>

      <div className="dashboard__grid">
        <DashKitDnDWrapper>
          <React.Fragment>
            <DashKit
              config={config}
              editMode={editMode}
              onChange={handleChange}
              onDrop={handleDrop}
              overlayMenuItems={['delete']}
            />
            {editMode ? <ActionPanel items={items} /> : null}
          </React.Fragment>
        </DashKitDnDWrapper>
        {config.items.length === 0 ? (
          <div className="dashboard__empty">
            <Text variant="body-2">
              На дашборде нет виджетов. Включите режим редактирования и добавьте их из панели внизу.
            </Text>
          </div>
        ) : null}
      </div>
    </div>
  );
}
