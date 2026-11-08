import { Card, Flex, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';

import { type AppTheme, useAppTheme } from '../theme';

export function SettingsPage() {
  const { theme, setTheme } = useAppTheme();

  return (
    <Flex direction="column" gap={6}>
      <div>
        <Text variant="display-1" as="h1" style={{ margin: 0 }}>
          Настройки
        </Text>
        <Text variant="body-2" color="secondary" as="p">
          Оформление приложения.
        </Text>
      </div>

      <Card view="outlined" style={{ padding: 20 }}>
        <Flex direction="column" gap={5}>
          <Flex alignItems="center" justifyContent="space-between" gap={4}>
            <div>
              <Text variant="subheader-2" as="div">
                Тёмная тема
              </Text>
              <Text variant="body-1" color="secondary" as="div">
                То же самое, что кнопка в шапке.
              </Text>
            </div>
            <Switch
              size="l"
              checked={theme === 'dark'}
              onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
              controlProps={{ 'aria-label': 'Тёмная тема' }}
            />
          </Flex>

          <Flex alignItems="center" justifyContent="space-between" gap={4}>
            <Text variant="subheader-2" as="div">
              Выбор темы
            </Text>
            <SegmentedRadioGroup<AppTheme> value={theme} onUpdate={setTheme} size="m">
              <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            </SegmentedRadioGroup>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
