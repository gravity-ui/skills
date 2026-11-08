import React, { useState } from 'react';
import { Tip, TipRow } from '../charts/Tip';
import { topPages } from '../data';
import { fmtCompact, fmtInt, fmtPercent } from '../format';

const ROW_H = 30;

/** Ранжированные горизонтальные полосы: одна категория-ряд, один цвет, значение у конца. */
export function TopPages({ days, height }: { days: number; height: number }) {
  const pages = topPages(days);
  const total = pages.reduce((s, p) => s + p.views, 0);
  const max = pages[0].views;
  const fit = Math.max(1, Math.floor((height - 4) / ROW_H));
  const shown = pages.slice(0, fit);
  const [hover, setHover] = useState<{ i: number; cx: number; cy: number } | null>(null);

  const showTip = (i: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setHover({ i, cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
  };

  return (
    <>
      <ul className="bars" aria-label="Топ страниц по просмотрам">
        {shown.map((p, i) => (
          <li
            key={p.path}
            className={'bars__row' + (hover?.i === i ? ' is-hover' : '')}
            style={{ height: ROW_H }}
            tabIndex={0}
            onPointerMove={(e) => setHover({ i, cx: e.clientX, cy: e.clientY })}
            onPointerLeave={() => setHover(null)}
            onFocus={(e) => showTip(i, e.currentTarget)}
            onBlur={() => setHover(null)}
          >
            <span className="bars__label" title={p.path}>
              {p.path}
            </span>
            <span className="bars__track">
              <span className="bars__bar" style={{ width: `${(p.views / max) * 100}%` }} />
            </span>
            <span className="bars__value">{fmtCompact(p.views)}</span>
          </li>
        ))}
      </ul>
      {hover && (
        <Tip x={hover.cx} y={hover.cy}>
          <div className="tip__title">{shown[hover.i].path}</div>
          <TipRow name="просмотров" value={fmtInt(shown[hover.i].views)} />
          <TipRow name="доля от топа" value={fmtPercent(shown[hover.i].views / total, 1)} />
        </Tip>
      )}
    </>
  );
}
