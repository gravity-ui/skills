import {lazy} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';

import type {ChartEngineProps, ChartMode} from './types';

/**
 * Реестр движков. Каждый движок — отдельный чанк, который загружается при первом
 * открытии своего режима. Остальные движки в браузер не попадают.
 */
export const ENGINES: Record<ChartMode, LazyExoticComponent<ComponentType<ChartEngineProps>>> = {
  sales: lazy(() => import('./engines/SalesLineEngine')),
  monitoring: lazy(() => import('./engines/MonitoringTimeseriesEngine')),
};
