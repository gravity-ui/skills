import { Link, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <section className="page">
      <Text variant="display-1" as="h1">
        О приложении
      </Text>
      <Text>
        Небольшое демо-приложение на React + Vite. Навигация реализована через
        hash-роутинг (<code>#/home</code>, <code>#/tasks</code>, <code>#/about</code>) без
        дополнительных зависимостей, поэтому ссылки на страницы можно копировать, а
        кнопки «назад/вперёд» работают как обычно.
      </Text>
      <Text>
        Тема переключается через <code>ThemeProvider</code> из Gravity UI. При первом
        запуске учитывается системная настройка, дальше выбор хранится в{' '}
        <code>localStorage</code>.
      </Text>
      <Text>
        Документация компонентов:{' '}
        <Link href="https://gravity-ui.com/components/uikit" target="_blank">
          gravity-ui.com
        </Link>
      </Text>
    </section>
  );
}
