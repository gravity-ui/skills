import React from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {Button, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {ENGINE_BY_MODE, preloadEngine} from './engines/registry';
import {MAX_SERIES, resolveSeriesColors} from './palette';
import {useEngine} from './useEngine';
import {VizTable} from './VizTable';
import type {VizChartProps, VizDataset, VizEngineType, VizMode} from './types';

import './VizWidget.css';

settings.set({lang: 'ru'});

const MODES: VizMode[] = ['sales', 'monitoring'];

const MODE_LABELS: Record<VizMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

type ViewMode = 'chart' | 'table';

export interface VizWidgetProps {
    /** Данные для каждого режима в едином формате. */
    datasets: Record<VizMode, VizDataset>;
    /** Контролируемый режим. Если не задан — виджет хранит режим сам. */
    mode?: VizMode;
    defaultMode?: VizMode;
    onModeChange?: (mode: VizMode) => void;
    /** Высота области графика в px. */
    height?: number;
    className?: string;
}

export function VizWidget({
    datasets,
    mode: modeProp,
    defaultMode = 'sales',
    onModeChange,
    height = 360,
    className,
}: VizWidgetProps) {
    const [innerMode, setInnerMode] = React.useState<VizMode>(defaultMode);
    const mode = modeProp ?? innerMode;
    const [view, setView] = React.useState<ViewMode>('chart');

    const handleModeChange = React.useCallback(
        (next: VizMode) => {
            if (modeProp === undefined) {
                setInnerMode(next);
            }
            onModeChange?.(next);
        },
        [modeProp, onModeChange],
    );

    // Пользователь навёл курсор на переключатель — заранее тянем чанки остальных движков.
    const preloadOthers = React.useCallback(() => {
        MODES.filter((m) => m !== mode).forEach((m) => preloadEngine(ENGINE_BY_MODE[m]));
    }, [mode]);

    const engineType = ENGINE_BY_MODE[mode];
    const {engine, loadingType, error, retry} = useEngine(engineType);
    const theme = useThemeType();

    const dataset = datasets[mode];
    if (dataset.series.length > MAX_SERIES) {
        throw new Error(
            `VizWidget: слишком много серий (${dataset.series.length}), максимум ${MAX_SERIES}. Сверните лишние в «Прочее».`,
        );
    }
    const colors = React.useMemo(() => resolveSeriesColors(dataset.series, theme), [dataset.series, theme]);

    // Пока грузится новый движок, рисуем прежний движок с его же данными:
    // кадр держится, но данные одного режима не попадают в движок другого.
    const visibleMode = engine && engine.type !== engineType ? modeForEngine(engine.type) : mode;
    const visibleDataset = datasets[visibleMode];
    const visibleColors = React.useMemo(
        () => resolveSeriesColors(visibleDataset.series, theme),
        [visibleDataset.series, theme],
    );

    const chartProps = React.useMemo<VizChartProps | undefined>(() => {
        if (!engine) {
            return undefined;
        }
        return engine.build(visibleDataset, {theme, lang: 'ru', colors: visibleColors});
    }, [engine, visibleDataset, theme, visibleColors]);

    const chartRef = React.useRef<ChartKitRef | undefined>(undefined);
    React.useEffect(() => {
        chartRef.current?.reflow?.();
    }, [view, height]);

    const points = dataset.timeline.length;

    return (
        <section className={['viz-widget', className].filter(Boolean).join(' ')} aria-label={dataset.title}>
            <header className="viz-widget__header">
                <div className="viz-widget__heading">
                    <Text variant="subheader-2">{dataset.title}</Text>
                    <Text variant="caption-2" color="secondary">
                        {`${dataset.series.length} серии · ${points.toLocaleString('ru-RU')} точек`}
                        {loadingType ? ' · загрузка движка…' : ''}
                    </Text>
                </div>
                <div className="viz-widget__controls" onMouseEnter={preloadOthers} onFocusCapture={preloadOthers}>
                    <SegmentedRadioGroup<VizMode>
                        size="m"
                        value={mode}
                        onUpdate={handleModeChange}
                        aria-label="Режим графика"
                    >
                        {MODES.map((m) => (
                            <SegmentedRadioGroup.Option key={m} value={m} content={MODE_LABELS[m]} />
                        ))}
                    </SegmentedRadioGroup>
                    <SegmentedRadioGroup<ViewMode>
                        size="m"
                        value={view}
                        onUpdate={setView}
                        aria-label="Представление"
                    >
                        <SegmentedRadioGroup.Option value="chart" content="График" />
                        <SegmentedRadioGroup.Option value="table" content="Таблица" />
                    </SegmentedRadioGroup>
                </div>
            </header>

            {view === 'table' ? (
                <VizTable dataset={dataset} colors={colors} />
            ) : (
                <div
                    className={['viz-widget__chart', loadingType ? 'viz-widget__chart_loading' : '']
                        .filter(Boolean)
                        .join(' ')}
                    style={{height}}
                    aria-busy={Boolean(loadingType)}
                >
                    {error ? (
                        <div className="viz-widget__state" role="alert">
                            <Text color="danger">{`Не удалось загрузить движок «${engineType}»: ${error.message}`}</Text>
                            <Button view="outlined" size="m" onClick={retry}>
                                Повторить
                            </Button>
                        </div>
                    ) : chartProps ? (
                        renderChart(chartProps, chartRef)
                    ) : (
                        <div className="viz-widget__state">
                            <Loader size="m" />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

/** Сужаем объединение пропсов по дискриминанту `type`, чтобы дженерик ChartKit вывелся точно. */
function renderChart(props: VizChartProps, ref: React.MutableRefObject<ChartKitRef | undefined>) {
    switch (props.type) {
        case 'yagr':
            return <ChartKit ref={ref} {...props} />;
        case 'gravity-charts':
            return <ChartKit ref={ref} {...props} />;
        default:
            return null;
    }
}

function modeForEngine(type: VizEngineType): VizMode {
    return MODES.find((m) => ENGINE_BY_MODE[m] === type) ?? 'sales';
}
