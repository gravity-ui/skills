import React from 'react';
import { Card, Text, Switch } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';

interface SettingsPageProps {
  theme: RealTheme;
  onToggleTheme: () => void;
}

export function SettingsPage({ theme, onToggleTheme }: SettingsPageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Text variant="display-1">Настройки</Text>

      <Card view="filled" style={{ padding: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <Text variant="subheader-2">Тёмная тема</Text>
            <Text variant="body-2" color="secondary" style={{ display: 'block', marginTop: 4 }}>
              Сейчас активна: {theme === 'dark' ? 'тёмная 🌙' : 'светлая ☀️'}
            </Text>
          </div>
          <Switch
            size="l"
            checked={theme === 'dark'}
            onUpdate={onToggleTheme}
            aria-label="Переключить тёмную тему"
          />
        </div>
      </Card>

      <Text variant="body-1" color="secondary">
        Настройка темы также доступна кнопкой в шапке на любой странице — выбор сохраняется
        автоматически.
      </Text>
    </div>
  );
}
