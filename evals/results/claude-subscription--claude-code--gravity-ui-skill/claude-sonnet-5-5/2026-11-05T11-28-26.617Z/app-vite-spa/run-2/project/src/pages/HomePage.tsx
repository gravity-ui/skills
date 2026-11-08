import {Button, Card, Flex, Text} from '@gravity-ui/uikit';
import {useNavigate} from 'react-router-dom';

import {useAppTheme} from '../theme';
import {Page} from './Page';

export function HomePage() {
  const navigate = useNavigate();
  const {theme, toggleTheme} = useAppTheme();

  return (
    <Page title="Добро пожаловать" description="Небольшое приложение на Gravity UI из трёх страниц.">
      <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-5)'}}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">Что внутри</Text>
          <Text variant="body-2">
            Боковая навигация (AsideHeader), маршрутизация между страницами и переключатель
            светлой и тёмной темы. Выбранная тема сохраняется в браузере.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action" size="l" onClick={() => navigate('/features')}>
              Посмотреть возможности
            </Button>
            <Button view="outlined" size="l" onClick={toggleTheme}>
              {theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Page>
  );
}
