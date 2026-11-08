import {lazy} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';

import type {ChartEngineProps, ChartMode} from './types';

/**
 * Engine registry: every mode maps to a lazily imported module. Each engine
 * is a separate Vite chunk, fetched only when its mode is first selected.
 * Both engines implement the same ChartEngineProps contract.
 */
export const chartEngines: Record<ChartMode, LazyExoticComponent<ComponentType<ChartEngineProps>>> = {
  sales: lazy(() => import('./engines/sales/SalesLineChart')),
  monitoring: lazy(() => import('./engines/monitoring/MonitoringChart')),
};
