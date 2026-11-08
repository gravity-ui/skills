import './chartkit';
import './ChartWidget.css';

import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {Button, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {toChartKitConfig} from './adapters';
import type {ChartWidgetKind, ChartWidgetView} from './types';

const ENGINE_LABEL: Record<ChartWidgetKind, string> = {
    line: 'Gravity Charts · SVG',
    dense: 'Yagr · canvas',
};

const pointsFormatter = new Intl.NumberFormat('ru-RU');

export interface ChartWidgetProps<Id extends string = string> {
    title?: React.ReactNode;
    views: ChartWidgetView<Id>[];
    /** Активный вид (контролируемый режим). */
    value?: Id;
    /** Вид по умолчанию (неконтролируемый режим). По умолчанию — первый. */
    defaultValue?: Id;
    onUpdate?: (value: Id) => void;
    /** Высота области графика, px. */
    height?: number;
    /** Доступ к `reflow()` активного графика — например, после ресайза контейнера. */
    chartRef?: React.Ref<ChartKitRef | undefined>;
    className?: string;
}

export function ChartWidget<Id extends string = string>({
    title,
    views,
    value,
    defaultValue,
    onUpdate,
    height = 360,
    chartRef,
    className,
}: ChartWidgetProps<Id>) {
    const [innerValue, setInnerValue] = React.useState<Id | undefined>(defaultValue);
    const activeId = value ?? innerValue;
    const view = views.find((item) => item.id === activeId) ?? views[0];
    const theme = useThemeType();

    const handleUpdate = React.useCallback(
        (next: Id) => {
            setInnerValue(next);
            onUpdate?.(next);
        },
        [onUpdate],
    );

    // Пересчитываем конфиг только при смене вида/данных/темы: оба движка
    // сравнивают `data` по ссылке и перерисовываются при каждой новой.
    const config = React.useMemo(
        () => (view ? toChartKitConfig(view.kind, view.data, theme) : undefined),
        [view, theme],
    );

    if (!view || !config) {
        return null;
    }

    const pointsCount = view.data.timeline.length * view.data.series.length;

    return (
        <section className={['chart-widget', className].filter(Boolean).join(' ')}>
            <header className="chart-widget__header">
                {title && (
                    <Text as="h2" variant="subheader-3" className="chart-widget__title">
                        {title}
                    </Text>
                )}
                {views.length > 1 && (
                    <SegmentedRadioGroup<Id>
                        value={view.id}
                        onUpdate={handleUpdate}
                        aria-label="Вид графика"
                    >
                        {views.map((item) => (
                            <SegmentedRadioGroup.Option key={item.id} value={item.id}>
                                {item.label}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                )}
            </header>
            <div className="chart-widget__meta">
                {view.description && <Text color="secondary">{view.description}</Text>}
                <Text color="secondary" variant="caption-2">
                    {pointsFormatter.format(pointsCount)} точек · {ENGINE_LABEL[view.kind]}
                </Text>
            </div>
            <div className="chart-widget__chart" style={{height}}>
                <ChartKit
                    // Разные движки — разные экземпляры: не даём React переиспользовать узел.
                    key={view.id}
                    ref={chartRef}
                    {...config}
                    renderPluginLoader={renderLoader}
                    renderError={renderError}
                />
            </div>
        </section>
    );
}

function renderLoader() {
    return (
        <div className="chart-widget__state">
            <Loader size="m" />
        </div>
    );
}

function renderError({message, resetError}: {message: string; resetError: () => void}) {
    return (
        <div className="chart-widget__state">
            <Text color="danger">{message}</Text>
            <Button view="outlined" onClick={resetError}>
                Повторить
            </Button>
        </div>
    );
}
