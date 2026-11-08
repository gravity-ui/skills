import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import type {GravityChartsWidgetData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

export type VisualizationMode = 'sales' | 'monitoring';

export type VisualizationWidgetData = {
    sales: GravityChartsWidgetData['data'];
    monitoring: YagrWidgetData;
};

export type VisualizationWidgetProps = {
    data: VisualizationWidgetData;
    mode: VisualizationMode;
    onModeChange: (mode: VisualizationMode) => void;
};

settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});

const modes = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
] as const;

export function VisualizationWidget({data, mode, onModeChange}: VisualizationWidgetProps) {
    return (
        <section style={{display: 'grid', gap: 16, minWidth: 0}}>
            <header style={{display: 'grid', gap: 8}}>
                <Text variant="header-1">Визуализация</Text>
                <SegmentedRadioGroup<VisualizationMode>
                    aria-label="Режим визуализации"
                    onUpdate={onModeChange}
                    value={mode}
                >
                    {modes.map(({content, value}) => (
                        <SegmentedRadioGroup.Option content={content} key={value} value={value} />
                    ))}
                </SegmentedRadioGroup>
            </header>

            <div style={{height: 360}}>
                <ChartKit
                    data={data[mode]}
                    type={mode === 'sales' ? 'gravity-charts' : 'yagr'}
                />
            </div>
        </section>
    );
}
