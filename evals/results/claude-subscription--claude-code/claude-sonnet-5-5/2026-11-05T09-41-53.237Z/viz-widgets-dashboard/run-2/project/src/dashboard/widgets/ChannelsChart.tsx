import { useState, type FocusEvent, type PointerEvent } from 'react';
import type { Dataset } from '../data';
import { fmtInt } from '../format';
import { ChartTooltip, type Anchor } from '../viz/ChartTooltip';
import { DataTable, Frame, type View } from './Frame';

/** Ranked horizontal bars: one series → one colour, value at the tip, mark = hit target. */
export function ChannelsChart({ data }: { data: Dataset }) {
  const [view, setView] = useState<View>('chart');
  const [hover, setHover] = useState<{ id: string; anchor: Anchor } | null>(null);

  const rows = [...data.channels].sort((a, b) => b.value - a.value);
  const max = rows[0]?.value ?? 1;
  const total = rows.reduce((a, r) => a + r.value, 0);
  const hovered = rows.find((r) => r.id === hover?.id);

  const onPointer = (e: PointerEvent<HTMLElement>, id: string) => setHover({ id, anchor: { x: e.clientX, y: e.clientY } });
  const onFocus = (e: FocusEvent<HTMLElement>, id: string) => {
    const b = e.currentTarget.getBoundingClientRect();
    setHover({ id, anchor: { x: b.left + b.width / 2, y: b.top } });
  };

  return (
    <Frame title="Заказы по каналам" subtitle="Всего за период" view={view} onViewChange={setView}>
      {view === 'table' ? (
        <DataTable head={['Канал', 'Заказы', 'Доля']} rows={rows.map((r) => [r.name, fmtInt(r.value), `${Math.round((r.value / total) * 100)}%`])} />
      ) : (
        <div className="hbars" role="list">
          {rows.map((r) => (
            <div
              key={r.id}
              role="listitem"
              tabIndex={0}
              className={`hbar${hover?.id === r.id ? ' hbar_active' : ''}`}
              aria-label={`${r.name}: ${fmtInt(r.value)} заказов`}
              onPointerEnter={(e) => onPointer(e, r.id)}
              onPointerMove={(e) => onPointer(e, r.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={(e) => onFocus(e, r.id)}
              onBlur={() => setHover(null)}
            >
              <span className="hbar__name" title={r.name}>{r.name}</span>
              <span className="hbar__track">
                <span className="hbar__bar" style={{ width: `calc((100% - 64px) * ${r.value / max})` }} />
                <span className="hbar__value">{fmtInt(r.value)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <ChartTooltip anchor={hover?.anchor ?? null}>
        {hovered && (
          <>
            <div className="viz-tooltip__head">{hovered.name}</div>
            <div className="viz-tooltip__row">
              <strong>{fmtInt(hovered.value)}</strong>
              <span>заказов · {Math.round((hovered.value / total) * 100)}%</span>
            </div>
          </>
        )}
      </ChartTooltip>
    </Frame>
  );
}
