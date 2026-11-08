import React from 'react';

import {Card, Flex, Icon, Switch, Text} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {CpuChart} from './monitoring/CpuChart';

import './app.css';

interface AppProps {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({theme, onThemeChange}: AppProps) {
    const [currentCpu, setCurrentCpu] = React.useState<number | null>(null);

    return (
        <div className="page">
            <div className="page__content">
                <Flex justifyContent="space-between" alignItems="center">
                    <Text variant="header-2">Мониторинг</Text>
                    <Flex alignItems="center" gap={2}>
                        <span className="page__theme-icon">
                            <Icon data={Sun} size={16} />
                        </span>
                        <Switch
                            checked={theme === 'dark'}
                            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
                            aria-label="Тёмная тема"
                        />
                        <span className="page__theme-icon">
                            <Icon data={Moon} size={16} />
                        </span>
                    </Flex>
                </Flex>

                <Card view="raised" size="l" spacing={{p: 5}}>
                    <Flex direction="column" gap={4}>
                        <Flex
                            justifyContent="space-between"
                            alignItems="baseline"
                            wrap={true}
                            gap={2}
                        >
                            <Flex direction="column" gap={1} style={{minWidth: 0, flex: 1}}>
                                <Text variant="subheader-2">Загрузка CPU</Text>
                                <Text variant="body-2" color="secondary">
                                    Средняя по кластеру, последние 24 часа
                                </Text>
                            </Flex>
                            <Text variant="display-1">
                                {currentCpu === null ? '—' : `${currentCpu.toFixed(1)} %`}
                            </Text>
                        </Flex>
                        <CpuChart theme={theme} className="page__chart" onPoint={setCurrentCpu} />
                    </Flex>
                </Card>
            </div>
        </div>
    );
}
