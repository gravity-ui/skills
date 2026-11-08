import type { WidgetDef } from './types';
import { StatsWidget } from './StatsWidget';
import { ChartWidget } from './ChartWidget';
import { ListWidget } from './ListWidget';
import { TextWidget } from './TextWidget';
import type { ComponentType } from 'react';
import type { WidgetProps } from './types';

type WidgetComponent = ComponentType<WidgetProps>;

const componentMap: Record<WidgetDef['type'], WidgetComponent> = {
  stats: StatsWidget,
  chart: ChartWidget,
  list: ListWidget,
  text: TextWidget,
};

export function getWidgetComponent(def: WidgetDef): WidgetComponent {
  return componentMap[def.type];
}

export const WIDGET_DEFS: WidgetDef[] = [
  {
    id: 'widget-stats-1',
    type: 'stats',
    title: 'Active users',
    defaultW: 3,
    defaultH: 4,
    minW: 2,
    minH: 3,
  },
  {
    id: 'widget-stats-2',
    type: 'stats',
    title: 'Uptime',
    defaultW: 3,
    defaultH: 4,
    minW: 2,
    minH: 3,
  },
  {
    id: 'widget-chart-1',
    type: 'chart',
    title: 'Response time',
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'widget-chart-2',
    type: 'chart',
    title: 'Req/sec',
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'widget-list-1',
    type: 'list',
    title: 'Events',
    defaultW: 3,
    defaultH: 5,
    minW: 2,
    minH: 4,
  },
  {
    id: 'widget-text-1',
    type: 'text',
    title: 'Status',
    defaultW: 3,
    defaultH: 3,
    minW: 2,
    minH: 2,
  },
];

export function buildInitialLayout() {
  let x = 0;
  let y = 0;
  const rowCapacity = 12;

  return WIDGET_DEFS.map((def) => {
    if (x + def.defaultW > rowCapacity) {
      x = 0;
      y += 1;
    }
    const layout = {
      i: def.id,
      x,
      y,
      w: def.defaultW,
      h: def.defaultH,
      minW: def.minW,
      minH: def.minH,
    };
    x += def.defaultW;
    return layout;
  });
}
