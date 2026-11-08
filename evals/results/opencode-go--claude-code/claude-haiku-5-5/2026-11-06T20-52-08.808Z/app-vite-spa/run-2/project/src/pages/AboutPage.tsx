import { Text } from '@gravity-ui/uikit';

const FEATURES = [
  'Навигация между страницами по хешу адреса (#/tasks, #/about), работает с кнопкой «Назад».',
  'Светлая и тёмная тема. По умолчанию выбирается тема системы, ваш выбор сохраняется.',
  'Список задач с сохранением в localStorage: данные остаются после перезагрузки.',
];

export function AboutPage() {
  return (
    <section className="page">
      <Text as="h1" variant="header-1">
        О приложении
      </Text>
      <Text as="p" variant="body-2" color="secondary">
        Стек: React, TypeScript, Vite и компоненты Gravity UI. Внутренней библиотеки маршрутизации нет:
        страницы переключаются по адресу в URL.
      </Text>
      <ul>
        {FEATURES.map((feature) => (
          <li key={feature}>
            <Text variant="body-2">{feature}</Text>
          </li>
        ))}
      </ul>
    </section>
  );
}
