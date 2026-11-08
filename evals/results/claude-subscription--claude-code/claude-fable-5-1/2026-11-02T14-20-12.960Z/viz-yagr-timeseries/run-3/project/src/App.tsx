import {useEffect, useMemo, useState} from 'react';
import {Button, Card, Flex, SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {createSimulatedCpuMetrics} from './cpuMetrics';
import type {CpuMetricsSource} from './cpuMetrics';
import './App.css';

const percent = new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 1, maximumFractionDigits: 1});

function useCpuStats(source: CpuMetricsSource) {
    const compute = () => {
        const {values} = source.getSnapshot();
        let sum = 0;
        let max = 0;
        for (const v of values) {
            sum += v;
            if (v > max) {
                max = v;
            }
        }
        return {
            current: values.length ? values[values.length - 1] : 0,
            average: values.length ? sum / values.length : 0,
            max,
            points: values.length,
        };
    };

    const [stats, setStats] = useState(compute);

    useEffect(() => {
        setStats(compute());
        return source.subscribe(() => setStats(compute()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source]);

    return stats;
}

function MonitoringPage({
    source,
    theme,
    onThemeChange,
}: {
    source: CpuMetricsSource;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}) {
    const [chartVisible, setChartVisible] = useState(true);
    const stats = useCpuStats(source);

    return (
        <main className="monitoring">
            <Flex as="header" justifyContent="space-between" alignItems="center" gap={4} wrap>
                <Text variant="header-1" as="h1">
                    Мониторинг
                </Text>
                <SegmentedRadioGroup value={theme} onUpdate={onThemeChange} size="m" aria-label="Тема">
                    <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
            </Flex>

            <Card view="outlined" type="container" className="monitoring__card">
                <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap className="monitoring__card-header">
                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-2" as="h2">
                            Загрузка CPU, последние 24 часа
                        </Text>
                        <Text variant="body-1" color="secondary">
                            Обновление каждые {source.intervalMs / 1000} с · {stats.points.toLocaleString('ru-RU')} точек ·
                            выделите диапазон для увеличения, двойной клик — сброс
                        </Text>
                    </Flex>
                    <Flex gap={6} alignItems="center" wrap>
                        <Flex direction="column" gap={0}>
                            <Text variant="caption-2" color="secondary">
                                Сейчас
                            </Text>
                            <Text variant="display-1" className="monitoring__stat">
                                {percent.format(stats.current)} %
                            </Text>
                        </Flex>
                        <Flex direction="column" gap={0}>
                            <Text variant="caption-2" color="secondary">
                                Среднее
                            </Text>
                            <Text variant="subheader-3" className="monitoring__stat">
                                {percent.format(stats.average)} %
                            </Text>
                        </Flex>
                        <Flex direction="column" gap={0}>
                            <Text variant="caption-2" color="secondary">
                                Пик
                            </Text>
                            <Text variant="subheader-3" className="monitoring__stat">
                                {percent.format(stats.max)} %
                            </Text>
                        </Flex>
                        <Button view="outlined" size="m" onClick={() => setChartVisible((v) => !v)}>
                            {chartVisible ? 'Скрыть график' : 'Показать график'}
                        </Button>
                    </Flex>
                </Flex>

                <div className="monitoring__chart">
                    {chartVisible ? (
                        <CpuLoadChart source={source} />
                    ) : (
                        <Flex centerContent className="monitoring__placeholder">
                            <Text color="secondary">График скрыт — ресурсы освобождены</Text>
                        </Flex>
                    )}
                </div>
            </Card>
        </main>
    );
}

export function App() {
    const [theme, setTheme] = useState<Theme>('system');
    const source = useMemo(() => createSimulatedCpuMetrics(), []);

    useEffect(() => () => source.stop(), [source]);

    return (
        <ThemeProvider theme={theme}>
            <MonitoringPage source={source} theme={theme} onThemeChange={setTheme} />
        </ThemeProvider>
    );
}
