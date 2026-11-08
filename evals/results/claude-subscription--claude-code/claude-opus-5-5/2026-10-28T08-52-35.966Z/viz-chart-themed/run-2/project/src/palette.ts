import type {ThemeType} from '@gravity-ui/uikit';

// Categorical slots, assigned in fixed order (never cycled). Each theme has its own
// validated steps: light against #ffffff, dark against Gravity's dark background #221d22.
// The light aqua step is below 3:1 on white, so the chart ships direct end labels and a table view.
export const SERIES_COLORS: Record<ThemeType, string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a'],
    dark: ['#3987e5', '#d95926', '#199e70'],
};
