/**
 * One-time ChartKit setup. Imported for its side effect by the widget, so the
 * registry is populated before the first `<ChartKit>` render.
 *
 * Registering a plugin is cheap: each plugin's `renderer` is a `React.lazy`
 * component, so `@gravity-ui/charts` and `@gravity-ui/yagr` are split into
 * separate chunks and fetched only when a view with that engine is first shown.
 */
import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

import type {VisualizationEngine} from './types';

settings.set({lang: 'ru', plugins: [GravityChartsPlugin, YagrPlugin]});

/** Maps the widget's engine names onto ChartKit plugin types. */
export const CHARTKIT_TYPE = {
    line: 'gravity-charts',
    timeseries: 'yagr',
} as const satisfies Record<VisualizationEngine, string>;
