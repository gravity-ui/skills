import {lazy, type ComponentType, type LazyExoticComponent} from 'react';

import type {ChartMode, EngineProps} from '../types';

/**
 * Each engine is a separate chunk, fetched the first time its mode is shown.
 * `lazy` is created once here at module scope; creating it during render would
 * refetch and remount the engine on every render.
 */
export const ENGINES: Record<ChartMode, LazyExoticComponent<ComponentType<EngineProps>>> = {
    sales: lazy(() => import('./SalesLineEngine')),
    monitoring: lazy(() => import('./MonitoringEngine')),
};
