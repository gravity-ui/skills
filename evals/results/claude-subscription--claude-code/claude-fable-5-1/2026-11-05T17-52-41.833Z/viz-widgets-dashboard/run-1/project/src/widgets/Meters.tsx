import { CircleCheck, TriangleExclamation } from '@gravity-ui/icons';
import { Icon, Progress, Text } from '@gravity-ui/uikit';

import { meters, type Severity } from './data';

const THEME: Record<Severity, 'success' | 'warning' | 'danger'> = {
  good: 'success',
  warning: 'warning',
  critical: 'danger',
};

const LABEL: Record<Severity, string> = { good: 'норма', warning: 'внимание', critical: 'критично' };

export function ResourceMeters() {
  return (
    <div className="meters">
      {meters.map((m) => (
        <div key={m.name} className="meters__row">
          <div className="meters__head">
            <span className={`activity__icon activity__icon_${m.severity}`} aria-hidden="true">
              <Icon data={m.severity === 'good' ? CircleCheck : TriangleExclamation} size={14} />
            </span>
            <Text variant="body-1" ellipsis>
              {m.name}
            </Text>
            <Text variant="caption-2" color="hint">
              {LABEL[m.severity]}
            </Text>
          </div>
          <Text variant="subheader-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {m.value} %
          </Text>
          <div className="meters__bar">
            <Progress
              value={m.value}
              size="s"
              theme={THEME[m.severity]}
              text=""
              aria-label={`${m.name}: ${m.value} %, ${LABEL[m.severity]}`}
            />
          </div>
          <Text variant="caption-2" color="secondary" style={{ gridColumn: '1 / -1' }}>
            {m.detail}
          </Text>
        </div>
      ))}
    </div>
  );
}
