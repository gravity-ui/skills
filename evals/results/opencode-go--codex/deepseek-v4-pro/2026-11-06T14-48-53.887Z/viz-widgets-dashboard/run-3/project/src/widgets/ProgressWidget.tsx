import { Card, Text } from '@gravity-ui/uikit';
import type { ProgressProps } from './types';

export function ProgressWidget({ items }: ProgressProps) {
  return (
    <Card view="raised" style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const pct = Math.min(Math.round((item.current / Math.max(item.total, 1)) * 100), 100);
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="caption-1">{item.label}</Text>
              <Text variant="caption-1" color="secondary">
                {item.current} / {item.total}
              </Text>
            </div>
            <div style={{ background: 'var(--g-color-base-generic)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: pct >= 100 ? 'var(--g-color-base-positive)' : 'var(--g-color-base-info)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
