import { Card, Text } from '@gravity-ui/uikit';
import type { ListProps } from './types';

export function ListWidget({ items }: ListProps) {
  return (
    <Card view="raised" style={{ padding: 16, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom:
                i < items.length - 1 ? '1px solid var(--g-color-line-generic)' : undefined,
            }}
          >
            <Text variant="body-1">{item.label}</Text>
            <Text variant="body-1" color="secondary">
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
}
