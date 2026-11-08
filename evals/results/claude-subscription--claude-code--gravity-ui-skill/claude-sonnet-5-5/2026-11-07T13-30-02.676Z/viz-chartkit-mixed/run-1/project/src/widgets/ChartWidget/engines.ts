import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin, ChartKitType} from '@gravity-ui/chartkit';

import type {ChartWidgetMode} from './types';

/**
 * Each mode has its own chart engine. The plugin modules are imported dynamically,
 * so the engine code (`@gravity-ui/charts` / `@gravity-ui/yagr`) lands in a separate
 * chunk and is fetched only when the mode is first shown.
 * (Importing a plugin statically would pull the engine into the main bundle:
 * the `gravity-charts` plugin entry re-exports from `@gravity-ui/charts`.)
 */
const ENGINES: Record<
    ChartWidgetMode,
    {type: ChartKitType; load: () => Promise<ChartKitPlugin>}
> = {
    sales: {
        type: 'gravity-charts',
        load: () => import('@gravity-ui/chartkit/gravity-charts').then((m) => m.GravityChartsPlugin),
    },
    monitoring: {
        type: 'yagr',
        load: () => import('@gravity-ui/chartkit/yagr').then((m) => m.YagrPlugin),
    },
};

const pending = new Map<ChartWidgetMode, Promise<void>>();

export function getEngineType(mode: ChartWidgetMode) {
    return ENGINES[mode].type;
}

/** Loads the engine for the mode once and registers it in the ChartKit registry. */
export function ensureEngine(mode: ChartWidgetMode): Promise<void> {
    let promise = pending.get(mode);
    if (!promise) {
        promise = ENGINES[mode]
            .load()
            .then((plugin) => settings.set({plugins: [plugin]}))
            .catch((error) => {
                // allow a retry after a failed chunk load
                pending.delete(mode);
                throw error;
            });
        pending.set(mode, promise);
    }
    return promise;
}
