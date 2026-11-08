import React from 'react';

import {loadEngine, peekEngine} from './engines/registry';
import type {AnyChartEngine, ChartWidgetMode} from './types';

export type EngineStatus = 'loading' | 'ready' | 'error';

export interface EngineState {
    status: EngineStatus;
    /** Последний готовый движок: пока грузится новый, прежний график остаётся на экране. */
    engine?: AnyChartEngine;
    error?: Error;
}

/** Лениво загружает движок для режима и отслеживает состояние загрузки. */
export function useChartEngine(mode: ChartWidgetMode): EngineState {
    const [state, setState] = React.useState<EngineState>(() => {
        const engine = peekEngine(mode);
        return engine ? {status: 'ready', engine} : {status: 'loading'};
    });

    React.useEffect(() => {
        const ready = peekEngine(mode);
        if (ready) {
            setState({status: 'ready', engine: ready});
            return undefined;
        }

        let cancelled = false;
        setState((prev) => ({status: 'loading', engine: prev.engine}));

        loadEngine(mode).then(
            (engine) => {
                if (!cancelled) {
                    setState({status: 'ready', engine});
                }
            },
            (error: unknown) => {
                if (!cancelled) {
                    setState((prev) => ({
                        status: 'error',
                        engine: prev.engine,
                        error: error instanceof Error ? error : new Error(String(error)),
                    }));
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [mode]);

    return state;
}
