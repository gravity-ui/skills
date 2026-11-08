import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

// The plugin objects are tiny: each one is just `{type, renderer: React.lazy(...)}`.
// The engines themselves (@gravity-ui/charts and yagr/uPlot) are split into
// separate chunks and fetched only when a chart of that type is first rendered.
// `lang` localizes ChartKit's own texts (errors, "no data"). Month names and date
// formats come from @gravity-ui/date-utils, which keeps its own locale.
settings.set({lang: 'ru', plugins: [GravityChartsPlugin, YagrPlugin]});
