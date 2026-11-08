import { Button, Card, Text } from '@gravity-ui/uikit';
import { hrefFor, routes } from '../router';

export function HomePage() {
  return (
    <div className="page">
      <Text variant="display-2" as="h1">
        Главная
      </Text>
      <Text variant="body-2" color="secondary" as="p">
        Небольшое демо-приложение: три страницы, навигация между ними и переключатель
        светлой/тёмной темы. Тема запоминается между перезагрузками.
      </Text>

      <div className="page__grid">
        <Card type="container" view="filled" className="page__card">
          <Text variant="subheader-2" as="h2">
            Навигация
          </Text>
          <Text variant="body-1" as="p">
            Переходы работают через адресную строку, поэтому кнопки «назад» и «вперёд»
            в браузере тоже работают.
          </Text>
          <Button view="outlined" href={hrefFor(routes.about)}>
            О приложении
          </Button>
        </Card>

        <Card type="container" view="filled" className="page__card">
          <Text variant="subheader-2" as="h2">
            Тема
          </Text>
          <Text variant="body-1" as="p">
            Кнопка в шапке переключает тему мгновенно. Более подробные настройки — на
            отдельной странице.
          </Text>
          <Button view="outlined" href={hrefFor(routes.settings)}>
            Настройки
          </Button>
        </Card>
      </div>
    </div>
  );
}
