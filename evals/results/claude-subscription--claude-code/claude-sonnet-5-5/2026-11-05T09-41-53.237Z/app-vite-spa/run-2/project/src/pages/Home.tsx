import { Button, Card, Text } from '@gravity-ui/uikit';
import { hrefTo } from '../router';
import { useAppTheme } from '../theme';

export function Home() {
  const { theme } = useAppTheme();
  return (
    <div className="stack">
      <Text variant="display-1" as="h1">
        Добро пожаловать
      </Text>
      <Text variant="body-2" color="secondary">
        Небольшое приложение на React и Gravity UI: три страницы, навигация и переключатель темы.
      </Text>
      <Card type="container" view="outlined" className="card">
        <Text variant="subheader-2">Текущая тема</Text>
        <Text as="p">
          Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема. Переключатель находится в
          шапке — выбор сохраняется между визитами.
        </Text>
        <div>
          <Button view="action" size="l" href={hrefTo('/features')}>
            Смотреть возможности
          </Button>
        </div>
      </Card>
    </div>
  );
}
