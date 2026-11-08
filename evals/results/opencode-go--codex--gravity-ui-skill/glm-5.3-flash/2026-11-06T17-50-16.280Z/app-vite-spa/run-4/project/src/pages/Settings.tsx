import { Card, Flex, Switch, Text } from '@gravity-ui/uikit';

import type { ThemeMode } from '../types';

interface SettingsProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function Settings({ theme, onThemeChange }: SettingsProps) {
  return (
    <section className="page" aria-labelledby="settings-title">
      <Text variant="header-1" as="h1" id="settings-title">
        Настройки
      </Text>
      <Text color="secondary">Оформление и базовые параметры приложения.</Text>

      <Card type="container" view="filled" spacing={{ p: 6 }}>
        <Flex direction="column" gap="6">
          <Flex direction="column" gap="3">
            <Text variant="header-2" as="h2">
              Тема
            </Text>
            <Flex alignItems="center" justifyContent="space-between">
              <Flex direction="column">
                <Text>Тёмная тема</Text>
                <Text color="secondary">Использовать тёмное оформление.</Text>
              </Flex>
              <Switch
                checked={theme === 'dark'}
                onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
              />
            </Flex>
          </Flex>

          <Flex direction="column" gap="3">
            <Text variant="header-2" as="h2">
              Уведомления
            </Text>
            <Flex alignItems="center" justifyContent="space-between">
              <Text>Напоминания о дедлайнах</Text>
              <Switch defaultChecked />
            </Flex>
            <Flex alignItems="center" justifyContent="space-between">
              <Text>Еженедельная сводка</Text>
              <Switch defaultChecked />
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </section>
  );
}
