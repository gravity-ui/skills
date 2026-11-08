import { useRef, useState } from 'react';

import { useElementSize } from '../dashboard/useElementSize';
import { ChartTooltip, Legend } from './chartParts';
import { TRAFFIC_SOURCES } from './data';
import { formatInteger, formatShare } from './format';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetProps } from './types';

const COLORS = ['var(--viz-s1)', 'var(--viz-s2)', 'var(--viz-s3)', 'var(--viz-other)'];
const MIN_LABEL_PX = 44;

export function SourcesWidget(frame: WidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(ref);
  const [hover, setHover] = useState<number | null>(null);

  const total = TRAFFIC_SOURCES.reduce((a, s) => a + s.value, 0);
  const parts = TRAFFIC_SOURCES.map((s, i) => ({ ...s, share: s.value / total, color: COLORS[i] }));
  const gaps = 2 * (parts.length - 1);

  return (
    <WidgetFrame {...frame} subtitle="Сессии за 30 дней по каналам">
      <div className="segbar" ref={ref}>
        <div className="segbar__bar" role="list" aria-label="Источники трафика">
          {parts.map((p, i) => {
            const px = (width - gaps) * p.share;
            return (
              <div
                key={p.name}
                role="listitem"
                tabIndex={0}
                className="segbar__part"
                style={{ flex: `${p.value} 1 0px`, background: p.color }}
                aria-label={`${p.name}: ${formatInteger(p.value)}, ${formatShare(p.share)}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                {px >= MIN_LABEL_PX ? formatShare(p.share) : null}
              </div>
            );
          })}
        </div>
        <Legend items={parts} kind="rect" />
        {hover !== null && (
          <ChartTooltip
            rows={[{ name: parts[hover].name, value: `${formatInteger(parts[hover].value)} · ${formatShare(parts[hover].share)}`, color: parts[hover].color, kind: 'rect' }]}
            style={{ left: Math.min(Math.max(0, width - 200), (width - gaps) * parts.slice(0, hover).reduce((a, p) => a + p.share, 0) + 2 * hover), top: 'calc(50% + 18px)' }}
          />
        )}
      </div>
    </WidgetFrame>
  );
}
