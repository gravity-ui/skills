import type {DashKitProps} from '@gravity-ui/dashkit';

export type WidgetType = 'title' | 'stat' | 'bars' | 'meter' | 'list';

export const INITIAL_CONFIG: DashKitProps['config'] = {
  salt: '0.7319046255883417',
  counter: 8,
  aliases: {},
  connections: [],
  items: [
    {
      id: 't1',
      type: 'title',
      namespace: 'default',
      orderId: 0,
      data: {size: 'm', text: 'Продажи и продукт', showInTOC: false},
    },
    {
      id: 's1',
      type: 'stat',
      namespace: 'default',
      orderId: 1,
      data: {
        label: 'Выручка',
        value: '4,2 млн ₽',
        trend: {value: '+12,4%', direction: 'up', good: true, period: 'к прошлому месяцу'},
      },
    },
    {
      id: 's2',
      type: 'stat',
      namespace: 'default',
      orderId: 2,
      data: {
        label: 'Заказы',
        value: '12 940',
        trend: {value: '+3,1%', direction: 'up', good: true, period: 'к прошлому месяцу'},
      },
    },
    {
      id: 's3',
      type: 'stat',
      namespace: 'default',
      orderId: 3,
      data: {
        label: 'Отток клиентов',
        value: '2,8%',
        trend: {value: '+0,6 п.п.', direction: 'up', good: false, period: 'к прошлому месяцу'},
      },
    },
    {
      id: 'b1',
      type: 'bars',
      namespace: 'default',
      orderId: 4,
      data: {
        title: 'Выручка по месяцам, тыс. ₽',
        points: [
          {label: 'янв', value: 320},
          {label: 'фев', value: 410},
          {label: 'мар', value: 380},
          {label: 'апр', value: 520},
          {label: 'май', value: 610},
          {label: 'июн', value: 580},
          {label: 'июл', value: 690},
          {label: 'авг', value: 740},
        ],
      },
    },
    {
      id: 'm1',
      type: 'meter',
      namespace: 'default',
      orderId: 5,
      data: {
        label: 'Использование квоты API',
        value: 72,
        caption: '7,2 млн из 10 млн запросов',
      },
    },
    {
      id: 'l1',
      type: 'list',
      namespace: 'default',
      orderId: 6,
      data: {
        title: 'Последние события',
        items: [
          {text: 'Новый корпоративный клиент — ООО «Вега»', time: '12:42'},
          {text: 'Оплачен счёт № 1042 на 380 тыс. ₽', time: '11:15'},
          {text: 'Завершён импорт каталога (2 340 позиций)', time: '10:03'},
          {text: 'Превышение 70 % квоты API', time: '09:47'},
          {text: 'Оформен возврат по заказу #88 312', time: '09:12'},
        ],
      },
    },
  ],
  layout: [
    {i: 't1', x: 0, y: 0, w: 36, h: 4},
    {i: 's1', x: 0, y: 4, w: 12, h: 7},
    {i: 's2', x: 12, y: 4, w: 12, h: 7},
    {i: 's3', x: 24, y: 4, w: 12, h: 7},
    {i: 'b1', x: 0, y: 11, w: 18, h: 18},
    {i: 'm1', x: 18, y: 11, w: 18, h: 6},
    {i: 'l1', x: 18, y: 17, w: 18, h: 12},
  ],
};

/** Default sizes (in 36-col grid units) for newly added widgets. */
export const WIDGET_SIZES: Record<WidgetType, {w: number; h: number}> = {
  title: {w: 36, h: 4},
  stat: {w: 12, h: 7},
  bars: {w: 18, h: 16},
  meter: {w: 12, h: 6},
  list: {w: 12, h: 12},
};

/** Templates for the "Добавить виджет" menu. */
export const WIDGET_TEMPLATES: Record<WidgetType, {menuText: string; data: Record<string, unknown>}> = {
  title: {
    menuText: 'Заголовок',
    data: {size: 'm', text: 'Новый раздел', showInTOC: false},
  },
  stat: {
    menuText: 'Показатель',
    data: {
      label: 'Новый показатель',
      value: '1 024',
      trend: {value: '+5,2%', direction: 'up', good: true, period: 'к прошлой неделе'},
    },
  },
  bars: {
    menuText: 'График',
    data: {
      title: 'Новый график',
      points: [
        {label: 'Пн', value: 12},
        {label: 'Вт', value: 19},
        {label: 'Ср', value: 15},
        {label: 'Чт', value: 24},
        {label: 'Пт', value: 21},
      ],
    },
  },
  meter: {
    menuText: 'Шкала',
    data: {label: 'Новая шкала', value: 40, caption: '40 из 100'},
  },
  list: {
    menuText: 'Список',
    data: {
      title: 'Новый список',
      items: [
        {text: 'Первое событие', time: '12:00'},
        {text: 'Второе событие', time: '11:30'},
      ],
    },
  },
};
