import {useState} from 'react';

import {formatFull, formatPercent} from '../format';
import {useElementSize} from '../hooks';
import {ChartTooltip} from './ChartTooltip';
import {DataTable} from './DataTable';
import type {WidgetView} from './WidgetFrame';

interface SegmentedBarProps {
  title: string;
  parts: Array<{name: string; value: number}>;
  view: WidgetView;
}

const BAR_HEIGHT = 28;
const GAP = 2;
const CHAR_WIDTH = 7;

/** Tall segmented bar: one whole split into <= 6 parts, share printed where it fits, legend of names only. */
export function SegmentedBar({title, parts, view}: SegmentedBarProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<{index: number; px: number; py: number} | null>(null);
  const total = parts.reduce((a, b) => a + b.value, 0);

  if (view === 'table') {
    const rows = parts.map((p) => ({name: p.name, value: formatFull(p.value), share: formatPercent(total ? p.value / total : 0)}));
    const columns = [
      {id: 'name', name: 'Источник'},
      {id: 'value', name: 'Сессии', align: 'end' as const, className: 'viz-num'},
      {id: 'share', name: 'Доля', align: 'end' as const, className: 'viz-num'},
    ];
    return <DataTable columns={columns} rows={rows} label={`${title}, таблица`} />;
  }

  const width = size.width;
  const nonZero = parts.filter((p) => p.value > 0).length;
  const available = Math.max(0, width - GAP * Math.max(0, nonZero - 1));
  let cursor = 0;
  const blocks = parts.map((p, i) => {
    const w = total ? (p.value / total) * available : 0;
    const block = {...p, index: i, x: cursor, w, share: total ? p.value / total : 0, color: `var(--viz-s${i + 1})`};
    if (w > 0) cursor += w + GAP;
    return block;
  });

  return (
    <div className="viz-chart viz-chart_segmented" ref={ref}>
      {width > 0 ? (
        <svg width={width} height={BAR_HEIGHT} role="img" aria-label={`${title}: доли ${parts.length} частей`}>
          {blocks
            .filter((b) => b.w > 0)
            .map((b) => {
              const label = formatPercent(b.share);
              const fits = b.w >= label.length * CHAR_WIDTH + 16;
              const isHover = hover?.index === b.index;
              return (
                <g
                  key={b.name}
                  className="viz-hit"
                  tabIndex={0}
                  role="img"
                  aria-label={`${b.name}: ${formatFull(b.value)}, ${label}`}
                  onPointerMove={(event) => {
                    const rect = ref.current?.getBoundingClientRect();
                    if (rect) setHover({index: b.index, px: event.clientX - rect.left, py: event.clientY - rect.top});
                  }}
                  onPointerLeave={() => setHover(null)}
                  onFocus={(event) => {
                    const host = ref.current?.getBoundingClientRect();
                    const svg = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    const offsetY = host && svg ? svg.top - host.top : 0;
                    setHover({index: b.index, px: b.x + b.w / 2, py: offsetY + BAR_HEIGHT / 2});
                  }}
                  onBlur={() => setHover(null)}
                >
                  <rect x={b.x} y={0} width={b.w} height={BAR_HEIGHT} rx={4} fill={b.color} opacity={isHover ? 0.85 : 1} />
                  {fits ? (
                    <text x={b.x + 8} y={BAR_HEIGHT / 2} dy="0.35em" className="viz-label_on-fill" fill={b.index === 3 ? 'var(--viz-on-s4)' : '#ffffff'}>
                      {label}
                    </text>
                  ) : null}
                </g>
              );
            })}
        </svg>
      ) : null}
      <div className="viz-legend" role="list" aria-label="Части">
        {blocks.map((b) => (
          <span key={b.name} className="viz-legend__item" role="listitem">
            <span className="viz-legend__key_rect" style={{background: b.color}} />
            {b.name}
          </span>
        ))}
      </div>
      {hover ? (
        <ChartTooltip
          x={hover.px}
          y={hover.py}
          width={width}
          height={size.height}
          title={blocks[hover.index].name}
          rows={[
            {name: 'сессий', value: formatFull(blocks[hover.index].value), color: blocks[hover.index].color, keyShape: 'rect'},
            {name: 'доля', value: formatPercent(blocks[hover.index].share)},
          ]}
        />
      ) : null}
    </div>
  );
}
