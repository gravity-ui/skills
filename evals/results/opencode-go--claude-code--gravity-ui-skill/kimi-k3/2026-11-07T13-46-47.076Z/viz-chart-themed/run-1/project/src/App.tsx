import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import {Card, Flex, Switch, Text} from '@gravity-ui/uikit';

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 9, 20); // 20 Oct 2026

const visits = [320, 415, 380, 512, 470, 610, 590, 655, 602, 720, 684, 745, 810, 768, 855, 902, 880, 940];
const signups = [42, 55, 48, 71, 63, 84, 79, 92, 85, 101, 96, 110, 124, 118, 131, 140, 136, 152];

// No explicit colors are set: axes, grid, labels, legend and tooltip fall back to
// the uikit `--g-*` CSS tokens, and the built-in series palette is designed to keep
// contrast on both light and dark backgrounds — so the chart always matches the
// theme of the surrounding ThemeProvider.
const data: ChartData = {
    title: {
        text: 'Audience dynamics',
    },
    legend: {
        enabled: true,
    },
    xAxis: {
        type: 'datetime',
        title: {text: 'Date'},
    },
    yAxis: [
        {
            title: {text: 'Count'},
        },
    ],
    series: {
        data: [
            {
                type: 'line',
                name: 'Visits',
                interpolation: {type: 'monotone'},
                data: visits.map((y, index) => ({x: START + index * DAY, y})),
            },
            {
                type: 'line',
                name: 'Signups',
                interpolation: {type: 'monotone'},
                data: signups.map((y, index) => ({x: START + index * DAY, y})),
            },
        ],
    },
};

export interface AppProps {
    darkTheme: boolean;
    onThemeChange: (dark: boolean) => void;
}

export function App({darkTheme, onThemeChange}: AppProps) {
    return (
        <div style={{maxWidth: 960, margin: '0 auto', padding: 24}}>
            <Flex justifyContent="space-between" alignItems="center" style={{marginBottom: 16}}>
                <Text variant="header-1">Line chart</Text>
                <Switch
                    checked={darkTheme}
                    onUpdate={onThemeChange}
                    content="Dark theme"
                    size="l"
                />
            </Flex>
            <Card style={{padding: 16}}>
                {/* Chart adapts to the parent size — the container needs an explicit height */}
                <div style={{height: 360}}>
                    <Chart data={data} />
                </div>
            </Card>
        </div>
    );
}
