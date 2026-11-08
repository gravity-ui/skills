import React from 'react';
import {Card, Flex, Switch, Text} from '@gravity-ui/uikit';

import {PageShell} from './PageShell';
import type {AppTheme} from '../theme';

interface SettingsPageProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function SettingsPage({theme, onThemeChange}: SettingsPageProps) {
  const isDark = theme === 'dark';

  return (
    <PageShell title="Настройки" description="Параметры внешнего вида приложения.">
      <Card type="container" view="outlined" spacing={{p: 5}}>
        <Flex alignItems="center" gap={4}>
          <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
            <Text variant="subheader-1">Тёмная тема</Text>
            <Text variant="body-1" color="secondary">
              Сейчас включена {isDark ? 'тёмная' : 'светлая'} тема. Настройка сохраняется в
              браузере.
            </Text>
          </Flex>
          <Switch
            size="l"
            checked={isDark}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
            controlProps={{'aria-label': 'Тёмная тема'}}
            style={{flexShrink: 0}}
          />
        </Flex>
      </Card>
    </PageShell>
  );
}
