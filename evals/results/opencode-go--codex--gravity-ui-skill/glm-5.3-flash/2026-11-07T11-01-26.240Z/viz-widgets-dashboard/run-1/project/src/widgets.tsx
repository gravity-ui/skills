import { Flex, Progress, Text as GravityText } from '@gravity-ui/uikit';

import type { WidgetType } from './widget-types';

type Metric = {
  label: string;
  value: string;
  delta: string;
  progress: number;
};

type TableRow = {
  name: string;
  owner: string;
  status: string;
  progress: number;
};

type WidgetData = {
  metric?: Metric;
  table?: TableRow[];
};

const metrics: Record<string, Metric> = {
  users: { label: 'Active users', value: '4 286', delta: '+12.4%', progress: 78 },
  revenue: { label: 'Revenue', value: '$86 300', delta: '+5.1%', progress: 64 },
};

const rows: TableRow[] = [
  { name: 'Checkout migration', owner: 'Design', status: 'In review', progress: 72 },
  { name: 'Mobile onboarding', owner: 'Mobile', status: 'Building', progress: 48 },
  { name: 'Analytics schema', owner: 'Data', status: 'Done', progress: 100 },
];

export function getWidgetData(type: WidgetType): WidgetData {
  if (type === 'usersMetric') {
    return { metric: metrics.users };
  }
  if (type === 'revenueMetric') {
    return { metric: metrics.revenue };
  }
  return { table: rows };
}

export function Widget({ type, data }: { type: WidgetType; data: WidgetData }) {
  if (type === 'usersMetric' || type === 'revenueMetric') {
    const metric = data.metric ?? metrics[type === 'usersMetric' ? 'users' : 'revenue'];

    return (
      <Flex direction="column" height="100%" gap={3} justifyContent="center">
        <GravityText color="secondary">{metric.label}</GravityText>
        <GravityText variant="header-1">{metric.value}</GravityText>
        <Flex gap={2}>
          <GravityText color="positive">{metric.delta}</GravityText>
          <GravityText color="secondary">vs last week</GravityText>
        </Flex>
        <Progress value={metric.progress} />
      </Flex>
    );
  }

  const tableRows = data.table ?? rows;

  return (
    <Flex direction="column" height="100%" gap={3}>
      <GravityText variant="subheader-1">Project status</GravityText>
      {tableRows.map((row) => (
        <Flex key={row.name} direction="column" gap={1}>
          <Flex justifyContent="space-between">
            <GravityText>{row.name}</GravityText>
            <GravityText color="secondary">{row.status}</GravityText>
          </Flex>
          <GravityText color="secondary">{row.owner}</GravityText>
          <Progress value={row.progress} />
        </Flex>
      ))}
    </Flex>
  );
}
