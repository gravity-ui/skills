import React from 'react';

const bars = [38, 66, 54, 81, 47, 92, 63];

const statuses = [
  { label: 'Сборка', value: 82 },
  { label: 'Тесты', value: 64 },
  { label: 'Релиз', value: 35 },
];

const tasks = [
  { text: 'Собрать отчёт по скорости', done: true },
  { text: 'Согласовать метрики', done: false },
  { text: 'Проверить алерты', done: false },
];

export function WidgetContent({ type }: { type: string }) {
  if (type === 'metric') {
    return (
      <div className="dashboard-widget__metric">
        <span className="dashboard-widget__metric-value">12 480</span>
        <span className="dashboard-widget__metric-label">активных сессий за сутки</span>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="dashboard-widget__chart" aria-hidden="true">
        {bars.map((value, index) => (
          <span key={index} className="dashboard-widget__bar" style={{ ['--value' as string]: value }} />
        ))}
      </div>
    );
  }

  if (type === 'status') {
    return (
      <div className="dashboard-widget__status">
        {statuses.map(({ label, value }) => (
          <div key={label} className="dashboard-widget__status-item">
            <span>{label}</span>
            <span className="dashboard-widget__progress" style={{ ['--value' as string]: value }} />
            <span>{value}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {tasks.map(({ text, done }) => (
        <div key={text} className={`dashboard-widget__task${done ? ' dashboard-widget__task--done' : ''}`}>
          <span className="dashboard-widget__task-mark" />
          <span style={{ color: done ? 'var(--g-color-text-secondary)' : 'inherit' }}>{text}</span>
        </div>
      ))}
    </div>
  );
}
