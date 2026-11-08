import React from 'react';
import {Card, Flex, SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {RealTheme} from '@gravity-ui/uikit';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';

// Monthly data, timestamps in milliseconds (datetime axis requires Unix time).
const month = (monthIndex: number) => new Date(2026, monthIndex, 1).getTime();

const chartData: ChartData = {
    title: {
        text: 'Выручка и расходы за 2026 год',
    },
    xAxis: {
        type: 'datetime',
    },
    yAxis: [
        {
            title: {text: 'тыс. ₽'},
        },
    ],
    series: {
        data: [
            {
                type: 'line',
                name: 'Выручка',
                data: [
                    {x: month(0), y: 420},
                    {x: month(1), y: 385},
                    {x: month(2), y: 460},
                    {x: month(3), y: 510},
                    {x: month(4), y: 495},
                    {x: month(5), y: 560},
                    {x: month(6), y: 610},
                    {x: month(7), y: 590},
                    {x: month(8), y: 655},
                    {x: month(9), y: 700},
                ],
            },
            {
                type: 'line',
                name: 'Расходы',
                data: [
                    {x: month(0), y: 310},
                    {x: month(1), y: 295},
                    {x: month(2), y: 330},
                    {x: month(3), y: 345},
                    {x: month(4), y: 360},
                    {x: month(5), y: 355},
                    {x: month(6), y: 390},
                    {x: month(7), y: 405},
                    {x: month(8), y: 420},
                    {x: month(9), y: 445},
                ],
            },
        ],
    },
};

export function App() {
    const [theme, setTheme] = React.useState<RealTheme>('light');

    return (
        // Nested ThemeProvider inside the root one (see main.tsx) is scoped:
        // it re-themes only this subtree, and the chart follows the theme
        // automatically via --g-color-* tokens.
        <ThemeProvider theme={theme}>
            <Flex
                direction="column"
                gap={5}
                style={{
                    minHeight: '100vh',
                    padding: 24,
                    background: 'var(--g-color-base-background)',
                    color: 'var(--g-color-text-primary)',
                }}
            >
                <Flex justifyContent="space-between" alignItems="center">
                    <Text variant="header-1">Аналитика продаж</Text>
                    <SegmentedRadioGroup
                        value={theme}
                        onUpdate={(value) => setTheme(value as RealTheme)}
                        options={[
                            {value: 'light', content: 'Светлая'},
                            {value: 'dark', content: 'Тёмная'},
                        ]}
                    />
                </Flex>
                <Card style={{padding: 16}}>
                    {/* Chart fills its parent — explicit height is required */}
                    <div style={{height: 360}}>
                        <Chart data={chartData} lang="ru" />
                    </div>
                </Card>
            </Flex>
        </ThemeProvider>
    );
}
