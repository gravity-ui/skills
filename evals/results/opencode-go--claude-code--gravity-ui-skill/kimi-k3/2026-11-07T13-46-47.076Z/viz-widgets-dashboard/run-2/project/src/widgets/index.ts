import * as React from 'react';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

import {BarsWidget, type BarsWidgetData} from './BarsWidget';
import {ListWidget, type ListWidgetData} from './ListWidget';
import {MeterWidget, type MeterWidgetData} from './MeterWidget';
import {StatWidget, type StatWidgetData} from './StatWidget';

export const pluginStat: Plugin = {
  type: 'stat',
  defaultLayout: {w: 12, h: 7, minW: 6, minH: 5},
  renderer: function StatPlugin({data}: PluginWidgetProps) {
    return React.createElement(StatWidget, {data: data as unknown as StatWidgetData});
  },
};

export const pluginBars: Plugin = {
  type: 'bars',
  defaultLayout: {w: 18, h: 16, minW: 12, minH: 10},
  renderer: function BarsPlugin({data}: PluginWidgetProps) {
    return React.createElement(BarsWidget, {data: data as unknown as BarsWidgetData});
  },
};

export const pluginMeter: Plugin = {
  type: 'meter',
  defaultLayout: {w: 12, h: 6, minW: 6, minH: 4},
  renderer: function MeterPlugin({data}: PluginWidgetProps) {
    return React.createElement(MeterWidget, {data: data as unknown as MeterWidgetData});
  },
};

export const pluginList: Plugin = {
  type: 'list',
  defaultLayout: {w: 12, h: 12, minW: 8, minH: 6},
  renderer: function ListPlugin({data}: PluginWidgetProps) {
    return React.createElement(ListWidget, {data: data as unknown as ListWidgetData});
  },
};
