import { Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <section>
      <Text as="h1" variant="display-2">
        О проекте
      </Text>
      <Text as="p" variant="body-2" className="page__lead">
        Демонстрация на React и Gravity UI: несколько страниц и переключение темы без внешнего роутера.
      </Text>

      <Text as="h2" variant="subheader-2" style={{ marginTop: 24 }}>
        Что внутри
      </Text>
      <ul className="about-list">
        <li>Навигация по хэшу URL (#/, #/tasks, #/about): работают кнопки «назад» и «вперёд».</li>
        <li>Тема хранится в localStorage; по умолчанию используется тема системы.</li>
        <li>Компоненты и тема — из @gravity-ui/uikit.</li>
      </ul>
    </section>
  );
}
