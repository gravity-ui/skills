import {Card, Flex, Label, Text} from '@gravity-ui/uikit';

import {Page} from './Page';

const FEATURES = [
  {
    id: 'navigation',
    title: 'Навигация',
    text: 'Сворачиваемая боковая панель с подсветкой текущей страницы.',
    label: 'AsideHeader',
  },
  {
    id: 'routing',
    title: 'Маршрутизация',
    text: 'Переходы между страницами без перезагрузки, работают кнопки браузера «назад» и «вперёд».',
    label: 'react-router',
  },
  {
    id: 'theme',
    title: 'Темы',
    text: 'Светлая и тёмная темы на семантических токенах --g-*, выбор запоминается.',
    label: 'ThemeProvider',
  },
] as const;

export function FeaturesPage() {
  return (
    <Page title="Возможности" description="Из чего собрано приложение.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--g-spacing-4)',
        }}
      >
        {FEATURES.map((feature) => (
          <Card
            key={feature.id}
            view="outlined"
            type="container"
            style={{padding: 'var(--g-spacing-4)'}}
          >
            <Flex direction="column" gap={2}>
              <Text variant="subheader-2">{feature.title}</Text>
              <Text variant="body-2" color="secondary">
                {feature.text}
              </Text>
              <div>
                <Label theme="info">{feature.label}</Label>
              </div>
            </Flex>
          </Card>
        ))}
      </div>
    </Page>
  );
}
