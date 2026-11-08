import { Card, Flex, Switch, Text } from '@gravity-ui/uikit';

import type { AppTheme } from '../useAppTheme';

interface Props {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function SettingsPage({ theme, onThemeChange }: Props) {
  return (
    <div className="page">
      <Flex direction="column" gap={6}>
        <Text variant="header-1">Настройки</Text>

        <Card type="container" view="outlined" className="page__card">
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Внешний вид</Text>
            <Switch
              checked={theme === 'dark'}
              onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
              content="Тёмная тема"
            />
            <Text variant="body-1" color="secondary">
              Выбор сохраняется в браузере. Тему также можно переключить кнопкой в нижней части меню.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}
