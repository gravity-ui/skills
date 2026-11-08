import { Flex, List, Text } from '@gravity-ui/uikit';

const features = [
  'Навигация между тремя страницами',
  'Светлая и тёмная темы',
  'Выбранная страница сохраняется в URL',
];

export function FeaturesPage() {
  return (
    <Flex direction="column" gap="4">
      <Text variant="header-1" as="h2">Возможности</Text>
      <List items={features} />
      <Text color="secondary">Выберите пункт меню в верхней части экрана.</Text>
    </Flex>
  );
}
