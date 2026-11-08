import {Button, Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {Palette, Rocket, Sliders} from '@gravity-ui/icons';

import {Page} from '../components/Page';

const FEATURES = [
  {
    icon: Rocket,
    title: 'Быстрый старт',
    text: 'React, Vite и дизайн-система Gravity UI: каркас приложения собирается за минуты.',
  },
  {
    icon: Palette,
    title: 'Светлая и тёмная темы',
    text: 'Тема переключается через ThemeProvider, а все цвета берутся из семантических токенов --g-*.',
  },
  {
    icon: Sliders,
    title: 'Гибкие настройки',
    text: 'Режим оформления — светлый, тёмный или системный — выбирается на странице настроек.',
  },
];

export function HomePage({onOpenSettings}: {onOpenSettings: () => void}) {
  return (
    <Page title="Главная">
      <Text variant="body-1" color="secondary">
        Небольшое демо-приложение на Gravity UI: три страницы, боковая навигация AsideHeader и
        переключатель светлой/тёмной темы в нижней части меню.
      </Text>

      <Flex wrap="wrap" gap={4}>
        {FEATURES.map((feature) => (
          <Card
            key={feature.title}
            type="container"
            view="outlined"
            size="l"
            spacing={{p: 5}}
            style={{flex: '1 1 240px'}}
          >
            <Flex direction="column" gap={3}>
              <Icon data={feature.icon} size={24} />
              <Text variant="subheader-2">{feature.title}</Text>
              <Text variant="body-2" color="secondary">
                {feature.text}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Flex gap={3}>
        <Button view="action" size="l" onClick={onOpenSettings}>
          Открыть настройки
        </Button>
      </Flex>
    </Page>
  );
}
