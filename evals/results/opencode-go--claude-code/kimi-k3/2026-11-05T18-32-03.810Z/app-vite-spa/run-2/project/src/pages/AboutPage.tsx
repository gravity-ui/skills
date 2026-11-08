import { Card, Text } from '@gravity-ui/uikit';

const FEATURES = [
  {
    title: '🧭 Навигация',
    text: 'Три страницы (Главная, Задачи, О приложении) переключаются без перезагрузки — маршрутизация реализована на состоянии React.',
  },
  {
    title: '🌗 Темы',
    text: 'Светлая и тёмная темы через ThemeProvider из Gravity UI. Выбор сохраняется в localStorage, а при первом визите берётся из системных настроек (prefers-color-scheme).',
  },
  {
    title: '🎨 UI-кит',
    text: 'Интерфейс собран из компонентов @gravity-ui/uikit: кнопки, карточки, поля ввода, чекбоксы и иконки @gravity-ui/icons.',
  },
  {
    title: '⚙️ Стек',
    text: 'React 18 + TypeScript + Vite. Сборка — vite build, разработка — npm run dev.',
  },
];

export function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Text variant="header-1">О приложении</Text>
        <div style={{ marginTop: 8 }}>
          <Text variant="body-2" color="secondary">
            Небольшое демо, показывающее базовые приёмы построения SPA.
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FEATURES.map((f) => (
          <Card key={f.title} view="raised" style={{ padding: 20 }}>
            <Text variant="subheader-2">{f.title}</Text>
            <div style={{ marginTop: 8 }}>
              <Text color="secondary">{f.text}</Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
