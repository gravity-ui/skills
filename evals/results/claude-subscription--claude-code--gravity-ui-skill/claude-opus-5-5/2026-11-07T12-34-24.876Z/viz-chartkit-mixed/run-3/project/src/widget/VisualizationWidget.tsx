import React from 'react';

import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {Button, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {
    assertValidDataset,
    countPoints,
    isEmptyDataset,
    toGravityChartsData,
    toYagrData,
} from './adapters';
import {CHARTKIT_TYPE} from './chartkit';
import type {VisualizationEngine, VisualizationView, VisualizationWidgetProps} from './types';

import './VisualizationWidget.css';

const ENGINE_CAPTION: Record<VisualizationEngine, string> = {
    line: 'Линейный график',
    timeseries: 'Плотный временной ряд · выделите область, чтобы приблизить',
};

const numberFormatter = new Intl.NumberFormat('ru-RU');

function PlotMessage({children}: {children: React.ReactNode}) {
    return (
        <Flex className="viz-widget__state" direction="column" alignItems="center" justifyContent="center" gap={3}>
            {children}
        </Flex>
    );
}

function PlotError({message, onRetry}: {message: string; onRetry?: () => void}) {
    return (
        <PlotMessage>
            <Text variant="subheader-1">Не удалось построить график</Text>
            <Text color="secondary" className="viz-widget__error-text">
                {message}
            </Text>
            {onRetry && (
                <Button view="outlined" onClick={onRetry}>
                    Повторить
                </Button>
            )}
        </PlotMessage>
    );
}

const renderPluginLoader = () => (
    <PlotMessage>
        <Loader size="m" />
        <Text color="secondary">Загружаем движок графика…</Text>
    </PlotMessage>
);

const renderError = ({message, resetError}: {message: string; resetError: () => void}) => (
    <PlotError message={message} onRetry={resetError} />
);

interface PlotProps {
    view: VisualizationView;
    onError?: (error: unknown) => void;
}

/** Renders the active view through a single ChartKit entry point, dispatching by engine. */
const Plot = React.forwardRef<ChartKitRef | undefined, PlotProps>(function Plot({view, onError}, ref) {
    const prepared = React.useMemo(() => {
        try {
            assertValidDataset(view.data);
        } catch (error) {
            const reason = error instanceof Error ? error : new Error(String(error));
            return {engine: 'invalid', error: reason} as const;
        }
        return view.engine === 'line'
            ? ({engine: 'line', data: toGravityChartsData(view)} as const)
            : ({engine: 'timeseries', data: toYagrData(view)} as const);
    }, [view]);

    const invalidDataError = prepared.engine === 'invalid' ? prepared.error : undefined;
    React.useEffect(() => {
        if (invalidDataError) {
            onError?.(invalidDataError);
        }
    }, [invalidDataError, onError]);

    if (prepared.engine === 'invalid') {
        return <PlotError message={prepared.error.message} />;
    }

    if (isEmptyDataset(view.data)) {
        return (
            <PlotMessage>
                <Text color="secondary">Нет данных для отображения</Text>
            </PlotMessage>
        );
    }

    const common = {
        ref,
        onError: onError ? ({error}: {error: unknown}) => onError(error) : undefined,
        renderError,
        renderPluginLoader,
    };

    return prepared.engine === 'line' ? (
        <ChartKit {...common} type={CHARTKIT_TYPE.line} data={prepared.data} />
    ) : (
        <ChartKit {...common} type={CHARTKIT_TYPE.timeseries} data={prepared.data} />
    );
});

function VisualizationWidgetInner<Id extends string>(
    {
        title,
        description,
        views,
        view: controlledView,
        defaultView,
        onViewChange,
        height = 360,
        onError,
        className,
    }: VisualizationWidgetProps<Id>,
    ref: React.ForwardedRef<ChartKitRef | undefined>,
) {
    const [uncontrolledView, setUncontrolledView] = React.useState<Id | undefined>(
        defaultView ?? views[0]?.id,
    );
    const activeId = controlledView ?? uncontrolledView;
    const active = views.find((v) => v.id === activeId) ?? views[0];

    const handleUpdate = React.useCallback(
        (id: Id) => {
            if (controlledView === undefined) {
                setUncontrolledView(id);
            }
            onViewChange?.(id);
        },
        [controlledView, onViewChange],
    );

    const titleId = React.useId();

    return (
        <Card view="outlined" className={['viz-widget', className].filter(Boolean).join(' ')}>
            <section aria-labelledby={titleId}>
                <Flex className="viz-widget__header" alignItems="flex-start" justifyContent="space-between" gap={3} wrap>
                    <div className="viz-widget__heading">
                        <Text as="h2" id={titleId} variant="subheader-3" ellipsis>
                            {title}
                        </Text>
                        {description && (
                            <Text as="p" variant="body-1" color="secondary">
                                {description}
                            </Text>
                        )}
                    </div>
                    {views.length > 1 && active && (
                        <SegmentedRadioGroup<Id>
                            className="viz-widget__switcher"
                            aria-label="Режим графика"
                            value={active.id}
                            onUpdate={handleUpdate}
                            options={views.map((v) => ({value: v.id, content: v.label}))}
                        />
                    )}
                </Flex>

                {active && (
                    <Text as="div" variant="caption-2" color="secondary" className="viz-widget__meta">
                        {ENGINE_CAPTION[active.engine]} · Рядов: {active.data.series.length} · Точек:{' '}
                        {numberFormatter.format(countPoints(active.data))}
                    </Text>
                )}

                <div className="viz-widget__plot" style={{height}}>
                    {active ? (
                        // `key` remounts the chart on switch, so each engine starts from a clean state.
                        <Plot key={active.id} ref={ref} view={active} onError={onError} />
                    ) : (
                        <PlotMessage>
                            <Text color="secondary">Нет настроенных представлений</Text>
                        </PlotMessage>
                    )}
                </div>
            </section>
        </Card>
    );
}

/**
 * A single visualization widget with a mode switcher. Every view goes through the same
 * props contract (`VisualizationView`); the engine behind each view is loaded lazily
 * by ChartKit the first time that view is shown.
 *
 * The ref exposes ChartKit's `reflow()` for the active chart (e.g. after a layout change).
 */
export const VisualizationWidget = React.forwardRef(VisualizationWidgetInner) as <Id extends string>(
    props: VisualizationWidgetProps<Id> & {ref?: React.ForwardedRef<ChartKitRef | undefined>},
) => React.JSX.Element;
