import './dashkit-setup';

import React from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, Config, ItemDropProps} from '@gravity-ui/dashkit';
import {ArrowsRotateRight, Moon, Pencil, Sun} from '@gravity-ui/icons';
import {Button, Icon, Text} from '@gravity-ui/uikit';

import {WIDGET_CATALOG, initialConfig} from './widget-catalog';
import type {WidgetType} from './widget-catalog';

interface AppProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function App({theme, onToggleTheme}: AppProps) {
  const [config, setConfig] = React.useState<Config>(initialConfig);
  const [editMode, setEditMode] = React.useState(false);

  const addWidget = React.useCallback((type: WidgetType) => {
    const entry = WIDGET_CATALOG.find((item) => item.type === type);
    if (!entry) {
      return;
    }
    setConfig((prev) =>
      DashKit.setItem({
        item: {type, namespace: 'default', data: entry.makeData()},
        config: prev,
      }),
    );
  }, []);

  const onDrop = React.useCallback((dropProps: ItemDropProps) => {
    const type = dropProps.dragProps.type as WidgetType;
    const entry = WIDGET_CATALOG.find((item) => item.type === type);
    if (entry) {
      const {w, h, x, y} = dropProps.itemLayout;
      setConfig((prev) =>
        DashKit.setItem({
          item: {
            type,
            namespace: 'default',
            data: entry.makeData(),
            layout: {w, h, x, y},
          },
          config: prev,
          options: {updateLayout: dropProps.newLayout},
        }),
      );
    }
    dropProps.commit();
  }, []);

  const onReset = React.useCallback(() => {
    setConfig(structuredClone(initialConfig));
  }, []);

  const panelItems = React.useMemo<ActionPanelItem[]>(
    () =>
      WIDGET_CATALOG.map((entry) => ({
        id: entry.type,
        icon: <Icon data={entry.icon} size={16} />,
        title: entry.title,
        qa: `add-widget-${entry.type}`,
        dragProps: {type: entry.type},
        onClick: () => addWidget(entry.type),
      })),
    [addWidget],
  );

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title">
          <Text variant="header-1" ellipsis>
            Дашборд
          </Text>
        </div>
        <Button
          className="app__action"
          view="flat"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        >
          <Icon data={theme === 'light' ? Moon : Sun} size={16} />
        </Button>
        <Button className="app__action" view="outlined" onClick={onReset}>
          <Icon data={ArrowsRotateRight} size={16} />
          Сбросить
        </Button>
        <Button
          className="app__action"
          view={editMode ? 'action' : 'outlined'}
          onClick={() => setEditMode((value) => !value)}
          qa="toggle-edit-mode"
        >
          <Icon data={Pencil} size={16} />
          {editMode ? 'Готово' : 'Редактировать'}
        </Button>
      </header>
      <main className="app__dash">
        {config.items.length === 0 ? (
          <div className="app__empty">
            <Text variant="subheader-2" color="secondary">
              На дашборде пока нет виджетов
            </Text>
            <Text variant="body-2" color="hint">
              Нажмите «Редактировать» и добавьте виджеты с панели внизу
            </Text>
          </div>
        ) : null}
        <DashKitDnDWrapper>
          <>
            <DashKit
              editMode={editMode}
              config={config}
              onChange={({config: next}) => setConfig(next)}
              onDrop={onDrop}
            />
            {editMode ? <ActionPanel items={panelItems} /> : null}
          </>
        </DashKitDnDWrapper>
      </main>
    </div>
  );
}
