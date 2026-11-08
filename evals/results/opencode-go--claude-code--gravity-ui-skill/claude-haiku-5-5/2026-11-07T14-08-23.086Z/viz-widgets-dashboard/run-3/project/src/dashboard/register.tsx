import {DashKit} from '@gravity-ui/dashkit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';

import {ActivityWidget, ChartWidget, KpiWidget} from './widgets';
import {WIDGET_TYPES} from './types';
import type {KpiWidgetData} from './types';

// DashKit must be configured before it renders: grid spacing and widget plugins.
// `reloadPlugins` (unlike `registerPlugins`) does not throw if this module is re-evaluated by HMR.
DashKit.setSettings({
  gridLayout: {margin: [8, 8]},
});

DashKit.reloadPlugins(
  {
    type: WIDGET_TYPES.kpi,
    defaultLayout: {w: 9, h: 6, minW: 6, minH: 4},
    renderer: ({data}: PluginWidgetProps) => <KpiWidget metric={(data as unknown as KpiWidgetData).metric} />,
  },
  {
    type: WIDGET_TYPES.chart,
    defaultLayout: {w: 24, h: 14, minW: 12, minH: 8},
    renderer: () => <ChartWidget />,
  },
  {
    type: WIDGET_TYPES.activity,
    defaultLayout: {w: 12, h: 14, minW: 8, minH: 6},
    renderer: () => <ActivityWidget />,
  },
);
