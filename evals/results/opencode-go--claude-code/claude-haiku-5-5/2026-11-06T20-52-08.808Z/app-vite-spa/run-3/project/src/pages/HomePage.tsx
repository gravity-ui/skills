import { Card, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <section>
      <Text as="h1" variant="display-2">
        Добро пожаловать
      </Text>
      <Text as="p" variant="body-2" className="page__lead">
        Небольшое приложение: три страницы, навигация по ссылкам и переключение светлой и тёмной темы.
      </Text>

      <div className="cards">
        <Card view="outlined" className="card">
          <Text variant="subheader-2">Задачи</Text>
          <Text as="p" variant="body-1" className="card__text">
            Простой список дел: добавляйте, отмечайте и удаляйте задачи.
          </Text>
        </Card>
        <Card view="outlined" className="card">
          <Text variant="subheader-2">Тема</Text>
          <Text as="p" variant="body-1" className="card__text">
            Переключатель в шапке меняет тему. Выбор сохраняется в браузере.
          </Text>
        </Card>
      </div>
    </section>
  );
}
