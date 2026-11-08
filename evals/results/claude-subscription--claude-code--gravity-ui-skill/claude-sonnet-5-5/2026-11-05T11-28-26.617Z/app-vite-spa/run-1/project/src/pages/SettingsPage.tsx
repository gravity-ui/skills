import {Card, Flex, Switch, Text} from '@gravity-ui/uikit';

import {useAppTheme} from '../theme';

export function SettingsPage() {
  const {theme, setTheme} = useAppTheme();

  return (
    <Flex direction="column" gap={5}>
      <Text variant="header-1">Настройки</Text>
      <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-4)'}}>
        <Flex alignItems="center" justifyContent="space-between" gap={4}>
          <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
            <Text variant="subheader-2">Тёмная тема</Text>
            <Text variant="body-1" color="secondary">
              Переключает оформление всего приложения.
            </Text>
          </Flex>
          <Switch
            style={{flexShrink: 0}}
            size="l"
            checked={theme === 'dark'}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Тёмная тема"
          />
        </Flex>
      </Card>
    </Flex>
  );
}
