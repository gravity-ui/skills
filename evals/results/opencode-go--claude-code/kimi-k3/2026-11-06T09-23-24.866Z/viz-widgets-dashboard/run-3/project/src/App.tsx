import { useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, Icon, Text, ThemeProvider } from '@gravity-ui/uikit';
import {
  ArrowRotateLeft,
  ChartLine,
  Grip,
  Moon,
  Plus,
  SquareListUl,
  Sun,
  TrashBin,
  Xmark,
} from '@gravity-ui/icons';

import { DashboardGrid, type DragHandleProps, type GridItem } from './grid/DashboardGrid';
import { findFreeSpot, type Layout } from './grid/layout';
import { WIDGETS, WidgetBody, type WidgetType } from './widgets';
import './viz.css';

interface WidgetState extends GridItem {
  type: WidgetType;
}

const STORAGE_KEY = 'viz-dashboard-layout-v2';

const DEFAULT_WIDGETS: WidgetState[] = (
  [
    { type: 'kpi', x: 0, y: 0 },
    { type: 'revenue', x: 0, y: 2 },
    { type: 'categories', x: 7, y: 2 },
    { type: 'sources', x: 0, y: 6 },
    { type: 'pages', x: 7, y: 8 },
  ] as const
).map(({ type, x, y }) => {
  const meta = WIDGETS[type];
  return {
    id: type,
    type,
    x,
    y,
    w: meta.defaultW,
    h: meta.defaultH,
    minW: meta.minW,
    minH: meta.minH,
  };
});

function loadWidgets(): WidgetState[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGETS;
    const parsed = JSON.parse(raw) as { type: WidgetType; x: number; y: number; w: number; h: number }[];
    return parsed
      .filter((p) => p.type in WIDGETS)
      .map((p) => {
        const meta = WIDGETS[p.type];
        return {
          id: p.type,
          type: p.type,
          x: p.x,
          y: p.y,
          w: Math.max(meta.minW, p.w),
          h: Math.max(meta.minH, p.h),
          minW: meta.minW,
          minH: meta.minH,
        };
      });
  } catch {
    return DEFAULT_WIDGETS;
  }
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [widgets, setWidgets] = useState<WidgetState[]>(loadWidgets);
  const [tableViews, setTableViews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(widgets.map(({ type, x, y, w, h }) => ({ type, x, y, w, h }))),
    );
  }, [widgets]);

  const onLayoutChange = (layout: Layout) => {
    setWidgets((prev) =>
      prev.map((w) => {
        const item = layout.find((i) => i.id === w.id);
        return item ? { ...w, x: item.x, y: item.y, w: item.w, h: item.h } : w;
      }),
    );
  };

  const addWidget = (type: WidgetType) => {
    setWidgets((prev) => {
      const meta = WIDGETS[type];
      const spot = findFreeSpot(prev, meta.defaultW, meta.defaultH);
      return [
        ...prev,
        {
          id: type,
          type,
          ...spot,
          w: meta.defaultW,
          h: meta.defaultH,
          minW: meta.minW,
          minH: meta.minH,
        },
      ];
    });
  };

  const removeWidget = (id: string) =>
    setWidgets((prev) => prev.filter((w) => w.id !== id));

  const resetLayout = () => setWidgets(DEFAULT_WIDGETS);

  const addMenuItems = useMemo(
    () =>
      (Object.keys(WIDGETS) as WidgetType[])
        .filter((t) => !widgets.some((w) => w.type === t))
        .map((t) => ({ action: () => addWidget(t), text: WIDGETS[t].title })),
    [widgets],
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="viz-page">
        <header className="viz-header">
          <Text variant="header-1">Панель показателей</Text>
          <span className="viz-header__spacer" />
          <DropdownMenu
            items={addMenuItems}
            disabled={addMenuItems.length === 0}
            renderSwitcher={(props) => (
              <Button {...props} view="outlined">
                <Icon data={Plus} size={16} />
                Виджет
              </Button>
            )}
          />
          <Button view="outlined" onClick={resetLayout} title="Сбросить расположение">
            <Icon data={ArrowRotateLeft} size={16} />
            Сбросить
          </Button>
          <Button
            view="outlined"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            title="Переключить тему"
          >
            <Icon data={theme === 'light' ? Moon : Sun} size={16} />
          </Button>
        </header>

        <main className="viz-board">
          <DashboardGrid
            items={widgets}
            onChange={onLayoutChange}
            renderItem={(item, dragProps: DragHandleProps) => {
              const meta = WIDGETS[item.type];
              const table = !!tableViews[item.id];
              return (
                <section className="viz-widget" aria-label={meta.title}>
                  <div className="viz-widget__header">
                    <span className="viz-widget__drag" {...dragProps}>
                      <Icon data={Grip} size={16} />
                    </span>
                    <span className="viz-widget__title">{meta.title}</span>
                    {meta.hasTableView && (
                      <Button
                        view="flat-secondary"
                        size="s"
                        title={table ? 'Показать график' : 'Показать таблицу'}
                        onClick={() =>
                          setTableViews((prev) => ({ ...prev, [item.id]: !table }))
                        }
                      >
                        <Icon data={table ? ChartLine : SquareListUl} size={14} />
                      </Button>
                    )}
                    <Button
                      view="flat-secondary"
                      size="s"
                      title="Убрать виджет"
                      onClick={() => removeWidget(item.id)}
                    >
                      <Icon data={Xmark} size={14} />
                    </Button>
                  </div>
                  <div className="viz-widget__body">
                    <WidgetBody type={item.type} table={table} />
                  </div>
                </section>
              );
            }}
          />
          {widgets.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--viz-text-secondary)' }}>
              <Icon data={TrashBin} size={24} />
              <p>Все виджеты убраны. Добавьте их кнопкой «Виджет» выше.</p>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
