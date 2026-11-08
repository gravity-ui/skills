import { Flex, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Flex direction="column" gap="4">
      <Text variant="header-1" as="h2">О проекте</Text>
      <Text variant="body-1">Учебное мини-приложение на React и Gravity UI.</Text>
    </Flex>
  );
}
