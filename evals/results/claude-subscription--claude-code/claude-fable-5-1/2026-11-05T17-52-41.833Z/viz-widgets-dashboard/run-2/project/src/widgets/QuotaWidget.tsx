import { Icon, Text } from '@gravity-ui/uikit';

import { Meter, meterSeverity } from '../charts/Meter';
import { fmt, type Quota } from '../data';
import { CheckIcon, WarningIcon } from '../icons';
import { WidgetFrame } from './WidgetFrame';

const STATUS_TEXT = {
  ok: 'В пределах лимита',
  warning: 'Скоро закончится',
  critical: 'Лимит почти исчерпан',
} as const;

export function QuotaWidget({ quota, onRemove }: { quota: Quota; onRemove?: () => void }) {
  const ratio = quota.used / quota.limit;
  const severity = meterSeverity(ratio);
  return (
    <WidgetFrame title="Хранилище" subtitle="использование квоты" onRemove={onRemove}>
      <div className="quota">
        <div className="quota__figures">
          <span className="quota__value">{fmt.number(quota.used)}</span>
          <Text variant="body-1" color="secondary">
            из {fmt.number(quota.limit)} {quota.unit}
          </Text>
          <span className="quota__share">{fmt.percent(ratio)}</span>
        </div>
        <Meter ratio={ratio} label={`Использовано ${fmt.percent(ratio)} квоты`} />
        <div className={`status-line status-line_${severity}`}>
          <Icon data={severity === 'ok' ? CheckIcon : WarningIcon} size={14} />
          <Text variant="caption-2">{STATUS_TEXT[severity]}</Text>
        </div>
      </div>
    </WidgetFrame>
  );
}
