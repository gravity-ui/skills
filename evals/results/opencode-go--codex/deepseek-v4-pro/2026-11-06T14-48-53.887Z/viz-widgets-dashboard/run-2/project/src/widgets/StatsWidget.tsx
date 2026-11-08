import { Card, Text, useTheme } from '@gravity-ui/uikit';
import type { WidgetProps } from './types';

const STATS_DATA: Record<string, { value: string; label: string; delta: string }> = {
  'widget-stats-1': { value: '1,247', label: 'Active users', delta: '+12.5%' },
  'widget-stats-2': { value: '89.3%', label: 'Uptime', delta: '+0.3%' },
};

export function StatsWidget({ id }: WidgetProps) {
  const theme = useTheme();
  const data = STATS_DATA[id] ?? { value: '—', label: 'Unknown', delta: '—' };
  const isPositive = data.delta.startsWith('+');

  return (
    <Card view="filled" style={{ height: '100%', padding: 16 }}>
      <Text variant="subheader-2" color="secondary">
        {data.label}
      </Text>
      <div style={{ marginTop: 12 }}>
        <Text variant="display-2">{data.value}</Text>
      </div>
      <div style={{ marginTop: 8 }}>
        <Text
          variant="body-2"
          color={isPositive ? 'positive' : 'danger'}
        >
          {data.delta} vs last week
        </Text>
      </div>
    </Card>
  );
}
