import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, pluginText, pluginTitle} from '@gravity-ui/dashkit';

import {ChartWidget} from './widgets/ChartWidget';
import {StatWidget} from './widgets/StatWidget';

// DashKit requires the uikit language to be configured before it renders.
configure({lang: Lang.Ru});

DashKit.setSettings({
  gridLayout: {
    cols: 36,
    rowHeight: 20,
    margin: [8, 8],
    containerPadding: [0, 0],
  },
});

DashKit.registerPlugins(
  pluginTitle,
  pluginText,
  {
    type: 'stat',
    defaultLayout: {w: 12, h: 5, minW: 6, minH: 4},
    renderer: StatWidget,
  },
  {
    type: 'chart',
    defaultLayout: {w: 18, h: 12, minW: 9, minH: 8},
    renderer: ChartWidget,
  },
);
