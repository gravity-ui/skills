import { useEffect, useState } from 'react';
import { DEFAULT_LAYOUT, widgetById } from './registry';
import { normalize, type Layout } from './layout';

const KEY = 'dashboard:v1';

export interface Saved {
  layout: Layout;
  gravity: boolean;
}

const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback);

/** Read a saved dashboard; anything unknown or malformed is dropped, sizes come from the registry. */
export function load(cols: number): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && Array.isArray(raw.layout)) {
      const seen = new Set<string>();
      const layout: Layout = [];
      for (const r of raw.layout) {
        const def = typeof r?.id === 'string' ? widgetById(r.id) : undefined;
        if (!def || seen.has(def.id)) continue;
        seen.add(def.id);
        layout.push({ id: def.id, x: num(r.x, 0), y: num(r.y, 0), w: num(r.w, def.w), h: num(r.h, def.h), minW: def.minW, minH: def.minH });
      }
      return { layout: normalize(layout, cols), gravity: raw.gravity !== false };
    }
  } catch {
    /* corrupted or unavailable storage → defaults */
  }
  return { layout: DEFAULT_LAYOUT, gravity: true };
}

export function usePersistentDashboard(cols: number) {
  const [state, setState] = useState<Saved>(() => load(cols));
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota / private mode: keep working in memory */
    }
  }, [state]);
  return [state, setState] as const;
}
