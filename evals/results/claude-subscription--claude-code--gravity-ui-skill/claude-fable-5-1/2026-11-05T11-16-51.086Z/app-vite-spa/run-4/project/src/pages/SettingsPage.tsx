import { Card, Flex, Switch, Text } from '@gravity-ui/uikit';

import type { AppTheme } from '../theme';

type Props = {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
};

export function SettingsPage({ theme, onThemeChange }: Props) {
  const isDark = theme === 'dark';

  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1">Настройки</Text>
        <Text variant="body-2" color="secondary">
          Выбор темы сохраняется в браузере и применяется ко всему приложению.
        </Text>
      </Flex>

      <Card type="container" view="outlined" spacing={{ p: 5 }}>
        <Flex alignItems="center" gap={4}>
          <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Text variant="subheader-2">Тёмная тема</Text>
            <Text variant="body-1" color="secondary">
              Сейчас включена {isDark ? 'тёмная' : 'светлая'} тема.
            </Text>
          </Flex>
          <Switch
            size="l"
            checked={isDark}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
            style={{ flexShrink: 0 }}
          />
        </Flex>
      </Card>
    </Flex>
  );
}
