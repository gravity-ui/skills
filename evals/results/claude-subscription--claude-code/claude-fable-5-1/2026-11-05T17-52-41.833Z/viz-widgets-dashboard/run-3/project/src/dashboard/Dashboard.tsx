import {useEffect, useMemo, useRef, useState} from 'react';
import {Button, DropdownMenu, Icon, SegmentedRadioGroup, Switch, Text} from '@gravity-ui/uikit';

import {generateData, RANGE_DAYS} from './data';
import type {DashboardData, RangeKey} from './data';
import {formatDayMonth, formatFullDate} from './format';
import {GridLayout} from './GridLayout';
import type {GridItemApi} from './GridLayout';
import {useElementSize, useLocalStorageState} from './hooks';
import {LockIcon, LockOpenIcon, PlusIcon, ResetIcon} from './icons';
import {addItem, compact, removeItem, scaleLayout} from './layout';
import type {Layout, LayoutItem} from './types';
import {isWidgetKind, WIDGET_KINDS, WIDGETS} from './widgets/registry';
import type {WidgetKind} from './widgets/registry';
import {WidgetFrame} from './widgets/WidgetFrame';
import type {WidgetView} from './widgets/WidgetFrame';

import './dashboard.css';

const STORAGE_KEY = 'viz-dashboard:v1';
const BASE_COLS = 12;
const ROW_HEIGHT = 56;
const GAP = 12;

interface WidgetInstance {
  id: string;
  kind: WidgetKind;
}

interface DashboardState {
  version: 1;
  widgets: WidgetInstance[];
  /** One layout per column count; the 12-column one is canonical, others are derived on first use. */
  layouts: Record<string, Layout>;
}

const DEFAULT_WIDGETS: Array<WidgetInstance & Pick<LayoutItem, 'x' | 'y'>> = [
  {id: 'stat-users', kind: 'stat-users', x: 0, y: 0},
  {id: 'stat-revenue', kind: 'stat-revenue', x: 3, y: 0},
  {id: 'stat-conversion', kind: 'stat-conversion', x: 6, y: 0},
  {id: 'stat-errors', kind: 'stat-errors', x: 9, y: 0},
  {id: 'sessions', kind: 'sessions', x: 0, y: 3},
  {id: 'sources', kind: 'sources', x: 8, y: 3},
  {id: 'pages', kind: 'pages', x: 8, y: 6},
  {id: 'activity', kind: 'activity', x: 0, y: 9},
  {id: 'orders', kind: 'orders', x: 8, y: 12},
];

function itemFor(id: string, kind: WidgetKind, x: number, y: number): LayoutItem {
  const def = WIDGETS[kind];
  return {i: id, x, y, w: def.size.w, h: def.size.h, minW: def.minSize.w, minH: def.minSize.h};
}

function defaultState(): DashboardState {
  return {
    version: 1,
    widgets: DEFAULT_WIDGETS.map(({id, kind}) => ({id, kind})),
    layouts: {[BASE_COLS]: compact(DEFAULT_WIDGETS.map((w) => itemFor(w.id, w.kind, w.x, w.y)), BASE_COLS)},
  };
}

function isLayout(value: unknown): value is Layout {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.i === 'string' &&
        [item.x, item.y, item.w, item.h].every((n) => Number.isInteger(n) && n >= 0),
    )
  );
}

function isDashboardState(value: unknown): value is DashboardState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<DashboardState>;
  return (
    v.version === 1 &&
    Array.isArray(v.widgets) &&
    v.widgets.every((w) => w && typeof w.id === 'string' && isWidgetKind(w.kind)) &&
    !!v.layouts &&
    typeof v.layouts === 'object' &&
    Object.values(v.layouts).every(isLayout)
  );
}

/** Drops layout entries for removed widgets and places widgets that have no entry yet. */
function syncLayout(layout: Layout, widgets: WidgetInstance[], cols: number): Layout {
  const ids = new Set(widgets.map((w) => w.id));
  let next = layout.filter((item) => ids.has(item.i));
  const present = new Set(next.map((item) => item.i));
  for (const w of widgets) {
    if (!present.has(w.id)) next = addItem(next, itemFor(w.id, w.kind, 0, 0), cols);
  }
  return next.length === layout.length && next.every((item, i) => item === layout[i]) ? layout : compact(next, cols);
}

function columnsFor(width: number): number {
  if (width >= 960) return 12;
  if (width >= 600) return 6;
  return 0; // stacked
}

function useDashboardData(range: RangeKey): {data: DashboardData; loading: boolean} {
  const [data, setData] = useState(() => generateData(range));
  const [loading, setLoading] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setLoading(true);
    // Simulated refetch: the previous frame stays on screen at reduced opacity, no skeleton.
    const timer = window.setTimeout(() => {
      setData(generateData(range));
      setLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [range]);
  return {data, loading};
}

export function Dashboard() {
  const [state, setState] = useLocalStorageState<DashboardState>(STORAGE_KEY, defaultState, isDashboardState);
  const [editable, setEditable] = useLocalStorageState<boolean>('viz-dashboard:editable', true, (v): v is boolean => typeof v === 'boolean');
  const [range, setRange] = useState<RangeKey>('30d');
  const [views, setViews] = useState<Record<string, WidgetView>>({});
  const [hostRef, hostSize] = useElementSize<HTMLDivElement>();
  const {data, loading} = useDashboardData(range);

  const cols = columnsFor(hostSize.width);
  const layout = useMemo(() => {
    const key = String(cols || BASE_COLS);
    const stored = state.layouts[key];
    const base = state.layouts[String(BASE_COLS)] ?? [];
    const candidate = stored ?? scaleLayout(base, BASE_COLS, cols || BASE_COLS);
    return syncLayout(candidate, state.widgets, cols || BASE_COLS);
  }, [state, cols]);

  const onLayoutChange = (next: Layout) => {
    setState((prev) => ({...prev, layouts: {...prev.layouts, [String(cols)]: next}}));
  };

  const addWidget = (kind: WidgetKind) => {
    const id = `${kind}-${Date.now().toString(36)}`;
    setState((prev) => {
      const layouts: Record<string, Layout> = {};
      for (const [key, l] of Object.entries(prev.layouts)) layouts[key] = addItem(l, itemFor(id, kind, 0, 0), Number(key));
      return {...prev, widgets: [...prev.widgets, {id, kind}], layouts};
    });
  };

  const removeWidget = (id: string) => {
    setState((prev) => {
      const layouts: Record<string, Layout> = {};
      for (const [key, l] of Object.entries(prev.layouts)) layouts[key] = removeItem(l, id, Number(key));
      return {...prev, widgets: prev.widgets.filter((w) => w.id !== id), layouts};
    });
  };

  const reset = () => {
    setState(defaultState());
    setViews({});
  };

  const widgetById = useMemo(() => new Map(state.widgets.map((w) => [w.id, w])), [state.widgets]);
  const titleOf = (item: LayoutItem) => {
    const w = widgetById.get(item.i);
    return w ? WIDGETS[w.kind].title : item.i;
  };

  const renderWidget = (api: Pick<GridItemApi, 'item' | 'editable'> & Partial<GridItemApi>) => {
    const w = widgetById.get(api.item.i);
    if (!w) return null;
    const def = WIDGETS[w.kind];
    const view = views[w.id] ?? 'chart';
    return (
      <WidgetFrame
        title={def.title}
        editable={api.editable}
        dragHandleProps={api.dragHandleProps}
        supportsTable={def.supportsTable}
        view={view}
        onViewChange={(next) => setViews((prev) => ({...prev, [w.id]: next}))}
        onRemove={() => removeWidget(w.id)}
      >
        {def.render({data, view})}
      </WidgetFrame>
    );
  };

  const periodStart = data.dates[0];
  const periodEnd = data.dates[data.dates.length - 1];
  const addItems = WIDGET_KINDS.map((kind) => ({
    text: WIDGETS[kind].title,
    action: () => addWidget(kind),
    disabled: state.widgets.some((w) => w.kind === kind),
  }));

  return (
    <div className="dash">
      <header className="dash__header">
        <div>
          <Text as="h1" variant="header-2">
            Обзор продукта
          </Text>
          <Text as="p" variant="body-1" color="secondary">
            Виджеты можно перетаскивать за рукоятку и растягивать за правый нижний угол.
          </Text>
        </div>
        <div className="dash__toolbar">
          <Switch size="m" checked={editable} onUpdate={setEditable}>
            <span className="dash__switch-label">
              <Icon data={editable ? LockOpenIcon : LockIcon} size={14} />
              Редактирование
            </span>
          </Switch>
          <DropdownMenu
            items={addItems}
            renderSwitcher={(props) => (
              <Button view="action" disabled={!editable} {...props}>
                <Icon data={PlusIcon} size={16} />
                Добавить виджет
              </Button>
            )}
          />
          <Button view="outlined" onClick={reset} disabled={!editable}>
            <Icon data={ResetIcon} size={16} />
            Сбросить раскладку
          </Button>
        </div>
      </header>

      <div className="dash__filters" role="group" aria-label="Фильтры">
        <SegmentedRadioGroup<RangeKey> size="m" value={range} onUpdate={setRange} aria-label="Период">
          {(Object.keys(RANGE_DAYS) as RangeKey[]).map((key) => (
            <SegmentedRadioGroup.Option key={key} value={key}>
              {RANGE_DAYS[key]} дней
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
        <Text variant="body-1" color="secondary">
          {formatDayMonth(periodStart)} — {formatFullDate(periodEnd)}
        </Text>
      </div>

      <div ref={hostRef} className={`dash__grid-host${loading ? ' dash__grid-host_loading' : ''}`} aria-busy={loading}>
        {hostSize.width === 0 ? null : state.widgets.length === 0 ? (
          <div className="dash__empty">
            <Text variant="subheader-2">На дашборде нет виджетов</Text>
            <Text variant="body-1" color="secondary">
              Добавьте их через меню «Добавить виджет» или сбросьте раскладку.
            </Text>
          </div>
        ) : cols > 0 ? (
          <GridLayout
            layout={layout}
            cols={cols}
            rowHeight={ROW_HEIGHT}
            gap={GAP}
            width={hostSize.width}
            editable={editable}
            onLayoutChange={onLayoutChange}
            renderItem={renderWidget}
            getItemLabel={titleOf}
          />
        ) : (
          <div className="stack">
            {layout.map((item) => (
              <div key={item.i} className="stack__item" style={{height: item.h * ROW_HEIGHT + (item.h - 1) * GAP}}>
                {renderWidget({item, editable: false})}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
