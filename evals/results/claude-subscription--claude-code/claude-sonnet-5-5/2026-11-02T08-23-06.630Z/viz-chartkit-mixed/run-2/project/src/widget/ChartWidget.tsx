import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import {Button, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import {ENGINE_TYPE, loadEngine} from './engines';
import {MODE_LABELS} from './types';
import type {ChartWidgetProps, WidgetMode} from './types';

const MODES: WidgetMode[] = ['sales', 'monitoring'];

const DEFAULT_TITLES: Record<WidgetMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

type EngineState =
    | {mode: WidgetMode; status: 'loading'}
    | {mode: WidgetMode; status: 'ready'}
    | {mode: WidgetMode; status: 'error'; error: unknown};

/**
 * Подгружает движок режима; `retry` повторяет после сетевой ошибки.
 * Состояние привязано к режиму: пока эффект не отработал после смены режима,
 * результат прошлого режима считается «loading», а не «ready».
 */
function useEngine(mode: WidgetMode) {
    const [state, setState] = React.useState<EngineState>({mode, status: 'loading'});
    const [attempt, setAttempt] = React.useState(0);

    React.useEffect(() => {
        let cancelled = false;
        setState({mode, status: 'loading'});
        loadEngine(mode).then(
            () => !cancelled && setState({mode, status: 'ready'}),
            (error) => !cancelled && setState({mode, status: 'error', error}),
        );
        return () => {
            cancelled = true;
        };
    }, [mode, attempt]);

    const current: EngineState = state.mode === mode ? state : {mode, status: 'loading'};
    return {state: current, retry: () => setAttempt((n) => n + 1)};
}

export function ChartWidget(props: ChartWidgetProps) {
    const {
        data,
        mode: controlledMode,
        defaultMode = 'sales',
        onModeChange,
        title,
        unit,
        height = 360,
        yMin,
        yMax,
        timeZone,
        className,
    } = props;

    const [innerMode, setInnerMode] = React.useState<WidgetMode>(defaultMode);
    const mode = controlledMode ?? innerMode;

    const handleModeChange = (next: WidgetMode) => {
        if (controlledMode === undefined) {
            setInnerMode(next);
        }
        onModeChange?.(next);
    };

    const {state, retry} = useEngine(mode);

    const resolvedTitle =
        typeof title === 'string' ? title : (title?.[mode] ?? DEFAULT_TITLES[mode]);

    const chartProps = React.useMemo(() => {
        const opts = {unit: unit?.[mode], yMin, yMax, timeZone};
        return mode === 'sales'
            ? ({type: 'gravity-charts', data: toGravityChartsData(data.sales, opts)} as const)
            : ({type: 'yagr', data: toYagrData(data.monitoring, opts)} as const);
    }, [mode, data, unit, yMin, yMax, timeZone]);

    return (
        <section className={className} aria-label={resolvedTitle}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 12,
                }}
            >
                <Text variant="subheader-3">{resolvedTitle}</Text>
                <SegmentedRadioGroup
                    value={mode}
                    onUpdate={(value) => handleModeChange(value as WidgetMode)}
                    aria-label="Режим графика"
                >
                    {MODES.map((m) => (
                        <SegmentedRadioGroup.Option key={m} value={m}>
                            {MODE_LABELS[m]}
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>
            </div>

            <div style={{height, position: 'relative'}} data-engine={ENGINE_TYPE[mode]}>
                {state.status === 'loading' && (
                    <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
                        <Loader size="m" />
                    </div>
                )}
                {state.status === 'error' && (
                    <div
                        role="alert"
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                        }}
                    >
                        <Text color="danger">Не удалось загрузить движок графика</Text>
                        <Button onClick={retry}>Повторить</Button>
                    </div>
                )}
                {/* key: при смене режима движок монтируется заново, а не переиспользуется */}
                {state.status === 'ready' && <ChartKit key={mode} {...chartProps} />}
            </div>
        </section>
    );
}
