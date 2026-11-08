import * as React from 'react';
import {Card, Flex, Label, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {createMockCpuLoadSource, type CpuLoadSource} from './cpuLoadSource';
import './MonitoringPage.css';

const WARNING_THRESHOLD = 70;
const DANGER_THRESHOLD = 90;

function loadTheme(value: number): 'success' | 'warning' | 'danger' {
    if (value >= DANGER_THRESHOLD) {
        return 'danger';
    }
    return value >= WARNING_THRESHOLD ? 'warning' : 'success';
}

function useLatestCpuLoad(source: CpuLoadSource) {
    return React.useSyncExternalStore(source.subscribe, source.getLatest, source.getLatest);
}

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'});

export function MonitoringPage() {
    const source = React.useMemo(() => createMockCpuLoadSource(), []);
    const latest = useLatestCpuLoad(source);

    return (
        <Flex direction="column" gap={4} className="monitoring-page">
            <Text variant="header-1">Мониторинг</Text>

            <Card view="outlined" spacing={{p: 4}}>
                <Flex direction="column" gap={3}>
                    <Flex alignItems="center" justifyContent="space-between" gap={3}>
                        <Flex direction="column" gap={0.5} style={{flex: 1, minWidth: 0}}>
                            <Text variant="subheader-2" ellipsis>
                                Загрузка CPU
                            </Text>
                            <Text variant="caption-2" color="secondary">
                                Последние 24 часа, обновление каждые {source.stepMs / 1000} с. Выделите область для
                                приближения, двойной клик — сброс.
                            </Text>
                        </Flex>
                        {latest ? (
                            <Flex alignItems="center" gap={2} style={{flexShrink: 0}}>
                                <Text variant="caption-2" color="hint">
                                    {timeFormatter.format(latest.ts)}
                                </Text>
                                <Label theme={loadTheme(latest.value)} size="m">
                                    {latest.value.toFixed(1)}%
                                </Label>
                            </Flex>
                        ) : null}
                    </Flex>

                    <div className="monitoring-page__chart">
                        <CpuLoadChart source={source} />
                    </div>
                </Flex>
            </Card>
        </Flex>
    );
}
