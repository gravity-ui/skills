import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';
import { Card, Flex, Text } from '@gravity-ui/uikit';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const VISITS_2025 = [1240, 1380, 1520, 1610, 1790, 1950, 2100, 2040, 1880, 1720, 1650, 1830];
const VISITS_2026 = [1410, 1560, 1700, 1850, 2020, 2230, 2390, 2310, 2150, 2010, 1940, 2120];

// No colors are set here on purpose: axes, grid lines, labels, legend and tooltip
// are styled by @gravity-ui/charts through the uikit `--g-*` tokens, so the chart
// follows whichever theme the surrounding ThemeProvider sets (light / dark / hc).
const data: ChartData = {
    xAxis: {
        type: 'category',
        categories: MONTHS,
    },
    yAxis: [
        {
            title: { text: 'Посещения' },
        },
    ],
    legend: { enabled: true },
    series: {
        data: [
            {
                type: 'line',
                name: '2025',
                data: VISITS_2025.map((y, x) => ({ x, y })),
            },
            {
                type: 'line',
                name: '2026',
                data: VISITS_2026.map((y, x) => ({ x, y })),
            },
        ],
    },
};

export function App() {
    return (
        <div style={{ padding: 'var(--g-spacing-6)' }}>
            <Card view="outlined" style={{ padding: 'var(--g-spacing-4)' }}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-3">Посещения сайта по месяцам</Text>
                    {/* Chart fills its parent, so the wrapper needs an explicit height */}
                    <div style={{ height: 360, minWidth: 0 }}>
                        <Chart data={data} />
                    </div>
                </Flex>
            </Card>
        </div>
    );
}
