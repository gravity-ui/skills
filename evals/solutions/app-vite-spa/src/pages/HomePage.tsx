import { Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <>
      <Text variant="display-1" as="h1">
        Главная
      </Text>
      <Text variant="body-1" as="p">
        Добро пожаловать! Это небольшое приложение на Gravity UI: переключайтесь между страницами
        через навигацию сверху и меняйте тему переключателем.
      </Text>
    </>
  );
}
