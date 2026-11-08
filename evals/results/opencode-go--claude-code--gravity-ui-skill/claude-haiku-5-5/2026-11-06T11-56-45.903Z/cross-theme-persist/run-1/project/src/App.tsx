import { Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { useAppTheme } from './AppThemeProvider';
import { type AppTheme } from './theme-storage';

const THEME_OPTIONS: { value: AppTheme; content: string }[] = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
  { value: 'system', content: 'Системная' },
];

export function App() {
  const { theme, setTheme } = useAppTheme();

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="subheader-2">Тема оформления</Text>
      <SegmentedRadioGroup<AppTheme>
        aria-label="Тема оформления"
        value={theme}
        options={THEME_OPTIONS}
        onUpdate={setTheme}
      />
    </Flex>
  );
}
