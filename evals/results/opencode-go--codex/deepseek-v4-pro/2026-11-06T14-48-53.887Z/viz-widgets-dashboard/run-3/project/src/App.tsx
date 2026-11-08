import { useState } from 'react';
import { Dashboard } from './Dashboard';
import type { WidgetDef } from './widgets/types';

const defaultWidgets: WidgetDef[] = [
  {
    id: 'w1',
    title: 'Выручка',
    col: 1,
    row: 1,
    colSpan: 2,
    rowSpan: 1,
    kind: 'metric',
    data: { value: '₽ 1,284,500', label: 'За текущий месяц', trend: 'up', trendValue: '+12.3%' },
  },
  {
    id: 'w2',
    title: 'Активные пользователи',
    col: 3,
    row: 1,
    colSpan: 2,
    rowSpan: 1,
    kind: 'metric',
    data: { value: '4,821', label: 'DAU (сегодня)', trend: 'up', trendValue: '+5.1%' },
  },
  {
    id: 'w3',
    title: 'Конверсия',
    col: 5,
    row: 1,
    colSpan: 2,
    rowSpan: 1,
    kind: 'metric',
    data: { value: '3.2%', label: 'В корзину → заказ', trend: 'down', trendValue: '−0.4%' },
  },
  {
    id: 'w4',
    title: 'Продажи по категориям',
    col: 1,
    row: 2,
    colSpan: 3,
    rowSpan: 2,
    kind: 'chart',
    data: {
      bars: [
        { label: 'Электроника', value: 420 },
        { label: 'Одежда', value: 310 },
        { label: 'Книги', value: 180 },
        { label: 'Спорт', value: 250 },
        { label: 'Дом', value: 140 },
      ],
    },
  },
  {
    id: 'w5',
    title: 'Топ товаров',
    col: 4,
    row: 2,
    colSpan: 3,
    rowSpan: 2,
    kind: 'list',
    data: {
      items: [
        { label: 'iPhone 16 Pro', value: '₽ 4,200,000' },
        { label: 'MacBook Air M4', value: '₽ 3,150,000' },
        { label: 'AirPods Pro 2', value: '₽ 1,870,000' },
        { label: 'Apple Watch Ultra', value: '₽ 1,560,000' },
        { label: 'iPad Pro M4', value: '₽ 1,240,000' },
        { label: 'Apple Pencil Pro', value: '₽ 720,000' },
      ],
    },
  },
  {
    id: 'w6',
    title: 'Выполнение плана',
    col: 1,
    row: 4,
    colSpan: 3,
    rowSpan: 2,
    kind: 'progress',
    data: {
      items: [
        { label: 'Квартальная цель по выручке', current: 78, total: 100 },
        { label: 'NPS целевой показатель', current: 45, total: 50 },
        { label: 'План по найму (Q4)', current: 12, total: 15 },
        { label: 'Миграция на новую платформу', current: 62, total: 100 },
        { label: 'Обучение сотрудников', current: 88, total: 100 },
      ],
    },
  },
  {
    id: 'w7',
    title: 'Заметки',
    col: 4,
    row: 4,
    colSpan: 3,
    rowSpan: 2,
    kind: 'text',
    data: {
      body: 'Ключевые приоритеты на неделю:\n\n• Запуск A/B-теста нового онбординга\n• Оптимизация времени загрузки чекаута (цель: < 2с)\n• Интеграция с новым платёжным провайдером\n• Анализ оттока за октябрь\n\nСледующий обзор: пятница, 10:00.',
    },
  },
];

export function App() {
  const [widgets, setWidgets] = useState<WidgetDef[]>(defaultWidgets);
  return <Dashboard widgets={widgets} onChange={setWidgets} />;
}
