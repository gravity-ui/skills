import { Card, Text, List } from '@gravity-ui/uikit';
import type { WidgetProps } from './types';

const LIST_DATA: Record<string, string[]> = {
  'widget-list-1': [
    'Database migration completed',
    'New deployment v2.4.1 rolled out',
    'SSL certificate renewed',
    'Backup job scheduled',
  ],
};

export function ListWidget({ id }: WidgetProps) {
  const items = LIST_DATA[id] ?? ['No items'];

  return (
    <Card view="filled" style={{ height: '100%', padding: 16 }}>
      <Text variant="subheader-2" color="secondary" style={{ marginBottom: 12 }}>
        Recent events
      </Text>
      <List
        items={items}
        itemsHeight={36}
        renderItem={(item: string) => (
          <Text variant="body-2">{item}</Text>
        )}
      />
    </Card>
  );
}
