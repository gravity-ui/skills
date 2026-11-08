import React from 'react';
import { SERVICE_LOAD } from '../data';
import { fmtPercent } from '../format';
import { StatusIcon } from '../icons';

function level(v: number) {
  if (v >= 0.9) return { key: 'critical' as const, label: 'Критично' };
  if (v >= 0.75) return { key: 'warning' as const, label: 'Внимание' };
  return null;
}

/** Индикаторы: заливка несёт тяжесть, незаполненная часть — светлый тон того же цвета. */
export function Services({ height }: { height: number }) {
  const compact = height < 175;
  return (
    <ul className={'meters' + (compact ? ' meters_compact' : '')} aria-label="Нагрузка на сервисы сейчас">
      {SERVICE_LOAD.map((s) => {
        const lv = level(s.value);
        const tone = lv?.key ?? 'normal';
        return (
          <li key={s.id} className="meter">
            <div className="meter__head">
              <span className="meter__name">{s.name}</span>
              {lv && (
                <span className="meter__state">
                  <StatusIcon kind={lv.key} size={13} />
                  {lv.label}
                </span>
              )}
              <span className="meter__num">{fmtPercent(s.value)}</span>
            </div>
            <div
              className={`meter__track meter__track_${tone}`}
              role="meter"
              aria-label={s.name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(s.value * 100)}
            >
              <div className={`meter__fill meter__fill_${tone}`} style={{ width: `${s.value * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
