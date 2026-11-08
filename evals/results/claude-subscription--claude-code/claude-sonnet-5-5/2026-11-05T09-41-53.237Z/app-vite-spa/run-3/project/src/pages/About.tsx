import { Text } from '@gravity-ui/uikit';

export function About() {
  return (
    <>
      <Text variant="display-1">О приложении</Text>
      <Text variant="body-2">
        Демо на React, Vite и Gravity UI. Навигация построена на hash-адресах (
        <code>#/</code>, <code>#/tasks</code>, <code>#/about</code>), поэтому работает без сервера
        и без отдельной библиотеки роутинга.
      </Text>
      <Text variant="body-2">
        Тема по умолчанию берётся из настроек системы, а ручной выбор сохраняется в localStorage.
        Список задач тоже сохраняется между перезагрузками.
      </Text>
    </>
  );
}
