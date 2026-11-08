import {settings} from '@gravity-ui/chartkit';

import type {ChartWidgetMode} from './types';

/**
 * Each mode maps to its own chart engine. The plugin module (and with it the
 * engine) is fetched with a dynamic import only when the mode is first shown,
 * then registered in the global ChartKit registry.
 */
const loaders: Record<ChartWidgetMode, () => Promise<void>> = {
  sales: () =>
    import('@gravity-ui/chartkit/gravity-charts').then(({GravityChartsPlugin}) => {
      settings.set({plugins: [GravityChartsPlugin]});
    }),
  monitoring: () =>
    import('@gravity-ui/chartkit/yagr').then(({YagrPlugin}) => {
      settings.set({plugins: [YagrPlugin]});
    }),
};

const cache = new Map<ChartWidgetMode, Promise<void>>();

export function loadEngine(mode: ChartWidgetMode): Promise<void> {
  let promise = cache.get(mode);
  if (!promise) {
    promise = loaders[mode]();
    // Allow a retry after a failed network request
    promise.catch(() => cache.delete(mode));
    cache.set(mode, promise);
  }
  return promise;
}
