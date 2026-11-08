import {useCallback, useState} from 'react';
import {Button, Text, ThemeProvider} from '@gravity-ui/uikit';
import {CpuMonitor} from './CpuMonitor';

export function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggle = useCallback(() => {
        setTheme((t) => (t === 'light' ? 'dark' : 'light'));
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--g-color-base-background)',
                    padding: 'var(--g-spacing-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--g-spacing-4)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Text variant="header-1">Monitoring Dashboard</Text>
                    <Button view="action" onClick={toggle}>
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </Button>
                </div>
                <div style={{flex: 1, minHeight: 0}}>
                    <CpuMonitor />
                </div>
            </div>
        </ThemeProvider>
    );
}
