import { Card, Text } from '@gravity-ui/uikit';

const FEATURES = [
  'Навигация между страницами по адресу с хешем (#/tasks, #/about) — работает кнопка «назад».',
  'Светлая и тёмная тема на компонентах Gravity UI, выбор сохраняется в localStorage.',
  'Список задач: добавление, отметка выполнения и удаление. Данные сохраняются в браузере.',
];

export function AboutPage() {
  return (
    <Card view="outlined" size="l" className="page-card">
      <Text variant="header-2" as="h1">
        О приложении
      </Text>
      <Text variant="body-2" as="p" color="secondary">
        Стек: React, TypeScript, Vite и UI-кит Gravity UI.
      </Text>
      <ul className="feature-list">
        {FEATURES.map((feature) => (
          <li key={feature}>
            <Text variant="body-2">{feature}</Text>
          </li>
        ))}
      </ul>
    </Card>
  );
}
