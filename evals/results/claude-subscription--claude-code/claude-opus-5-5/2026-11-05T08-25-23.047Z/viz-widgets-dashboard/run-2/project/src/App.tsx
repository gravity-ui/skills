import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, Icon, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { ArrowRotateLeft, ChartLine, Grip, ListUl, Lock, LockOpen, Plus } from '@gravity-ui/icons';

import './dashboard.css';
import { useSize } from './charts';
import { DashboardGrid, type GridItemApi } from './DashboardGrid';
import { type Period, fmt, getDashboardData } from './data';
import { type Layout, compact, findFreeSpot, sanitizeLayout, stackLayout } from './layout';
import { WIDGETS, type WidgetDef, type WidgetView } from './widgets';

const COLS = 12;
const ROW_HEIGHT = 72;
const GAP = 16;
/** Below this width the grid collapses into one read-only column. */
const NARROW_WIDTH = 720;
const STORAGE_KEY = 'dashboard-state:v1';
const PERIODS: Period[] = [7, 30, 90];

const DEFAULT_LAYOUT: Layout = WIDGETS.map((w) => ({ id: w.id, ...w.layout }));
const WIDGET_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));

interface SavedState {
  layout: Layout;
  views: Record<string, WidgetView>;
  period: Period;
}

function loadState(): SavedState {
  const fallback: SavedState = { layout: DEFAULT_LAYOUT, views: {}, period: 30 };
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return fallback;
    const layout = sanitizeLayout(raw.layout, DEFAULT_LAYOUT, COLS) ?? DEFAULT_LAYOUT;
    const views: Record<string, WidgetView> = {};
    for (const [id, view] of Object.entries(raw.views ?? {})) {
      if (WIDGET_BY_ID.get(id)?.hasTableView && (view === 'chart' || view === 'table')) views[id] = view;
    }
    const period = PERIODS.includes(raw.period) ? (raw.period as Period) : 30;
    return { layout, views, period };
  } catch {
    return fallback;
  }
}

export function App() {
  const [initial] = useState(loadState);
  const [layout, setLayout] = useState<Layout>(initial.layout);
  const [views, setViews] = useState(initial.views);
  const [period, setPeriod] = useState<Period>(initial.period);
  const [editing, setEditing] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [rootRef, { width }] = useSize<HTMLDivElement>();

  const data = useMemo(() => getDashboardData(period), [period]);
  const narrow = width > 0 && width < NARROW_WIDTH;
  const editable = editing && !narrow;

  useEffect(() => {
    try {
      const compactLayout = layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ layout: compactLayout, views, period }));
    } catch {
      // Storage can be unavailable (private mode, quota) — the dashboard still works.
    }
  }, [layout, views, period]);

  const hidden = WIDGETS.filter((w) => !layout.some((item) => item.id === w.id));

  const addWidget = (widget: WidgetDef) => {
    const spot = findFreeSpot(layout, widget.layout.w, widget.layout.h, COLS);
    setLayout(compact([...layout, { id: widget.id, ...widget.layout, ...spot }], COLS));
    setAnnouncement(`Виджет «${widget.title}» добавлен`);
  };

  const removeWidget = (widget: WidgetDef) => {
    setLayout(compact(layout.filter((item) => item.id !== widget.id), COLS));
    setAnnouncement(`Виджет «${widget.title}» скрыт. Вернуть его можно кнопкой «Добавить виджет»`);
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    setViews({});
    setAnnouncement('Раскладка сброшена к исходной');
  };

  const getLabel = useCallback((id: string) => WIDGET_BY_ID.get(id)?.title ?? id, []);

  const first = data.dates[0];
  const last = data.dates[data.dates.length - 1];

  return (
    <div className="dash viz-root" ref={rootRef}>
      <header className="dash__header">
        <div>
          <h1 className="dash__title">Аналитика интернет-магазина</h1>
          <div className="dash__subtitle">
            {fmt.day(first)} — {fmt.day(last)} {last.getFullYear()}
          </div>
        </div>
        <div className="dash__actions">
          <DropdownMenu
            items={hidden.map((widget) => ({ text: widget.title, action: () => addWidget(widget) }))}
            renderSwitcher={(props) => (
              <Button {...props} view="outlined" disabled={hidden.length === 0}>
                <Icon data={Plus} size={16} />
                Добавить виджет
              </Button>
            )}
          />
          <Button view="outlined" onClick={resetLayout}>
            <Icon data={ArrowRotateLeft} size={16} />
            Сбросить
          </Button>
          <Button
            view={editing ? 'action' : 'outlined'}
            onClick={() => setEditing((v) => !v)}
            aria-pressed={editing}
            disabled={narrow}
          >
            <Icon data={editing ? LockOpen : Lock} size={16} />
            {editing ? 'Редактирование' : 'Раскладка закреплена'}
          </Button>
        </div>
      </header>

      {/* One filter row above everything it scopes. */}
      <div className="dash__filters">
        <span className="dash__filter-label" id="period-label">
          Период
        </span>
        <SegmentedRadioGroup
          aria-labelledby="period-label"
          value={String(period)}
          onUpdate={(value) => setPeriod(Number(value) as Period)}
          options={PERIODS.map((p) => ({ value: String(p), content: `${p} дней` }))}
        />
      </div>

      <p className="dash__hint" id="grid-help">
        {narrow
          ? 'На узком экране виджеты выстроены в одну колонку. Менять раскладку можно на широком экране.'
          : editable
            ? 'Перетаскивайте виджеты за заголовок, размер меняйте за правый нижний угол. С клавиатуры: фокус на ручке ⠿, стрелки — переместить, Shift + стрелки — изменить размер. Esc отменяет перетаскивание.'
            : 'Раскладка закреплена. Включите «Редактирование», чтобы двигать виджеты.'}
      </p>

      {layout.length === 0 ? (
        <div className="dash__empty">
          Все виджеты скрыты.{' '}
          <Button view="flat-action" onClick={resetLayout}>
            Вернуть исходную раскладку
          </Button>
        </div>
      ) : (
        <DashboardGrid
          layout={narrow ? stackLayout(layout) : layout}
          cols={narrow ? 1 : COLS}
          rowHeight={ROW_HEIGHT}
          gap={GAP}
          editable={editable}
          onLayoutChange={setLayout}
          onAnnounce={setAnnouncement}
          getLabel={getLabel}
          renderItem={(id, api) => {
            const widget = WIDGET_BY_ID.get(id)!;
            return (
              <WidgetFrame
                widget={widget}
                api={api}
                editable={editable}
                view={views[id] ?? 'chart'}
                onToggleView={() =>
                  setViews((v) => ({ ...v, [id]: (v[id] ?? 'chart') === 'chart' ? 'table' : 'chart' }))
                }
                onRemove={() => removeWidget(widget)}
              >
                <widget.Component data={data} view={views[id] ?? 'chart'} />
              </WidgetFrame>
            );
          }}
        />
      )}

      <div className="visually-hidden" aria-live="polite" role="status">
        {announcement}
      </div>
    </div>
  );
}

function WidgetFrame({
  widget,
  api,
  editable,
  view,
  onToggleView,
  onRemove,
  children,
}: {
  widget: WidgetDef;
  api: GridItemApi;
  editable: boolean;
  view: WidgetView;
  onToggleView: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const titleId = `widget-title-${widget.id}`;
  return (
    <section className={`widget${api.active ? ' widget_active' : ''}`} aria-labelledby={titleId}>
      <header className="widget__header" {...api.dragHandleProps}>
        {editable && (
          <button
            type="button"
            className="widget__grip"
            aria-label={`Переместить «${widget.title}»`}
            aria-describedby="grid-help"
            {...api.gripProps}
          >
            <Icon data={Grip} size={14} />
          </button>
        )}
        <h2 className="widget__title" id={titleId}>
          {widget.title}
        </h2>
        <div className="widget__actions" data-nodrag>
          {widget.hasTableView && (
            <Button
              view="flat-secondary"
              size="s"
              onClick={onToggleView}
              title={view === 'chart' ? 'Показать таблицей' : 'Показать графиком'}
              aria-label={view === 'chart' ? 'Показать таблицей' : 'Показать графиком'}
            >
              <Icon data={view === 'chart' ? ListUl : ChartLine} size={16} />
            </Button>
          )}
          <DropdownMenu
            size="s"
            defaultSwitcherProps={{ view: 'flat-secondary', size: 's', 'aria-label': `Действия: ${widget.title}` }}
            items={[
              ...(widget.hasTableView
                ? [{ text: view === 'chart' ? 'Показать таблицей' : 'Показать графиком', action: onToggleView }]
                : []),
              { text: 'Скрыть виджет', action: onRemove, theme: 'danger' as const },
            ]}
          />
        </div>
      </header>
      <div className="widget__body">{children}</div>
    </section>
  );
}
