import { Button, Card, Text } from '@gravity-ui/uikit';

export function Home() {
  return (
    <div className="page">
      <Text variant="display-2" as="h1">
        Добро пожаловать
      </Text>
      <Text variant="body-2" color="secondary" as="p">
        Небольшое приложение из трёх страниц: навигация в шапке и переключатель светлой и тёмной
        темы. Выбор темы сохраняется между визитами.
      </Text>
      <div className="row">
        <Button view="action" size="l" href="#/features">
          Смотреть возможности
        </Button>
        <Button view="outlined" size="l" href="#/about">
          О проекте
        </Button>
      </div>
      <Card type="container" view="outlined" className="card">
        <Text variant="subheader-2" as="h2">
          Совет
        </Text>
        <Text as="p">
          Если тема ещё не выбрана, используется системная настройка (prefers-color-scheme).
        </Text>
      </Card>
    </div>
  );
}
