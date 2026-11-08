import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, pluginTitle} from '@gravity-ui/dashkit';

import {chartPlugin} from './plugins/chart';
import {metricPlugin} from './plugins/metric';
import {notePlugin} from './plugins/note';

let initialized = false;

/**
 * One-time DashKit configuration: language, grid settings and widget plugins.
 * Must run before the first <DashKit /> render. The guard makes it safe
 * against StrictMode double-invocation and HMR re-evaluation.
 */
export function setupDashboard() {
    if (initialized) {
        return;
    }
    initialized = true;

    configure({lang: Lang.Ru});

    DashKit.setSettings({
        gridLayout: {margin: [8, 8]},
    });

    DashKit.registerPlugins(pluginTitle, notePlugin, chartPlugin, metricPlugin);
}

setupDashboard();
