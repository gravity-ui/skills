import React from 'react';
import { Card, Flex, Text } from '@gravity-ui/uikit';
import type { AppTheme } from '../theme';

export function SettingsPage({ theme }: { theme: AppTheme }) {
  return (
    <Card type="container" view="outlined" size="l" spacing={{ p: 5 }}>
      <Flex direction="column" gap={3}>
        <Text variant="subheader-2">Тема оформления</Text>
        <Text variant="body-1">Сейчас выбрана: {theme === 'dark' ? 'тёмная' : 'светлая'}.</Text>
        <Text variant="body-2">
          Переключить тему можно в шапке любой страницы. Выбор сохраняется в браузере и применяется при следующем
          открытии приложения.
        </Text>
      </Flex>
    </Card>
  );
}
