import type {ChartData} from '@gravity-ui/charts';
import type {Config} from '@gravity-ui/dashkit';
import {ChartColumn, ChartLine, Heading, Text as TextIcon} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';

export type WidgetType = 'title' | 'text' | 'stat' | 'chart';

export type WidgetCatalogEntry = {
  type: WidgetType;
  /** Human-readable name shown in the action panel. */
  title: string;
  icon: IconData;
  /** Fresh widget data for every added instance. */
  makeData: () => Record<string, unknown>;
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const signupsChart: ChartData = {
  legend: {enabled: true},
  xAxis: {type: 'category', categories: WEEKDAYS},
  series: {
    data: [
      {
        type: 'line',
        name: 'Регистрации',
        data: [
          {x: 'Пн', y: 132},
          {x: 'Вт', y: 148},
          {x: 'Ср', y: 121},
          {x: 'Чт', y: 176},
          {x: 'Пт', y: 190},
          {x: 'Сб', y: 96},
          {x: 'Вс', y: 88},
        ],
      },
      {
        type: 'line',
        name: 'Активации',
        data: [
          {x: 'Пн', y: 84},
          {x: 'Вт', y: 97},
          {x: 'Ср', y: 80},
          {x: 'Чт', y: 118},
          {x: 'Пт', y: 131},
          {x: 'Сб', y: 54},
          {x: 'Вс', y: 47},
        ],
      },
    ],
  },
};

const CHANNELS = ['Онлайн', 'Розница', 'Партнёры', 'B2B'];

const channelsChart: ChartData = {
  xAxis: {type: 'category', categories: CHANNELS},
  series: {
    data: [
      {
        type: 'bar-x',
        name: 'Продажи',
        data: [
          {x: 'Онлайн', y: 482},
          {x: 'Розница', y: 305},
          {x: 'Партнёры', y: 218},
          {x: 'B2B', y: 164},
        ],
      },
    ],
  },
};

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    type: 'title',
    title: 'Заголовок',
    icon: Heading,
    makeData: () => ({size: 'm', text: 'Новый раздел', showInTOC: false}),
  },
  {
    type: 'text',
    title: 'Текст',
    icon: TextIcon,
    makeData: () => ({
      text: 'Подпись или пояснение к данным. Отредактируйте конфиг, чтобы изменить текст.',
    }),
  },
  {
    type: 'stat',
    title: 'Метрика',
    icon: ChartColumn,
    makeData: () => ({title: 'Новая метрика', value: '1 024', delta: 2.4}),
  },
  {
    type: 'chart',
    title: 'График',
    icon: ChartLine,
    makeData: () => ({title: 'Новый график', chartData: signupsChart}),
  },
];

export const initialConfig: Config = {
  salt: '0.46703554571365613',
  counter: 8,
  aliases: {},
  connections: [],
  items: [
    {
      id: 'hd',
      type: 'title',
      namespace: 'default',
      data: {size: 'm', text: 'Эффективность команды', showInTOC: false},
    },
    {
      id: 'st1',
      type: 'stat',
      namespace: 'default',
      data: {title: 'Выручка', value: '4,28 млн ₽', delta: 12.4},
    },
    {
      id: 'st2',
      type: 'stat',
      namespace: 'default',
      data: {title: 'Активные пользователи', value: '18 204', delta: 3.1},
    },
    {
      id: 'st3',
      type: 'stat',
      namespace: 'default',
      data: {title: 'Конверсия', value: '3,42%', delta: -0.8},
    },
    {
      id: 'ch1',
      type: 'chart',
      namespace: 'default',
      data: {title: 'Регистрации и активации за неделю', chartData: signupsChart},
    },
    {
      id: 'ch2',
      type: 'chart',
      namespace: 'default',
      data: {title: 'Продажи по каналам', chartData: channelsChart},
    },
    {
      id: 'tx1',
      type: 'text',
      namespace: 'default',
      data: {
        text: 'Виджеты можно свободно перемещать и растягивать по сетке. Нажмите «Редактировать», чтобы включить режим настройки: перетаскивайте виджеты, меняйте их размер, добавляйте новые с панели внизу и удаляйте лишние через меню виджета.',
      },
    },
  ],
  layout: [
    {i: 'hd', x: 0, y: 0, w: 36, h: 2},
    {i: 'st1', x: 0, y: 2, w: 12, h: 5},
    {i: 'st2', x: 12, y: 2, w: 12, h: 5},
    {i: 'st3', x: 24, y: 2, w: 12, h: 5},
    {i: 'ch1', x: 0, y: 7, w: 20, h: 12},
    {i: 'ch2', x: 20, y: 7, w: 16, h: 12},
    {i: 'tx1', x: 0, y: 19, w: 36, h: 4},
  ],
};
