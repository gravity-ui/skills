import { Card, Flex, Switch, Text } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface SettingsPageProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  const isDark = theme === 'dark';

  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1" as="h1">
          Настройки
        </Text>
        <Text variant="body-2" color="secondary">
          Параметры оформления приложения. Выбор сохраняется в браузере.
        </Text>
      </Flex>

      <Card type="container" view="outlined" size="l" style={{ maxWidth: 560 }}>
        <Flex direction="column" gap={4}>
          <Text variant="subheader-3">Оформление</Text>

          <Flex alignItems="center" justifyContent="space-between" gap={3}>
            <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body-2">Тёмная тема</Text>
              <Text variant="body-1" color="secondary">
                Сейчас используется {isDark ? 'тёмная' : 'светлая'} тема.
              </Text>
            </Flex>
            <Switch
              size="l"
              checked={isDark}
              onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
              title="Переключить тему"
              style={{ flexShrink: 0 }}
            />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
