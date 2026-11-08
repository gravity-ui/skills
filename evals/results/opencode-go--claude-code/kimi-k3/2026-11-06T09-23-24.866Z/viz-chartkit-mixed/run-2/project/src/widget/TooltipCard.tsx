import React from 'react';

export interface TooltipRow {
  id: string;
  color: string;
  name: string;
  value: string;
}

interface TooltipCardProps {
  left: number;
  top: number;
  /** 'right' — карточка справа от курсора; 'left' — зеркально (у правого края графика). */
  side: 'left' | 'right';
  title: string;
  rows: TooltipRow[];
}

/**
 * Общий для обоих движков тултип: значение ведёт (strong), имя серии вторично,
 * ключ серии — короткий штрих цвета. React рендерит name/value как текст
 * (эквивалент textContent) — имена серий из данных не интерполируются в HTML.
 */
export function TooltipCard({left, top, side, title, rows}: TooltipCardProps) {
  return (
    <div
      className="viz-tooltip"
      role="status"
      style={{
        left,
        top,
        transform: side === 'left' ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
      }}
    >
      <div className="viz-tooltip__title">{title}</div>
      {rows.map((row) => (
        <div className="viz-tooltip__row" key={row.id}>
          <span className="viz-tooltip__key" style={{background: row.color}} aria-hidden />
          <span className="viz-tooltip__name">{row.name}</span>
          <span className="viz-tooltip__value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
