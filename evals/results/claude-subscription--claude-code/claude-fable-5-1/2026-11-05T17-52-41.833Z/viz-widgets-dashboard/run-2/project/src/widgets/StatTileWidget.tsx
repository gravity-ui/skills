import { Icon, Text } from '@gravity-ui/uikit';

import { Sparkline } from '../charts/Sparkline';
import { fmt, type Kpi } from '../data';
import { ArrowDownIcon, ArrowUpIcon } from '../icons';
import { WidgetFrame } from './WidgetFrame';

export interface StatTileWidgetProps {
  title: string;
  kpi: Kpi;
  format: (value: number) => string;
  hero?: boolean;
  onRemove?: () => void;
}

/** Стат-плитка: подпись · значение · дельта к прошлому периоду · спарклайн. */
export function StatTileWidget({ title, kpi, format, hero, onRemove }: StatTileWidgetProps) {
  const up = kpi.delta >= 0;
  const good = up === kpi.upIsGood;
  const value = format(kpi.value);
  return (
    <WidgetFrame title={title} onRemove={onRemove}>
      <div className={`stat ${hero ? 'stat_hero' : ''}`}>
        <div className="stat__value" title={value}>
          {value}
        </div>
        <div className="stat__meta">
          <span className="stat__meta-text">
            <span className={`stat__delta ${good ? 'stat__delta_good' : 'stat__delta_bad'}`}>
              <Icon data={up ? ArrowUpIcon : ArrowDownIcon} size={12} />
              {fmt.signedPercent(kpi.delta)}
            </span>
            <Text variant="caption-2" color="secondary" className="stat__period">
              к прошлому периоду
            </Text>
          </span>
          <span className="stat__spark">
            <Sparkline values={kpi.trend} width={96} height={28} />
          </span>
        </div>
      </div>
    </WidgetFrame>
  );
}
