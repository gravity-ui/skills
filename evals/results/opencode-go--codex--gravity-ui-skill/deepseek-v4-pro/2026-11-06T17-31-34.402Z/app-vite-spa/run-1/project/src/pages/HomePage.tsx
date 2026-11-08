import { Card, Flex, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="header-1">Dashboard</Text>
      <Flex gap={4} wrap>
        <Card type="container" view="filled" theme="info" size="l" style={{ flex: 1, minWidth: 200 }}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-1">Total Users</Text>
            <Text variant="display-1">1,234</Text>
            <Text color="secondary">+12% from last month</Text>
          </Flex>
        </Card>
        <Card type="container" view="filled" theme="success" size="l" style={{ flex: 1, minWidth: 200 }}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-1">Revenue</Text>
            <Text variant="display-1">$45.6k</Text>
            <Text color="secondary">+8% from last month</Text>
          </Flex>
        </Card>
        <Card type="container" view="filled" theme="warning" size="l" style={{ flex: 1, minWidth: 200 }}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-1">Active Projects</Text>
            <Text variant="display-1">42</Text>
            <Text color="secondary">3 new this week</Text>
          </Flex>
        </Card>
      </Flex>
      <Card type="container" view="outlined" size="l">
        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Recent Activity</Text>
          <Text color="secondary">User john.doe completed onboarding</Text>
          <Text color="secondary">Project "Atlas" reached milestone v2.0</Text>
          <Text color="secondary">New team member added to "Nebula"</Text>
          <Text color="secondary">Billing cycle processed for November</Text>
        </Flex>
      </Card>
    </Flex>
  );
}
