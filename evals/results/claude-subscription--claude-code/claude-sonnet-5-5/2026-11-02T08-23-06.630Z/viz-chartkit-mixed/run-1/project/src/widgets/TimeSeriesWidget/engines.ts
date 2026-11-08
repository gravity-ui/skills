import type {ComponentType} from 'react';
import type {ChartKitProps} from '@gravity-ui/chartkit';

import type {TimeSeriesMode} from './types';

type ChartKitComponent = ComponentType<ChartKitProps<'gravity-charts'> | ChartKitProps<'yagr'>>;

export type EngineType = 'gravity-charts' | 'yagr';

export const ENGINE_BY_MODE: Record<TimeSeriesMode, EngineType> = {
  sales: 'gravity-charts',
  monitoring: 'yagr',
};

/**
 * Каждый движок — отдельный динамический import() => отдельный чанк.
 * Пока режим не открыт, его код (и код ChartKit) не скачивается.
 * Промисы кэшируются: повторное переключение не создаёт новых запросов.
 */
const pluginLoaders: Record<EngineType, () => Promise<unknown>> = {
  'gravity-charts': async () => {
    const {settings} = await import('@gravity-ui/chartkit');
    const {GravityChartsPlugin} = await import('@gravity-ui/chartkit/gravity-charts');
    settings.set({plugins: [GravityChartsPlugin]});
  },
  yagr: async () => {
    const {settings} = await import('@gravity-ui/chartkit');
    const {YagrPlugin} = await import('@gravity-ui/chartkit/yagr');
    settings.set({plugins: [YagrPlugin]});
  },
};

const cache = new Map<EngineType, Promise<ChartKitComponent>>();

export function loadEngine(engine: EngineType): Promise<ChartKitComponent> {
  let promise = cache.get(engine);
  if (!promise) {
    promise = (async () => {
      // регистрация плагина должна завершиться до первого рендера <ChartKit type=...>
      await pluginLoaders[engine]();
      const mod = await import('@gravity-ui/chartkit');
      return mod.default as unknown as ChartKitComponent;
    })();
    // неудачная загрузка не должна навсегда застревать в кэше
    promise.catch(() => cache.delete(engine));
    cache.set(engine, promise);
  }
  return promise;
}
