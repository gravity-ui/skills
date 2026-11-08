import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Table } from '@gravity-ui/uikit';

import { ChartTooltip } from './ChartTooltip';
import { ChartViewToggle, type ChartView } from './ChartViewToggle';
import { formatCompact, formatDate, formatNumber, niceTicks, traffic, TRAFFIC_SERIES } from './data';
import { useSize } from '../hooks/useSize';

const M = { top: 12, right: 64, bottom: 24, left: 44 };

export function TrafficLineChart() {
  const [view, setView] = useState<ChartView>('chart');
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(plotRef);

  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);

  const max = useMemo(
    () => Math.max(...traffic.flatMap((p) => TRAFFIC_SERIES.map((s) => p.values[s.id]))),
    [],
  );
  const ticks = useMemo(() => niceTicks(max), [max]);
  const yMax = ticks[ticks.length - 1];
  const x = (i: number) => M.left + (traffic.length === 1 ? 0 : (i / (traffic.length - 1)) * innerW);
  const y = (v: number) => M.top + innerH - (v / yMax) * innerH;

  const xTickIdx = useMemo(() => {
    const n = Math.max(2, Math.min(6, Math.floor(innerW / 90)));
    return Array.from({ length: n }, (_, k) => Math.round((k / (n - 1)) * (traffic.length - 1)));
  }, [innerW]);

  const indexAt = (clientX: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || innerW === 0) return null;
    const px = clientX - rect.left - M.left;
    return Math.max(0, Math.min(traffic.length - 1, Math.round((px / innerW) * (traffic.length - 1))));
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => setHover(indexAt(e.clientX));
  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const d = e.key === 'ArrowLeft' ? -1 : 1;
      setHover((h) => Math.max(0, Math.min(traffic.length - 1, (h ?? traffic.length - 1) + d)));
    } else if (e.key === 'Escape') {
      setHover(null);
    }
  };

  const columns = [
    { id: 'date', name: 'Дата', template: (p: (typeof traffic)[number]) => formatDate(p.date, 'long') },
    ...TRAFFIC_SERIES.map((s) => ({
      id: s.id,
      name: s.name,
      align: 'end' as const,
      template: (p: (typeof traffic)[number]) => formatNumber(p.values[s.id]),
    })),
  ];

  return (
    <div className="viz">
      <ChartViewToggle value={view} onChange={setView} />
      {view === 'table' ? (
        <div className="viz__table">
          <Table data={traffic} columns={columns} aria-label="Трафик по дням" />
        </div>
      ) : (
        <>
          <div className="viz__plot" ref={plotRef}>
            {width > 0 && height > 0 && (
              <svg
                width={width}
                height={height}
                role="img"
                aria-label="Трафик за 30 дней по платформам"
                tabIndex={0}
                onPointerMove={onPointerMove}
                onPointerLeave={() => setHover(null)}
                onBlur={() => setHover(null)}
                onKeyDown={onKeyDown}
              >
                <g className="viz__grid">
                  {ticks.map((t) => (
                    <line key={t} x1={M.left} x2={M.left + innerW} y1={y(t)} y2={y(t)} />
                  ))}
                </g>
                <line
                  className="viz__axis-line"
                  x1={M.left}
                  x2={M.left + innerW}
                  y1={y(0)}
                  y2={y(0)}
                />
                {ticks.map((t) => (
                  <text key={t} className="viz__tick" x={M.left - 8} y={y(t) + 4} textAnchor="end">
                    {t >= 10_000 ? `${Math.round(t / 1000)}K` : formatNumber(t)}
                  </text>
                ))}
                {xTickIdx.map((i) => (
                  <text key={i} className="viz__tick" x={x(i)} y={M.top + innerH + 16} textAnchor="middle">
                    {formatDate(traffic[i].date)}
                  </text>
                ))}

                {TRAFFIC_SERIES.map((s) => {
                  const color = `var(--viz-series-${s.slot})`;
                  const d = traffic
                    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.values[s.id]).toFixed(1)}`)
                    .join(' ');
                  const last = traffic[traffic.length - 1];
                  return (
                    <g key={s.id}>
                      <path d={d} className="viz__line" style={{ stroke: color }} />
                      <circle
                        cx={x(traffic.length - 1)}
                        cy={y(last.values[s.id])}
                        r={4}
                        className="viz__marker"
                        style={{ fill: color }}
                      />
                      <text
                        className="viz__end-label"
                        x={x(traffic.length - 1) + 10}
                        y={y(last.values[s.id]) + 4}
                      >
                        {formatCompact(last.values[s.id])}
                      </text>
                    </g>
                  );
                })}

                {hover != null && (
                  <g>
                    <line className="viz__crosshair" x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + innerH} />
                    {TRAFFIC_SERIES.map((s) => (
                      <circle
                        key={s.id}
                        cx={x(hover)}
                        cy={y(traffic[hover].values[s.id])}
                        r={5}
                        className="viz__marker"
                        style={{ fill: `var(--viz-series-${s.slot})`, pointerEvents: 'none' }}
                      />
                    ))}
                  </g>
                )}
              </svg>
            )}
            {hover != null && (
              <ChartTooltip
                x={x(hover)}
                y={M.top}
                width={width}
                title={formatDate(traffic[hover].date, 'long')}
                rows={TRAFFIC_SERIES.map((s) => ({
                  name: s.name,
                  value: formatNumber(traffic[hover].values[s.id]),
                  color: `var(--viz-series-${s.slot})`,
                }))}
              />
            )}
          </div>
          <ul className="viz__legend" aria-label="Легенда">
            {TRAFFIC_SERIES.map((s) => (
              <li key={s.id} className="viz__legend-item">
                <span
                  className="viz__legend-key viz__legend-key_line"
                  style={{ background: `var(--viz-series-${s.slot})` }}
                />
                {s.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
