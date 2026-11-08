import { Flex, Text } from '@gravity-ui/uikit';

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Flex direction="column" gap={1}>
      <Text variant="header-1" as="h1" className="app-heading">
        {title}
      </Text>
      <Text variant="body-2" color="secondary">
        {description}
      </Text>
    </Flex>
  );
}
