import { useRef, useState } from 'react';
import { Table } from '@gravity-ui/uikit';

import { ChartTooltip } from './ChartTooltip';
import { ChartViewToggle, type ChartView } from './ChartViewToggle';
import { formatMoney, revenueByChannel } from './data';
import { useSize } from '../hooks/useSize';

const LABEL_W = 104;
const VALUE_W = 72;
const BAR_MAX = 24;
const GAP = 2;

/** Горизонтальные столбцы: одна серия, значение у кончика, закруглён только конец данных. */
export function RevenueBarChart() {
  const [view, setView] = useState<ChartView>('chart');
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(plotRef);

  const n = revenueByChannel.length;
  const max = Math.max(...revenueByChannel.map((d) => d.value));
  const innerW = Math.max(0, width - LABEL_W - VALUE_W);
  const band = height / n;
  const bar = Math.min(BAR_MAX, Math.max(6, band - GAP * 2 - 4));
  const x0 = LABEL_W;
  const w = (v: number) => (v / max) * innerW;
  const r = 4;
  const barPath = (len: number, y: number) => {
    const rr = Math.min(r, len / 2);
    return `M${x0} ${y} h${len - rr} a${rr} ${rr} 0 0 1 ${rr} ${rr} v${bar - rr * 2} a${rr} ${rr} 0 0 1 -${rr} ${rr} h-${len - rr} z`;
  };

  const columns = [
    { id: 'name', name: 'Канал' },
    {
      id: 'value',
      name: 'Выручка',
      align: 'end' as const,
      template: (d: (typeof revenueByChannel)[number]) => formatMoney(d.value),
    },
  ];

  return (
    <div className="viz">
      <ChartViewToggle value={view} onChange={setView} />
      {view === 'table' ? (
        <div className="viz__table">
          <Table data={revenueByChannel} columns={columns} aria-label="Выручка по каналам" />
        </div>
      ) : (
        <div className="viz__plot" ref={plotRef}>
          {width > 0 && height > 0 && (
            <svg width={width} height={height} role="img" aria-label="Выручка по каналам за 30 дней">
              <line className="viz__axis-line" x1={x0} x2={x0} y1={0} y2={height} />
              {revenueByChannel.map((d, i) => {
                const yBand = i * band;
                const yBar = yBand + (band - bar) / 2;
                const len = w(d.value);
                return (
                  <g key={d.name}>
                    <text className="viz__cat-label" x={x0 - 10} y={yBand + band / 2 + 4} textAnchor="end">
                      {d.name}
                    </text>
                    <rect
                      className="viz__bar-hit"
                      x={0}
                      y={yBand}
                      width={width}
                      height={band}
                      tabIndex={0}
                      aria-label={`${d.name}: ${formatMoney(d.value)}`}
                      onPointerEnter={() => setHover(i)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                    />
                    <path className="viz__bar" d={barPath(len, yBar)} style={{ fill: 'var(--viz-series-1)' }} />
                    <text className="viz__bar-label" x={x0 + len + 8} y={yBar + bar / 2 + 4}>
                      {formatMoney(d.value)}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
          {hover != null && (
            <ChartTooltip
              x={x0 + w(revenueByChannel[hover].value)}
              y={hover * band}
              width={width}
              rows={[
                {
                  name: revenueByChannel[hover].name,
                  value: formatMoney(revenueByChannel[hover].value),
                  color: 'var(--viz-series-1)',
                  keyShape: 'rect',
                },
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
}
