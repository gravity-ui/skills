import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import type {Plugin} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

import {MetricWidget} from './widgets/MetricWidget';
import {NoteWidget} from './widgets/NoteWidget';
import {ProgressWidget} from './widgets/ProgressWidget';
import {TableWidget} from './widgets/TableWidget';

/** Типы виджетов, зарегистрированных в DashKit. */
export const WIDGET_TYPES = {
  title: 'title',
  metric: 'metric',
  table: 'table',
  progress: 'progress',
  note: 'note',
} as const;

export type WidgetType = (typeof WIDGET_TYPES)[keyof typeof WIDGET_TYPES];

const metricPlugin: Plugin = {
  type: WIDGET_TYPES.metric,
  defaultLayout: {w: 9, h: 6},
  renderer: (props) => <MetricWidget {...props} />,
};

const tablePlugin: Plugin = {
  type: WIDGET_TYPES.table,
  defaultLayout: {w: 18, h: 14},
  renderer: (props) => <TableWidget {...props} />,
};

const progressPlugin: Plugin = {
  type: WIDGET_TYPES.progress,
  defaultLayout: {w: 12, h: 12},
  renderer: (props) => <ProgressWidget {...props} />,
};

const notePlugin: Plugin = {
  type: WIDGET_TYPES.note,
  defaultLayout: {w: 12, h: 8},
  renderer: (props) => <NoteWidget {...props} />,
};

let configured = false;

/** Настраивает DashKit один раз до первого рендера: язык, сетка, плагины. */
export function setupDashKit() {
  if (configured) return;
  configured = true;

  configure({lang: Lang.Ru});

  DashKit.setSettings({
    gridLayout: {margin: [12, 12]},
  });

  DashKit.registerPlugins(pluginTitle, metricPlugin, tablePlugin, progressPlugin, notePlugin);
}
