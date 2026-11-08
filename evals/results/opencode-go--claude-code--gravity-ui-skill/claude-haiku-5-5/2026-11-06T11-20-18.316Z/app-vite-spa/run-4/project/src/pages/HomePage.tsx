import { Box, Card, Flex, Text, useThemeType } from '@gravity-ui/uikit';

const FEATURES = [
  {
    title: 'Навигация',
    text: 'Боковое меню на AsideHeader. Каждый пункт — обычная ссылка с хешем.',
  },
  {
    title: 'Тема',
    text: 'Переключатель в меню переключает светлую и тёмную тему через ThemeProvider.',
  },
  {
    title: 'Состояние',
    text: 'Тема сохраняется в localStorage, поэтому выбор переживает перезагрузку.',
  },
];

export function HomePage() {
  const themeType = useThemeType();

  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={6} style={{ maxWidth: 960 }}>
        <Flex direction="column" gap={2}>
          <Text variant="header-1">Добро пожаловать</Text>
          <Text variant="body-2" color="secondary">
            Небольшое демо на Gravity UI: три страницы, навигация между ними и переключатель темы.
          </Text>
          <Text variant="body-2" color="secondary">
            Текущая тема: {themeType === 'dark' ? 'тёмная' : 'светлая'}.
          </Text>
        </Flex>

        <Flex gap={4} wrap>
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              type="container"
              view="outlined"
              size="l"
              style={{ flex: '1 1 240px', minWidth: 0 }}
            >
              <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{feature.title}</Text>
                <Text variant="body-2" color="secondary">
                  {feature.text}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
