import type {VizEngine, VizMode} from '../types';

type EngineLoader = () => Promise<VizEngine>;

/**
 * Карта ленивых загрузчиков. Каждый `import()` — отдельный чанк сборки:
 * код Gravity Charts не попадает в бандл до первого включения режима
 * «Продажи», код Yagr/uPlot — до первого включения «Мониторинга».
 */
const loaders: Record<VizMode, EngineLoader> = {
    sales: () => import('./salesEngine').then((m) => m.salesEngine),
    monitoring: () => import('./monitoringEngine').then((m) => m.monitoringEngine),
};

const cache = new Map<VizMode, Promise<VizEngine>>();
const ready = new Map<VizMode, VizEngine>();

/** Загружает движок для режима (один раз) и регистрирует его плагин в ChartKit. */
export function loadEngine(mode: VizMode): Promise<VizEngine> {
    let pending = cache.get(mode);
    if (!pending) {
        pending = loaders[mode]()
            .then(async (engine) => {
                await engine.prepare?.();
                return engine;
            })
            .then(
                (engine) => {
                    ready.set(mode, engine);
                    return engine;
                },
                (error) => {
                    // Неудачную загрузку не кэшируем — следующий вызов повторит попытку.
                    cache.delete(mode);
                    throw error;
                },
            );
        cache.set(mode, pending);
    }
    return pending;
}

/** Синхронный доступ к уже загруженному движку (например, для первого рендера без мерцания). */
export function getLoadedEngine(mode: VizMode): VizEngine | undefined {
    return ready.get(mode);
}

/** Предзагрузка — удобно вызывать при наведении на переключатель режимов. */
export function preloadEngine(mode: VizMode): void {
    void loadEngine(mode).catch(() => undefined);
}

/** Только для тестов: сброс состояния реестра. */
export function resetEngineRegistry(): void {
    cache.clear();
    ready.clear();
}
