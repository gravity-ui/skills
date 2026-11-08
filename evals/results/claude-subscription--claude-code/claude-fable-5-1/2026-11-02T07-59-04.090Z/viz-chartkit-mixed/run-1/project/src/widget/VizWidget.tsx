import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';
import {
    Button,
    Card,
    Label,
    Loader,
    SegmentedRadioGroup,
    Skeleton,
    Switch,
    Text,
    useThemeValue,
} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {ENGINES} from './engines/registry';
import {getSeriesColors, normalizeTheme} from './palette';
import type {VizDataset, VizEngine, VizMode, VizRenderContext} from './types';
import {useEngine} from './useEngine';

import './VizWidget.css';

export interface VizWidgetProps {
    title?: string;
    /** Данные обоих режимов в едином формате `VizDataset`. */
    datasets: Record<VizMode, VizDataset>;
    /** Текущий режим (управляемый вариант). */
    mode?: VizMode;
    /** Начальный режим (неуправляемый вариант). */
    defaultMode?: VizMode;
    onModeChange?: (mode: VizMode) => void;
    /** Высота области графика в пикселях. */
    height?: number;
    className?: string;
    /** Вызывается, когда движок режима загружен и график отрисован этим движком. */
    onEngineReady?: (mode: VizMode, engineLabel: string) => void;
}

const MODE_META: Record<VizMode, {label: string; description: string}> = {
    sales: {label: 'Продажи', description: 'Линейный график по месяцам'},
    monitoring: {label: 'Мониторинг', description: 'Плотный временной ряд, выделите область для зума'},
};

const MODES: VizMode[] = ['sales', 'monitoring'];

interface EngineChartProps<T extends ChartKitType> {
    engine: VizEngine<T>;
    dataset: VizDataset;
    ctx: VizRenderContext;
}

/** Рендер графика любым движком через единый интерфейс `VizEngine`. */
function EngineChart<T extends ChartKitType>({engine, dataset, ctx}: EngineChartProps<T>) {
    const data = React.useMemo(() => engine.buildData(dataset, ctx), [engine, dataset, ctx]);
    // `ChartKitProps<T>` включает отображаемый тип по ключам конкретного плагина, который TS не может
    // свести для обобщённого T. Поля `type` и `data` уже согласованы типом `VizEngine<T>`.
    const props = {type: engine.type, data} as unknown as ChartKitProps<T>;
    return <ChartKit {...props} />;
}

export function VizWidget({
    title,
    datasets,
    mode: modeProp,
    defaultMode = 'sales',
    onModeChange,
    height = 400,
    className,
    onEngineReady,
}: VizWidgetProps) {
    const [innerMode, setInnerMode] = React.useState<VizMode>(defaultMode);
    const mode = modeProp ?? innerMode;
    const [showTable, setShowTable] = React.useState(false);

    const handleModeChange = React.useCallback(
        (next: VizMode) => {
            setInnerMode(next);
            onModeChange?.(next);
        },
        [onModeChange],
    );

    const theme = normalizeTheme(useThemeValue());
    const dataset = datasets[mode];
    const engine = ENGINES[mode];
    const {status, error, retry} = useEngine(mode);

    // Пока новый движок грузится, держим предыдущий график на месте с пониженной прозрачностью.
    const lastReadyRef = React.useRef<VizMode | null>(null);
    if (status === 'ready') {
        lastReadyRef.current = mode;
    }
    const displayMode = status === 'ready' ? mode : lastReadyRef.current;
    const displayDataset = displayMode ? datasets[displayMode] : null;

    const ctx = React.useMemo<VizRenderContext>(
        () => ({theme, colors: getSeriesColors(theme, displayDataset?.series.length ?? 0)}),
        [theme, displayDataset],
    );

    React.useEffect(() => {
        if (status === 'ready') {
            onEngineReady?.(mode, ENGINES[mode].label);
        }
    }, [status, mode, onEngineReady]);

    const renderBody = () => {
        if (showTable) {
            return <DataTable dataset={dataset} />;
        }

        if (status === 'error') {
            return (
                <div className="viz-widget__overlay" role="alert">
                    <Text variant="body-2">Не удалось загрузить движок «{engine.label}»</Text>
                    <Text variant="caption-2" color="secondary">
                        {error?.message}
                    </Text>
                    <Button view="outlined" onClick={retry}>
                        Повторить
                    </Button>
                </div>
            );
        }

        return (
            <React.Fragment>
                {displayMode && displayDataset ? (
                    <div
                        className={`viz-widget__chart${displayMode !== mode ? ' viz-widget__chart_stale' : ''}`}
                        data-engine={ENGINES[displayMode].type}
                        aria-busy={displayMode !== mode}
                    >
                        <EngineChart engine={ENGINES[displayMode]} dataset={displayDataset} ctx={ctx} />
                    </div>
                ) : (
                    <Skeleton style={{height: '100%'}} />
                )}
                {status !== 'ready' && (
                    <div className="viz-widget__overlay">
                        <Loader size="m" />
                        <Text variant="caption-2" color="secondary">
                            Загружаем движок «{engine.label}»…
                        </Text>
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <Card view="outlined" className={`viz-widget${className ? ` ${className}` : ''}`}>
            <div className="viz-widget__header">
                <div className="viz-widget__heading">
                    {title && <Text variant="subheader-2">{title}</Text>}
                    <Text variant="caption-2" color="secondary">
                        {MODE_META[mode].description}
                    </Text>
                </div>
                <div className="viz-widget__controls">
                    <SegmentedRadioGroup<VizMode>
                        value={mode}
                        onUpdate={handleModeChange}
                        size="m"
                        aria-label="Режим визуализации"
                    >
                        {MODES.map((item) => (
                            <SegmentedRadioGroup.Option key={item} value={item}>
                                {MODE_META[item].label}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                    <Switch checked={showTable} onUpdate={setShowTable} size="m">
                        Таблица
                    </Switch>
                </div>
            </div>

            <div className="viz-widget__body" style={{height}}>
                {renderBody()}
            </div>

            <div className="viz-widget__footer">
                <Text variant="caption-2" color="secondary">
                    Движок:
                </Text>
                <Label size="xs" theme={status === 'ready' ? 'success' : status === 'error' ? 'danger' : 'normal'}>
                    {engine.label}
                </Label>
                <Text variant="caption-2" color="secondary">
                    {status === 'ready' ? 'загружен' : status === 'error' ? 'ошибка загрузки' : 'загружается…'}
                </Text>
                {dataset.unit && (
                    <Text variant="caption-2" color="secondary">
                        · {dataset.series.length} серий · {dataset.timeline.length} точек · {dataset.unit}
                    </Text>
                )}
            </div>
        </Card>
    );
}
