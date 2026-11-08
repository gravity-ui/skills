import { Card, Text } from '@gravity-ui/uikit';
import type { ChartProps } from './types';

const defaultColors = [
  'var(--g-color-base-info)',
  'var(--g-color-base-positive)',
  'var(--g-color-base-warning)',
  'var(--g-color-base-danger)',
  'var(--g-color-base-utility)',
];

export function ChartWidget({ bars }: ChartProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <Card view="raised" style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {bars.map((bar, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text variant="caption-1" style={{ width: 64, flexShrink: 0, textAlign: 'right' }}>
            {bar.label}
          </Text>
          <div style={{ flex: 1, background: 'var(--g-color-base-generic)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.round((bar.value / max) * 100)}%`,
                height: '100%',
                borderRadius: 4,
                backgroundColor: bar.color ?? defaultColors[i % defaultColors.length],
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <Text variant="caption-1" style={{ width: 40, flexShrink: 0 }}>
            {bar.value}
          </Text>
        </div>
      ))}
    </Card>
  );
}
