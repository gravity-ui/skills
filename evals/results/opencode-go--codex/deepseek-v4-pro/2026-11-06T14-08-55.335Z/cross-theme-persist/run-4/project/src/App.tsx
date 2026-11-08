import React from 'react';
import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { useThemeState } from './themeState';

const themeOptions: { value: Theme; content: string }[] = [
  { value: 'system', content: 'System' },
  { value: 'light', content: 'Light' },
  { value: 'dark', content: 'Dark' },
];

export function App() {
  const { theme, setTheme } = useThemeState();

  return (
    <div style={{ padding: 24 }}>
      <Text variant="header-1" style={{ marginBottom: 16 }}>
        Theme
      </Text>

      <SegmentedRadioGroup
        value={theme}
        onUpdate={(val) => setTheme(val as Theme)}
        options={themeOptions}
      />
    </div>
  );
}
