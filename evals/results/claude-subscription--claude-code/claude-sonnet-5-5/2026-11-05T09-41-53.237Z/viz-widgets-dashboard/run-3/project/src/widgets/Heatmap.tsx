import React, { useRef, useState } from 'react';
import { BLOCKS, WEEKDAYS, type DashboardData } from '../data';
import { int } from '../format';
import { Tip } from './Tip';

export function Heatmap({ data }: { data: DashboardData }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const grid = WEEKDAYS.map(() => BLOCKS.map(() => 0));
  for (const d of data.current) {
    const wd = (d.date.getDay() + 6) % 7;
    d.byBlock.forEach((v, b) => (grid[wd][b] += v));
  }
  const flat = grid.flat();
  const lo = Math.min(...flat);
  const hi = Math.max(...flat);

  const show = (r: number, c: number, el: Element) => {
    const box = bodyRef.current!.getBoundingClientRect();
    const cell = el.getBoundingClientRect();
    setActive({ r, c });
    setAnchor({ x: cell.left - box.left + cell.width / 2, y: cell.top - box.top });
  };
  const hide = () => {
    setActive(null);
    setAnchor(null);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (!d[e.key]) return;
    e.preventDefault();
    const r = Math.min(Math.max((active?.r ?? 0) + d[e.key][0], 0), WEEKDAYS.length - 1);
    const c = Math.min(Math.max((active?.c ?? 0) + d[e.key][1], 0), BLOCKS.length - 1);
    const el = bodyRef.current!.querySelector(`[data-cell="${r}-${c}"]`);
    if (el) show(r, c, el);
  };

  return (
    <div className="heat">
      <div
        ref={bodyRef}
        className="heat__body"
        tabIndex={0}
        role="group"
        aria-label="Заказы по дням недели и времени суток. Стрелки перемещают по ячейкам."
        onKeyDown={onKey}
        onFocus={(e) => {
          if (!active) {
            const el = e.currentTarget.querySelector('[data-cell="0-0"]');
            if (el) show(0, 0, el);
          }
        }}
        onBlur={hide}
        onPointerLeave={() => document.activeElement !== bodyRef.current && hide()}
      >
        <div className="heat__grid" style={{ gridTemplateColumns: `28px repeat(${BLOCKS.length}, 1fr)` }}>
          <span />
          {BLOCKS.map((b) => (
            <span key={b} className="heat__col">{b}</span>
          ))}
          {WEEKDAYS.map((day, r) => (
            <React.Fragment key={day}>
              <span className="heat__row">{day}</span>
              {BLOCKS.map((b, c) => {
                const v = grid[r][c];
                const t = hi === lo ? 0 : (v - lo) / (hi - lo);
                const on = active?.r === r && active?.c === c;
                return (
                  <span
                    key={b}
                    data-cell={`${r}-${c}`}
                    className={'heat__cell' + (on ? ' heat__cell_on' : '')}
                    style={{ background: `color-mix(in oklab, var(--heat-hi) ${Math.round(t * 100)}%, var(--heat-lo))` }}
                    role="img"
                    aria-label={`${day}, ${b} ч: ${int(v)} заказов`}
                    onPointerEnter={(e) => show(r, c, e.currentTarget)}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {active && anchor && (
          <Tip
            x={anchor.x}
            y={anchor.y - 6}
            placement="above"
            title={`${WEEKDAYS[active.r]}, ${BLOCKS[active.c]} ч`}
            rows={[{ value: int(grid[active.r][active.c]), label: 'заказов' }]}
          />
        )}
      </div>
      <div className="heat__legend" aria-hidden>
        <span>меньше</span>
        <span className="heat__ramp" />
        <span>больше</span>
      </div>
    </div>
  );
}
