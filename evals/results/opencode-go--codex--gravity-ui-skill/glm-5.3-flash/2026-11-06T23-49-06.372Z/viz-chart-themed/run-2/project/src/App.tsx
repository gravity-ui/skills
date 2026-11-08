import { Chart } from '@gravity-ui/charts';
import { Text, useThemeValue } from '@gravity-ui/uikit';
import React from 'react';

const chartPoints = [
  { x: 1, y: 12 },
  { x: 2, y: 28 },
  { x: 3, y: 22 },
  { x: 4, y: 38 },
  { x: 5, y: 31 },
  { x: 6, y: 45 },
];

const chartStyle: React.CSSProperties = {
  height: 320,
  padding: 'var(--g-spacing-3)',
  background: 'var(--g-color-base-generic)',
  border: '1px solid var(--g-color-line-generic)',
  borderRadius: 'var(--g-border-radius-l)',
  color: 'var(--g-color-text-primary)',
};

export function App() {
  const theme = useThemeValue();

  return (
    <div style={{ padding: 'var(--g-spacing-4)' }}>
      <div style={chartStyle}>
        <Text variant="header-1" as="h1">
          Sales trend
        </Text>
        <Text color="secondary" as="p">
          Weekly revenue
        </Text>
        <div style={{ height: 260, marginTop: 'var(--g-spacing-3)' }}>
          <Chart
            data={{
              series: {
                data: [
                  {
                    type: 'line',
                    name: 'Revenue',
                    color:
                      theme === 'dark'
                        ? 'var(--g-color-line-brand)'
                        : 'var(--g-color-text-brand)',
                    data: chartPoints,
                  },
                ],
              },
              title: { text: 'Revenue by day' },
              legend: { enabled: false },
            }}
          />
        </div>
      </div>
    </div>
  );
}
