import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

// Регистрируем плагины один раз. Рендерер каждого плагина — React.lazy:
// код движка (gravity-charts / yagr) загружается только при первом показе
// графика этого типа.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});
