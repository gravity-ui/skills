import type {Config} from '@gravity-ui/dashkit';

import {WIDGET_TYPES} from './types';
import type {KpiWidgetData} from './types';

const STORAGE_KEY = 'dashboard-config-v1';
const KNOWN_TYPES = new Set<string>(Object.values(WIDGET_TYPES));

// Grid has 36 columns; rows are 18px high (dashkit defaults).
const DEFAULT_ITEMS: Config['items'] = [
  {id: 'kpi-revenue', type: WIDGET_TYPES.kpi, namespace: 'default', data: {metric: 'revenue'} satisfies KpiWidgetData},
  {id: 'kpi-orders', type: WIDGET_TYPES.kpi, namespace: 'default', data: {metric: 'orders'} satisfies KpiWidgetData},
  {id: 'kpi-customers', type: WIDGET_TYPES.kpi, namespace: 'default', data: {metric: 'customers'} satisfies KpiWidgetData},
  {id: 'kpi-avg-check', type: WIDGET_TYPES.kpi, namespace: 'default', data: {metric: 'avgCheck'} satisfies KpiWidgetData},
  {id: 'chart-revenue', type: WIDGET_TYPES.chart, namespace: 'default', data: {}},
  {id: 'activity', type: WIDGET_TYPES.activity, namespace: 'default', data: {}},
];

const DEFAULT_LAYOUT: Config['layout'] = [
  {i: 'kpi-revenue', x: 0, y: 0, w: 9, h: 6},
  {i: 'kpi-orders', x: 9, y: 0, w: 9, h: 6},
  {i: 'kpi-customers', x: 18, y: 0, w: 9, h: 6},
  {i: 'kpi-avg-check', x: 27, y: 0, w: 9, h: 6},
  {i: 'chart-revenue', x: 0, y: 6, w: 24, h: 14},
  {i: 'activity', x: 24, y: 6, w: 12, h: 14},
];

export function createDefaultConfig(): Config {
  return {
    salt: 'dashboard-default',
    counter: DEFAULT_ITEMS.length,
    items: structuredClone(DEFAULT_ITEMS),
    layout: structuredClone(DEFAULT_LAYOUT),
    aliases: {},
    connections: [],
  };
}

// Returns a stored config only if it is structurally usable; otherwise the default.
function isUsableConfig(value: unknown): value is Config {
  if (!value || typeof value !== 'object') return false;
  const config = value as Partial<Config>;
  if (!Array.isArray(config.items) || !Array.isArray(config.layout)) return false;
  const ids = new Set(config.items.map((item) => item.id));
  const itemsOk = config.items.every((item) => KNOWN_TYPES.has(item.type));
  const layoutOk = config.layout.every((cell) => ids.has(cell.i));
  return itemsOk && layoutOk;
}

export function loadConfig(): Config {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isUsableConfig(parsed)) return parsed;
    }
  } catch {
    // Corrupted JSON or storage disabled: fall through to the default layout.
  }
  return createDefaultConfig();
}

export function saveConfig(config: Config): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage is full or disabled: the layout still works for this session.
  }
}
