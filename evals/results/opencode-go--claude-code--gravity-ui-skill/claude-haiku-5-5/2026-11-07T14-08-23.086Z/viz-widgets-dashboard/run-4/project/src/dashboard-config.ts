import type {Config} from '@gravity-ui/dashkit';

import {AVERAGE_CHECK, CHANNELS, ORDERS, REVENUE, RECENT_EVENTS} from './data';

const STORAGE_KEY = 'viz-widgets-dashboard:config:v1';

/** Раскладка по умолчанию. Сетка DashKit — 36 колонок. */
export function createDefaultConfig(): Config {
  return {
    salt: 'dashboard',
    counter: 6,
    items: [
      {id: 'title', type: 'title', namespace: 'default', data: {text: 'Обзор продаж', size: 'l'}},
      {id: 'revenue', type: 'metric', namespace: 'default', data: REVENUE},
      {id: 'orders', type: 'metric', namespace: 'default', data: ORDERS},
      {id: 'average-check', type: 'metric', namespace: 'default', data: AVERAGE_CHECK},
      {id: 'channels', type: 'progress', namespace: 'default', data: CHANNELS},
      {id: 'events', type: 'list', namespace: 'default', data: RECENT_EVENTS},
    ],
    layout: [
      {i: 'title', x: 0, y: 0, w: 36, h: 3},
      {i: 'revenue', x: 0, y: 3, w: 12, h: 6},
      {i: 'orders', x: 12, y: 3, w: 12, h: 6},
      {i: 'average-check', x: 24, y: 3, w: 12, h: 6},
      {i: 'channels', x: 0, y: 9, w: 18, h: 10},
      {i: 'events', x: 18, y: 9, w: 18, h: 10},
    ],
    aliases: {},
    connections: [],
  };
}

/** Читает сохранённую раскладку; при ошибке или повреждённых данных возвращает дефолт. */
export function loadConfig(): Config {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Config>;
      if (Array.isArray(parsed.items) && Array.isArray(parsed.layout)) {
        return parsed as Config;
      }
    }
  } catch {
    // Недоступный localStorage или битый JSON — используем дефолтную раскладку.
  }
  return createDefaultConfig();
}

export function saveConfig(config: Config): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Квота или приватный режим — раскладка просто не сохранится между перезагрузками.
  }
}

export function clearSavedConfig(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // См. saveConfig.
  }
}
