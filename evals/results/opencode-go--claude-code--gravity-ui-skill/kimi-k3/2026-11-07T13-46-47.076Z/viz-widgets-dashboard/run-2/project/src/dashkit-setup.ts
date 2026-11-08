import {configure, Lang} from '@gravity-ui/uikit';
import {DashKit, pluginTitle} from '@gravity-ui/dashkit';

import {pluginBars, pluginList, pluginMeter, pluginStat} from './widgets';

configure({lang: Lang.Ru});

DashKit.setSettings({
  gridLayout: {margin: [8, 8], containerPadding: [8, 8]},
  // default overlay menu is [copy, delete]; copy needs an ActionPanel to paste into,
  // which this dashboard doesn't have — keep only delete
  menu: ['delete'],
});

DashKit.registerPlugins(pluginTitle, pluginStat, pluginBars, pluginMeter, pluginList);
