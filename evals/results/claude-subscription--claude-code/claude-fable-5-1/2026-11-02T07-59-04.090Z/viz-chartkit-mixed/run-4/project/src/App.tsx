import React from 'react';
import {Button, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {makeMonitoringDataset} from './data/monitoring';
import {makeSalesDataset} from './data/sales';
import {VisualizationWidget} from './widget';
import type {VizMode} from './widget';

export function App() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    const [mode, setMode] = React.useState<VizMode>('sales');
    const [lastRender, setLastRender] = React.useState<string>('');

    // Данные обоих режимов в едином формате; виджет сам выбирает движок под режим.
    const datasets = React.useMemo(
        () => ({sales: makeSalesDataset(), monitoring: makeMonitoringDataset()}),
        [],
    );

    const subtitle =
        mode === 'sales'
            ? 'Выручка по каналам, помесячно за 24 месяца'
            : 'Загрузка CPU по узлам, шаг 10 с, последние 24 часа';

    return (
        <ThemeProvider theme={theme} scoped rootClassName="demo-root">
            <div
                style={{
                    minHeight: '100vh',
                    padding: 24,
                    background: 'var(--g-color-base-background)',
                    color: 'var(--g-color-text-primary)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        gap: 16,
                    }}
                >
                    <div>
                        <Text variant="header-1" as="h1" style={{margin: 0}}>
                            Единый виджет визуализации
                        </Text>
                        <Text variant="body-1" color="secondary" as="div">
                            {subtitle}
                        </Text>
                    </div>
                    <Button
                        view="outlined"
                        size="m"
                        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                    >
                        <Icon data={theme === 'light' ? Moon : Sun} size={16} />
                        {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                    </Button>
                </div>

                <VisualizationWidget
                    title={mode === 'sales' ? 'Продажи' : 'Мониторинг'}
                    datasets={datasets}
                    mode={mode}
                    onModeChange={setMode}
                    height={380}
                    onRender={({library, renderTime}) =>
                        setLastRender(
                            renderTime !== undefined
                                ? `${library}: отрисовано за ${Math.round(renderTime)} мс`
                                : `${library}: отрисовано`,
                        )
                    }
                />

                <Text variant="caption-2" color="secondary" as="div" style={{marginTop: 12}} aria-live="polite">
                    {lastRender || ' '}
                </Text>
            </div>
        </ThemeProvider>
    );
}
