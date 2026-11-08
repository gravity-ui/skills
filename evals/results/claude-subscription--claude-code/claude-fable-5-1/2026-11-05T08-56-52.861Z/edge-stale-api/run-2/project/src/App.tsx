import { Button, Card, Flex, Label, Text, useThemeValue } from '@gravity-ui/uikit';

import { AppThemeProvider, ThemeSwitcher } from './theme';

function Page() {
  const themeValue = useThemeValue();

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, minHeight: '100vh' }}>
      <Flex as="header" alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="header-1">Gravity UI</Text>
        <ThemeSwitcher />
      </Flex>

      <Card view="outlined" type="container" style={{ padding: 16, maxWidth: 480 }}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">Текущая тема</Text>
          <Flex alignItems="center" gap={2}>
            <Text color="secondary">themeValue:</Text>
            <Label theme="info" size="s" qa="current-theme">
              {themeValue}
            </Label>
          </Flex>
          <Text color="secondary">
            Выбор сохраняется в localStorage и восстанавливается при перезагрузке. Если
            сохранённого значения нет, берётся системная тема.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action">Action</Button>
            <Button view="normal">Normal</Button>
            <Button view="outlined">Outlined</Button>
            <Button view="flat">Flat</Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <Page />
    </AppThemeProvider>
  );
}
