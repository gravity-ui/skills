import React, { useState } from 'react';
import { Tip, TipRow } from '../charts/Tip';
import { deviceSplit } from '../data';
import { fmtCompact, fmtInt, fmtPercent, textWidth } from '../format';

/** Слот категориальной палитры по сущности; «Другое» — нейтральный серый. */
export const DEVICE_COLORS: Record<string, string> = {
  desktop: 'var(--series-1)',
  mobile: 'var(--series-2)',
  tablet: 'var(--series-3)',
  other: 'var(--other)',
};

const GAP = 2;

/** Высокая сегментированная полоса: доля — внутри блока, если помещается, иначе только в тултипе. */
export function Devices({ days, width }: { days: number; width: number }) {
  const { total, parts } = deviceSplit(days);
  const [hover, setHover] = useState<{ i: number; cx: number; cy: number } | null>(null);
  const barW = Math.max(0, width - 32);
  const usable = barW - GAP * (parts.length - 1);

  const showTip = (i: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setHover({ i, cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
  };

  const summary = parts.map((p) => `${p.name} ${fmtPercent(p.share)}`).join(', ');

  return (
    <div className="devices">
      <div className="devices__total">
        <span className="devices__num">{fmtCompact(total)}</span>
        <span className="devices__cap">визитов за {days} дн.</span>
      </div>
      <div className="seg" role="img" aria-label={`Визиты по устройствам: ${summary}`}>
        {parts.map((p, i) => {
          const w = Math.max(0, p.share * usable);
          const text = fmtPercent(p.share);
          const fits = w >= textWidth(text) + 20;
          return (
            <div
              key={p.id}
              className={'seg__block' + (hover?.i === i ? ' is-hover' : '')}
              style={{ width: w, background: DEVICE_COLORS[p.id] }}
              tabIndex={0}
              aria-label={`${p.name}: ${fmtInt(p.value)} визитов, ${text}`}
              onPointerMove={(e) => setHover({ i, cx: e.clientX, cy: e.clientY })}
              onPointerLeave={() => setHover(null)}
              onFocus={(e) => showTip(i, e.currentTarget)}
              onBlur={() => setHover(null)}
            >
              {fits && <span className="seg__label">{text}</span>}
            </div>
          );
        })}
      </div>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.id} className="legend__item">
            <span className="legend__swatch" style={{ background: DEVICE_COLORS[p.id] }} />
            {p.name}
          </li>
        ))}
      </ul>
      {hover && (
        <Tip x={hover.cx} y={hover.cy}>
          <div className="tip__title">{parts[hover.i].name}</div>
          <TipRow color={DEVICE_COLORS[parts[hover.i].id]} name="визитов" value={fmtInt(parts[hover.i].value)} />
          <TipRow name="доля" value={fmtPercent(parts[hover.i].share, 1)} />
        </Tip>
      )}
    </div>
  );
}
