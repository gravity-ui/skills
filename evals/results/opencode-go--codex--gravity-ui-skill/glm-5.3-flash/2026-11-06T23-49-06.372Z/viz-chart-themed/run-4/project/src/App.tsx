// Implement the requested feature here (and may add sibling files).
import {Chart} from '@gravity-ui/charts';
import {
    Box,
    SegmentedRadioGroup,
    Text,
    ThemeProvider,
    useThemeValue,
} from '@gravity-ui/uikit';
import React from 'react';

import type {ChartData, LineSeries} from '@gravity-ui/charts';

type SalesSeries = LineSeries;

const salesSeries: SalesSeries = {
    type: 'line',
    name: 'Продажи',
    data: [
        {x: 'Пн', y: 12},
        {x: 'Вт', y: 18},
        {x: 'Ср', y: 15},
        {x: 'Чт', y: 24},
        {x: 'Пт', y: 31},
        {x: 'Сб', y: 27},
        {x: 'Вс', y: 35},
    ],
};

const chartData: ChartData = {
    series: {
        data: [salesSeries],
    },
};

export function App() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    return (
        <ThemeProvider theme={theme}>
            <Box
                spacing={{my: 6, py: 6, px: 5}}
                maxWidth={640}
                style={{
                    marginInline: 'auto',
                    borderRadius: '1rem',
                    backgroundColor: 'var(--g-color-base-generic)',
                }}
            >
                <Box spacing={{mb: 4}} width="100%">
                    <Text variant="header-2" as="h1">
                        Динамика продаж
                    </Text>
                </Box>

                <Box
                    spacing={{mb: 4}}
                    width="100%"
                    style={{display: 'flex', justifyContent: 'flex-end'}}
                >
                    <SegmentedRadioGroup
                        size="m"
                        value={theme}
                        onUpdate={(value) => setTheme(value as typeof theme)}
                    >
                        <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                </Box>

                <Box
                    height={360}
                    width="100%"
                    style={{
                        borderRadius: '1rem',
                        backgroundColor: 'var(--g-color-base-background)',
                    }}
                >
                    <Chart data={chartData} lang="ru" />
                </Box>
            </Box>
        </ThemeProvider>
    );
}
