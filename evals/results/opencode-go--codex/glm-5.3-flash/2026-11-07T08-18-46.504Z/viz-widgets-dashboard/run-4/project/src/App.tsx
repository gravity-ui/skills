import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, SegmentedRadioGroup } from '@gravity-ui/uikit';
import GridLayout, { Layout, WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Widgets, widgetMeta } from './widgets';
import {
  compactLayouts,
  dashboardBreakpoints as breakpoints,
  dashboardColumns as columns,
  dashboardStorageKey,
  defaultLayout,
  readLayouts,
} from './dashboard-utils';
import './dashboard.css';

const ResponsiveGrid = WidthProvider(Responsive);

type WidgetId = keyof typeof Widgets;
type Layouts = Record<string, Layout[]>;
type Mode = 'view' | 'edit';

function WidgetShell({ id, title, mode, onRemove }: {
  id: WidgetId;
  title: string;
  mode: Mode;
  onRemove: (id: WidgetId) => void;
}) {
  const Widget = Widgets[id];

  return (
    <Card view="raised" className="dashboard-widget">
      <header className="dashboard-widget__header">
        <div>
          <h2 className="dashboard-widget__title">{title}</h2>
          <span className="dashboard-widget__hint">Перетащите за заголовок в режиме настройки</span>
        </div>
        {mode === 'edit' && (
          <Button size="s" view="flat-danger" onClick={() => onRemove(id)}>
            Удалить
          </Button>
        )}
      </header>
      <div className="dashboard-widget__body">
        <Widget />
      </div>
      <span className="dashboard-widget__handle" aria-hidden="true" />
    </Card>
  );
}

export function App() {
  const [layouts, setLayouts] = useState<Layouts>(() => readLayouts(Object.keys(Widgets)));
  const [visible, setVisible] = useState<WidgetId[]>(() => Object.keys(Widgets) as WidgetId[]);
  const [mode, setMode] = useState<Mode>('view');

  useEffect(() => {
    localStorage.setItem(dashboardStorageKey, JSON.stringify(layouts));
  }, [layouts]);

  const handleLayoutChange = useCallback((_current: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  }, []);

  const removeWidget = useCallback((id: WidgetId) => {
    setVisible((current) => current.filter((widgetId) => widgetId !== id));
  }, []);

  const resetLayout = useCallback(() => {
    setLayouts(compactLayouts(defaultLayout));
    setVisible(Object.keys(Widgets) as WidgetId[]);
  }, []);

  const hiddenWidgets = useMemo(
    () => (Object.keys(widgetMeta) as WidgetId[]).filter((id) => !visible.includes(id)),
    [visible],
  );

  return (
    <div className="dashboard">
      <header className="dashboard__toolbar">
        <div>
          <h1>Операционный дашборд</h1>
          <p>Свободно перемещайте виджеты по сетке и меняйте их размер.</p>
        </div>
        <Flex gap="4" alignItems="center" wrap="wrap">
          <SegmentedRadioGroup<Mode>
            value={mode}
            onUpdate={setMode}
            name="dashboard-mode"
            size="m"
            options={[
              { value: 'view', content: 'Просмотр' },
              { value: 'edit', content: 'Настройка' },
            ]}
          />
          <Button view="outlined" size="m" onClick={resetLayout}>Сбросить</Button>
        </Flex>
      </header>

      {mode === 'edit' && (
        <section className="dashboard__palette" aria-label="Скрытые виджеты">
          {hiddenWidgets.length === 0 ? (
            <span>Все доступные виджеты уже на дашборде.</span>
          ) : (
            hiddenWidgets.map((id) => (
              <Button
                key={id}
                size="s"
                view="outlined"
                onClick={() => setVisible((current) => [...current, id])}
              >
                Вернуть «{widgetMeta[id].title}»
              </Button>
            ))
          )}
        </section>
      )}

      <ResponsiveGrid
        className={mode === 'edit' ? 'dashboard__grid dashboard__grid--edit' : 'dashboard__grid'}
        layouts={layouts}
        breakpoints={breakpoints}
        cols={columns}
        rowHeight={28}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={mode === 'edit'}
        isResizable={mode === 'edit'}
        draggableHandle=".dashboard-widget__header"
        onLayoutChange={handleLayoutChange}
      >
        {visible.map((id) => (
          <div key={id}>
            <WidgetShell
              id={id}
              title={widgetMeta[id].title}
              mode={mode}
              onRemove={removeWidget}
            />
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
}
