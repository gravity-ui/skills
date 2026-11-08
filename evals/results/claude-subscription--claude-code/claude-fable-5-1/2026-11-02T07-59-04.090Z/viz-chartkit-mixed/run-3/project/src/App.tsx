import React from 'react';
import {Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {RealTheme} from '@gravity-ui/uikit';

import {buildMonitoringDataset} from './data/monitoring';
import {buildSalesDataset} from './data/sales';
import {VizWidget} from './viz';
import type {VizMode} from './viz';

import './App.css';

export function App() {
    const [theme, setTheme] = React.useState<RealTheme>('light');
    const [mode, setMode] = React.useState<VizMode>('sales');

    const datasets = React.useMemo(
        () => ({
            sales: buildSalesDataset(),
            monitoring: buildMonitoringDataset(),
        }),
        [],
    );

    return (
        <ThemeProvider theme={theme} scoped rootClassName="app-root">
            <div className="app">
                <header className="app__toolbar">
                    <Text variant="header-1">Виджет визуализации</Text>
                    <Switch
                        size="m"
                        checked={theme === 'dark'}
                        onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
                        content="Тёмная тема"
                    />
                </header>
                <VizWidget datasets={datasets} mode={mode} onModeChange={setMode} height={380} />
            </div>
        </ThemeProvider>
    );
}
