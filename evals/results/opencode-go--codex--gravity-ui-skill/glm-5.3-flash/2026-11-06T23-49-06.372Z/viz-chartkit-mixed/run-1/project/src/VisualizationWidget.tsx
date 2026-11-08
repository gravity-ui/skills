import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import React from 'react';

import {visualizationData} from './visualization-data';
import type {VisualizationMode, VisualizationWidgetProps} from './visualization-types';
import './VisualizationWidget.css';

const GravityChart = React.lazy(async () => {
    const [{GravityChartsPlugin}, {settings}, chartkit] = await Promise.all([
        import('@gravity-ui/chartkit/gravity-charts'),
        import('@gravity-ui/chartkit'),
        import('@gravity-ui/chartkit'),
    ]);

    settings.set({plugins: [GravityChartsPlugin]});

    return {default: chartkit.default<'gravity-charts'>};
});

const MonitoringChart = React.lazy(async () => {
    const [{YagrPlugin}, {settings}, chartkit] = await Promise.all([
        import('@gravity-ui/chartkit/yagr'),
        import('@gravity-ui/chartkit'),
        import('@gravity-ui/chartkit'),
    ]);

    settings.set({plugins: [YagrPlugin]});

    return {default: chartkit.default<'yagr'>};
});

const modeMeta: Record<VisualizationMode, {title: string; caption: string}> = {
    sales: {
        title: 'Продажи по месяцам',
        caption: 'Сравнение заказов и возвратов за полугодие',
    },
    monitoring: {
        title: 'Мониторинг сервиса',
        caption: 'Высокочастотные метрики за последний час',
    },
};

const modeOptions = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
] as const;

export function VisualizationWidget({mode, onModeChange}: VisualizationWidgetProps) {
    const salesData = visualizationData.sales;
    const monitoringData = visualizationData.monitoring;

    return (
        <section className="visualization-widget">
            <header className="visualization-widget__header">
                <h2 className="visualization-widget__title">{modeMeta[mode].title}</h2>
                <p className="visualization-widget__caption">{modeMeta[mode].caption}</p>
            </header>
            <SegmentedRadioGroup<VisualizationMode>
                className="visualization-widget__switcher"
                name="visualization-mode"
                value={mode}
                onUpdate={onModeChange}
                aria-label="Режим визуализации"
            >
                {modeOptions.map((option) => (
                    <SegmentedRadioGroup.Option key={option.value} {...option} />
                ))}
            </SegmentedRadioGroup>
            <div className="visualization-widget__chart">
                {mode === 'sales' ? (
                    <GravityChart type="gravity-charts" data={salesData.data} />
                ) : (
                    <MonitoringChart type="yagr" data={monitoringData} />
                )}
            </div>
        </section>
    );
}
