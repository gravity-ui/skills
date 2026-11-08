import {useEffect, useMemo, useState} from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {createSimulatedCpuLoadSource} from './cpuLoadSource';

function formatPercent(value: number | null): string {
    return value === null ? '—' : `${value.toFixed(1)} %`;
}

export function MonitoringPage() {
    // Источник живёт столько же, сколько страница: при размонтировании
    // график отписывается, и таймер источника останавливается сам.
    const source = useMemo(() => createSimulatedCpuLoadSource(), []);

    const [latest, setLatest] = useState<number | null>(() => {
        const {values} = source.getHistory();
        return values.length > 0 ? values[values.length - 1] : null;
    });

    useEffect(() => {
        return source.subscribe((points) => {
            setLatest(points[points.length - 1].value);
        });
    }, [source]);

    return (
        <Flex direction="column" gap={4}>
            <Text variant="header-1" as="h1">
                Мониторинг
            </Text>

            <Card type="container" view="outlined" spacing={{p: 4}}>
                <Flex direction="column" gap={3}>
                    <Flex alignItems="baseline" justifyContent="space-between" gap={3} wrap>
                        <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                            <Text variant="subheader-2" as="h2">
                                Загрузка CPU
                            </Text>
                            <Text variant="body-1" color="secondary">
                                Последние 24 часа, обновление в реальном времени
                            </Text>
                        </Flex>
                        <Flex direction="column" alignItems="flex-end" style={{flexShrink: 0}}>
                            <Text variant="header-2" style={{fontVariantNumeric: 'tabular-nums'}}>
                                {formatPercent(latest)}
                            </Text>
                            <Text variant="caption-2" color="hint">
                                сейчас
                            </Text>
                        </Flex>
                    </Flex>

                    <CpuLoadChart source={source} height={320} />

                    <Text variant="caption-2" color="hint">
                        Выделите участок, чтобы приблизить; двойной клик возвращает полный диапазон.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    );
}
