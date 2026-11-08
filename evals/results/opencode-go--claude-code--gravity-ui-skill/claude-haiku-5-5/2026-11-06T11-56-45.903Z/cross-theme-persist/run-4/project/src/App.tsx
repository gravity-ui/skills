import { Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import type { AppTheme } from './theme-storage';

interface AppProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const THEME_OPTIONS: {value: AppTheme; content: string}[] = [
  {value: 'light', content: 'Светлая'},
  {value: 'dark', content: 'Тёмная'},
  {value: 'system', content: 'Системная'},
];

export function App({theme, onThemeChange}: AppProps) {
  return (
    <div style={{ padding: 24 }}>
      <Flex direction="column" gap={3}>
        <Text variant="header-1">Тема оформления</Text>
        <SegmentedRadioGroup
          aria-label="Тема оформления"
          value={theme}
          onUpdate={onThemeChange}
          options={THEME_OPTIONS}
        />
      </Flex>
    </div>
  );
}
