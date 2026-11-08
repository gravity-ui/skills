import { Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import type { ThemeName } from './theme';

interface AppProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

const THEME_OPTIONS: {value: ThemeName; content: string}[] = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
];

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <div style={{ padding: 24 }}>
      <Flex direction="column" gap={4}>
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
