import React from 'react';
import {Card, Switch, Text} from '@gravity-ui/uikit';

import {CpuChart} from './CpuChart';
import {useCpuStream} from './useCpuStream';

export interface AppProps {
    dark?: boolean;
    onDarkChange?: (dark: boolean) => void;
}

export function App({dark = false, onDarkChange}: AppProps) {
    const {timeline, values} = useCpuStream();

    return (
        <div style={{padding: 24, maxWidth: 1400, margin: '0 auto'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
                <Text variant="header-1" style={{flex: 1}}>
                    Мониторинг
                </Text>
                {onDarkChange && (
                    <Switch checked={dark} onUpdate={onDarkChange} content="Тёмная тема" />
                )}
            </div>
            <Card view="outlined" style={{padding: 16}}>
                <Text variant="subheader-2" as="h2" style={{margin: '0 0 4px'}}>
                    Загрузка CPU, последние 24 часа
                </Text>
                <Text variant="body-1" color="secondary" as="p" style={{margin: '0 0 12px'}}>
                    Выделите область, чтобы приблизить; двойной клик — сбросить масштаб.
                </Text>
                <CpuChart timeline={timeline} values={values} height={360} />
            </Card>
        </div>
    );
}
