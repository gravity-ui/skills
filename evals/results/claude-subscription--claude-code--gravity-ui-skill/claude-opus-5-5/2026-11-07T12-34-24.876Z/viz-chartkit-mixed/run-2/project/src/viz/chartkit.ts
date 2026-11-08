import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

/**
 * Регистрация движков в глобальном реестре ChartKit.
 *
 * Плагины содержат только `React.lazy`-рендереры: код `@gravity-ui/charts`
 * и `@gravity-ui/yagr` загружается отдельным чанком при первом показе
 * соответствующего режима, а не в основном бандле.
 */
settings.set({
    plugins: [GravityChartsPlugin, YagrPlugin],
    lang: 'ru',
});
