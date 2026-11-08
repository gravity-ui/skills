import {settings} from '@gravity-ui/chartkit';

import type {AnyChartEngine, ChartWidgetMode} from '../types';

type EngineModule = {engine: AnyChartEngine};

/**
 * Единственное место, где перечислены движки. Каждый `import()` — отдельный чанк,
 * а рендерер плагина внутри ChartKit дополнительно обёрнут в `React.lazy`,
 * поэтому тяжёлые библиотеки (uPlot, d3) не попадают в основной бандл.
 */
const loaders: Record<ChartWidgetMode, () => Promise<EngineModule>> = {
    sales: () => import('./sales'),
    monitoring: () => import('./monitoring'),
};

const pending = new Map<ChartWidgetMode, Promise<AnyChartEngine>>();
const loaded = new Map<ChartWidgetMode, AnyChartEngine>();

/** Загружает модуль движка, регистрирует его плагин в ChartKit и кэширует результат. */
export function loadEngine(mode: ChartWidgetMode): Promise<AnyChartEngine> {
    const ready = loaded.get(mode);
    if (ready) {
        return Promise.resolve(ready);
    }
    const inflight = pending.get(mode);
    if (inflight) {
        return inflight;
    }
    const promise = loaders[mode]()
        .then(({engine}) => {
            settings.set({plugins: [engine.plugin]});
            loaded.set(mode, engine);
            return engine;
        })
        .finally(() => {
            pending.delete(mode);
        });
    pending.set(mode, promise);
    return promise;
}

/** Синхронно возвращает уже загруженный движок, если он есть. */
export function peekEngine(mode: ChartWidgetMode): AnyChartEngine | undefined {
    return loaded.get(mode);
}

/** Предзагрузка движка (например, при наведении на переключатель). Ошибки проглатываются. */
export function preloadEngine(mode: ChartWidgetMode): void {
    loadEngine(mode).catch(() => undefined);
}
