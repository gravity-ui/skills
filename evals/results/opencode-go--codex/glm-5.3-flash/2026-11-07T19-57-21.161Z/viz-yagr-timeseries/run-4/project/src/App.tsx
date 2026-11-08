import {useEffect, useMemo, useState} from 'react';
import {Card, Text} from '@gravity-ui/uikit';

import {CpuUsageChart} from './CpuUsageChart';
import {createCpuUsageSource, createHistoricalCpuData, type CpuSample} from './cpu-usage-stream';

const MAX_SAMPLE_COUNT = 17_280;

export function App() {
    const [samples, setSamples] = useState<CpuSample[]>(() => createHistoricalCpuData(Date.now()));
    const [endTimestamp, setEndTimestamp] = useState(() => Date.now());

    useEffect(() => {
        const cpuSource = createCpuUsageSource();
        const unsubscribe = cpuSource.subscribe((sample) => {
            setSamples((previousSamples) => {
                const nextSamples = [...previousSamples, sample];

                if (nextSamples.length > MAX_SAMPLE_COUNT) {
                    nextSamples.splice(0, nextSamples.length - MAX_SAMPLE_COUNT);
                }

                return nextSamples;
            });
            setEndTimestamp(sample.timestamp);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const lastSample = useMemo(
        () => samples[samples.length - 1],
        [samples],
    );

    return (
        <main className="monitoring-page">
            <Card view="filled" className="monitoring-card">
                <Text variant="header-2">CPU</Text>
                <Text variant="body-1" color="secondary">
                    Загрузка за последние сутки{lastSample ? ` · ${formatCpuValue(lastSample.value)}` : ''}
                </Text>
                <div className="cpu-chart-container">
                    <CpuUsageChart samples={samples} endTimestamp={endTimestamp} />
                </div>
            </Card>
        </main>
    );
}

function formatCpuValue(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'percent',
        maximumFractionDigits: 1,
    }).format(value);
}
