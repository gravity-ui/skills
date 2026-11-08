import * as React from 'react';
import {Provider} from '@gravity-ui/uikit';
import type {ProviderProps, Theme} from '@gravity-ui/uikit';

/**
 * Темы, между которыми переключается пользователь.
 * `system` — значение по умолчанию в uikit: следует за prefers-color-scheme ОС
 * и разрешается в `light` или `dark` (см. systemLightTheme / systemDarkTheme у Provider).
 */
export const APP_THEMES = ['light', 'dark', 'system'] as const satisfies readonly Theme[];
export type AppTheme = (typeof APP_THEMES)[number];

export const THEME_STORAGE_KEY = 'app-theme';

export function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

function readStoredTheme(): AppTheme | undefined {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isAppTheme(stored) ? stored : undefined;
    } catch {
        return undefined;
    }
}

function writeStoredTheme(theme: AppTheme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // localStorage недоступен (приватный режим, SSR, запрет политикой) — просто не сохраняем.
    }
}

export interface ThemeSwitchContextValue {
    /** Выбранная пользователем тема (то, что передаётся в `theme` у Provider). */
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const ThemeSwitchContext = React.createContext<ThemeSwitchContextValue | undefined>(undefined);

/**
 * Доступ к выбранной теме и её сеттеру.
 * Разрешённое значение темы (`light`/`dark`) читайте через `useThemeValue` / `useThemeType` из uikit.
 */
export function useThemeSwitch(): ThemeSwitchContextValue {
    const context = React.useContext(ThemeSwitchContext);
    if (!context) {
        throw new Error('useThemeSwitch must be used within <AppThemeProvider>');
    }
    return context;
}

export interface AppThemeProviderProps extends Omit<ProviderProps, 'theme'> {
    /** Тема, если в localStorage ещё нет сохранённого выбора. */
    defaultTheme?: AppTheme;
}

/**
 * Прикладной провайдер поверх `Provider` из @gravity-ui/uikit v8:
 * хранит выбранную тему, сохраняет её в localStorage и прокидывает в `theme`.
 * Остальные props (`lang`, `layout`, `defaultProps`, `direction`, mobile-настройки) идут в `Provider` как есть.
 */
export function AppThemeProvider({children, defaultTheme = 'system', ...providerProps}: AppThemeProviderProps) {
    const [theme, setThemeState] = React.useState<AppTheme>(() => readStoredTheme() ?? defaultTheme);

    const setTheme = React.useCallback((next: AppTheme) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    const contextValue = React.useMemo<ThemeSwitchContextValue>(() => ({theme, setTheme}), [theme, setTheme]);

    return (
        <ThemeSwitchContext.Provider value={contextValue}>
            <Provider {...providerProps} theme={theme}>
                {children}
            </Provider>
        </ThemeSwitchContext.Provider>
    );
}
