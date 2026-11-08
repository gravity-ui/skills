import React from 'react';
import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import {createMockCpuLoadSource} from './monitoring/cpuLoadSource';

import './App.css';

export type AppTheme = 'light' | 'dark';

export interface AppProps {
    theme: AppTheme;
    onThemeChange: (theme: AppTheme) => void;
}

export function App({theme, onThemeChange}: AppProps) {
    // The source is created once: a new object would recreate the chart.
    const [cpuSource] = React.useState(createMockCpuLoadSource);

    return (
        <main className="monitoring-page">
            <Flex
                className="monitoring-page__header"
                alignItems="center"
                justifyContent="space-between"
                gap={4}
                wrap
            >
                <Text variant="header-1" as="h1" className="monitoring-page__title">
                    Мониторинг
                </Text>
                <SegmentedRadioGroup<AppTheme>
                    value={theme}
                    onUpdate={onThemeChange}
                    aria-label="Тема оформления"
                >
                    <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
            </Flex>

            <CpuLoadChart source={cpuSource} />
        </main>
    );
}
