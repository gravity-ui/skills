import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

/**
 * Global ChartKit plugin registry — must be populated at app entry, before the
 * first `<ChartKit>` render (an unregistered `type` throws at render time).
 *
 * Registering a plugin does NOT pull the engine into the initial bundle: each
 * plugin's renderer is `React.lazy`, so the @gravity-ui/charts /
 * @gravity-ui/yagr code is fetched only when a chart of that type first shows.
 */
settings.set({
    plugins: [GravityChartsPlugin, YagrPlugin],
    lang: 'ru',
});
