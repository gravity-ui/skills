import * as React from 'react';
import {Card, Flex, Label, Switch, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import type {CpuLoadSample} from './monitoring/CpuLoadChart';
import {createMockCpuLoadSource} from './monitoring/cpuLoadSource';

import './App.css';

export type AppTheme = 'light' | 'dark';

export interface AppProps {
    theme: AppTheme;
    onThemeChange: (theme: AppTheme) => void;
}

function loadTheme(value: number): React.ComponentProps<typeof Label>['theme'] {
    if (value >= 90) {
        return 'danger';
    }
    if (value >= 70) {
        return 'warning';
    }
    return 'success';
}

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

export function App({theme, onThemeChange}: AppProps) {
    // Replace with a real source (HTTP history + WebSocket/SSE stream) implementing CpuLoadSource.
    const source = React.useMemo(() => createMockCpuLoadSource(2000), []);
    const [latest, setLatest] = React.useState<CpuLoadSample | null>(null);

    return (
        <Flex direction="column" gap={4} className="monitoring-page">
            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
                <Text variant="header-1">Мониторинг</Text>
                <Switch
                    checked={theme === 'dark'}
                    onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
                    content="Тёмная тема"
                />
            </Flex>

            <Card view="outlined" className="monitoring-page__card">
                <Flex direction="column" gap={3} className="monitoring-page__card-body">
                    <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                        <Flex direction="column" gap={0.5}>
                            <Text variant="subheader-2">Загрузка CPU</Text>
                            <Text variant="caption-2" color="secondary">
                                За последние 24 часа · выделите область для увеличения,
                                двойной клик — сброс
                            </Text>
                        </Flex>
                        {latest && (
                            <Label theme={loadTheme(latest.value)} size="m" value={`${latest.value.toFixed(1)} %`}>
                                {timeFormat.format(latest.timestamp)}
                            </Label>
                        )}
                    </Flex>

                    <CpuLoadChart source={source} onLatestSample={setLatest} />
                </Flex>
            </Card>
        </Flex>
    );
}
