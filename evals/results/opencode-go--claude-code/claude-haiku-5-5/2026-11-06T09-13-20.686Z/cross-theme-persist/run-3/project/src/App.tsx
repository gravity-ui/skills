import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import type { AppTheme } from './theme';

interface AppProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="subheader-2">Тема оформления</Text>
      <SegmentedRadioGroup
        name="theme"
        value={theme}
        onUpdate={onThemeChange}
      >
        <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
    </div>
  );
}
