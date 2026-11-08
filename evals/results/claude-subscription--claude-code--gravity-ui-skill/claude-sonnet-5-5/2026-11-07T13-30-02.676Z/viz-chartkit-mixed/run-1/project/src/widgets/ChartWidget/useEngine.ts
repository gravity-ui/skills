import React from 'react';

import {ensureEngine} from './engines';
import type {ChartWidgetMode} from './types';

export type EngineState = {status: 'loading'} | {status: 'ready'} | {status: 'error'; error: unknown};

export function useEngine(mode: ChartWidgetMode) {
    const [attempt, setAttempt] = React.useState(0);
    const [state, setState] = React.useState<{mode: ChartWidgetMode; attempt: number; value: EngineState}>();

    React.useEffect(() => {
        let cancelled = false;
        ensureEngine(mode).then(
            () => !cancelled && setState({mode, attempt, value: {status: 'ready'}}),
            (error) => !cancelled && setState({mode, attempt, value: {status: 'error', error}}),
        );
        return () => {
            cancelled = true;
        };
    }, [mode, attempt]);

    // a result that belongs to another mode / attempt is stale → still loading
    const engine: EngineState =
        state && state.mode === mode && state.attempt === attempt ? state.value : {status: 'loading'};
    const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

    return {engine, retry};
}
