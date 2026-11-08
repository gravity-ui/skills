import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { useThemeChoice, type ThemeChoice } from './theme';

const THEME_LABELS: Record<ThemeChoice, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Системная',
};

export function App() {
  const { theme, setTheme } = useThemeChoice();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Text variant="subheader-2">Тема оформления</Text>
      <SegmentedRadioGroup
        name="theme"
        value={theme}
        onUpdate={(value) => setTheme(value as ThemeChoice)}
      >
        <SegmentedRadioGroup.Option value="light">{THEME_LABELS.light}</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="dark">{THEME_LABELS.dark}</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="system">{THEME_LABELS.system}</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
    </div>
  );
}
