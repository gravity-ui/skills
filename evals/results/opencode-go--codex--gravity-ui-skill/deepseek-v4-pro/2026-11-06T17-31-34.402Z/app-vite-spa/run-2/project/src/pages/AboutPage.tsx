import {Card, Flex, Text} from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="subheader-1">About</Text>
      <Card type="container" view="raised" size="l">
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">Gravity UI</Text>
          <Text variant="body-1" color="secondary">
            Gravity UI is an open-source design system and ecosystem of React libraries
            for building web applications. It provides a rich set of components,
            design tokens, and theming capabilities.
          </Text>
        </Flex>
      </Card>
      <Flex gap={4}>
        <Card type="container" view="raised" size="l" style={{flex: 1}}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Components</Text>
            <Text variant="body-1">
              UIKit ships buttons, forms, dialogs, menus, tabs, cards, and
              dozens more — all themeable via <code>--g-color-*</code> CSS variables.
            </Text>
          </Flex>
        </Card>
        <Card type="container" view="raised" size="l" style={{flex: 1}}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Ecosystem</Text>
            <Text variant="body-1">
              Beyond uikit: charts, data tables, navigation shells, date pickers,
              Markdown editors, and more — each in its own @gravity-ui/* package.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}
