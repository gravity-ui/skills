import {Icon, Text} from '@gravity-ui/uikit';
import {ArrowDown, ArrowUp} from '@gravity-ui/icons';

export interface StatTrend {
  /** preformatted signed value, e.g. "+12,4%" */
  value: string;
  direction: 'up' | 'down';
  /** whether the direction is good news (drives the color) */
  good: boolean;
  /** named comparison period, e.g. "к прошлому месяцу" */
  period: string;
}

export interface StatWidgetData {
  label: string;
  value: string;
  trend?: StatTrend;
}

export function StatWidget({data}: {data: StatWidgetData}) {
  const trend = data.trend;
  return (
    <div className="widget stat">
      <Text variant="body-2" color="secondary" ellipsis title={data.label}>
        {data.label}
      </Text>
      <div className="stat__value">
        <Text variant="display-2">{data.value}</Text>
      </div>
      {trend ? (
        <div className={`stat__delta stat__delta_${trend.good ? 'good' : 'bad'}`}>
          <Icon data={trend.direction === 'up' ? ArrowUp : ArrowDown} size={14} />
          <Text variant="body-2" color={trend.good ? 'positive' : 'danger'}>
            {trend.value}
          </Text>
          <Text variant="caption-1" color="hint" ellipsis title={trend.period}>
            {trend.period}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
