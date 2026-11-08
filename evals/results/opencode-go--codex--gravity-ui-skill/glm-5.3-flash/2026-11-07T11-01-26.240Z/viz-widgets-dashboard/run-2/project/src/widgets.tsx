import { Card, Flex, Text } from '@gravity-ui/uikit';

type Metric = {
  label: string;
  value: string;
  delta: string;
};

type TableRow = {
  name: string;
  owner: string;
  progress: string;
};

const metrics: Metric[] = [
  { label: 'Active users', value: '24,803', delta: '+8.2%' },
  { label: 'Conversion', value: '5.6%', delta: '+0.4 pp' },
  { label: 'Avg. session', value: '4m 12s', delta: '+11s' },
  { label: 'Error rate', value: '0.24%', delta: '-0.05 pp' },
];

const tableRows: TableRow[] = [
  { name: 'Onboarding', owner: 'Anna', progress: '92%' },
  { name: 'Checkout', owner: 'Ivan', progress: '78%' },
  { name: 'Notifications', owner: 'Maria', progress: '64%' },
  { name: 'Reports', owner: 'Peter', progress: '51%' },
];

function WidgetFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="widget-shell" type="container" view="raised">
      <Flex direction="column" gap="3" height="100%">
        <Text variant="subheader-2">{title}</Text>
        <Flex className="widget-body" direction="column" grow>
          {children}
        </Flex>
      </Flex>
    </Card>
  );
}

function MetricsWidget() {
  return (
    <ul className="metric-list">
      {metrics.map((metric) => (
        <li className="metric-item" key={metric.label}>
          <Text color="secondary">{metric.label}</Text>
          <Flex direction="column" alignItems="flex-end">
            <Text variant="subheader-1">{metric.value}</Text>
            <Text variant="caption-1" color="secondary">
              {metric.delta}
            </Text>
          </Flex>
        </li>
      ))}
    </ul>
  );
}

function PerformanceWidget() {
  return (
    <Flex direction="column" gap="3" justifyContent="center" height="100%">
      <Text variant="display-2">96.4%</Text>
      <Text color="secondary">Availability in the last 30 days</Text>
      <Text variant="body-2">Response time — 184 ms</Text>
      <Text variant="body-2">Successful requests — 1.2M</Text>
    </Flex>
  );
}

function TableWidget() {
  return (
    <Flex direction="column" gap="2">
      {tableRows.map((row) => (
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap="2"
          key={row.name}
        >
          <Text className="table-cell-main">{row.name}</Text>
          <Text color="secondary" className="table-cell-main">
            {row.owner}
          </Text>
          <Text className="table-cell-progress">{row.progress}</Text>
        </Flex>
      ))}
    </Flex>
  );
}

function NotesWidget() {
  return (
    <Flex direction="column" gap="2">
      <Text variant="body-2">
        Drag the widget header to arrange the grid. Resize from the lower-right
        corner, or remove a widget in edit mode.
      </Text>
      <Text color="secondary">New widgets appear from the left palette.</Text>
    </Flex>
  );
}

export { MetricsWidget, NotesWidget, PerformanceWidget, TableWidget, WidgetFrame };
