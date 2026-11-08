// Implement the requested feature here (and may add sibling files).
import { useThemeValue } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import { ThemeSwitch } from './ThemeSwitch';

export interface AppProps {
    onThemeChange: (themeType: ThemeType) => void;
}

export function App({ onThemeChange }: AppProps) {
    const themeValue = useThemeValue();

    return (
        <div
            style={{
                display: 'grid',
                gap: 16,
                justifyContent: 'center',
                padding: 24,
                minHeight: '100dvh',
                alignContent: 'center',
            }}
        >
            <h1 style={{ margin: 0 }}>Gravity UI theme</h1>
            <ThemeSwitch onThemeChange={onThemeChange} />
            <div style={{ color: 'var(--g-color-text-primary)' }}>
                Current theme: {themeValue}
            </div>
        </div>
    );
}
