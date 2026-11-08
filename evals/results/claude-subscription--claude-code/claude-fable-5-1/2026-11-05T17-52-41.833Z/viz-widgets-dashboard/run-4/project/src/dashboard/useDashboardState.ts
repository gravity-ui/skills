import { useCallback, useEffect, useMemo, useState } from 'react';

import { WIDGETS, isWidgetType, type WidgetType } from '../widgets/registry';
import { addItem, normalizeLayout, removeItem, type Layout } from './layout';

export const COLS = 12;
const STORAGE_KEY = 'gravity-dashboard:v1';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
}

export interface DashboardState {
  widgets: WidgetInstance[];
  layout: Layout;
}

const DEFAULT_STATE: DashboardState = {
  widgets: [
    { id: 'revenue', type: 'revenue' },
    { id: 'users', type: 'users' },
    { id: 'traffic', type: 'traffic' },
    { id: 'quotas', type: 'quotas' },
    { id: 'orders', type: 'orders' },
    { id: 'events', type: 'events' },
    { id: 'sources', type: 'sources' },
  ],
  layout: [
    { id: 'revenue', x: 0, y: 0, w: 3, h: 2 },
    { id: 'users', x: 0, y: 2, w: 3, h: 2 },
    { id: 'traffic', x: 3, y: 0, w: 6, h: 4 },
    { id: 'quotas', x: 9, y: 0, w: 3, h: 4 },
    { id: 'orders', x: 0, y: 4, w: 6, h: 4 },
    { id: 'events', x: 6, y: 4, w: 6, h: 4 },
    { id: 'sources', x: 0, y: 8, w: 6, h: 2 },
  ],
};

function withMinSizes(state: DashboardState): DashboardState {
  const types = new Map(state.widgets.map((w) => [w.id, w.type]));
  const layout = state.layout.map((l) => {
    const def = WIDGETS[types.get(l.id)!];
    return { ...l, minW: def.minSize.w, minH: def.minSize.h };
  });
  return { widgets: state.widgets, layout: normalizeLayout(layout, COLS) };
}

/** Читает сохранённое состояние, отбрасывая всё, что не прошло проверку формы. */
function load(): DashboardState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return withMinSizes(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as Partial<DashboardState>;
    if (!Array.isArray(parsed.widgets) || !Array.isArray(parsed.layout)) return withMinSizes(DEFAULT_STATE);

    const widgets = parsed.widgets.filter(
      (w): w is WidgetInstance => !!w && typeof w.id === 'string' && isWidgetType(w.type),
    );
    const ids = new Set(widgets.map((w) => w.id));
    const layout = parsed.layout.filter(
      (l): l is Layout[number] =>
        !!l && ids.has(l.id) && [l.x, l.y, l.w, l.h].every((n) => typeof n === 'number' && Number.isFinite(n)),
    );
    const laidOut = new Set(layout.map((l) => l.id));
    const complete = widgets.filter((w) => laidOut.has(w.id));
    return withMinSizes({ widgets: complete, layout: layout.filter((l) => complete.some((w) => w.id === l.id)) });
  } catch {
    return withMinSizes(DEFAULT_STATE);
  }
}

export function useDashboardState() {
  const [state, setState] = useState<DashboardState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* приватный режим или переполнение — просто не сохраняем */
    }
  }, [state]);

  const setLayout = useCallback((layout: Layout) => setState((s) => ({ ...s, layout })), []);

  const addWidget = useCallback((type: WidgetType) => {
    const def = WIDGETS[type];
    const id = `${type}-${Date.now().toString(36)}`;
    setState((s) => ({
      widgets: [...s.widgets, { id, type }],
      layout: addItem(s.layout, { id, w: def.defaultSize.w, h: def.defaultSize.h, minW: def.minSize.w, minH: def.minSize.h }, COLS),
    }));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setState((s) => ({ widgets: s.widgets.filter((w) => w.id !== id), layout: removeItem(s.layout, id) }));
  }, []);

  const reset = useCallback(() => setState(withMinSizes(DEFAULT_STATE)), []);

  const widgetById = useMemo(() => new Map(state.widgets.map((w) => [w.id, w])), [state.widgets]);

  return { state, widgetById, setLayout, addWidget, removeWidget, reset };
}
