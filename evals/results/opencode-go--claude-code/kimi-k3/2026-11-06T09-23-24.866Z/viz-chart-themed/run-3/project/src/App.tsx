import React from 'react';
import {SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';

import {LineChart} from './LineChart';
import './app.css';

type AppTheme = 'light' | 'dark';

const MONTHS = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
];

const SESSIONS = [
    {name: 'Десктоп', values: [42, 45, 44, 48, 52, 50, 54, 53, 55, 57, 56, 58]},
    {name: 'Мобильные', values: [30, 33, 37, 36, 41, 45, 47, 52, 55, 58, 63, 68]},
    {name: 'Планшеты', values: [18, 17, 19, 21, 20, 22, 24, 23, 25, 27, 26, 29]},
];

export function App() {
    const [theme, setTheme] = React.useState<AppTheme>('light');

    return (
        // Nested provider is automatically scoped: it stamps
        // .g-root_theme_light / .g-root_theme_dark on a wrapper div,
        // and the chart picks up the matching --g-color-* tokens.
        <ThemeProvider theme={theme}>
            <div className="app-shell">
                <header className="app-header">
                    <div>
                        <Text variant="header-1">Сессии по платформам</Text>
                        <div className="app-subtitle">
                            <Text variant="body-2" color="secondary">
                                Линейный график подстраивается под текущую тему приложения
                            </Text>
                        </div>
                    </div>
                    <SegmentedRadioGroup<AppTheme>
                        value={theme}
                        onUpdate={setTheme}
                        aria-label="Тема оформления"
                        options={[
                            {value: 'light', content: 'Светлая'},
                            {value: 'dark', content: 'Тёмная'},
                        ]}
                    />
                </header>

                <section className="chart-card">
                    <LineChart
                        title="Сессии по платформам"
                        subtitle="тыс. сессий в месяц, 2025"
                        labels={MONTHS}
                        series={SESSIONS}
                        unit="тыс."
                        xCaption="Месяц"
                    />
                </section>
            </div>
        </ThemeProvider>
    );
}
