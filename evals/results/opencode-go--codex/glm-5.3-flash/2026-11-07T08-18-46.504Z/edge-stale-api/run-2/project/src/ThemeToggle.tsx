import { SegmentedRadioGroup, useTheme, type Theme } from '@gravity-ui/uikit';

const themeOptions = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
  { value: 'system', content: 'Системная' },
] as const;

export function ThemeToggle({ setTheme }: { setTheme: (theme: Theme) => void }) {
  const theme = useTheme();

  return (
    <SegmentedRadioGroup
      name="theme"
      value={theme}
      onUpdate={setTheme}
      aria-label="Тема оформления"
    >
      {themeOptions.map(({ value, content }) => (
        <SegmentedRadioGroup.Option key={value} value={value} content={content} />
      ))}
    </SegmentedRadioGroup>
  );
}
