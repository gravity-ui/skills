import type {Config} from '@gravity-ui/dashkit';

import {WidgetType} from './types';
import type {MeterData, StatData, TableData, TasksData, WidgetData} from './types';

const NAMESPACE = 'default';

/** Данные по умолчанию для виджета, добавляемого из панели действий. */
export const widgetPresets: Record<string, () => WidgetData> = {
  [WidgetType.Title]: () => ({text: 'Новый раздел', size: 'm', showInTOC: false}),
  [WidgetType.Text]: () => ({text: 'Заметка. Текст можно поменять в конфиге виджета.'}),
  [WidgetType.Stat]: () =>
    ({label: 'Показатель', value: '0', delta: '0 %', direction: 'up', period: 'за неделю'}) satisfies StatData,
  [WidgetType.Meter]: () =>
    ({
      title: 'Нагрузка',
      rows: [
        {name: 'CPU', value: 42},
        {name: 'Память', value: 67},
      ],
    }) satisfies MeterData,
  [WidgetType.Table]: () =>
    ({
      title: 'Таблица',
      rows: [],
    }) satisfies TableData,
  [WidgetType.Tasks]: () =>
    ({
      title: 'Задачи',
      tasks: [{id: 't1', text: 'Первая задача'}],
    }) satisfies TasksData,
};

export const initialConfig: Config = {
  salt: 'dashboard-demo',
  counter: 9,
  aliases: {},
  connections: [],
  items: [
    {
      id: 'title',
      type: WidgetType.Title,
      namespace: NAMESPACE,
      data: {text: 'Обзор продаж', size: 'l', showInTOC: false},
    },
    {
      id: 'stat-revenue',
      type: WidgetType.Stat,
      namespace: NAMESPACE,
      data: {label: 'Выручка', value: '4,2 млн ₽', delta: '+8,4 %', direction: 'up', period: 'к прошлому месяцу'},
    },
    {
      id: 'stat-orders',
      type: WidgetType.Stat,
      namespace: NAMESPACE,
      data: {label: 'Заказы', value: '1 284', delta: '+3,1 %', direction: 'up', period: 'к прошлому месяцу'},
    },
    {
      id: 'stat-refunds',
      type: WidgetType.Stat,
      namespace: NAMESPACE,
      data: {
        label: 'Возвраты',
        value: '37',
        delta: '+12 %',
        direction: 'up',
        upIsGood: false,
        period: 'к прошлому месяцу',
      },
    },
    {
      id: 'stat-nps',
      type: WidgetType.Stat,
      namespace: NAMESPACE,
      data: {label: 'NPS', value: '61', delta: '−2 п.', direction: 'down', period: 'к прошлому кварталу'},
    },
    {
      id: 'orders',
      type: WidgetType.Table,
      namespace: NAMESPACE,
      data: {
        title: 'Последние заказы',
        rows: [
          {id: '#10492', customer: 'ООО «Вектор»', amount: '128 400 ₽', status: 'paid'},
          {id: '#10491', customer: 'ИП Смирнова', amount: '14 900 ₽', status: 'pending'},
          {id: '#10490', customer: 'АО «Прибой»', amount: '402 000 ₽', status: 'paid'},
          {id: '#10489', customer: 'ООО «Лагуна»', amount: '8 300 ₽', status: 'failed'},
          {id: '#10488', customer: 'ИП Козлов', amount: '56 750 ₽', status: 'paid'},
          {id: '#10487', customer: 'ООО «Север»', amount: '91 200 ₽', status: 'pending'},
        ],
      },
    },
    {
      id: 'load',
      type: WidgetType.Meter,
      namespace: NAMESPACE,
      data: {
        title: 'Нагрузка на сервисы',
        rows: [
          {name: 'API', value: 54},
          {name: 'База данных', value: 78},
          {name: 'Очередь задач', value: 93},
          {name: 'Хранилище', value: 31},
        ],
      },
    },
    {
      id: 'tasks',
      type: WidgetType.Tasks,
      namespace: NAMESPACE,
      data: {
        title: 'Задачи на сегодня',
        tasks: [
          {id: 't1', text: 'Согласовать бюджет на Q1'},
          {id: 't2', text: 'Проверить возвраты за неделю'},
          {id: 't3', text: 'Обновить прайс-лист'},
          {id: 't4', text: 'Созвон с логистикой'},
        ],
      },
    },
    {
      id: 'note',
      type: WidgetType.Text,
      namespace: NAMESPACE,
      data: {
        text: 'Включите режим редактирования, чтобы перетаскивать и растягивать виджеты, добавлять новые из панели внизу и удалять через меню виджета. Раскладка сохраняется в браузере.',
      },
    },
  ],
  layout: [
    {i: 'title', x: 0, y: 0, w: 36, h: 2},
    {i: 'stat-revenue', x: 0, y: 2, w: 9, h: 6},
    {i: 'stat-orders', x: 9, y: 2, w: 9, h: 6},
    {i: 'stat-refunds', x: 18, y: 2, w: 9, h: 6},
    {i: 'stat-nps', x: 27, y: 2, w: 9, h: 6},
    {i: 'orders', x: 0, y: 8, w: 22, h: 14},
    {i: 'load', x: 22, y: 8, w: 14, h: 8},
    {i: 'tasks', x: 22, y: 16, w: 14, h: 10},
    {i: 'note', x: 0, y: 22, w: 22, h: 4},
  ],
};
