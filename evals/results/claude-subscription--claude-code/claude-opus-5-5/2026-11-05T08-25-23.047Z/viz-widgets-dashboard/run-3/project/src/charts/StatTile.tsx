import React from 'react';
import { ArrowDown, ArrowUp } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';

import { useElementSize } from '../useElementSize';
import { fmt } from '../format';
import { ChartTooltip } from './ChartTooltip';

interface Props {
  value: number;
  previous: number;
  trend: number[];
  format: (n: number) => string;
  comparison: string;
  /** Whether a rise is good news (revenue) or bad news (e.g. churn). */
  upIsGood?: boolean;
  trendLabel: string;
}

export function StatTile({ value, previous, trend, format, comparison, upIsGood = true, trendLabel }: Props) {
  const delta = previous ? ((value - previous) / previous) * 100 : 0;
  const good = delta === 0 ? null : delta > 0 === upIsGood;
  return (
    <div className="stat">
      <div className="stat__value">{format(value)}</div>
      <div className="stat__delta">
        <span className={`stat__change${good === null ? '' : good ? ' stat__change_good' : ' stat__change_bad'}`}>
          {delta !== 0 && <Icon data={delta > 0 ? ArrowUp : ArrowDown} size={14} />}
          {fmt.signedPct(delta)}
        </span>
        <span className="stat__comparison">{comparison}</span>
      </div>
      <Sparkline values={trend} format={format} label={trendLabel} />
    </div>
  );
}

function Sparkline({ values, format, label }: { values: number[]; format: (n: number) => string; label: string }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
  const last = values.length - 1;
  const ok = width > 20 && height > 16;

  return (
    <div ref={ref} className="stat__spark">
      {ok && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={label}
          onPointerMove={(e) => {
            const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
            setHover(Math.max(0, Math.min(last, Math.round(((px - pad) / (width - pad * 2)) * last))));
          }}
          onPointerLeave={() => setHover(null)}
        >
          <path
            d={values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}
            className="stat__spark-line"
          />
          {hover !== null && hover !== last && (
            <circle cx={x(hover)} cy={y(values[hover])} r={4} className="stat__spark-hover chart-dot" />
          )}
          <circle cx={x(last)} cy={y(values[last])} r={4} className="stat__spark-current chart-dot" />
        </svg>
      )}
      {ok && hover !== null && (
        <ChartTooltip x={x(hover)} y={0} containerWidth={width}>
          <div className="chart-tooltip__row">
            <span className="chart-tooltip__value">{format(values[hover])}</span>
            <span className="chart-tooltip__label">
              {hover === last ? 'последний отрезок' : `отрезок ${hover + 1} из ${values.length}`}
            </span>
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}
