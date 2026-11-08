import React from 'react';
import {Button, Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart, type CpuLoadChartHandle, type CpuLoadSample} from './cpu-load/CpuLoadChart';
import {createMockCpuSource} from './cpu-load/source';

import './App.css';

const MemoCpuLoadChart = React.memo(CpuLoadChart);

const valueFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});
const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

export function App() {
    // Replace with a real metrics source (HTTP history + WebSocket/SSE stream).
    const [source] = React.useState(() => createMockCpuSource());
    const chartRef = React.useRef<CpuLoadChartHandle>(null);
    const [latest, setLatest] = React.useState<CpuLoadSample | null>(null);
    const [zoomed, setZoomed] = React.useState(false);

    return (
        <main className="monitoring-page">
            <Text as="h1" variant="header-2">
                Мониторинг
            </Text>

            <Card className="cpu-card" view="outlined">
                <Flex className="cpu-card__header" justifyContent="space-between" alignItems="flex-start" gap={4}>
                    <Flex direction="column" gap={1}>
                        <Text as="h2" variant="subheader-3">
                            Загрузка CPU, %
                        </Text>
                        <Text color="secondary">
                            {zoomed
                                ? 'Фрагмент за сутки · двойной клик по графику — вернуть'
                                : 'Последние 24 часа · выделите область, чтобы увеличить'}
                        </Text>
                    </Flex>

                    <Flex alignItems="center" gap={4}>
                        {zoomed && (
                            <Button view="outlined" onClick={() => chartRef.current?.resetZoom()}>
                                Сбросить масштаб
                            </Button>
                        )}
                        <Flex direction="column" alignItems="flex-end" aria-live="off">
                            <Text variant="display-1" className="cpu-card__value">
                                {typeof latest?.value === 'number' ? `${valueFormat.format(latest.value)} %` : '—'}
                            </Text>
                            <Text variant="caption-2" color="secondary">
                                {latest ? `сейчас, ${timeFormat.format(latest.timestamp)}` : 'загрузка…'}
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>

                <div className="cpu-card__chart">
                    <MemoCpuLoadChart
                        ref={chartRef}
                        source={source}
                        onLatestSample={setLatest}
                        onZoomChange={setZoomed}
                    />
                </div>
            </Card>
        </main>
    );
}
