import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

// react-grid-layout / react-resizable styles are required by DashKit
// (it re-exports the grid machinery but not these base styles).
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {createChartPlugin} from './widgets/pluginChart';
import {pluginNote} from './widgets/pluginNote';
import {pluginStat} from './widgets/pluginStat';

// DashKit relies on uikit i18n for its built-in controls.
configure({lang: Lang.Ru});

DashKit.setSettings({
    gridLayout: {margin: [8, 8]},
});

DashKit.registerPlugins(
    pluginTitle,
    pluginStat,
    createChartPlugin('line-chart', {w: 18, h: 11}),
    createChartPlugin('bar-chart', {w: 18, h: 11}),
    createChartPlugin('pie-chart', {w: 12, h: 11}),
    pluginNote,
);
