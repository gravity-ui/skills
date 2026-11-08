import { Card, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <section className="page">
      <Text variant="display-1" as="h1">Добро пожаловать</Text>
      <Text variant="body-2" color="secondary">
        Небольшое приложение из трёх страниц: переключайтесь между ними в шапке и меняйте тему
        переключателем справа. Выбор темы запоминается.
      </Text>
      <Card view="outlined" type="container" style={{ padding: 16 }}>
        <Text variant="subheader-2">Что внутри</Text>
        <Text as="p" variant="body-1">
          Страница «Задачи» — простой список дел, «О приложении» — описание стека.
        </Text>
      </Card>
    </section>
  );
}
