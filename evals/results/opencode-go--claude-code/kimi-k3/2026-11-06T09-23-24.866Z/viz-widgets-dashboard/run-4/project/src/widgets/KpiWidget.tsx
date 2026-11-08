import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {fmtInt, fmtMoney, fmtPct, fmtSignedPct, kpiData} from '../dashboard/data';
import type {MetricKey} from '../dashboard/types';
import {Sparkline} from '../charts/Sparkline';

interface KpiWidgetProps {
  metric: MetricKey;
  days: number;
}

export function KpiWidget({metric, days}: KpiWidgetProps) {
  const {value, delta, spark, upIsGood} = kpiData(metric, days);

  const formatted =
    metric === 'revenue'
      ? fmtMoney(value)
      : metric === 'users'
        ? fmtInt(value)
        : fmtPct(value);

  const good = delta === 0 ? null : delta > 0 === upIsGood;
  const DeltaIcon = delta >= 0 ? ArrowUp : ArrowDown;
  const deltaClass = good === null ? 'kpi-delta-flat' : good ? 'kpi-delta-good' : 'kpi-delta-bad';

  return (
    <div className="kpi">
      <div className="kpi-value">{formatted}</div>
      <div
        className={`kpi-delta ${deltaClass}`}
        aria-label={`Изменение к предыдущему периоду: ${fmtSignedPct(delta)}`}
      >
        <Icon data={DeltaIcon} size={14} aria-hidden />
        <span>{fmtSignedPct(delta)}</span>
        <span className="kpi-delta-period">к пред. периоду</span>
      </div>
      <div className="kpi-spark">
        <Sparkline values={spark} color="var(--s1)" />
      </div>
    </div>
  );
}
