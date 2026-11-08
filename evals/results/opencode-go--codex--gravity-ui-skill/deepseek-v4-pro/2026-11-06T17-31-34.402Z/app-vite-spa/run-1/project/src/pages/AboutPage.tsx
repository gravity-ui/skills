import { Card, Flex, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="header-1">About</Text>
      <Card type="container" view="outlined" size="l">
        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Gravity UI Demo</Text>
          <Text color="secondary">
            This is a small demo application built with Gravity UI — an open-source design system
            and React component library. It showcases theme switching, tab-based navigation, and
            responsive card layouts.
          </Text>
        </Flex>
      </Card>
      <Card type="container" view="outlined" size="l">
        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Features</Text>
          <Flex direction="column" gap={1}>
            <Text>• Multi-page navigation with tabs</Text>
            <Text>• Light / Dark theme switcher</Text>
            <Text>• Dashboard-style card layout</Text>
            <Text>• Built entirely with @gravity-ui/uikit</Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
