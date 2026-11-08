import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

// Global plugin registry, populated once at module load.
// Both plugin renderers are React.lazy components: the @gravity-ui/charts
// bundle is fetched only when a `gravity-charts` widget first renders, and
// the @gravity-ui/yagr bundle only when a `yagr` widget first renders.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});

export {ChartKit};
