import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRotateLeft, Grip, Lock, LockOpen, Moon, Plus, Sun, Xmark } from '@gravity-ui/icons';
import { Button, Card, DropdownMenu, Icon, Text, ThemeProvider } from '@gravity-ui/uikit';

import { GridLayout, type ItemRenderApi } from './grid/GridLayout';
import { addItem, fitToCols, removeItem, type Layout } from './grid/layout';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSize } from './hooks/useSize';
import { DEFAULT_LAYOUT, WIDGETS, WIDGETS_BY_ID } from './widgets/registry';
import './widgets/viz.css';
import './App.css';

const ROW_HEIGHT = 64;
const GAP = 12;
const BASE_COLS = 12;
const STORAGE_KEY = 'dashboard.layouts.v1';

type Layouts = Record<string, Layout>;

const colsFor = (width: number) => (width >= 1100 ? 12 : width >= 700 ? 8 : 4);

const isLayouts = (v: unknown): v is Layouts =>
  typeof v === 'object' &&
  v !== null &&
  Object.values(v as Record<string, unknown>).every(
    (l) =>
      Array.isArray(l) &&
      l.every((i) => i && typeof i.id === 'string' && typeof i.x === 'number' && typeof i.w === 'number'),
  );

/** Убираем из сохранённой раскладки виджеты, которых больше нет в реестре, и подтягиваем их ограничения. */
const sanitize = (layout: Layout): Layout =>
  layout
    .filter((i) => WIDGETS_BY_ID[i.id])
    .map((i) => {
      const d = WIDGETS_BY_ID[i.id];
      return { ...i, minW: d.minW, minH: d.minH, maxH: d.maxH };
    });

export function App() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('dashboard.theme', 'light');
  const [editable, setEditable] = useState(true);
  const [layouts, setLayouts, resetLayouts] = useLocalStorage<Layouts>(
    STORAGE_KEY,
    useMemo(() => ({ [BASE_COLS]: DEFAULT_LAYOUT }), []),
    isLayouts,
  );

  const pageRef = useRef<HTMLDivElement>(null);
  const { width } = useSize(pageRef);
  const cols = width > 0 ? colsFor(width) : BASE_COLS;

  /** Раскладка для текущего числа колонок; если такой ещё нет — выводим из ближайшей. */
  const layout = useMemo<Layout>(() => {
    const own = layouts[cols];
    if (own) return sanitize(own);
    const keys = Object.keys(layouts).map(Number);
    const from = keys.includes(BASE_COLS) ? BASE_COLS : keys.sort((a, b) => b - a)[0];
    const source = from != null ? layouts[from] : DEFAULT_LAYOUT;
    return fitToCols(sanitize(source), from ?? BASE_COLS, cols);
  }, [layouts, cols]);

  // Фиксируем выведенную раскладку, чтобы при следующих правках не пересчитывать её заново.
  useEffect(() => {
    if (width > 0 && !layouts[cols]) setLayouts((prev) => ({ ...prev, [cols]: layout }));
  }, [width, cols, layouts, layout, setLayouts]);

  const updateLayout = useCallback(
    (next: Layout) => setLayouts((prev) => ({ ...prev, [cols]: next })),
    [cols, setLayouts],
  );

  const addWidget = useCallback(
    (id: string) => {
      const d = WIDGETS_BY_ID[id];
      setLayouts((prev) => {
        const next: Layouts = {};
        for (const key of new Set([...Object.keys(prev), String(cols)])) {
          const c = Number(key);
          const k = c / BASE_COLS;
          const base = prev[key] ?? layout;
          next[key] = addItem(
            base.filter((i) => i.id !== id),
            { id, w: Math.max(d.minW, Math.round(d.w * k)), h: d.h, minW: d.minW, minH: d.minH, maxH: d.maxH },
            c,
          );
        }
        return next;
      });
    },
    [cols, layout, setLayouts],
  );

  const removeWidget = useCallback(
    (id: string) => {
      setLayouts((prev) =>
        Object.fromEntries(Object.entries(prev).map(([key, l]) => [key, removeItem(l, id, Number(key))])),
      );
    },
    [setLayouts],
  );

  const present = new Set(layout.map((i) => i.id));
  const available = WIDGETS.filter((w) => !present.has(w.id));

  const renderItem = useCallback(
    ({ item, dragHandleProps, isDragging, editable: canEdit }: ItemRenderApi) => {
      const def = WIDGETS_BY_ID[item.id];
      const { Component } = def;
      return (
        <Card view={isDragging ? 'raised' : 'outlined'} type="container" className="widget">
          <header className={`widget__header${canEdit ? ' widget__header_editable' : ''}`}>
            {canEdit && (
              <button type="button" {...dragHandleProps} className={`widget__grip ${dragHandleProps.className}`}>
                <Icon data={Grip} size={16} />
              </button>
            )}
            <Text as="h2" variant="subheader-2" ellipsis className="widget__title" title={def.title}>
              {def.title}
            </Text>
            {canEdit && (
              <Button
                view="flat-secondary"
                size="s"
                aria-label={`Убрать виджет «${def.title}»`}
                onClick={() => removeWidget(item.id)}
              >
                <Icon data={Xmark} size={14} />
              </Button>
            )}
          </header>
          <div className="widget__body">
            <Component />
          </div>
        </Card>
      );
    },
    [removeWidget],
  );

  return (
    <ThemeProvider theme={theme} scoped>
      <div className="dashboard" ref={pageRef}>
        <div className="dashboard__header">
          <div className="dashboard__title">
            <Text as="h1" variant="header-2">
              Обзор
            </Text>
            <Text variant="body-1" color="secondary">
              Последние 30 дней · {editable ? 'перетаскивайте виджеты за ручку, тяните за правый нижний угол' : 'раскладка закреплена'}
            </Text>
          </div>
          <div className="dashboard__controls">
            <DropdownMenu
              items={
                available.length
                  ? available.map((w) => ({ text: w.title, action: () => addWidget(w.id) }))
                  : [{ text: 'Все виджеты уже на дашборде', disabled: true, action: () => undefined }]
              }
              renderSwitcher={(props) => (
                <Button {...props} view="action" disabled={!editable}>
                  <Icon data={Plus} size={16} />
                  Добавить виджет
                </Button>
              )}
            />
            <Button view="outlined" onClick={() => setEditable((v) => !v)} aria-pressed={!editable}>
              <Icon data={editable ? LockOpen : Lock} size={16} />
              {editable ? 'Закрепить' : 'Редактировать'}
            </Button>
            <Button view="outlined" onClick={resetLayouts} title="Вернуть раскладку по умолчанию">
              <Icon data={ArrowRotateLeft} size={16} />
              Сбросить
            </Button>
            <Button
              view="flat"
              aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Icon data={theme === 'light' ? Moon : Sun} size={16} />
            </Button>
          </div>
        </div>

        {layout.length === 0 ? (
          <div className="dashboard__empty">
            <Text variant="body-2">Дашборд пуст. Добавьте виджет кнопкой выше.</Text>
          </div>
        ) : (
          <GridLayout
            layout={layout}
            cols={cols}
            rowHeight={ROW_HEIGHT}
            gap={GAP}
            editable={editable}
            onLayoutChange={updateLayout}
            renderItem={renderItem}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
