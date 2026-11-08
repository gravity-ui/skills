import {DashKit} from '@gravity-ui/dashkit';
import type {Config} from '@gravity-ui/dashkit';

import {KPI_DATA} from './data';
import type {KpiMetric} from './data';
import {WIDGET_TYPES} from './widgets';

const STORAGE_KEY = 'dashboard-config:v1';

export interface WidgetTemplate {
  id: string;
  title: string;
  type: string;
  data: Record<string, unknown>;
}

/** Widgets offered in the "Add widget" menu. Sizes come from each plugin's defaultLayout. */
export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  ...(Object.keys(KPI_DATA) as KpiMetric[]).map((metric) => ({
    id: `kpi-${metric}`,
    title: KPI_DATA[metric].label,
    type: WIDGET_TYPES.kpi,
    data: {metric},
  })),
  {
    id: 'revenue-chart',
    title: 'График выручки',
    type: WIDGET_TYPES.revenueChart,
    data: {},
  },
  {
    id: 'channels-chart',
    title: 'Заказы по каналам',
    type: WIDGET_TYPES.channelsChart,
    data: {},
  },
  {
    id: 'activity',
    title: 'Последние события',
    type: WIDGET_TYPES.activity,
    data: {},
  },
];

const emptyConfig = (): Config => ({
  salt: String(Math.random()),
  counter: 0,
  items: [],
  layout: [],
  aliases: {},
  connections: [],
});

/** Builds the initial dashboard: four KPI tiles, two charts, and an activity feed. */
export function createDefaultConfig(): Config {
  const placements: {type: string; data: Record<string, unknown>; x: number; y: number; w: number; h: number}[] = [
    {type: WIDGET_TYPES.kpi, data: {metric: 'revenue'}, x: 0, y: 0, w: 9, h: 4},
    {type: WIDGET_TYPES.kpi, data: {metric: 'orders'}, x: 9, y: 0, w: 9, h: 4},
    {type: WIDGET_TYPES.kpi, data: {metric: 'conversion'}, x: 18, y: 0, w: 9, h: 4},
    {type: WIDGET_TYPES.kpi, data: {metric: 'users'}, x: 27, y: 0, w: 9, h: 4},
    {type: WIDGET_TYPES.revenueChart, data: {}, x: 0, y: 4, w: 22, h: 10},
    {type: WIDGET_TYPES.channelsChart, data: {}, x: 22, y: 4, w: 14, h: 10},
    {type: WIDGET_TYPES.activity, data: {}, x: 0, y: 14, w: 18, h: 8},
  ];

  return placements.reduce<Config>(
    (config, {type, data, x, y, w, h}) =>
      DashKit.setItem({
        item: {type, data, namespace: 'default', layout: {x, y, w, h}},
        config,
      }),
    emptyConfig(),
  );
}

/** Adds a widget at the first free slot below the existing layout (plugin default size). */
export function addWidget(config: Config, template: WidgetTemplate): Config {
  return DashKit.setItem({
    item: {type: template.type, data: template.data, namespace: 'default'},
    config,
  });
}

function isConfig(value: unknown): value is Config {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Partial<Config>;
  if (typeof c.salt !== 'string' || typeof c.counter !== 'number') return false;
  if (!Array.isArray(c.items) || !Array.isArray(c.layout)) return false;
  const ids = new Set(c.items.map((item) => item.id));
  return c.layout.every((l) => ids.has(l.i));
}

export function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isConfig(parsed)) return parsed;
    }
  } catch {
    // Corrupted JSON or storage unavailable: fall back to the default layout.
  }
  return createDefaultConfig();
}

export function saveConfig(config: Config): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable (quota, privacy mode): the dashboard still works, just not persisted.
  }
}
