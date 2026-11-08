import { Icon, Label } from '@gravity-ui/uikit';
import { CircleExclamation, TriangleExclamation } from '@gravity-ui/icons';

import { QUOTAS } from './data';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetProps } from './types';

const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const pct = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 0 });

function severity(ratio: number) {
  if (ratio >= 0.9) return { color: 'var(--viz-critical)', label: 'критично', theme: 'danger' as const, icon: CircleExclamation };
  if (ratio >= 0.75) return { color: 'var(--viz-warning)', label: 'внимание', theme: 'warning' as const, icon: TriangleExclamation };
  return { color: 'var(--viz-s1)', label: null, theme: null, icon: null };
}

export function QuotasWidget(frame: WidgetProps) {
  return (
    <WidgetFrame {...frame} subtitle="Использование ресурсов">
      <div className="meter-list">
        {QUOTAS.map((q) => {
          const ratio = Math.min(1, q.used / q.total);
          const s = severity(ratio);
          return (
            <div key={q.name}>
              <div className="meter__head">
                <span>{q.name}</span>
                <span className="meter__value">
                  {s.theme && s.icon && (
                    <Label theme={s.theme} size="xs" icon={<Icon data={s.icon} size={12} />}>
                      {s.label}
                    </Label>
                  )}
                  {pct.format(ratio)}
                  <span style={{ color: 'var(--viz-muted)', fontWeight: 400 }}>
                    {fmt.format(q.used)} / {fmt.format(q.total)} {q.unit}
                  </span>
                </span>
              </div>
              <div
                className="meter__track"
                role="meter"
                aria-label={q.name}
                aria-valuemin={0}
                aria-valuemax={q.total}
                aria-valuenow={q.used}
                aria-valuetext={`${fmt.format(q.used)} из ${fmt.format(q.total)} ${q.unit}`}
                style={{ background: `color-mix(in srgb, ${s.color} 20%, transparent)` }}
              >
                <div className="meter__fill" style={{ width: `${ratio * 100}%`, background: s.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetFrame>
  );
}
