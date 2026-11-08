import './monitoring.css';

import {useMemo, useState} from 'react';
import {Moon, Sun} from '@gravity-ui/icons';
import {Button, Card, Flex, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {useCpuLoad} from './useCpuLoad';

type AppTheme = 'light' | 'dark';

function Stat({label, value}: {label: string; value: string}) {
    return (
        <Flex direction="column" gap={1}>
            <Text variant="caption-1" color="secondary">
                {label}
            </Text>
            <Text variant="header-2">{value}</Text>
        </Flex>
    );
}

export function App() {
    const [theme, setTheme] = useState<AppTheme>('light');
    const {timeline, values} = useCpuLoad();

    // Текстовая сводка по окну: дублирует график для тех, кто не читает
    // canvas, и даёт быстрый ответ без наведения.
    const {current, average, maximum} = useMemo(() => {
        let sum = 0;
        let max = -Infinity;
        for (const v of values) {
            sum += v;
            if (v > max) {
                max = v;
            }
        }
        return {
            current: values[values.length - 1] ?? 0,
            average: sum / values.length,
            maximum: max,
        };
    }, [values]);

    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    return (
        <ThemeProvider theme={theme}>
            <div className="monitoring-page">
                <Flex justifyContent="space-between" alignItems="center" gap={4}>
                    <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                        <Text variant="header-1">Мониторинг</Text>
                        <Text variant="body-2" color="secondary">
                            Сервер api-01 · данные обновляются каждую секунду
                        </Text>
                    </Flex>
                    <Button
                        view="outlined"
                        onClick={toggleTheme}
                        style={{flexShrink: 0}}
                        aria-label={
                            theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'
                        }
                    >
                        <Icon data={theme === 'light' ? Moon : Sun} size={16} />
                        {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                    </Button>
                </Flex>

                <Card type="container" view="filled" spacing={{p: 5}}>
                    <Flex direction="column" gap={4}>
                        <Flex
                            justifyContent="space-between"
                            alignItems="flex-end"
                            gap={4}
                            wrap={true}
                        >
                            <Text variant="subheader-1">Загрузка CPU за последние 24 часа</Text>
                            <Flex gap={6} style={{flexShrink: 0}}>
                                <Stat label="Текущая" value={`${current.toFixed(1)} %`} />
                                <Stat label="Средняя" value={`${average.toFixed(1)} %`} />
                                <Stat label="Максимум" value={`${maximum.toFixed(1)} %`} />
                            </Flex>
                        </Flex>

                        <CpuLoadChart timeline={timeline} values={values} />
                    </Flex>
                </Card>
            </div>
        </ThemeProvider>
    );
}
