import type {VizEngine, VizEngineModule, VizEngineType, VizMode} from '../types';

/** Какой движок обслуживает какой режим виджета. */
export const ENGINE_BY_MODE: Record<VizMode, VizEngineType> = {
    sales: 'gravity-charts',
    monitoring: 'yagr',
};

/**
 * Ленивые загрузчики. Каждый `import()` — отдельный чанк: модуль движка тянет
 * плагин ChartKit, а тот, в свою очередь, лениво подгружает сам рендерер
 * (@gravity-ui/charts или @gravity-ui/yagr).
 */
const loaders: Record<VizEngineType, () => Promise<VizEngineModule>> = {
    'gravity-charts': () => import('./gravityChartsEngine'),
    yagr: () => import('./yagrEngine'),
};

const pending = new Map<VizEngineType, Promise<VizEngine>>();
const loaded = new Map<VizEngineType, VizEngine>();

/** Движок, если он уже загружен (синхронно, без промиса). */
export function getLoadedEngine(type: VizEngineType): VizEngine | undefined {
    return loaded.get(type);
}

/** Загружает модуль движка (один раз) и регистрирует его плагин в ChartKit. */
export function loadEngine(type: VizEngineType): Promise<VizEngine> {
    const ready = loaded.get(type);
    if (ready) {
        return Promise.resolve(ready);
    }
    let promise = pending.get(type);
    if (!promise) {
        promise = loaders[type]()
            .then(({engine}) => {
                engine.register();
                loaded.set(type, engine);
                return engine;
            })
            .catch((error: unknown) => {
                pending.delete(type);
                throw error;
            });
        pending.set(type, promise);
    }
    return promise;
}

/** Предзагрузка по намерению пользователя (hover/focus на переключателе). */
export function preloadEngine(type: VizEngineType) {
    loadEngine(type).catch(() => {
        /* ошибка всплывёт при реальном переключении */
    });
}
