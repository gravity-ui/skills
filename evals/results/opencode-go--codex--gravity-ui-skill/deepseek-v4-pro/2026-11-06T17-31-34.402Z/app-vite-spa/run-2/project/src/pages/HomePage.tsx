import {Card, Flex, Text} from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="subheader-1">Welcome</Text>
      <Text variant="body-1" color="secondary">
        This is a small demo app built with Gravity UI. It has three pages,
        tab-based navigation, and a light / dark theme switch in the header.
      </Text>
      <Flex gap={4}>
        <Card type="container" view="raised" size="l" style={{flex: 1}}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Pages</Text>
            <Text variant="body-1">
              Home, About, and Settings — switch between them using the tabs above.
            </Text>
          </Flex>
        </Card>
        <Card type="container" view="raised" size="l" style={{flex: 1}}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Theming</Text>
            <Text variant="body-1">
              Toggle between light and dark mode using the Sun/Moon switch in the header.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}
