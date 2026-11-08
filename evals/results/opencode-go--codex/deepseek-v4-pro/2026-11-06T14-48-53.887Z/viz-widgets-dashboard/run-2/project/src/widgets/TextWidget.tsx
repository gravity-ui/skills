import { Card, Text } from '@gravity-ui/uikit';
import type { WidgetProps } from './types';

const TEXT_DATA: Record<string, { heading: string; body: string }> = {
  'widget-text-1': {
    heading: 'System status',
    body: 'All systems are operating normally. No incidents reported in the last 24 hours. Monitoring continues across all regions.',
  },
};

export function TextWidget({ id }: WidgetProps) {
  const data = TEXT_DATA[id] ?? { heading: 'Note', body: 'No content.' };

  return (
    <Card view="filled" style={{ height: '100%', padding: 16 }}>
      <Text variant="subheader-2" color="secondary">
        {data.heading}
      </Text>
      <div style={{ marginTop: 12 }}>
        <Text variant="body-2" color="secondary">
          {data.body}
        </Text>
      </div>
    </Card>
  );
}
