import type {DashKitProps} from '@gravity-ui/dashkit';

type Config = DashKitProps['config'];
type ItemsStateAndParams = NonNullable<DashKitProps['itemsStateAndParams']>;

export type DashboardState = {
  config: Config;
  itemsStateAndParams: ItemsStateAndParams;
};

const item = (
  id: string,
  type: string,
  data: Record<string, unknown>,
): Config['items'][number] => ({id, type, data, namespace: 'default'});

// Сетка DashKit — 36 колонок.
export const INITIAL_CONFIG: Config = {
  salt: '0.1',
  counter: 10,
  items: [
    item('t1', 'title', {text: 'Обзор продукта', size: 'l'}),
    item('k1', 'kpi', {title: 'Активные пользователи', value: '12 480', delta: 8.4}),
    item('k2', 'kpi', {title: 'Выручка', value: '1,2 млн ₽', delta: 3.1}),
    item('k3', 'kpi', {title: 'Ошибки', value: '37', delta: -12}),
    item('p1', 'progress', {
      title: 'Выполнение целей квартала',
      items: [
        {name: 'Новые клиенты', value: 72},
        {name: 'Удержание', value: 55},
        {name: 'Снижение оттока', value: 24},
        {name: 'NPS', value: 88},
      ],
    }),
    item('c1', 'tasks', {
      title: 'Задачи на неделю',
      tasks: [
        {id: 'a', text: 'Подготовить отчёт'},
        {id: 'b', text: 'Обновить роадмап'},
        {id: 'c', text: 'Провести ретро'},
        {id: 'd', text: 'Разобрать баг-репорты'},
      ],
    }),
    item('a1', 'activity', {
      title: 'Последние события',
      events: [
        {id: 'a', time: '09:12', text: 'Выкатили релиз 2.4.0'},
        {id: 'b', time: '10:40', text: 'Новый клиент подключил тариф «Команда»'},
        {id: 'c', time: '11:05', text: 'Алерт по latency снят'},
        {id: 'd', time: '13:27', text: 'Опубликован отчёт по retention'},
      ],
    }),
  ],
  layout: [
    {i: 't1', x: 0, y: 0, w: 36, h: 4},
    {i: 'k1', x: 0, y: 4, w: 12, h: 7},
    {i: 'k2', x: 12, y: 4, w: 12, h: 7},
    {i: 'k3', x: 24, y: 4, w: 12, h: 7},
    {i: 'p1', x: 0, y: 11, w: 12, h: 13},
    {i: 'c1', x: 12, y: 11, w: 12, h: 13},
    {i: 'a1', x: 24, y: 11, w: 12, h: 13},
  ],
  aliases: {},
  connections: [],
};

export const INITIAL_STATE: DashboardState = {
  config: INITIAL_CONFIG,
  itemsStateAndParams: {} as ItemsStateAndParams,
};

const STORAGE_KEY = 'widgets-dashboard:v1';

export function loadState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardState;
      if (parsed?.config?.items && parsed.config.layout) return parsed;
    }
  } catch {
    // повреждённое или недоступное хранилище — начинаем с начального состояния
  }
  return INITIAL_STATE;
}

export function saveState(state: DashboardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // хранилище недоступно — расположение не сохранится между сессиями
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ничего не делаем
  }
}
