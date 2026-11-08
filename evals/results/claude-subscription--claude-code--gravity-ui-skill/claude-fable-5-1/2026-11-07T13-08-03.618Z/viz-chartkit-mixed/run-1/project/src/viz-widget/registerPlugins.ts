import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

/**
 * Регистрация плагинов в глобальном реестре ChartKit.
 *
 * Сами плагины — это только `{type, renderer: React.lazy(...)}`: код движка
 * (`@gravity-ui/charts` или `@gravity-ui/yagr`) попадает в отдельный чанк
 * и загружается при первом рендере соответствующего `type`.
 * `settings.set` сливает список плагинов, поэтому повторный вызов безопасен.
 */
settings.set({lang: 'ru', plugins: [GravityChartsPlugin, YagrPlugin]});
