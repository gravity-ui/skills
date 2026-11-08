import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { navigate } from '../router';
import { useAppTheme } from '../theme';

export function HomePage() {
  const { theme } = useAppTheme();

  return (
    <Flex direction="column" gap={6}>
      <div>
        <Text variant="display-1" as="h1" style={{ margin: 0 }}>
          Главная
        </Text>
        <Text variant="body-2" color="secondary" as="p">
          Небольшое приложение на React и Gravity UI: три страницы, навигация по хешу и
          переключение светлой/тёмной темы.
        </Text>
      </div>

      <Flex gap={4} wrap>
        <Card view="filled" style={{ padding: 20, flex: '1 1 240px' }}>
          <Text variant="subheader-2" as="h3" style={{ margin: '0 0 8px' }}>
            Навигация
          </Text>
          <Text variant="body-1" as="p" style={{ margin: '0 0 12px' }}>
            Вкладки в шапке ведут на страницы. Адрес меняется, кнопки «назад/вперёд» в браузере
            работают.
          </Text>
          <Button view="action" onClick={() => navigate('about')}>
            Перейти к «О проекте»
          </Button>
        </Card>

        <Card view="filled" style={{ padding: 20, flex: '1 1 240px' }}>
          <Text variant="subheader-2" as="h3" style={{ margin: '0 0 8px' }}>
            Тема
          </Text>
          <Text variant="body-1" as="p" style={{ margin: '0 0 12px' }}>
            Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема. Выбор сохраняется в
            браузере и восстанавливается при следующем запуске.
          </Text>
          <Button view="normal" onClick={() => navigate('settings')}>
            Открыть настройки
          </Button>
        </Card>
      </Flex>
    </Flex>
  );
}
