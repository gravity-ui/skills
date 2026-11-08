import {settings} from '@gravity-ui/chartkit';

import type {VizEngine, VizMode} from '../types';
import {monitoringTimeseriesEngine} from './monitoringTimeseries';
import {salesLineEngine} from './salesLine';

/** Соответствие режима виджета движку графиков. Единственное место, где это задано. */
export const ENGINES = {
    sales: salesLineEngine,
    monitoring: monitoringTimeseriesEngine,
} as const satisfies Record<VizMode, VizEngine>;

const loaded = new Set<VizMode>();
const pending = new Map<VizMode, Promise<void>>();

export function isEngineLoaded(mode: VizMode): boolean {
    return loaded.has(mode);
}

/**
 * Лениво загружает движок режима и регистрирует его плагин в ChartKit.
 * Повторные вызовы для уже загруженного или загружающегося режима не создают новых запросов.
 * При ошибке загрузки следующий вызов повторит попытку.
 */
export function loadEngine(mode: VizMode): Promise<void> {
    if (loaded.has(mode)) {
        return Promise.resolve();
    }

    let promise = pending.get(mode);
    if (!promise) {
        promise = ENGINES[mode]
            .load()
            .then((plugin) => {
                settings.set({plugins: [plugin]});
                loaded.add(mode);
            })
            .finally(() => {
                pending.delete(mode);
            });
        pending.set(mode, promise);
    }

    return promise;
}

/** Сбрасывает состояние реестра. Нужен только тестам. */
export function resetEngineRegistry(): void {
    loaded.clear();
    pending.clear();
}
