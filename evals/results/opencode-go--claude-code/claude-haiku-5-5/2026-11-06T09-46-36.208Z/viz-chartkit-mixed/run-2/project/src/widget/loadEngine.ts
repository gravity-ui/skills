import type {EngineModule} from './engine';
import type {ChartMode} from './types';

export type EngineImporter = () => Promise<EngineModule>;

/**
 * Возвращает загрузчик движков: каждый модуль импортируется не более одного раза
 * (промис кешируется). Неудачная загрузка сбрасывает кеш, чтобы можно было повторить.
 */
export function createEngineLoader<M extends string>(importers: Record<M, EngineImporter>) {
  const cache = new Map<M, Promise<EngineModule>>();
  return (mode: M): Promise<EngineModule> => {
    let pending = cache.get(mode);
    if (!pending) {
      pending = importers[mode]().catch((error: unknown) => {
        cache.delete(mode);
        throw error;
      });
      cache.set(mode, pending);
    }
    return pending;
  };
}

// Динамические импорты создают отдельные чанки: движки не попадают в основной бандл,
// пока режим не выбран. uPlot тянется только вместе с monitoring-движком.
export const loadEngine = createEngineLoader<ChartMode>({
  sales: () => import('./engines/salesEngine'),
  monitoring: () => import('./engines/monitoringEngine'),
});
