import { useRef, useState, type FocusEvent, type PointerEvent } from 'react';
import type { Dataset } from '../data';
import { fmtCompact, fmtInt } from '../format';
import { ChartTooltip, type Anchor } from '../viz/ChartTooltip';
import { useSize } from '../viz/hooks';
import { DataTable, Frame, type View } from './Frame';

// Categorical slots 1..5 in fixed order (colour follows the entity, not its rank).
const SLOT: Record<string, number> = { organic: 1, direct: 2, ads: 3, social: 4, referral: 5 };
const GAP = 2;
const CHAR_W = 7.4; // ≈ width of a digit at 12px semibold
const PAD = 8;

/** One whole split into ≤ 6 parts: tall segmented bar, share printed inside only where it fits. */
export function TrafficBar({ data }: { data: Dataset }) {
  const [view, setView] = useState<View>('chart');
  const [hover, setHover] = useState<{ id: string; anchor: Anchor } | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const { width } = useSize(bar);

  const parts = data.traffic;
  const total = parts.reduce((a, p) => a + p.value, 0);
  const inner = Math.max(0, width - GAP * (parts.length - 1));
  const hovered = parts.find((p) => p.id === hover?.id);
  const pct = (v: number) => `${Math.round((v / total) * 100)}%`;

  const point = (e: PointerEvent<HTMLElement>, id: string) => setHover({ id, anchor: { x: e.clientX, y: e.clientY } });
  const focus = (e: FocusEvent<HTMLElement>, id: string) => {
    const b = e.currentTarget.getBoundingClientRect();
    setHover({ id, anchor: { x: b.left + b.width / 2, y: b.top } });
  };

  return (
    <Frame title="Источники трафика" subtitle={`${fmtCompact(total)} визитов`} view={view} onViewChange={setView}>
      {view === 'table' ? (
        <DataTable head={['Источник', 'Визиты', 'Доля']} rows={parts.map((p) => [p.name, fmtInt(p.value), pct(p.value)])} />
      ) : (
        <div className="traffic">
          <div ref={bar} className="segbar" role="group" aria-label={`Источники трафика: ${parts.map((p) => `${p.name} ${pct(p.value)}`).join(', ')}`}>
            {parts.map((p) => {
              const slot = SLOT[p.id] ?? 1;
              const label = pct(p.value);
              const fits = (p.value / total) * inner >= label.length * CHAR_W + PAD * 2;
              return (
                <div
                  key={p.id}
                  tabIndex={0}
                  className={`seg seg_${slot}${hover?.id === p.id ? ' seg_active' : ''}`}
                  style={{ flexGrow: p.value, flexBasis: 0 }}
                  aria-label={`${p.name}: ${fmtInt(p.value)} визитов, ${label}`}
                  onPointerEnter={(e) => point(e, p.id)}
                  onPointerMove={(e) => point(e, p.id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={(e) => focus(e, p.id)}
                  onBlur={() => setHover(null)}
                >
                  {fits && label}
                </div>
              );
            })}
          </div>
          <ul className="legend legend_wrap" aria-label="Легенда">
            {parts.map((p) => (
              <li key={p.id}>
                <span className={`key key_box seg_${SLOT[p.id] ?? 1}`} />
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ChartTooltip anchor={hover?.anchor ?? null}>
        {hovered && (
          <>
            <div className="viz-tooltip__head">{hovered.name}</div>
            <div className="viz-tooltip__row">
              <strong>{fmtInt(hovered.value)}</strong>
              <span>визитов · {pct(hovered.value)}</span>
            </div>
          </>
        )}
      </ChartTooltip>
    </Frame>
  );
}
