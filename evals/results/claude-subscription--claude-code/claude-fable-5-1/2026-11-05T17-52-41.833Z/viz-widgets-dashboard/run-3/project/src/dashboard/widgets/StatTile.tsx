import {useRef, useState} from 'react';
import {Icon, Text} from '@gravity-ui/uikit';

import type {StatValue} from '../data';
import {formatDelta} from '../format';
import {useElementSize} from '../hooks';
import {ArrowDownIcon, ArrowUpIcon} from '../icons';
import {ChartTooltip} from './ChartTooltip';

interface StatTileProps {
  label: string;
  stat: StatValue;
  format: (value: number) => string;
  /** Whether growth is good news (false for errors, churn, latency). */
  upIsGood?: boolean;
}

const SPARK_MIN = 40;
const SPARK_MAX = 96;
const PAD = 4;

/** Stat tile: label · value · delta vs previous period · 12-point sparkline (de-emphasis hue, latest segment in the accent). */
export function StatTile({label, stat, format, upIsGood = true}: StatTileProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverState, setHover] = useState<{index: number; px: number} | null>(null);

  const direction = stat.delta === 0 ? 'flat' : stat.delta > 0 ? 'up' : 'down';
  const tone = direction === 'flat' ? 'neutral' : (direction === 'up') === upIsGood ? 'good' : 'bad';

  const points = stat.trend;
  const n = points.length;
  const hover = hoverState && hoverState.index < n ? hoverState : null;
  const width = size.width;
  // The sparkline grows with the tile but stays a sparkline, not a chart.
  const SPARK_HEIGHT = Math.max(SPARK_MIN, Math.min(SPARK_MAX, size.height));
  const showSpark = n > 1 && width > 40 && size.height >= SPARK_MIN;
  // A sparkline has no axis, so it spans the data range rather than starting at zero.
  const max = Math.max(...points);
  const min = Math.min(...points);
  const stepX = n > 1 ? (width - PAD * 2) / (n - 1) : 0;
  const x = (i: number) => PAD + i * stepX;
  const y = (v: number) => PAD + (SPARK_HEIGHT - PAD * 2) * (max === min ? 0.5 : 1 - (v - min) / (max - min));
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = n - 1;
  const accentPath = n > 1 ? `M${x(last - 1).toFixed(1)},${y(points[last - 1]).toFixed(1)} L${x(last).toFixed(1)},${y(points[last]).toFixed(1)}` : '';

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || n < 2) return;
    const px = event.clientX - rect.left;
    const index = Math.max(0, Math.min(last, Math.round((px - PAD) / stepX)));
    setHover({index, px: x(index)});
  };

  return (
    <div className="stat">
      <Text variant="body-1" color="secondary">
        {label}
      </Text>
      <div className="stat__value">{format(stat.value)}</div>
      <div className={`stat__delta stat__delta_${tone}`}>
        {direction !== 'flat' ? <Icon data={direction === 'up' ? ArrowUpIcon : ArrowDownIcon} size={14} /> : null}
        <span>{formatDelta(stat.delta)}</span>
        <Text variant="body-1" color="hint">
          к прошлому периоду
        </Text>
      </div>
      <div className="stat__spark" ref={ref}>
        {showSpark ? (
          <svg
            ref={svgRef}
            width={width}
            height={SPARK_HEIGHT}
            role="img"
            aria-label={`Динамика: ${label}, ${n} точек`}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
          >
            <path d={path} fill="none" stroke="var(--viz-deemph)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <path d={accentPath} fill="none" stroke="var(--viz-s1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {hover ? <line x1={hover.px} x2={hover.px} y1={0} y2={SPARK_HEIGHT} stroke="var(--viz-axis)" /> : null}
            <circle
              cx={hover ? x(hover.index) : x(last)}
              cy={hover ? y(points[hover.index]) : y(points[last])}
              r={4}
              fill={hover && hover.index !== last ? 'var(--viz-deemph)' : 'var(--viz-s1)'}
              stroke="var(--viz-surface)"
              strokeWidth={2}
            />
          </svg>
        ) : null}
        {hover && showSpark ? (
          <ChartTooltip
            x={hover.px}
            y={SPARK_HEIGHT / 2}
            width={width}
            height={SPARK_HEIGHT}
            rows={[{name: `точка ${hover.index + 1} из ${n}`, value: format(points[hover.index])}]}
          />
        ) : null}
      </div>
    </div>
  );
}
