import { Card, Flex, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';

import { Page } from './Page';
import { useAppTheme } from '../theme/AppThemeContext';
import type { AppTheme } from '../theme/AppThemeContext';

export function SettingsPage() {
  const { theme, setTheme } = useAppTheme();

  return (
    <Page title="Настройки" description="Внешний вид приложения.">
      <Card type="container" view="outlined">
        <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-4)' }}>
          <Text variant="subheader-2">Тема оформления</Text>

          <Flex alignItems="center" justifyContent="space-between" gap={4}>
            <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body-2">Тёмная тема</Text>
              <Text variant="body-1" color="secondary">
                Переключает всё приложение между светлой и тёмной темой.
              </Text>
            </Flex>
            <Switch
              size="l"
              checked={theme === 'dark'}
              onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
              style={{ flexShrink: 0 }}
            />
          </Flex>

          <Flex direction="column" gap={2}>
            <Text variant="body-1" color="secondary">
              Или выберите явно:
            </Text>
            <SegmentedRadioGroup<AppTheme>
              value={theme}
              onUpdate={setTheme}
              options={[
                { value: 'light', content: 'Светлая' },
                { value: 'dark', content: 'Тёмная' },
              ]}
            />
          </Flex>
        </Flex>
      </Card>
    </Page>
  );
}
