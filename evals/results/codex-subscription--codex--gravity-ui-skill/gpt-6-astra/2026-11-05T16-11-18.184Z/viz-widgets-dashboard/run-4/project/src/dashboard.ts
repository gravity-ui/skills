import type {DashKitProps} from '@gravity-ui/dashkit';

export type DashboardConfig = DashKitProps['config'];
export type WidgetKind = 'revenue' | 'orders' | 'customers' | 'conversion' | 'trend' | 'traffic' | 'transactions' | 'goal' | 'note';
export const STORAGE_KEY = 'pulse-dashboard-v1';
export const widgetCatalog: {kind: WidgetKind; title: string; description: string; w: number; h: number}[] = [
  {kind: 'revenue', title: 'Выручка', description: 'Общая выручка и изменение за период', w: 3, h: 6},
  {kind: 'orders', title: 'Заказы', description: 'Количество оформленных заказов', w: 3, h: 6},
  {kind: 'customers', title: 'Новые клиенты', description: 'Рост вашей клиентской базы', w: 3, h: 6},
  {kind: 'conversion', title: 'Конверсия', description: 'Доля посетителей, сделавших заказ', w: 3, h: 6},
  {kind: 'trend', title: 'Динамика выручки', description: 'Сравнение с предыдущим периодом', w: 8, h: 14},
  {kind: 'traffic', title: 'Источники трафика', description: 'Откуда приходят ваши посетители', w: 4, h: 14},
  {kind: 'transactions', title: 'Последние заказы', description: 'Клиенты, суммы и статусы заказов', w: 8, h: 13},
  {kind: 'goal', title: 'Цель месяца', description: 'Прогресс выполнения плана продаж', w: 4, h: 13},
  {kind: 'note', title: 'Заметка', description: 'Важные мысли и задачи вашей команды', w: 4, h: 9},
];
export function initialConfig(): DashboardConfig {
  return {
    salt: 'pulse', counter: 8, aliases: {}, connections: [],
    items: widgetCatalog.slice(0, 8).map((w) => ({id: w.kind, type: 'pulse-widget', namespace: 'default', data: {kind: w.kind}})),
    layout: widgetCatalog.slice(0, 8).map((w, i) => ({
      i: w.kind, w: w.w, h: w.h, x: i < 4 ? i * 3 : i % 2 ? 8 : 0,
      y: i < 4 ? 0 : i < 6 ? 6 : 20, minW: 3, minH: i < 4 ? 6 : 10,
    })),
  };
}
export function readConfig(raw: string | null): DashboardConfig {
  if (!raw) return initialConfig();
  try {
    const value = JSON.parse(raw) as DashboardConfig;
    if (!Array.isArray(value.items) || !Array.isArray(value.layout) || typeof value.salt !== 'string' || !Number.isInteger(value.counter) || !value.aliases || !Array.isArray(value.connections)) throw new Error('Invalid config');
    const ids = new Set(value.items.map((i) => i.id));
    if (ids.size !== value.items.length || value.layout.length !== ids.size) throw new Error('Invalid items');
    for (const i of value.items) {
      if (i.type !== 'pulse-widget' || !widgetCatalog.some((w) => w.kind === i.data?.kind)) throw new Error('Unknown widget');
    }
    if (new Set(value.layout.map((l) => l.i)).size !== ids.size) throw new Error('Duplicate layout');
    for (const l of value.layout) {
      if (!ids.has(l.i) || ![l.x, l.y, l.w, l.h].every(Number.isFinite) || l.x < 0 || l.y < 0 || l.w < 1 || l.h < 1 || l.x + l.w > 12) throw new Error('Invalid layout');
    }
    return value;
  } catch { return initialConfig(); }
}
export const PERIODS = [
  {value: 'month', content: '1–31 октября 2026', factor: 1, label: 'октябрь'},
  {value: 'week', content: '25–31 октября 2026', factor: 0.27, label: 'последнюю неделю'},
  {value: 'quarter', content: '1 августа – 31 октября 2026', factor: 2.84, label: 'последние 3 месяца'},
];
export const formatNumber = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
export const formatMoney = (n: number) => `${formatNumber(Math.round(n))} ₽`;
export const orders = [
  {id: '#1048', name: 'Анна Смирнова', initials: 'АС', product: 'Подписка Pro', amount: 12900, status: 'Оплачен', color: 'purple', date: '31 окт., 14:32'},
  {id: '#1047', name: 'Михаил Волков', initials: 'МВ', product: 'Подписка Team', amount: 24900, status: 'Оплачен', color: 'blue', date: '31 окт., 13:18'},
  {id: '#1046', name: 'Елена Козлова', initials: 'ЕК', product: 'Подписка Pro', amount: 12900, status: 'В обработке', color: 'orange', date: '31 окт., 12:45'},
  {id: '#1045', name: 'Дмитрий Соколов', initials: 'ДС', product: 'Подписка Starter', amount: 4900, status: 'Оплачен', color: 'green', date: '31 окт., 11:56'},
  {id: '#1044', name: 'Мария Петрова', initials: 'МП', product: 'Подписка Team', amount: 24900, status: 'Оплачен', color: 'purple', date: '30 окт., 16:20'},
  {id: '#1043', name: 'Алексей Иванов', initials: 'АИ', product: 'Подписка Pro', amount: 12900, status: 'Возврат', color: 'blue', date: '30 окт., 15:10'},
];

/** Repack in reading order so keyboard moves work with differently sized widgets. */
export function moveWidget(config: DashboardConfig, id: string, direction: -1 | 1): DashboardConfig {
  const ordered = [...config.layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const index = ordered.findIndex((l) => l.i === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ordered.length) return config;
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  let x = 0, y = 0, rowHeight = 0;
  const layout = ordered.map((l) => {
    if (x + l.w > 12) { x = 0; y += rowHeight; rowHeight = 0; }
    const next = {...l, x, y};
    x += l.w;
    rowHeight = Math.max(rowHeight, l.h);
    return next;
  });
  return {...config, layout};
}

export function readPreference(key: 'title' | 'teamName', fallback: string) {
  try {
    const preferences = JSON.parse(localStorage.getItem('pulse-preferences-v1') || '{}');
    return typeof preferences?.[key] === 'string' && preferences[key].trim() ? preferences[key] as string : fallback;
  } catch { return fallback; }
}
