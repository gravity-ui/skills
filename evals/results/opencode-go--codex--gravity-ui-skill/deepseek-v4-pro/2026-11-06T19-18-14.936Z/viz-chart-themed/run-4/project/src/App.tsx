import {useCallback} from 'react';
import {Chart} from '@gravity-ui/charts';
import {Button, Icon, Text, Flex} from '@gravity-ui/uikit';
import SunIcon from '@gravity-ui/icons/Sun';
import MoonIcon from '@gravity-ui/icons/Moon';
import type {ThemeType} from '@gravity-ui/uikit';

interface AppProps {
    theme: ThemeType;
    onToggleTheme: () => void;
}

const chartData = {
    series: {
        data: [
            {
                type: 'line' as const,
                name: 'Просмотры',
                data: [
                    {x: 'Янв', y: 120},
                    {x: 'Фев', y: 210},
                    {x: 'Мар', y: 180},
                    {x: 'Апр', y: 290},
                    {x: 'Май', y: 340},
                    {x: 'Июн', y: 270},
                    {x: 'Июл', y: 390},
                ],
                marker: {enabled: true},
                interpolation: {type: 'monotone' as const},
            },
            {
                type: 'line' as const,
                name: 'Посетители',
                data: [
                    {x: 'Янв', y: 95},
                    {x: 'Фев', y: 170},
                    {x: 'Мар', y: 150},
                    {x: 'Апр', y: 220},
                    {x: 'Май', y: 260},
                    {x: 'Июн', y: 200},
                    {x: 'Июл', y: 310},
                ],
                marker: {enabled: true},
                interpolation: {type: 'monotone' as const},
            },
        ],
    },
    xAxis: {
        type: 'category' as const,
        title: {text: 'Месяц'},
    },
    yAxis: [
        {
            title: {text: 'Количество'},
        },
    ],
    title: {text: 'Статистика сайта'},
    legend: {enabled: true, position: 'bottom' as const},
    tooltip: {
        valueFormat: {type: 'number' as const, precision: 0},
    },
};

export function App({theme, onToggleTheme}: AppProps) {
    const handleToggleTheme = useCallback(() => {
        onToggleTheme();
    }, [onToggleTheme]);

    return (
        <div style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
            <Flex justifyContent="space-between" alignItems="center" style={{marginBottom: 16}}>
                <Text variant="header-1">Статистика сайта</Text>
                <Button view="action" onClick={handleToggleTheme}>
                    <Icon data={theme === 'light' ? MoonIcon : SunIcon} />
                    {theme === 'light' ? ' Тёмная тема' : ' Светлая тема'}
                </Button>
            </Flex>
            <div style={{height: 400}}>
                <Chart data={chartData} />
            </div>
        </div>
    );
}
