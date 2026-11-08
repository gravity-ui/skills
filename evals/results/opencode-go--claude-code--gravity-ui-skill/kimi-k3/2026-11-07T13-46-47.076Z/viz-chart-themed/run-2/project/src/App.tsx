import React from 'react';
import {Box, Card, Flex, SegmentedRadioGroup, Text, ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const REVENUE_2024 = [4.2, 4.8, 5.1, 4.6, 5.9, 6.4, 6.1, 6.8, 7.5, 7.1, 8.3, 9.0];
const REVENUE_2025 = [5.0, 5.6, 6.2, 6.8, 7.3, 8.1, 7.6, 8.9, 9.4, 10.2, 10.8, 12.1];

// Colors for axes, grid, labels and tooltip come from `--g-*` / `--gcharts-*`
// CSS variables, so the chart automatically follows the active Gravity UI theme.
const chartData: ChartData = {
    title: {text: 'Выручка по месяцам'},
    legend: {enabled: true},
    xAxis: {
        type: 'category',
        categories: MONTHS,
        title: {text: 'Месяц'},
    },
    yAxis: [{title: {text: 'млн ₽'}}],
    series: {
        data: [
            {
                type: 'line',
                name: '2024',
                data: REVENUE_2024.map((y, i) => ({x: MONTHS[i], y})),
            },
            {
                type: 'line',
                name: '2025',
                data: REVENUE_2025.map((y, i) => ({x: MONTHS[i], y})),
                marker: {enabled: true},
            },
        ],
    },
};

export function App() {
    // The outer ThemeProvider (main.tsx) uses `theme="system"`;
    // useThemeType() gives the resolved 'light' | 'dark' as the initial value.
    const [theme, setTheme] = React.useState<'light' | 'dark'>(useThemeType());

    return (
        <ThemeProvider theme={theme} scoped>
            <Box
                spacing={{p: 6}}
                style={{
                    minHeight: '100vh',
                    background: 'var(--g-color-base-background)',
                }}
            >
                <Flex direction="column" gap={5} style={{maxWidth: 960, margin: '0 auto'}}>
                    <Flex justifyContent="space-between" alignItems="center" gap={4}>
                        <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                            <Text variant="header-1">Продажи</Text>
                            <Text variant="body-2" color="secondary">
                                График подстраивается под текущую тему приложения
                            </Text>
                        </Flex>
                        <SegmentedRadioGroup
                            style={{flexShrink: 0}}
                            value={theme}
                            onUpdate={(value) => setTheme(value)}
                        >
                            <SegmentedRadioGroup.Option value="light" content="Светлая" />
                            <SegmentedRadioGroup.Option value="dark" content="Тёмная" />
                        </SegmentedRadioGroup>
                    </Flex>

                    <Card view="raised" size="l">
                        <Box spacing={{p: 5}}>
                            <div style={{height: 360}}>
                                <Chart data={chartData} />
                            </div>
                        </Box>
                    </Card>
                </Flex>
            </Box>
        </ThemeProvider>
    );
}
