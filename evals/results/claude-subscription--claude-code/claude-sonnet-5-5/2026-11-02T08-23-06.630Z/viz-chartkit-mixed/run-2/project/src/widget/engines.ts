import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin} from '@gravity-ui/chartkit';

import type {WidgetMode} from './types';

/**
 * Ленивая загрузка движков. Каждый движок — отдельный dynamic import (отдельный чанк),
 * который стартует только когда режим впервые показывается. Промис кэшируется:
 * повторные переключения не импортируют и не регистрируют плагин заново.
 */
const loaders: Record<WidgetMode, () => Promise<ChartKitPlugin>> = {
    // Обычный линейный график — gravity-charts (SVG/d3)
    sales: () => import('@gravity-ui/chartkit/gravity-charts').then((m) => m.GravityChartsPlugin),
    // Плотный временной ряд — yagr (uPlot, canvas)
    monitoring: () => import('@gravity-ui/chartkit/yagr').then((m) => m.YagrPlugin),
};

export const ENGINE_TYPE: Record<WidgetMode, 'gravity-charts' | 'yagr'> = {
    sales: 'gravity-charts',
    monitoring: 'yagr',
};

const cache = new Map<WidgetMode, Promise<void>>();

// settings.set объединяет плагины по `type` (не заменяет список) — регистрация идемпотентна.
const register = (plugin: ChartKitPlugin) => settings.set({plugins: [plugin]});

export function loadEngine(mode: WidgetMode): Promise<void> {
    let promise = cache.get(mode);
    if (!promise) {
        promise = loaders[mode]().then(register);
        // Неудачная загрузка (сеть) не должна застревать в кэше — иначе «повторить» не сработает.
        promise.catch(() => cache.delete(mode));
        cache.set(mode, promise);
    }
    return promise;
}

