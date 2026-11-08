import React from 'react';
import { Card, Text } from '@gravity-ui/uikit';

export interface WidgetDefinition {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'table' | 'text';
}

export const WIDGETS: WidgetDefinition[] = [
  { id: 'stats-1', title: 'Active Users', type: 'stats' },
  { id: 'stats-2', title: 'Revenue', type: 'stats' },
  { id: 'chart-1', title: 'Traffic Overview', type: 'chart' },
  { id: 'chart-2', title: 'Conversion Rate', type: 'chart' },
  { id: 'table-1', title: 'Recent Orders', type: 'table' },
  { id: 'text-1', title: 'Summary', type: 'text' },
];

interface WidgetContentProps {
  widget: WidgetDefinition;
}

export function WidgetContent({ widget }: WidgetContentProps) {
  switch (widget.type) {
    case 'stats':
      return <StatsContent title={widget.title} />;
    case 'chart':
      return <ChartPlaceholder />;
    case 'table':
      return <TablePlaceholder />;
    case 'text':
      return <TextPlaceholder />;
    default:
      return null;
  }
}

function StatsContent({ title }: { title: string }) {
  const value = React.useMemo(() => Math.floor(Math.random() * 9000 + 1000), []);
  const trend = React.useMemo(() => (Math.random() > 0.5 ? 'up' : 'down'), []);
  const pct = React.useMemo(() => Math.floor(Math.random() * 20 + 1), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Text variant="body-1" color="secondary">{title}</Text>
      <Text variant="display-2" style={{ fontWeight: 700, margin: '8px 0' }}>
        {value.toLocaleString()}
      </Text>
      <Text variant="body-2" color={trend === 'up' ? 'positive' : 'danger'}>
        {trend === 'up' ? '↑' : '↓'} {pct}% vs last week
      </Text>
    </div>
  );
}

function ChartPlaceholder() {
  const bars = React.useMemo(
    () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 60 + 15)),
    []
  );

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', padding: '4px 0' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: '12%',
            height: `${h}%`,
            background: `hsl(${(i * 30) % 360}, 60%, 55%)`,
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s',
            minWidth: 8,
          }}
        />
      ))}
    </div>
  );
}

function TablePlaceholder() {
  const rows = [
    { id: '#1024', customer: 'Alice Chen', status: 'Delivered', amount: '$128.50' },
    { id: '#1023', customer: 'Bob Kumar', status: 'Processing', amount: '$94.20' },
    { id: '#1022', customer: 'Charlie O.', status: 'Shipped', amount: '$215.00' },
    { id: '#1021', customer: 'Diana M.', status: 'Delivered', amount: '$67.80' },
  ];

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--g-color-line-generic)' }}>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Order</th>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Customer</th>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Status</th>
            <th style={{ textAlign: 'right', padding: '4px 8px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--g-color-line-generic-accent)' }}>
              <td style={{ padding: '4px 8px' }}><Text variant="code-1">{r.id}</Text></td>
              <td style={{ padding: '4px 8px' }}>{r.customer}</td>
              <td style={{ padding: '4px 8px' }}>{r.status}</td>
              <td style={{ padding: '4px 8px', textAlign: 'right' }}>{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextPlaceholder() {
  return (
    <div style={{ padding: '4px 0', height: '100%' }}>
      <Text variant="body-2">
        The dashboard provides a real-time overview of key business metrics.
        Drag and resize widgets to customize your layout. Click the header
        of any widget to move it around the grid.
      </Text>
    </div>
  );
}
