import React from 'react';
import { Sparkline } from '../charts/Sparkline';
import { kpi, type KpiId } from '../data';
import { fmtCompact, fmtMoney, fmtPercent, fmtSignedPercent } from '../format';
import { ArrowDownIcon, ArrowUpIcon } from '../icons';

const CONFIG: Record<KpiId, { format: (v: number) => string; upIsGood: boolean }> = {
  visitors: { format: fmtCompact, upIsGood: true },
  revenue: { format: fmtMoney, upIsGood: true },
  conversion: { format: (v) => fmtPercent(v / 100, 2), upIsGood: true },
  errors: { format: (v) => fmtPercent(v / 100, 2), upIsGood: false },
};

export function Kpi({ id, days, width, title }: { id: KpiId; days: number; width: number; title: string }) {
  const { format, upIsGood } = CONFIG[id];
  const { value, delta, trailing, trend } = kpi(id, days);
  const flat = Math.abs(delta) < 0.0005;
  const good = delta > 0 === upIsGood;
  const tone = flat ? 'flat' : good ? 'good' : 'bad';
  const showSpark = width >= 230;
  // Подпись цвета не несёт смысл в одиночку: стрелка + знак + слова для скринридера.
  const sr = flat ? 'без изменений' : `${delta > 0 ? 'рост' : 'снижение'}, ${good ? 'это хорошо' : 'это плохо'}`;

  return (
    <div className="kpi">
      <div className="kpi__text">
        <div className="kpi__value">{format(value)}</div>
        <div className={`kpi__delta kpi__delta_${tone}`}>
          {!flat && (delta > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />)}
          <span>{fmtSignedPercent(delta)}</span>
          <span className="sr-only">{sr}</span>
          <span className="kpi__vs">к пред. {days} дн.</span>
        </div>
      </div>
      {showSpark && (
        <div className="kpi__spark">
          <Sparkline
            previous={trailing}
            current={trend}
            width={Math.min(150, Math.max(70, width - 150))}
            height={44}
            format={format}
            label={`${title}: динамика за ${days} дней`}
          />
        </div>
      )}
    </div>
  );
}
