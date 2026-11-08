import {Button, Card, Flex, Text} from '@gravity-ui/uikit';
import {useNavigate} from 'react-router-dom';

import {useAppTheme} from '../theme';

export function HomePage() {
  const navigate = useNavigate();
  const {theme} = useAppTheme();

  return (
    <Flex direction="column" gap={5}>
      <Text variant="header-1">Добро пожаловать</Text>
      <Text variant="body-2" color="secondary">
        Небольшое приложение на Gravity UI: три страницы, боковая навигация и переключатель
        светлой/тёмной темы.
      </Text>
      <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-4)'}}>
        <Flex direction="column" gap={3} alignItems="flex-start">
          <Text variant="subheader-2">Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}</Text>
          <Text variant="body-1">
            Переключить тему можно кнопкой внизу боковой панели или на странице настроек. Выбор
            сохраняется в браузере.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action" onClick={() => navigate('/features')}>
              Смотреть возможности
            </Button>
            <Button view="outlined" onClick={() => navigate('/settings')}>
              Открыть настройки
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
