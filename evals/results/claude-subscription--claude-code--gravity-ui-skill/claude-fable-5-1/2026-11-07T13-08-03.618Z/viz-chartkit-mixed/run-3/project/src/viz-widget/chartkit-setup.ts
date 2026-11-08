import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

/**
 * Registers chart engines in the ChartKit plugin registry.
 *
 * Both plugins are declared here, but each plugin's `renderer` is a `React.lazy` component:
 * `@gravity-ui/charts` is fetched only when the widget first renders `type="gravity-charts"`,
 * `@gravity-ui/yagr` only when it first renders `type="yagr"`. Registering is cheap — it does
 * not download either engine.
 *
 * Call once at the app entry point, before any `<VizWidget>` mounts.
 */
export function setupChartKit(lang: 'ru' | 'en' = 'ru') {
    settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang});
}
