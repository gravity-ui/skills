import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

// Плагины регистрируются один раз. Сам код движков сюда не попадает:
// renderer каждого плагина — React.lazy, и его чанк скачивается
// только при первом рендере <ChartKit type="..."/> этого типа.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});
