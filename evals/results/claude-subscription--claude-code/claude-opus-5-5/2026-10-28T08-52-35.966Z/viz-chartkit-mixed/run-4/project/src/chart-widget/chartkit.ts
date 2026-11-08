import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

// Плагины лёгкие: их `renderer` — React.lazy, поэтому код движка
// (@gravity-ui/charts или Yagr/uPlot) скачивается только при первом показе
// графика соответствующего типа.
settings.set({lang: 'ru', plugins: [GravityChartsPlugin, YagrPlugin]});
