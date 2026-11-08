import {Icon, SegmentedRadioGroup, Text, useTheme, useThemeValue} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';
import {Display, Moon, Sun} from '@gravity-ui/icons';

export type ThemeSwitcherProps = {
  /** Called with the selected theme; the parent passes it to `ThemeProvider`'s `theme` prop. */
  onUpdate: (theme: Theme) => void;
};

/**
 * Light / dark / system switcher for @gravity-ui/uikit v7.
 *
 * In v7 the theme is controlled by `ThemeProvider`'s `theme` prop, and
 * `useTheme()` only reads it — so the setter comes from the owner of that state.
 * `useThemeValue()` gives the resolved theme (`light` / `dark` / …) when `system` is selected.
 */
export function ThemeSwitcher({onUpdate}: ThemeSwitcherProps) {
  const theme = useTheme();
  const resolvedTheme = useThemeValue();

  return (
    <SegmentedRadioGroup<Theme>
      value={theme}
      onUpdate={onUpdate}
      size="m"
      aria-label="Theme"
    >
      <SegmentedRadioGroup.Option<Theme> value="light" title="Light">
        <Icon data={Sun} size={16} />
        <Text variant="body-1" style={{marginInlineStart: 6}}>
          Light
        </Text>
      </SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option<Theme> value="dark" title="Dark">
        <Icon data={Moon} size={16} />
        <Text variant="body-1" style={{marginInlineStart: 6}}>
          Dark
        </Text>
      </SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option<Theme> value="system" title="System">
        <Icon data={Display} size={16} />
        <Text variant="body-1" style={{marginInlineStart: 6}}>
          System
        </Text>
      </SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
