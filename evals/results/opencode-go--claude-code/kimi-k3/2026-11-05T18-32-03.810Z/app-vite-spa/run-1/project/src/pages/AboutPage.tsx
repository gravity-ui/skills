import React from 'react';
import { Card, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Text variant="display-1">О проекте</Text>

      <Card view="filled" style={{ padding: 20 }}>
        <Text variant="subheader-2">Что это?</Text>
        <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 8 }}>
          Минимальный пример одностраничного приложения: клиентская маршрутизация на основе
          хэша (#/, #/about, #/settings), общий лэйаут с шапкой и переключение темы через
          ThemeProvider из Gravity UI.
        </Text>
      </Card>

      <Card view="filled" style={{ padding: 20 }}>
        <Text variant="subheader-2">Как устроена навигация?</Text>
        <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 8 }}>
          Приложение слушает событие hashchange и рендерит нужную страницу. Такой подход не
          требует отдельной библиотеки маршрутизации и работает даже при открытии файла
          по прямой ссылке с хэшем.
        </Text>
      </Card>

      <Card view="filled" style={{ padding: 20 }}>
        <Text variant="subheader-2">Как устроена тема?</Text>
        <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 8 }}>
          Выбранная тема сохраняется в localStorage, а при первом запуске берётся из
          системных предпочтений (prefers-color-scheme).
        </Text>
      </Card>
    </div>
  );
}
