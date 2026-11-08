import { Card, Flex, Label, Text } from '@gravity-ui/uikit';

const features = [
  { title: 'Навигация', description: 'Три страницы переключаются через вкладки.' },
  { title: 'Тема', description: 'Выбор сохраняется в локальном хранилище браузера.' },
  { title: 'Адаптивность', description: 'Карточки перестраиваются на узких экранах.' },
];

export function FeaturesPage() {
  return (
    <Flex direction="column" gap="4">
      <Text variant="header-1" as="h1">
        Возможности
      </Text>
      <Text variant="body-1" color="secondary">
        Короткий обзор ключевых частей интерфейса.
      </Text>
      <Flex gap="3" wrap>
        {features.map((feature) => (
          <Card
            key={feature.title}
            view="outlined"
            spacing={{ p: 4 }}
            style={{ minWidth: 240, flex: '1 1 240px' }}
          >
            <Flex direction="column" gap="2">
              <Label theme="info" size="s">
                {feature.title}
              </Label>
              <Text variant="body-2" color="secondary">
                {feature.description}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
