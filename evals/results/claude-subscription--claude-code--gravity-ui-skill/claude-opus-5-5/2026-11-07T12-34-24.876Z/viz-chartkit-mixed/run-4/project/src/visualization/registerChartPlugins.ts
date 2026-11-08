import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

/**
 * Registers ChartKit plugins in the global registry.
 *
 * Must run once at the app entry point, before the first `<ChartKit>` render.
 * Registration is cheap: each plugin only holds a `React.lazy` renderer, so the
 * actual engine (`@gravity-ui/charts` or `@gravity-ui/yagr`) is fetched as a
 * separate chunk the first time its chart type is rendered.
 */
settings.set({
    plugins: [GravityChartsPlugin, YagrPlugin],
    lang: 'ru',
});
