import { Button, Card, Flex, Label, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router-dom';

import { Page } from './Page';
import { useAppTheme } from '../theme/AppThemeContext';

const FEATURES = [
  {
    title: 'Навигация',
    text: 'Боковое меню на AsideHeader из @gravity-ui/navigation, маршруты — react-router.',
  },
  {
    title: 'Темы',
    text: 'Светлая и тёмная темы через ThemeProvider; выбор сохраняется в localStorage.',
  },
  {
    title: 'Компоненты',
    text: 'Карточки, таблица, переключатели и типографика — из @gravity-ui/uikit.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppTheme();

  return (
    <Page
      title="Главная"
      description="Небольшое демо-приложение на Gravity UI: три страницы, боковая навигация и переключатель темы."
    >
      <Flex gap={3} alignItems="center" wrap>
        <Text variant="body-1" color="secondary">
          Текущая тема:
        </Text>
        <Label theme="info" size="s">
          {theme === 'dark' ? 'тёмная' : 'светлая'}
        </Label>
        <Button view="action" onClick={toggleTheme}>
          Переключить тему
        </Button>
        <Button view="outlined" onClick={() => navigate('/team')}>
          Открыть команду
        </Button>
      </Flex>

      <Flex gap={4} wrap>
        {FEATURES.map((feature) => (
          <Card
            key={feature.title}
            type="container"
            view="outlined"
            style={{ flex: '1 1 240px', minWidth: 0 }}
          >
            <Flex direction="column" gap={2} style={{ padding: 'var(--g-spacing-4)' }}>
              <Text variant="subheader-2">{feature.title}</Text>
              <Text variant="body-1" color="secondary">
                {feature.text}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Page>
  );
}
