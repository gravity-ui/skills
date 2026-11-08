import { CircleCheck, TriangleExclamation } from '@gravity-ui/icons';
import { Icon, Text } from '@gravity-ui/uikit';

import { activity } from './data';

export function ActivityFeed() {
  return (
    <ul className="activity" aria-label="Последние события">
      {activity.map((e) => (
        <li key={e.id} className="activity__item">
          <span className={`activity__icon activity__icon_${e.severity}`} aria-hidden="true">
            <Icon data={e.severity === 'good' ? CircleCheck : TriangleExclamation} size={14} />
          </span>
          <Text variant="body-1" ellipsis>
            {e.title}
          </Text>
          <Text variant="caption-2" color="hint" className="activity__time" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {e.time}
          </Text>
          <Text variant="caption-2" color="secondary" className="activity__meta" ellipsis>
            {e.detail}
          </Text>
        </li>
      ))}
    </ul>
  );
}
