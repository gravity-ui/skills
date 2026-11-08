import React from 'react';
import { Card, Text, Button } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Text variant="display-1">Добро пожаловать 👋</Text>
      <Text variant="body-2" color="secondary">
        Это небольшое демонстрационное приложение на React и Gravity UI с навигацией между
        страницами и переключателем светлой/тёмной темы.
      </Text>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card view="raised" style={{ padding: 20 }}>
          <Text variant="subheader-2">🧭 Навигация</Text>
          <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 8 }}>
            Переключайтесь между тремя страницами через меню в шапке — адрес отражается в хэше URL.
          </Text>
        </Card>
        <Card view="raised" style={{ padding: 20 }}>
          <Text variant="subheader-2">🌗 Темы</Text>
          <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 8 }}>
            Светлая и тёмная тема переключаются кнопкой в шапке и запоминаются между визитами.
          </Text>
        </Card>
        <Card view="raised" style={{ padding: 20 }}>
          <Text variant="subheader-2">⚡ Технологии</Text>
          <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 8 }}>
            Vite, React 18, TypeScript и компоненты Gravity UI.
          </Text>
        </Card>
      </div>

      <div>
        <Button view="action" size="l" href="#/about">
          Узнать больше
        </Button>
      </div>
    </div>
  );
}
