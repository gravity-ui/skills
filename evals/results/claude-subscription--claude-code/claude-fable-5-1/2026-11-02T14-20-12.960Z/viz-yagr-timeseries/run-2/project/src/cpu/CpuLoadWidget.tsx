import * as React from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './CpuLoadChart';
import {createSimulatedCpuLoadSource, type CpuLoadSource, type CpuLoadStats} from './cpuLoadSource';

import './CpuLoadWidget.css';

const STATS_REFRESH_MS = 1000;

const formatPercent = (value: number | null) => (value === null ? '—' : `${value.toFixed(1)} %`);
const formatCount = new Intl.NumberFormat('ru-RU');

/** Держит источник данных на время жизни компонента и гасит его при размонтировании. */
function useCpuLoadSource(): CpuLoadSource {
    const [source] = React.useState(() => createSimulatedCpuLoadSource());
    React.useEffect(() => () => source.dispose(), [source]);
    return source;
}

/** Агрегаты обновляются не чаще раза в секунду и только в шапке, а не в графике. */
function useCpuLoadStats(source: CpuLoadSource): CpuLoadStats {
    const [stats, setStats] = React.useState(() => source.getStats());

    React.useEffect(() => {
        let dirty = false;
        const unsubscribe = source.subscribe(() => {
            dirty = true;
        });
        const timer = setInterval(() => {
            if (!dirty) return;
            dirty = false;
            setStats(source.getStats());
        }, STATS_REFRESH_MS);

        setStats(source.getStats());
        return () => {
            unsubscribe();
            clearInterval(timer);
        };
    }, [source]);

    return stats;
}

function Stat({label, value}: {label: string; value: string}) {
    return (
        <div className="cpu-load-widget__stat">
            <Text variant="caption-2" color="secondary">
                {label}
            </Text>
            <Text variant="subheader-2" className="cpu-load-widget__stat-value">
                {value}
            </Text>
        </div>
    );
}

export function CpuLoadWidget() {
    const source = useCpuLoadSource();
    const stats = useCpuLoadStats(source);

    return (
        <Card type="container" view="outlined" className="cpu-load-widget">
            <Flex direction="column" gap={3}>
                <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap>
                    <div>
                        <Text as="h2" variant="subheader-3" className="cpu-load-widget__title">
                            Загрузка CPU
                        </Text>
                        <Text variant="body-1" color="secondary">
                            Последние 24 часа · {formatCount.format(stats.points)} точек · обновление каждые 2 с
                        </Text>
                    </div>
                    <Flex gap={6} wrap>
                        <Stat label="Сейчас" value={formatPercent(stats.current)} />
                        <Stat label="Средняя" value={formatPercent(stats.average)} />
                        <Stat label="Пиковая" value={formatPercent(stats.max)} />
                    </Flex>
                </Flex>

                <div className="cpu-load-widget__plot">
                    <CpuLoadChart source={source} />
                </div>
            </Flex>
        </Card>
    );
}
