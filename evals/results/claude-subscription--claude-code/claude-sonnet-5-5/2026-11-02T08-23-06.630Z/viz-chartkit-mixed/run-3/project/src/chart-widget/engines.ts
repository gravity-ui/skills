import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin} from '@gravity-ui/chartkit';

import type {ChartMode} from './types';

/** ChartKit plugin type that renders each widget mode. */
export type EngineType = 'gravity-charts' | 'yagr';

export const MODE_ENGINE: Record<ChartMode, EngineType> = {
  sales: 'gravity-charts',
  monitoring: 'yagr',
};

// Each loader is a dynamic import, so every engine (and its heavy dependency:
// @gravity-ui/charts / uPlot) lands in its own chunk. The plugin entry modules are
// imported dynamically on purpose: the gravity-charts entry re-exports from
// @gravity-ui/charts, so a static import would pull the engine into the main bundle.
const LOADERS: Record<EngineType, () => Promise<ChartKitPlugin>> = {
  'gravity-charts': () =>
    import('@gravity-ui/chartkit/gravity-charts').then((m) => m.GravityChartsPlugin),
  yagr: () => import('@gravity-ui/chartkit/yagr').then((m) => m.YagrPlugin),
};

const pending = new Map<EngineType, Promise<void>>();
const registered = new Set<EngineType>();

export function isEngineReady(engine: EngineType): boolean {
  return registered.has(engine);
}

/** Loads the engine once and registers it in ChartKit. Safe to call repeatedly. */
export function loadEngine(engine: EngineType): Promise<void> {
  if (registered.has(engine)) {
    return Promise.resolve();
  }

  let promise = pending.get(engine);
  if (!promise) {
    promise = LOADERS[engine]()
      .then((plugin) => {
        settings.set({plugins: [plugin]});
        registered.add(engine);
      })
      .finally(() => {
        // On failure the next call retries instead of replaying the rejection.
        pending.delete(engine);
      });
    pending.set(engine, promise);
  }
  return promise;
}
