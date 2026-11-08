import { Text } from '@gravity-ui/uikit';

export function About() {
  return (
    <div className="stack">
      <Text variant="display-1" as="h1">
        О проекте
      </Text>
      <Text as="p" variant="body-2">
        Демонстрационное приложение: Vite, React 18, TypeScript и библиотека компонентов Gravity UI.
      </Text>
      <Text as="p" color="secondary">
        Страницы лежат в <code>src/pages</code>, роутер — в <code>src/router.ts</code>, управление темой —
        в <code>src/theme.tsx</code>.
      </Text>
    </div>
  );
}
