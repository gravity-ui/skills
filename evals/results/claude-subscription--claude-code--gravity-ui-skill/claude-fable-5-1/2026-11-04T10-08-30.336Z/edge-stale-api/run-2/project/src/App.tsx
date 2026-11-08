import {Card, Flex, Text, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';
import {useAppTheme} from './useAppTheme';

function Content() {
  const resolvedTheme = useThemeValue();

  return (
    <Card view="filled" style={{padding: 'var(--g-spacing-4)'}}>
      <Text as="p" variant="body-2">
        Active theme: <Text variant="code-inline-2">{resolvedTheme}</Text>
      </Text>
    </Card>
  );
}

export function App() {
  const [theme, setTheme] = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
        <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
          <Text variant="header-1">Theme switcher</Text>
          <ThemeSwitcher onUpdate={setTheme} />
        </Flex>
        <Content />
      </Flex>
    </ThemeProvider>
  );
}
