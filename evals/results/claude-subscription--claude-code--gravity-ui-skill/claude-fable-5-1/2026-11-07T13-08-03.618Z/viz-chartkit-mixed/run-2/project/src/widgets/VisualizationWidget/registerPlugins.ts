import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

let registered = false;

/**
 * Регистрирует оба плагина ChartKit. Вызывается один раз на входе в приложение.
 *
 * Регистрация плагина — это только запись в реестр: сам рендерер плагина обёрнут в `React.lazy`,
 * поэтому код `@gravity-ui/charts` и `@gravity-ui/yagr` подтягивается отдельными чанками
 * лишь при первом рендере `<ChartKit type="gravity-charts" />` / `<ChartKit type="yagr" />`.
 */
export function registerVisualizationPlugins(): void {
    if (registered) {
        return;
    }
    registered = true;
    settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});
}
