import { Card, Text } from '@gravity-ui/uikit';
import type { MetricProps } from './types';

const trendColors: Record<string, string> = {
  up: 'var(--g-color-text-positive)',
  down: 'var(--g-color-text-danger)',
  flat: 'var(--g-color-text-secondary)',
};

const trendArrows: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function MetricWidget({ value, label, trend, trendValue }: MetricProps) {
  return (
    <Card view="raised" style={{ padding: 16, height: '100%' }}>
      <Text variant="subheader-1" color="secondary">
        {label}
      </Text>
      <Text variant="display-2" style={{ marginTop: 8 }}>
        {value}
      </Text>
      {trend && (
        <Text
          variant="body-1"
          style={{ marginTop: 4, color: trendColors[trend] ?? trendColors.flat }}
        >
          {trendArrows[trend] ?? ''} {trendValue ?? ''}
        </Text>
      )}
    </Card>
  );
}
