import {Moon, Sun} from '@gravity-ui/icons';
import {Button, Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {useNavigate} from 'react-router-dom';

import {useThemeMode} from '../theme';
import {Page} from './Page';

export function HomePage() {
  const navigate = useNavigate();
  const {mode, toggle} = useThemeMode();

  return (
    <Page title="Добро пожаловать" description="Небольшое приложение на Gravity UI с тремя страницами.">
      <Card type="container" view="outlined" size="l">
        <Flex direction="column" gap={3} style={{padding: 'var(--g-spacing-4)'}}>
          <Text variant="subheader-2">Текущая тема: {mode === 'dark' ? 'тёмная' : 'светлая'}</Text>
          <Text variant="body-1" color="secondary">
            Тему можно переключить здесь или кнопкой внизу боковой панели. Выбор сохраняется между
            визитами.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action" size="l" onClick={toggle}>
              <Icon data={mode === 'dark' ? Sun : Moon} size={16} />
              Переключить тему
            </Button>
            <Button view="outlined" size="l" onClick={() => navigate('/features')}>
              Смотреть возможности
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Page>
  );
}
