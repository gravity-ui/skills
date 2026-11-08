import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin} from '@gravity-ui/chartkit';

import type {ChartWidgetMode} from './types';

// Language of the built-in ChartKit strings (tooltips, errors).
settings.set({lang: 'ru'});

/**
 * Each mode is backed by its own charting engine. Plugin modules are imported
 * dynamically, so neither engine reaches the main bundle: its code is fetched
 * (and registered in the ChartKit registry) the first time its mode is shown.
 */
const loaders: Record<ChartWidgetMode, () => Promise<ChartKitPlugin>> = {
  sales: () =>
    import('@gravity-ui/chartkit/gravity-charts').then((m) => m.GravityChartsPlugin),
  monitoring: () => import('@gravity-ui/chartkit/yagr').then((m) => m.YagrPlugin),
};

const cache = new Map<ChartWidgetMode, Promise<void>>();

export function loadEngine(mode: ChartWidgetMode): Promise<void> {
  let promise = cache.get(mode);
  if (!promise) {
    promise = loaders[mode]().then((plugin) => {
      settings.set({plugins: [plugin]});
    });
    // Do not cache failures, so that a retry actually re-requests the chunk.
    promise.catch(() => cache.delete(mode));
    cache.set(mode, promise);
  }
  return promise;
}
