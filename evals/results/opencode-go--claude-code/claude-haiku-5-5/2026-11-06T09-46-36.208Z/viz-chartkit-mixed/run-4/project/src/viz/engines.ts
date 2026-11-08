import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin} from '@gravity-ui/chartkit';

import type {VizMode} from './types';

/**
 * Engine registry. Each engine's code is loaded only when its mode is first requested.
 *
 * The `import()` lives here rather than in a top-level import on purpose: the plugin
 * modules re-export `@gravity-ui/charts` (or yagr) at their top level, so importing
 * the plugin module is what pulls the engine in. A dynamic import keeps it out of the
 * entry chunk until the reader actually switches to that mode.
 */
const LOADERS: Record<VizMode, () => Promise<ChartKitPlugin>> = {
  sales: () => import('@gravity-ui/chartkit/gravity-charts').then((m) => m.GravityChartsPlugin),
  monitoring: () => import('@gravity-ui/chartkit/yagr').then((m) => m.YagrPlugin),
};

const pending = new Map<VizMode, Promise<void>>();

/**
 * Loads the engine for `mode` and registers it with ChartKit. Resolves once the plugin
 * is registered, so a `<ChartKit type=…>` rendered afterwards cannot hit "unknown plugin".
 * Repeated calls share one load. A failed load is forgotten so a later attempt can retry.
 */
export function ensureEngine(mode: VizMode): Promise<void> {
  const existing = pending.get(mode);
  if (existing) {
    return existing;
  }
  const loading = LOADERS[mode]()
    .then((plugin) => {
      settings.set({plugins: [plugin]});
    })
    .catch((error: unknown) => {
      pending.delete(mode);
      throw error;
    });
  pending.set(mode, loading);
  return loading;
}
