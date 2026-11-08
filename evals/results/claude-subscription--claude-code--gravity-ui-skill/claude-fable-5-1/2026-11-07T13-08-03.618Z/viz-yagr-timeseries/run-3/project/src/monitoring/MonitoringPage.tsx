import * as React from 'react';
import {Card, Flex, Label, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {createSimulatedCpuLoadSource} from './cpuLoadSource';
import type {CpuLoadSource} from './cpuLoadSource';

function cpuLevelTheme(value: number): 'info' | 'warning' | 'danger' {
    if (value >= 90) {
        return 'danger';
    }
    if (value >= 70) {
        return 'warning';
    }
    return 'info';
}

/** Текущее значение вынесено в отдельный компонент, чтобы тики не перерисовывали страницу. */
function CpuLoadValue({source}: {source: CpuLoadSource}) {
    const [value, setValue] = React.useState<number | null>(() => {
        const {values} = source.getHistory();
        return values.length ? values[values.length - 1] : null;
    });

    React.useEffect(() => source.subscribe((point) => setValue(point.value)), [source]);

    if (value === null) {
        return <Label theme="unknown">нет данных</Label>;
    }
    return <Label theme={cpuLevelTheme(value)}>{`сейчас ${value.toFixed(1)} %`}</Label>;
}

export function MonitoringPage() {
    const [source] = React.useState(() => createSimulatedCpuLoadSource());

    return (
        <Flex direction="column" gap={4}>
            <Text variant="header-1">Мониторинг</Text>
            <Card spacing={{p: 4}}>
                <Flex direction="column" gap={3}>
                    <Flex alignItems="center" justifyContent="space-between" gap={2}>
                        <Flex direction="column" gap={0.5} style={{flex: 1, minWidth: 0}}>
                            <Text variant="subheader-2">Загрузка CPU</Text>
                            <Text variant="body-1" color="secondary">
                                Последние 24 часа · выделите область для масштабирования
                            </Text>
                        </Flex>
                        <div style={{flexShrink: 0}}>
                            <CpuLoadValue source={source} />
                        </div>
                    </Flex>
                    <CpuLoadChart source={source} />
                </Flex>
            </Card>
        </Flex>
    );
}
