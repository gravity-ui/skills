import * as React from 'react';
import {Text} from '@gravity-ui/uikit';

export interface BarsPoint {
  label: string;
  value: number;
}

export interface BarsWidgetData {
  title: string;
  points: BarsPoint[];
}

const TICK_COUNT = 4;

const fullFormat = new Intl.NumberFormat('ru-RU');
const compactFormat = new Intl.NumberFormat('ru-RU', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Round the axis max up to a clean 1 / 2 / 2.5 / 5 / 10 × 10^n step. */
function niceCeil(max: number): number {
  if (max <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const norm = max / magnitude;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function BarsWidget({data}: {data: BarsWidgetData}) {
  const [active, setActive] = React.useState<number | null>(null);

  const points = data.points ?? [];
  const maxValue = Math.max(0, ...points.map((p) => p.value));
  const niceMax = niceCeil(maxValue);
  const useCompact = niceMax >= 10_000;
  const ticks = Array.from({length: TICK_COUNT + 1}, (_, i) => (niceMax / TICK_COUNT) * i);

  const formatTick = (v: number) => (useCompact ? compactFormat.format(v) : fullFormat.format(v));

  return (
    <div className="widget bars-widget">
      <Text variant="subheader-1" ellipsis title={data.title}>
        {data.title}
      </Text>
      <div className="bars" role="img" aria-label={data.title}>
        <div className="bars__top">
          <div className="bars__yaxis" aria-hidden="true">
            {ticks.map((t) => (
              <span
                key={t}
                className="bars__ytick"
                style={{
                  top: `${(1 - t / niceMax) * 100}%`,
                  transform:
                    t === 0
                      ? 'translateY(-100%)'
                      : t === niceMax
                        ? 'translateY(0)'
                        : 'translateY(-50%)',
                }}
              >
                {formatTick(t)}
              </span>
            ))}
          </div>
          <div className="bars__area">
            {ticks
              .filter((t) => t > 0)
              .map((t) => (
                <div
                  key={t}
                  className="bars__gridline"
                  style={{top: `${(1 - t / niceMax) * 100}%`}}
                  aria-hidden="true"
                />
              ))}
            <div className="bars__slots">
              {points.map((p, i) => {
                const pct = Math.min(100, (p.value / niceMax) * 100);
                const valueText = fullFormat.format(p.value);
                return (
                  <div
                    key={`${p.label}-${i}`}
                    className="bars__slot"
                    tabIndex={0}
                    aria-label={`${p.label}: ${valueText}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  >
                    <div className="bars__bar" style={{height: `${pct}%`}} />
                    {active === i ? (
                      <div className="bars__tooltip" style={{bottom: `calc(${pct}% + 8px)`}}>
                        <span className="bars__tooltip-value">{valueText}</span>
                        <span className="bars__tooltip-label">{p.label}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bars__xlabels" aria-hidden="true">
          {points.map((p, i) => (
            <div key={`${p.label}-${i}`} className="bars__xlabel">
              <Text variant="caption-2" color="secondary" ellipsis title={p.label}>
                {p.label}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
