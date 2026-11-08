import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { THEME_MODES, ThemeMode, useThemeMode } from './theme';

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function App() {
  const { mode, setMode } = useThemeMode();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SegmentedRadioGroup
        aria-label="Theme"
        value={mode}
        onUpdate={(value) => setMode(value as ThemeMode)}
      >
        {THEME_MODES.map((themeMode) => (
          <SegmentedRadioGroup.Option key={themeMode} value={themeMode}>
            {THEME_LABELS[themeMode]}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>
    </div>
  );
}
