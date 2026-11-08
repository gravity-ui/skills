import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import {Button, SegmentedRadioGroup, Skeleton, Text, useThemeType} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {limitSeries, resolveDataset} from './data';
import {preloadEngine} from './engines/registry';
import {getSeriesColors} from './palette';
import type {ChartWidgetMode, ChartWidgetProps, EngineContext} from './types';
import {CHART_WIDGET_MODES} from './types';
import {useChartEngine} from './useChartEngine';

import './ChartWidget.css';

const DEFAULT_MODE_LABELS: Record<ChartWidgetMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

/**
 * Единый виджет визуализации. Режим выбирает движок (SVG gravity-charts для
 * разреженного ряда продаж, canvas yagr для плотного ряда мониторинга), движок
 * загружается лениво и регистрируется в ChartKit при первом использовании.
 */
export function ChartWidget(props: ChartWidgetProps) {
    const {data, defaultMode = 'sales', onModeChange, title, height = 360, modeLabels, className} = props;

    const isControlled = props.mode !== undefined;
    const [innerMode, setInnerMode] = React.useState<ChartWidgetMode>(defaultMode);
    const mode = isControlled ? (props.mode as ChartWidgetMode) : innerMode;

    const handleModeChange = React.useCallback(
        (next: ChartWidgetMode) => {
            if (!isControlled) {
                setInnerMode(next);
            }
            onModeChange?.(next);
        },
        [isControlled, onModeChange],
    );

    const preloadOtherEngines = React.useCallback(() => {
        CHART_WIDGET_MODES.filter((m) => m !== mode).forEach(preloadEngine);
    }, [mode]);

    const [view, setView] = React.useState<'chart' | 'table'>('chart');
    const theme = useThemeType();
    const colors = React.useMemo(() => getSeriesColors(theme), [theme]);

    const {status, engine, error} = useChartEngine(mode);

    // Пока новый движок грузится, на экране остаётся предыдущий график (приглушённый).
    const renderMode = engine?.mode ?? mode;
    const dataset = React.useMemo(() => {
        const resolved = resolveDataset(data, renderMode);
        return resolved ? limitSeries(resolved) : undefined;
    }, [data, renderMode]);

    const ctx = React.useMemo<EngineContext>(() => ({theme, colors, lang: 'ru'}), [theme, colors]);

    const chartData = React.useMemo(() => {
        if (!engine || !dataset) {
            return undefined;
        }
        return engine.buildData(dataset, ctx);
    }, [engine, dataset, ctx]);

    const isStale = status === 'loading' && Boolean(engine);
    const tableDataset = React.useMemo(() => {
        const resolved = resolveDataset(data, mode);
        return resolved ? limitSeries(resolved) : undefined;
    }, [data, mode]);

    let body: React.ReactNode;
    if (view === 'table') {
        body = tableDataset ? (
            <div className="chart-widget__table-wrap" style={{maxHeight: height}}>
                <DataTable dataset={tableDataset} mode={mode} colors={colors} />
            </div>
        ) : (
            <EmptyState text="Нет данных для этого режима" />
        );
    } else if (status === 'error' && !engine) {
        body = <EmptyState text={`Не удалось загрузить движок графика: ${error?.message ?? ''}`} />;
    } else if (!engine || !chartData) {
        body = <Skeleton className="chart-widget__skeleton" style={{height}} />;
    } else if (!dataset) {
        body = <EmptyState text="Нет данных для этого режима" />;
    } else {
        body = (
            <div
                className={cx('chart-widget__chart', isStale && 'chart-widget__chart_stale')}
                style={{height}}
                aria-busy={isStale || undefined}
            >
                <ChartKit
                    key={engine.type}
                    type={engine.type}
                    data={chartData as never}
                    renderPluginLoader={() => <Skeleton className="chart-widget__skeleton" style={{height}} />}
                />
            </div>
        );
    }

    return (
        <section className={cx('chart-widget', className)} data-mode={mode} data-engine={engine?.type}>
            <header className="chart-widget__header">
                <div className="chart-widget__heading">
                    {title ? (
                        <Text variant="subheader-2" as="h2" className="chart-widget__title">
                            {title}
                        </Text>
                    ) : null}
                    {tableDataset?.valueLabel ? (
                        <Text variant="body-1" color="secondary">
                            {tableDataset.valueLabel}
                        </Text>
                    ) : null}
                </div>
                <div className="chart-widget__controls">
                    {/* Наведение на переключатель предзагружает движки остальных режимов. */}
                    <div onPointerEnter={preloadOtherEngines} onFocus={preloadOtherEngines}>
                        <SegmentedRadioGroup<ChartWidgetMode>
                            size="m"
                            value={mode}
                            onUpdate={handleModeChange}
                            aria-label="Режим графика"
                        >
                            {CHART_WIDGET_MODES.map((m) => (
                                <SegmentedRadioGroup.Option key={m} value={m}>
                                    {modeLabels?.[m] ?? DEFAULT_MODE_LABELS[m]}
                                </SegmentedRadioGroup.Option>
                            ))}
                        </SegmentedRadioGroup>
                    </div>
                    <Button
                        view="outlined"
                        size="m"
                        selected={view === 'table'}
                        onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}
                        aria-pressed={view === 'table'}
                        title={view === 'chart' ? 'Показать таблицу' : 'Показать график'}
                    >
                        {view === 'chart' ? 'Таблица' : 'График'}
                    </Button>
                </div>
            </header>
            {body}
            {status === 'error' && engine ? (
                <Text color="danger" variant="body-1" className="chart-widget__error">
                    Не удалось загрузить движок «{modeLabels?.[mode] ?? DEFAULT_MODE_LABELS[mode]}»:{' '}
                    {error?.message}
                </Text>
            ) : null}
        </section>
    );
}

function EmptyState({text}: {text: string}) {
    return (
        <div className="chart-widget__empty">
            <Text color="secondary">{text}</Text>
        </div>
    );
}

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(' ');
}
