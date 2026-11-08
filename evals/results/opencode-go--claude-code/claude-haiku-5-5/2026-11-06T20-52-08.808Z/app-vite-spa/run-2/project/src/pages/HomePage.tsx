import { Button, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <section className="page">
      <Text as="h1" variant="header-1">
        Добро пожаловать
      </Text>
      <Text as="p" variant="body-2" color="secondary">
        Небольшое приложение на React и Gravity UI. Переключайтесь между страницами в меню
        сверху и меняйте тему оформления переключателем справа.
      </Text>
      <div className="page__actions">
        <Button href="#/tasks" view="action" size="l">
          Открыть список задач
        </Button>
        <Button href="#/about" view="outlined" size="l">
          Подробнее о приложении
        </Button>
      </div>
    </section>
  );
}
