import type { Config } from '@gravity-ui/dashkit';

const NAMESPACE = 'default';

// Initial dashboard config. DashKit's grid is 36 columns wide by default;
// `layout` positions are grid units ({i} must match the item id).
export const initialConfig: Config = {
  salt: '0.98421',
  counter: 6,
  aliases: {},
  connections: [],
  items: [
    {
      id: 'widget-title',
      type: 'title',
      namespace: NAMESPACE,
      data: { text: 'Обзор сервиса', size: 'm', showInTOC: false },
      orderId: 1,
    },
    {
      id: 'widget-stat-users',
      type: 'stat',
      namespace: NAMESPACE,
      data: { label: 'Активные пользователи', value: '12 480', trend: '+4,2% за неделю' },
      orderId: 2,
    },
    {
      id: 'widget-stat-orders',
      type: 'stat',
      namespace: NAMESPACE,
      data: { label: 'Заказы за сегодня', value: '327', trend: '+18 к вчерашнему дню' },
      orderId: 3,
    },
    {
      id: 'widget-stat-uptime',
      type: 'stat',
      namespace: NAMESPACE,
      data: { label: 'Доступность', value: '99,98%' },
      orderId: 4,
    },
    {
      id: 'widget-text-about',
      type: 'text',
      namespace: NAMESPACE,
      data: {
        text: 'Ключевые показатели сервиса за последние 7 дней. Данные обновляются каждые 15 минут.',
      },
      orderId: 5,
    },
    {
      id: 'widget-text-notes',
      type: 'text',
      namespace: NAMESPACE,
      data: {
        text: 'Заметки команды: на этой неделе выкатили новую версию поиска, следим за конверсией.',
      },
      orderId: 6,
    },
  ],
  layout: [
    { i: 'widget-title', x: 0, y: 0, w: 36, h: 2 },
    { i: 'widget-stat-users', x: 0, y: 2, w: 12, h: 5 },
    { i: 'widget-stat-orders', x: 12, y: 2, w: 12, h: 5 },
    { i: 'widget-stat-uptime', x: 24, y: 2, w: 12, h: 5 },
    { i: 'widget-text-about', x: 0, y: 7, w: 18, h: 7 },
    { i: 'widget-text-notes', x: 18, y: 7, w: 18, h: 7 },
  ],
};
