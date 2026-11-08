import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { fmtCompact, fmtDate, fmtInt, fmtRub, fmtRubFull } from '../format';
import type { Dataset } from '../data';
import { ChartTooltip, type Anchor } from '../viz/ChartTooltip';
import { niceScale, useSize } from '../viz/hooks';
import { DataTable, Frame, type View } from './Frame';

const M = { top: 18, right: 14, bottom: 24 };
const TICK_CHAR_W = 6.8; // ≈ width of one 11px tick-label character

export function TrendChart({ data }: { data: Dataset }) {
  const [view, setView] = useState<View>('chart');
  const area = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { width, height } = useSize(area);
  const [hover, setHover] = useState<{ idx: number; anchor: Anchor } | null>(null);

  const { current, previous } = data.revenue;
  const n = current.length;
  const plotH = Math.max(0, height - M.top - M.bottom);
  const scale = niceScale(Math.max(...current, ...previous), Math.max(2, Math.min(5, Math.floor(plotH / 44))));
  const axisFmt = scale.max >= 10_000 ? fmtCompact : fmtInt;
  // The left gutter grows with the widest tick label so nothing is clipped.
  const left = Math.ceil(Math.max(...scale.ticks.map((t) => axisFmt(t).length)) * TICK_CHAR_W) + 16;
  const plotW = Math.max(0, width - left - M.right);
  const x = (i: number) => left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => M.top + plotH - (v / scale.max) * plotH;

  const line = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const areaPath = `${line(current)}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;

  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 84))));
  const xTicks = Array.from({ length: n }, (_, i) => i).filter((i) => (n - 1 - i) % labelEvery === 0);

  const activate = (idx: number) => {
    const box = svg.current!.getBoundingClientRect();
    setHover({ idx, anchor: { x: box.left + x(idx), y: box.top + y(current[idx]) } });
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!plotW) return;
    const px = e.clientX - svg.current!.getBoundingClientRect().left;
    activate(Math.min(n - 1, Math.max(0, Math.round(((px - left) / plotW) * (n - 1)))));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    activate(Math.min(n - 1, Math.max(0, (hover?.idx ?? n - 1) + step)));
  };

  const last = current[n - 1];
  const labelBelow = y(last) - 12 < M.top;

  return (
    <Frame title="Выручка по дням" subtitle="Текущий и прошлый период" view={view} onViewChange={setView}>
      {view === 'table' ? (
        <DataTable
          head={['Дата', 'Текущий период', 'Прошлый период']}
          rows={data.days.map((d, i) => [fmtDate(d), fmtRubFull(current[i]), `${fmtRubFull(previous[i])} · ${fmtDate(data.prevDays[i])}`])}
        />
      ) : (
        <div className="trend">
          <ul className="legend" aria-label="Легенда">
            <li><span className="key key_line key_cur" />Текущий период</li>
            <li><span className="key key_line key_prev" />Прошлый период</li>
          </ul>
          <div className="trend__plot" ref={area}>
            {width > 0 && height > 0 && (
              <svg
                ref={svg}
                width={width}
                height={height}
                tabIndex={0}
                role="group"
                aria-label="График выручки по дням. Стрелки влево и вправо — переход между днями"
                onPointerMove={onMove}
                onPointerLeave={() => setHover(null)}
                onKeyDown={onKey}
                onBlur={() => setHover(null)}
              >
                {scale.ticks.map((t) => (
                  <g key={t}>
                    <line className={t === 0 ? 'axis' : 'grid'} x1={left} x2={width - M.right} y1={y(t)} y2={y(t)} />
                    <text className="tick" x={left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">{axisFmt(t)}</text>
                  </g>
                ))}
                {xTicks.map((i) => (
                  <text key={i} className="tick" x={x(i)} y={height - 6} textAnchor={i === 0 && xTicks.length > 1 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
                    {fmtDate(data.days[i])}
                  </text>
                ))}

                <path d={areaPath} className="area" />
                <path d={line(previous)} className="line line_prev" />
                <path d={line(current)} className="line line_cur" />

                {/* Direct label on the one thing that matters: where the current period ends. */}
                <circle className="dot dot_cur" cx={x(n - 1)} cy={y(last)} r={4} />
                <text className="end-label" x={x(n - 1)} y={y(last) + (labelBelow ? 20 : -12)} textAnchor="end">{fmtRub(last)}</text>

                {hover && (
                  <g pointerEvents="none">
                    <line className="crosshair" x1={x(hover.idx)} x2={x(hover.idx)} y1={M.top} y2={M.top + plotH} />
                    <circle className="dot dot_prev" cx={x(hover.idx)} cy={y(previous[hover.idx])} r={4} />
                    <circle className="dot dot_cur" cx={x(hover.idx)} cy={y(current[hover.idx])} r={4} />
                  </g>
                )}
              </svg>
            )}
          </div>
          <ChartTooltip anchor={hover?.anchor ?? null}>
            {hover && (
              <>
                <div className="viz-tooltip__head">{fmtDate(data.days[hover.idx])}</div>
                <div className="viz-tooltip__row">
                  <span className="key key_line key_cur" />
                  <strong>{fmtRubFull(current[hover.idx])}</strong>
                  <span>Текущий период</span>
                </div>
                <div className="viz-tooltip__row">
                  <span className="key key_line key_prev" />
                  <strong>{fmtRubFull(previous[hover.idx])}</strong>
                  <span>Прошлый, {fmtDate(data.prevDays[hover.idx])}</span>
                </div>
              </>
            )}
          </ChartTooltip>
        </div>
      )}
    </Frame>
  );
}
