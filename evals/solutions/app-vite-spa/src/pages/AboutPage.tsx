import { Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <>
      <Text variant="display-1" as="h1">
        О приложении
      </Text>
      <Text variant="body-1" as="p">
        Приложение собрано на Vite и React, интерфейс — на компонентах @gravity-ui/uikit, маршруты —
        на react-router. Тема (светлая или тёмная) хранится в состоянии и применяется через
        ThemeProvider.
      </Text>
    </>
  );
}
