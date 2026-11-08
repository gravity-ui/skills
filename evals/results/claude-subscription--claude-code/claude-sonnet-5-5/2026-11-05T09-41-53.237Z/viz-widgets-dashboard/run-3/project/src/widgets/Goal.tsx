import React from 'react';
import { sum, type DashboardData } from '../data';
import { AlertIcon, CheckIcon } from '../icons';
import { pct, rub } from '../format';

const GROWTH = 1.07;

export function Goal({ data }: { data: DashboardData }) {
  const cur = sum(data.current, (d) => d.revenue);
  const target = Math.round((sum(data.previous, (d) => d.revenue) * GROWTH) / 1000) * 1000;
  const ratio = cur / target;
  const level = ratio >= 0.9 ? 'ok' : ratio >= 0.7 ? 'warn' : 'bad';
  const status = {
    ok: ['Идём по плану', <CheckIcon key="i" />],
    warn: ['Небольшое отставание', <AlertIcon key="i" />],
    bad: ['Серьёзное отставание', <AlertIcon key="i" />],
  }[level];
  return (
    <div className="goal">
      <div className="goal__top">
        <span className="goal__value">{pct(ratio, 0)}</span>
        <span className="goal__of">
          {rub(cur)} из {rub(target)}
        </span>
      </div>
      <div
        className={`meter meter_${level}`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(Math.round(ratio * 100), 100)}
        aria-label="Выполнение плана по выручке"
      >
        <div className="meter__fill" style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </div>
      <div className={`goal__status goal__status_${level}`}>
        {status[1]} {status[0]}
        <span className="goal__hint"> · план: +{Math.round((GROWTH - 1) * 100)}&nbsp;% к прошлому периоду</span>
      </div>
    </div>
  );
}
