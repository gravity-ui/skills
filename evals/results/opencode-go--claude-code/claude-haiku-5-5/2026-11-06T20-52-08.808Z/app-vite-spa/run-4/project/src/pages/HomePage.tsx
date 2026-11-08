import { Button, Card, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Card view="outlined" size="l" className="page-card">
      <Text variant="display-1" as="h1">
        Добро пожаловать
      </Text>
      <Text variant="body-2" as="p" color="secondary">
        Небольшое приложение с навигацией между страницами и переключателем светлой и тёмной темы.
        Тема сохраняется в браузере и применяется при следующем открытии.
      </Text>
      <div className="page-actions">
        <Button view="action" size="l" href="#/tasks">
          Открыть список задач
        </Button>
      </div>
    </Card>
  );
}
