import {Card, Text} from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <div className="page">
      <Text variant="header-1">О проекте</Text>
      <Text variant="body-2" color="secondary">
        Небольшое одностраничное приложение для демонстрации базовых возможностей.
      </Text>

      <Card view="raised" className="page__card">
        <Text variant="subheader-2">Что внутри</Text>
        <ul className="about__list">
          <li>
            <Text variant="body-2">⚛️ React 18 + TypeScript</Text>
          </li>
          <li>
            <Text variant="body-2">🎨 Gravity UI — компоненты и темизация</Text>
          </li>
          <li>
            <Text variant="body-2">🧭 Навигация между страницами через hash-роутинг</Text>
          </li>
          <li>
            <Text variant="body-2">🌗 Светлая и тёмная темы с сохранением выбора</Text>
          </li>
        </ul>
      </Card>

      <Card view="raised" className="page__card">
        <Text variant="subheader-2">Навигация</Text>
        <Text variant="body-2" color="secondary">
          Адрес текущей страницы отражается в URL после символа #, поэтому кнопки
          «назад» и «вперёд» в браузере работают как ожидается.
        </Text>
      </Card>
    </div>
  );
}
