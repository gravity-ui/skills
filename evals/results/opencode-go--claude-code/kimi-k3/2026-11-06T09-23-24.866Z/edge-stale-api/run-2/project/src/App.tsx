import {Button, Card, Text, useThemeValue} from '@gravity-ui/uikit';

import {ThemeToggle} from './ThemeToggle';
import type {AppTheme} from './useAppTheme';

export interface AppProps {
    theme: AppTheme;
    onThemeChange: (theme: AppTheme) => void;
}

export function App({theme, onThemeChange}: AppProps) {
    // Resolved ("real") theme as read from the nearest ThemeProvider.
    const themeValue = useThemeValue();

    return (
        <div
            style={{
                maxWidth: 640,
                margin: '0 auto',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            <Text variant="header-1">Переключатель темы</Text>

            <ThemeToggle theme={theme} onChange={onThemeChange} />

            <Card view="raised" style={{padding: 16}}>
                <Text variant="body-2">
                    Текущая тема: <b>{themeValue === 'dark' ? 'тёмная' : 'светлая'}</b>
                </Text>
                <div style={{marginTop: 12, display: 'flex', gap: 8}}>
                    <Button view="action">Основная кнопка</Button>
                    <Button view="outlined">Вторичная кнопка</Button>
                </div>
            </Card>
        </div>
    );
}
