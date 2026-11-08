import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {Button, Icon, Loader, SegmentedRadioGroup, Text, useThemeValue} from '@gravity-ui/uikit';
import {ArrowRotateRight, ChartLine, LayoutList, Pulse} from '@gravity-ui/icons';

import {DataTable} from './DataTable';
import {preloadEngine} from './engines/registry';
import {CATEGORICAL, CHROME} from './palette';
import type {VizDataset, VizMode, VizRenderContext, VizTheme} from './types';
import {VIZ_MODES} from './types';
import {useVizEngine} from './useVizEngine';

import './VisualizationWidget.css';

const MODE_LABELS: Record<VizMode, {title: string; icon: typeof ChartLine}> = {
    sales: {title: 'Продажи', icon: ChartLine},
    monitoring: {title: 'Мониторинг', icon: Pulse},
};

export type VizView = 'chart' | 'table';

export interface VisualizationWidgetProps {
    /** Данные для каждого режима в едином формате. Режим без данных недоступен в переключателе. */
    datasets: Partial<Record<VizMode, VizDataset>>;
    /** Управляемый режим. Если не задан — виджет хранит режим сам. */
    mode?: VizMode;
    /** Режим по умолчанию для неуправляемого варианта. */
    defaultMode?: VizMode;
    onModeChange?: (mode: VizMode) => void;
    /** Заголовок виджета. */
    title?: string;
    /** Высота области графика в px. */
    height?: number;
    /** Тема; по умолчанию берётся из ThemeProvider. */
    theme?: VizTheme;
    /** Фиксированная категориальная палитра (по умолчанию — встроенная проверенная). */
    palette?: readonly string[];
    /** Показывать ли переключатель «График / Таблица». */
    tableView?: boolean;
    /** Вызывается после отрисовки движка. */
    onRender?: (info: {mode: VizMode; library: string; renderTime?: number}) => void;
    onError?: (error: unknown) => void;
    className?: string;
}

export interface VisualizationWidgetRef {
    /** Перерисовать график под новый размер контейнера. */
    reflow: () => void;
}

export const VisualizationWidget = React.forwardRef<VisualizationWidgetRef, VisualizationWidgetProps>(
    function VisualizationWidget(props, ref) {
        const {
            datasets,
            mode: controlledMode,
            defaultMode = 'sales',
            onModeChange,
            title,
            height = 360,
            theme: themeProp,
            palette,
            tableView = true,
            onRender,
            onError,
            className,
        } = props;

        const [uncontrolledMode, setUncontrolledMode] = React.useState<VizMode>(defaultMode);
        const mode = controlledMode ?? uncontrolledMode;
        const [view, setView] = React.useState<VizView>('chart');

        const themeValue = useThemeValue();
        const theme: VizTheme = themeProp ?? (themeValue.includes('dark') ? 'dark' : 'light');

        const {status, engine, error, retry} = useVizEngine(mode);
        const chartRef = React.useRef<ChartKitRef | undefined>(undefined);

        React.useImperativeHandle(ref, () => ({reflow: () => chartRef.current?.reflow()}), []);

        const handleModeChange = (next: VizMode) => {
            if (controlledMode === undefined) {
                setUncontrolledMode(next);
            }
            onModeChange?.(next);
        };

        const ctx = React.useMemo<VizRenderContext>(
            () => ({theme, palette: palette ?? CATEGORICAL[theme]}),
            [theme, palette],
        );

        // Движок может быть «старым» (прошлого режима), пока грузится новый —
        // тогда рисуем его с его же данными и приглушаем, без скачка верстки.
        const renderMode = engine?.mode;
        const renderDataset = renderMode ? datasets[renderMode] : undefined;
        const chartProps = React.useMemo(
            () => (engine && renderDataset ? engine.buildProps(renderDataset, ctx) : undefined),
            [engine, renderDataset, ctx],
        );

        const handleLoad = React.useCallback(
            (data?: {widgetRendering?: number}) => {
                if (engine) {
                    onRender?.({mode: engine.mode, library: engine.library, renderTime: data?.widgetRendering});
                }
            },
            [engine, onRender],
        );
        const handleError = React.useCallback(
            ({error: err}: {error: unknown}) => {
                onError?.(err);
            },
            [onError],
        );

        const activeDataset = datasets[mode];
        const preloadAll = React.useCallback(() => {
            for (const m of VIZ_MODES) {
                if (datasets[m]) {
                    preloadEngine(m);
                }
            }
        }, [datasets]);
        const isStale = status === 'loading' && chartProps !== undefined;
        const chrome = CHROME[theme];

        let body: React.ReactNode;
        if (status === 'error') {
            body = (
                <div className="viz-widget__state">
                    <Text color="danger">Не удалось загрузить движок графиков{error ? `: ${error.message}` : ''}</Text>
                    <Button view="outlined" size="s" onClick={retry}>
                        <Icon data={ArrowRotateRight} size={14} />
                        Повторить
                    </Button>
                </div>
            );
        } else if (!activeDataset) {
            body = (
                <div className="viz-widget__state">
                    <Text color="secondary">Нет данных для этого режима</Text>
                </div>
            );
        } else if (view === 'table') {
            body = <DataTable dataset={activeDataset} />;
        } else if (chartProps) {
            body = (
                <ChartKit
                    key={chartProps.type}
                    ref={chartRef}
                    type={chartProps.type}
                    data={chartProps.data as never}
                    onLoad={handleLoad}
                    onError={handleError}
                    renderPluginLoader={() => <Loader size="m" />}
                />
            );
        } else {
            body = (
                <div className="viz-widget__state">
                    <Loader size="m" />
                </div>
            );
        }

        return (
            <section
                className={['viz-widget', className].filter(Boolean).join(' ')}
                style={
                    {
                        '--viz-surface': chrome.surface,
                        '--viz-grid': chrome.grid,
                        '--viz-axis': chrome.axis,
                        '--viz-muted': chrome.muted,
                    } as React.CSSProperties
                }
                aria-busy={status === 'loading'}
            >
                <header className="viz-widget__header">
                    <div className="viz-widget__heading">
                        {title ? (
                            <Text variant="subheader-2" as="h2" className="viz-widget__title">
                                {title}
                            </Text>
                        ) : null}
                        <Text variant="caption-2" color="secondary" as="div" className="viz-widget__engine">
                            {engine && engine.mode === mode
                                ? `движок: ${engine.library}`
                                : status === 'loading'
                                  ? 'загрузка движка…'
                                  : ' '}
                        </Text>
                    </div>
                    <div className="viz-widget__controls">
                        {/* Предзагружаем чанки движков, пока курсор ещё только на переключателе. */}
                        <div onPointerEnter={preloadAll} onFocusCapture={preloadAll}>
                            <SegmentedRadioGroup<VizMode>
                                size="m"
                                value={mode}
                                onUpdate={handleModeChange}
                                aria-label="Режим визуализации"
                            >
                                {VIZ_MODES.map((m) => {
                                    const {title: label, icon} = MODE_LABELS[m];
                                    return (
                                        <SegmentedRadioGroup.Option key={m} value={m} disabled={!datasets[m]}>
                                            <span className="viz-widget__option">
                                                <Icon data={icon} size={16} />
                                                {label}
                                            </span>
                                        </SegmentedRadioGroup.Option>
                                    );
                                })}
                            </SegmentedRadioGroup>
                        </div>
                        {tableView ? (
                            <Button
                                view="flat"
                                size="m"
                                selected={view === 'table'}
                                onClick={() => setView((v) => (v === 'table' ? 'chart' : 'table'))}
                                aria-pressed={view === 'table'}
                                title={view === 'table' ? 'Показать график' : 'Показать таблицу'}
                            >
                                <Icon data={LayoutList} size={16} />
                            </Button>
                        ) : null}
                    </div>
                </header>
                <div
                    className={['viz-widget__body', isStale ? 'viz-widget__body_stale' : ''].join(' ').trim()}
                    style={{height}}
                >
                    {body}
                    {isStale ? (
                        <div className="viz-widget__overlay">
                            <Loader size="s" />
                        </div>
                    ) : null}
                </div>
            </section>
        );
    },
);
