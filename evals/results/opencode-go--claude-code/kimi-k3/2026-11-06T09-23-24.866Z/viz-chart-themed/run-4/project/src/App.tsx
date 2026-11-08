import {useState} from 'react';
import {SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';

import {LineChart} from './LineChart';
import {MONTHS, SERIES} from './chartData';

import './app.css';

type ThemeMode = 'light' | 'dark';

const THEME_OPTIONS = [
    {value: 'light', content: 'Светлая'},
    {value: 'dark', content: 'Тёмная'},
];

export function App() {
    // Вложенный scoped-провайдер переключает тему только внутри демо-страницы:
    // токены --g-color-* и --viz-series-* ниже по дереву меняются вместе с ней.
    const [theme, setTheme] = useState<ThemeMode>('light');

    return (
        <ThemeProvider theme={theme} scoped>
            <div className="page">
                <div className="page-inner">
                    <header className="page-header">
                        <div>
                            <Text variant="header-1">Финансовый обзор</Text>
                            <div className="page-subtitle">
                                <Text variant="body-2" color="secondary">
                                    Линейный график подстраивается под текущую тему приложения
                                </Text>
                            </div>
                        </div>
                        <SegmentedRadioGroup
                            name="theme"
                            value={theme}
                            options={THEME_OPTIONS}
                            onUpdate={(value) => setTheme(value as ThemeMode)}
                        />
                    </header>

                    <section className="chart-card viz-root">
                        <LineChart
                            title="Выручка и расходы"
                            subtitle="тыс. ₽ · 2025"
                            labels={MONTHS}
                            series={SERIES}
                        />
                    </section>
                </div>
            </div>
        </ThemeProvider>
    );
}
