import { Card, Text } from '@gravity-ui/uikit';
import type { WidgetProps } from './types';

const CHART_LABELS: Record<string, string> = {
  'widget-chart-1': 'Response time (ms)',
  'widget-chart-2': 'Requests per second',
};

function MiniBarChart() {
  const bars = [60, 45, 80, 55, 70, 40, 90];
  const max = Math.max(...bars);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        height: 100,
        marginTop: 12,
      }}
    >
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: 'var(--g-color-base-brand)',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s ease',
            minWidth: 0,
          }}
        />
      ))}
    </div>
  );
}

export function ChartWidget({ id }: WidgetProps) {
  const label = CHART_LABELS[id] ?? 'Chart';

  return (
    <Card view="filled" style={{ height: '100%', padding: 16 }}>
      <Text variant="subheader-2" color="secondary">
        {label}
      </Text>
      <MiniBarChart />
    </Card>
  );
}
