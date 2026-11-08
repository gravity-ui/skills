import React from 'react';

import {Card, Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {buildMonitoringData, buildSalesData} from './sampleData';
import {VizWidget, type VizWidgetMode} from './viz-widget';

const salesData = buildSalesData();
const monitoringData = buildMonitoringData();

const MODE_TITLES: Record<VizWidgetMode, string> = {
    sales: 'Продажи по каналам',
    monitoring: 'Мониторинг сервера (24ч, шаг 30с)',
};

export function App() {
    const [mode, setMode] = React.useState<VizWidgetMode>('sales');

    return (
        <div style={{maxWidth: 960, margin: '0 auto', padding: 'var(--g-spacing-6)'}}>
            <Flex direction="column" gap={4}>
                <Text variant="header-1">Виджет визуализации</Text>
                <Card type="container" view="outlined" spacing={{p: 4}}>
                    <Flex direction="column" gap={4}>
                        <Flex justifyContent="space-between" alignItems="center" gap={4}>
                            <Text variant="subheader-2">{MODE_TITLES[mode]}</Text>
                            <SegmentedRadioGroup<VizWidgetMode>
                                value={mode}
                                onUpdate={setMode}
                                options={[
                                    {value: 'sales', content: 'Продажи'},
                                    {value: 'monitoring', content: 'Мониторинг'},
                                ]}
                            />
                        </Flex>
                        {mode === 'sales' ? (
                            <VizWidget mode="sales" sales={salesData} />
                        ) : (
                            <VizWidget mode="monitoring" monitoring={monitoringData} />
                        )}
                    </Flex>
                </Card>
                <Text variant="body-2" color="secondary">
                    Оба режима — единый API виджета: поле <code>mode</code> выбирает движок
                    (@gravity-ui/charts для продаж, @gravity-ui/yagr для плотного временного
                    ряда). Бандлы движков подгружаются лениво при первом показе
                    соответствующего режима.
                </Text>
            </Flex>
        </div>
    );
}
