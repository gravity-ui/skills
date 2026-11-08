import {Card, Flex, Label, Text} from '@gravity-ui/uikit';

const FEATURES = [
  {title: 'Навигация', text: 'Сворачиваемая боковая панель AsideHeader и роутинг по страницам.', tag: 'navigation'},
  {title: 'Темы', text: 'Светлая и тёмная темы через ThemeProvider и семантические токены.', tag: 'uikit'},
  {title: 'Адаптивность', text: 'Карточки переносятся по строкам и не вызывают горизонтальный скролл.', tag: 'layout'},
  {title: 'Сохранение', text: 'Выбранная тема запоминается в localStorage.', tag: 'storage'},
];

export function FeaturesPage() {
  return (
    <Flex direction="column" gap={5}>
      <Text variant="header-1">Возможности</Text>
      <Flex gap={4} wrap>
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            view="outlined"
            type="container"
            style={{flex: '1 1 260px', minWidth: 0, padding: 'var(--g-spacing-4)'}}
          >
            <Flex direction="column" gap={2} alignItems="flex-start">
              <Text variant="subheader-2">{f.title}</Text>
              <Text variant="body-1" color="secondary">
                {f.text}
              </Text>
              <Label theme="info" size="s">
                {f.tag}
              </Label>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
