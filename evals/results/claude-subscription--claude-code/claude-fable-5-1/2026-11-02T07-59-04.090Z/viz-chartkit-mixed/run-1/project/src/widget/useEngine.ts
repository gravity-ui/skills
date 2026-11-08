import React from 'react';

import {isEngineLoaded, loadEngine} from './engines/registry';
import type {VizEngineStatus, VizMode} from './types';

interface EngineState {
    mode: VizMode;
    status: VizEngineStatus;
    error: Error | null;
}

export interface UseEngineResult {
    status: VizEngineStatus;
    error: Error | null;
    /** Повторить загрузку после ошибки. */
    retry: () => void;
}

function toError(reason: unknown): Error {
    return reason instanceof Error ? reason : new Error(String(reason));
}

/** Следит за загрузкой движка для текущего режима и отдаёт её статус. */
export function useEngine(mode: VizMode): UseEngineResult {
    const [attempt, setAttempt] = React.useState(0);
    const [state, setState] = React.useState<EngineState>(() => ({
        mode,
        status: isEngineLoaded(mode) ? 'ready' : 'idle',
        error: null,
    }));

    React.useEffect(() => {
        if (isEngineLoaded(mode)) {
            setState({mode, status: 'ready', error: null});
            return undefined;
        }

        let cancelled = false;
        setState({mode, status: 'loading', error: null});

        loadEngine(mode).then(
            () => {
                if (!cancelled) {
                    setState({mode, status: 'ready', error: null});
                }
            },
            (reason: unknown) => {
                if (!cancelled) {
                    setState({mode, status: 'error', error: toError(reason)});
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [mode, attempt]);

    const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

    // Между сменой режима и срабатыванием эффекта состояние ещё относится к прошлому режиму.
    if (state.mode !== mode) {
        return {status: isEngineLoaded(mode) ? 'ready' : 'loading', error: null, retry};
    }

    return {status: state.status, error: state.error, retry};
}
