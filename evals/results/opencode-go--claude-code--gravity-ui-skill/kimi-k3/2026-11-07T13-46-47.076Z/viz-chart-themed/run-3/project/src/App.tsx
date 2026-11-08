import * as React from 'react';
import {Card, Flex, Switch, Text, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import type {RealTheme} from '@gravity-ui/uikit';

import {ThemedLineChart} from './ThemedLineChart';
import './App.css';

export function App() {
    // The theme currently applied by the app's ThemeProvider (main.tsx).
    const appThemeValue = useThemeValue();
    const [theme, setTheme] = React.useState<RealTheme>(
        appThemeValue.includes('dark') ? 'dark' : 'light',
    );

    return (
        // Nested ThemeProvider is scoped: it renders a `g-root_theme_*` wrapper,
        // so all `--g-*` tokens (and the chart) inside follow the toggled theme.
        <ThemeProvider theme={theme}>
            <div className="app">
                <main className="app__content">
                    <Flex direction="column" gap={5}>
                        <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={3}>
                            <Text variant="header-1">Активность пользователей</Text>
                            <Switch
                                size="l"
                                checked={theme === 'dark'}
                                onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
                                content="Тёмная тема"
                            />
                        </Flex>
                        <Card view="raised" className="app__chart-card">
                            <Flex direction="column" gap={4}>
                                <Text variant="subheader-2" color="secondary">
                                    Активные пользователи за 30 дней
                                </Text>
                                <ThemedLineChart />
                            </Flex>
                        </Card>
                    </Flex>
                </main>
            </div>
        </ThemeProvider>
    );
}
