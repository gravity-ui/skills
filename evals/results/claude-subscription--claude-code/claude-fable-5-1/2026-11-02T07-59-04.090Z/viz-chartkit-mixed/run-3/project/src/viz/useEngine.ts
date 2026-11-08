import React from 'react';

import {getLoadedEngine, loadEngine} from './engines/registry';
import type {VizEngine, VizEngineType} from './types';

export interface EngineState {
    /** Движок, который можно рисовать прямо сейчас (может быть предыдущим, пока грузится новый). */
    engine: VizEngine | undefined;
    /** Какой тип сейчас подгружается (если отличается от `engine.type`). */
    loadingType: VizEngineType | undefined;
    error: Error | undefined;
    retry: () => void;
}

/**
 * Лениво подгружает движок под запрошенный тип. Пока новый чанк едет, отдаёт
 * прежний движок — виджет держит кадр, а не показывает скелет.
 */
export function useEngine(type: VizEngineType): EngineState {
    const [engine, setEngine] = React.useState<VizEngine | undefined>(() => getLoadedEngine(type));
    const [error, setError] = React.useState<Error | undefined>();
    const [attempt, setAttempt] = React.useState(0);

    React.useEffect(() => {
        const ready = getLoadedEngine(type);
        if (ready) {
            setEngine(ready);
            setError(undefined);
            return undefined;
        }

        let cancelled = false;
        loadEngine(type).then(
            (loaded) => {
                if (!cancelled) {
                    setEngine(loaded);
                    setError(undefined);
                }
            },
            (reason: unknown) => {
                if (!cancelled) {
                    setError(reason instanceof Error ? reason : new Error(String(reason)));
                }
            },
        );
        return () => {
            cancelled = true;
        };
    }, [type, attempt]);

    const retry = React.useCallback(() => {
        setError(undefined);
        setAttempt((n) => n + 1);
    }, []);

    const loadingType = engine?.type === type || error ? undefined : type;

    return {engine, loadingType, error, retry};
}
