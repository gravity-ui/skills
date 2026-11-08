import React from 'react';

type Widget = () => React.ReactElement;

const KpiWidget: Widget = () => (
  <div className="metric">
    <strong>₽8 245 000</strong>
    <span>Выручка за неделю</span>
    <em>+12,4%</em>
  </div>
);

const TrafficWidget: Widget = () => (
  <svg viewBox="0 0 300 120" className="sparkline" role="img" aria-label="График трафика">
    <defs>
      <linearGradient id="traffic" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="var(--g-color-base-brand)" stopOpacity=".36" />
        <stop offset="100%" stopColor="var(--g-color-base-brand)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M4 92 C48 58, 72 100, 108 70 C142 42, 168 82, 202 48 C236 20, 260 54, 296 30 V116 H4Z" fill="url(#traffic)" />
    <path d="M4 92 C48 58, 72 100, 108 70 C142 42, 168 82, 202 48 C236 20, 260 54, 296 30" fill="none" stroke="var(--g-color-base-brand)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const TasksWidget: Widget = () => (
  <ul className="compact-list">
    {[
      ['Подготовить релиз', 'Сегодня, 15:00'],
      ['Обновить отчёт', 'Завтра, 10:00'],
      ['Разобрать инцидент', 'Вчера'],
      ['Пригласить команду', 'В пятницу'],
    ].map(([title, date]) => (
      <li key={title}>
        <span>{title}</span>
        <small>{date}</small>
      </li>
    ))}
  </ul>
);

const ActivityWidget: Widget = () => (
  <div className="activity" aria-label="Активность по дням">
    {[36, 74, 48, 96, 58, 82, 68].map((value, index) => (
      <div key={index} className="activity__bar" style={{ height: `${value}%` }}>
        <span>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index]}</span>
      </div>
    ))}
  </div>
);

const AlertsWidget: Widget = () => (
  <div className="metric metric--warning">
    <strong>3</strong>
    <span>Активных оповещения</span>
    <em>Проверьте платежный шлюз</em>
  </div>
);

const UptimeWidget: Widget = () => (
  <div className="metric metric--positive">
    <strong>99,98%</strong>
    <span>Доступность сервисов</span>
    <em>SLA выполняется</em>
  </div>
);

export const Widgets = {
  revenue: KpiWidget,
  traffic: TrafficWidget,
  tasks: TasksWidget,
  activity: ActivityWidget,
  alerts: AlertsWidget,
  uptime: UptimeWidget,
} as const;

export const widgetMeta = {
  revenue: { title: 'Выручка' },
  traffic: { title: 'Трафик' },
  tasks: { title: 'Задачи' },
  activity: { title: 'Активность' },
  alerts: { title: 'Оповещения' },
  uptime: { title: 'Доступность' },
} as const;
