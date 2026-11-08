import React from 'react';

import type {ChartMode, EngineProps} from '../types';

type EngineModule = {default: React.ComponentType<EngineProps>};

/**
 * Динамические import() живут только здесь, поэтому chartkit/движки не попадают
 * в основной бандл. Промис кэшируется: прогрев (preload) и React.lazy
 * используют один и тот же запрос, чанк грузится ровно один раз.
 */
const loaders: Record<ChartMode, () => Promise<EngineModule>> = {
  sales: () => import('./SalesEngine'),
  monitoring: () => import('./MonitoringEngine'),
};

const cache = new Map<ChartMode, Promise<EngineModule>>();

export function preloadEngine(mode: ChartMode): Promise<EngineModule> {
  let promise = cache.get(mode);
  if (!promise) {
    promise = loaders[mode]();
    // Неудачную загрузку не кэшируем — повторная попытка должна пойти в сеть.
    promise.catch(() => cache.delete(mode));
    cache.set(mode, promise);
  }
  return promise;
}

export const LazyEngines: Record<ChartMode, React.LazyExoticComponent<React.ComponentType<EngineProps>>> = {
  sales: React.lazy(() => preloadEngine('sales')),
  monitoring: React.lazy(() => preloadEngine('monitoring')),
};
