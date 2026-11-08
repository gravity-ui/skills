import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin} from '@gravity-ui/chartkit';

import type {VizMode} from './types';

/**
 * Each engine lives behind a dynamic import, so neither the plugin module nor the
 * charting library it pulls in (@gravity-ui/charts / @gravity-ui/yagr) is in the main bundle.
 * The module is requested only when its mode is first shown.
 */
const importers: Record<VizMode, () => Promise<ChartKitPlugin>> = {
  sales: () => import('@gravity-ui/chartkit/gravity-charts').then((m) => m.GravityChartsPlugin),
  monitoring: () => import('@gravity-ui/chartkit/yagr').then((m) => m.YagrPlugin),
};

const registrations = new Map<VizMode, Promise<void>>();

export function registerEngine(mode: VizMode): Promise<void> {
  let promise = registrations.get(mode);
  if (!promise) {
    promise = importers[mode]().then((plugin) => {
      settings.set({plugins: [plugin]});
    });
    // allow a retry after a network failure
    promise.catch(() => registrations.delete(mode));
    registrations.set(mode, promise);
  }
  return promise;
}
