import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

import {
    barChartPlugin,
    lineChartPlugin,
    metricPlugin,
    notePlugin,
    pieChartPlugin,
    tablePlugin,
} from './widgets';

// DashKit must be configured once, before the first render.
configure({lang: Lang.Ru});

DashKit.setSettings({
    gridLayout: {margin: [12, 12], rowHeight: 18},
});

DashKit.registerPlugins(
    pluginTitle,
    metricPlugin,
    lineChartPlugin,
    barChartPlugin,
    pieChartPlugin,
    tablePlugin,
    notePlugin,
);
