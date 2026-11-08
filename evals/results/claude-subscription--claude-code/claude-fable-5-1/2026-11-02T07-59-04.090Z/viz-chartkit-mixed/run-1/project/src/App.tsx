import React from 'react';
import {Switch, Text} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {createMonitoringDataset} from './data/monitoring';
import {createSalesDataset} from './data/sales';
import {VizWidget} from './widget';
import type {VizMode} from './widget';

interface AppProps {
    theme?: Theme;
    onThemeChange?: (theme: Theme) => void;
}

export function App({theme = 'light', onThemeChange}: AppProps) {
    const datasets = React.useMemo(
        () => ({sales: createSalesDataset(), monitoring: createMonitoringDataset()}),
        [],
    );

    const handleEngineReady = React.useCallback((mode: VizMode, engineLabel: string) => {
        // eslint-disable-next-line no-console
        console.info(`[viz] режим «${mode}» отрисован движком ${engineLabel}`);
    }, []);

    return (
        <div style={{padding: 24, maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 16}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16}}>
                <Text variant="header-1">Виджет визуализации</Text>
                {onThemeChange && (
                    <Switch
                        checked={theme === 'dark'}
                        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
                        size="m"
                    >
                        Тёмная тема
                    </Switch>
                )}
            </div>
            <VizWidget
                title="Выручка и нагрузка API"
                datasets={datasets}
                defaultMode="sales"
                height={420}
                onEngineReady={handleEngineReady}
            />
            <Text variant="caption-2" color="secondary">
                Движки графиков загружаются лениво: код Gravity Charts приходит при первом показе
                режима «Продажи», код Yagr и uPlot — при первом переключении на «Мониторинг».
            </Text>
        </div>
    );
}
