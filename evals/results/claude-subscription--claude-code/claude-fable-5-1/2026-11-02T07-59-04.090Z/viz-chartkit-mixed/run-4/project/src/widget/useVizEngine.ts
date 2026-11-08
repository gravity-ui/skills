import React from 'react';

import {getLoadedEngine, loadEngine} from './engines/registry';
import type {VizEngine, VizEngineStatus, VizMode} from './types';

export interface VizEngineState {
    status: VizEngineStatus;
    engine: VizEngine | undefined;
    error: Error | undefined;
    retry: () => void;
}

/**
 * Подтягивает движок для режима. Пока новый движок грузится, хук продолжает
 * отдавать предыдущий — виджет держит прошлый кадр вместо скелетона.
 */
export function useVizEngine(mode: VizMode): VizEngineState {
    const [attempt, setAttempt] = React.useState(0);
    const [state, setState] = React.useState<{engine?: VizEngine; error?: Error; loadingMode?: VizMode}>(
        () => ({engine: getLoadedEngine(mode)}),
    );

    React.useEffect(() => {
        const cached = getLoadedEngine(mode);
        if (cached) {
            setState({engine: cached});
            return undefined;
        }
        let cancelled = false;
        setState((prev) => ({engine: prev.engine, loadingMode: mode}));
        loadEngine(mode).then(
            (engine) => {
                if (!cancelled) {
                    setState({engine});
                }
            },
            (error: unknown) => {
                if (!cancelled) {
                    setState((prev) => ({
                        engine: prev.engine,
                        error: error instanceof Error ? error : new Error(String(error)),
                    }));
                }
            },
        );
        return () => {
            cancelled = true;
        };
    }, [mode, attempt]);

    const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

    let status: VizEngineStatus = 'idle';
    if (state.error) {
        status = 'error';
    } else if (state.engine?.mode === mode) {
        status = 'ready';
    } else if (state.loadingMode === mode) {
        status = 'loading';
    }

    return {status, engine: state.engine, error: state.error, retry};
}
