import * as React from 'react';

import { findFreeSlot, compact, type Layout } from './grid/layout';
import { DEFAULT_LAYOUT, WIDGETS } from './widgets/registry';

const STORAGE_KEY = 'dashboard-layout-v1';
const COLS = 12;

interface Persisted {
  layout: Layout;
  hidden: string[];
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { layout: DEFAULT_LAYOUT, hidden: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const known = new Set(WIDGETS.map((w) => w.id));
    const layout = (parsed.layout ?? []).filter((item) => known.has(item.i));
    const hidden = (parsed.hidden ?? []).filter((id) => known.has(id));
    const present = new Set([...layout.map((item) => item.i), ...hidden]);
    // Виджеты, которых не было в сохранённой раскладке (например, добавленные позже), дописываем снизу.
    for (const def of DEFAULT_LAYOUT) {
      if (!present.has(def.i)) layout.push({ ...def, ...findFreeSlot(layout, def.w, def.h, COLS) });
    }
    // Ограничения берём из реестра, а не из хранилища.
    const sizes = new Map(DEFAULT_LAYOUT.map((d) => [d.i, d]));
    const normalized = layout.map((item) => {
      const def = sizes.get(item.i)!;
      return { ...item, minW: def.minW, minH: def.minH, maxW: def.maxW, maxH: def.maxH };
    });
    return { layout: compact(normalized, COLS), hidden };
  } catch {
    return { layout: DEFAULT_LAYOUT, hidden: [] };
  }
}

export function useDashboardState() {
  const [state, setState] = React.useState<Persisted>(load);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* приватный режим или переполненное хранилище — просто не сохраняем */
    }
  }, [state]);

  const setLayout = React.useCallback((layout: Layout) => setState((prev) => ({ ...prev, layout })), []);

  const hideWidget = React.useCallback((id: string) => {
    setState((prev) => ({
      layout: compact(prev.layout.filter((item) => item.i !== id), COLS),
      hidden: prev.hidden.includes(id) ? prev.hidden : [...prev.hidden, id],
    }));
  }, []);

  const showWidget = React.useCallback((id: string) => {
    setState((prev) => {
      const def = DEFAULT_LAYOUT.find((item) => item.i === id);
      if (!def || prev.layout.some((item) => item.i === id)) return prev;
      const slot = findFreeSlot(prev.layout, def.w, def.h, COLS);
      return { layout: compact([...prev.layout, { ...def, ...slot }], COLS), hidden: prev.hidden.filter((h) => h !== id) };
    });
  }, []);

  const reset = React.useCallback(() => setState({ layout: DEFAULT_LAYOUT, hidden: [] }), []);

  return { layout: state.layout, hidden: state.hidden, setLayout, hideWidget, showWidget, reset, cols: COLS };
}
