import {useCallback, useEffect, useState} from 'react';
import {settings} from '@gravity-ui/chartkit';
import type {ChartKitType} from '@gravity-ui/chartkit';

import type {VizEngine} from './types';

/** ChartKit plugin types the widget can dispatch to. */
export type EngineChartKitType = Extract<ChartKitType, 'gravity-charts' | 'yagr'>;

export const ENGINE_TO_CHARTKIT_TYPE: Record<VizEngine, EngineChartKitType> = {
    line: 'gravity-charts',
    timeseries: 'yagr',
};

/**
 * Lazy plugin registration.
 *
 * Each plugin entry (`@gravity-ui/chartkit/<plugin>`) is imported with a dynamic
 * `import()`, so the bundler emits it as a separate chunk together with its
 * charting library. The chunk is fetched the first time a view needs that
 * engine; `settings.set` merges plugins, so registering one does not drop the other.
 */
const loaders: Record<EngineChartKitType, () => Promise<void>> = {
    'gravity-charts': async () => {
        const {GravityChartsPlugin} = await import('@gravity-ui/chartkit/gravity-charts');
        settings.set({plugins: [GravityChartsPlugin]});
    },
    yagr: async () => {
        const {YagrPlugin} = await import('@gravity-ui/chartkit/yagr');
        settings.set({plugins: [YagrPlugin]});
    },
};

const inflight = new Map<EngineChartKitType, Promise<void>>();

export function isEngineLoaded(type: EngineChartKitType): boolean {
    return settings.get('plugins').some((plugin) => plugin.type === type);
}

export function loadEngine(type: EngineChartKitType): Promise<void> {
    if (isEngineLoaded(type)) {
        return Promise.resolve();
    }

    let promise = inflight.get(type);

    if (!promise) {
        promise = loaders[type]().catch((error: unknown) => {
            inflight.delete(type);
            throw error;
        });
        inflight.set(type, promise);
    }

    return promise;
}

export type EngineStatus =
    | {state: 'loading'}
    | {state: 'ready'}
    | {state: 'error'; error: Error};

/** Tracks lazy loading of the plugin for `type`; returns status and a retry callback. */
export function useEngine(type: EngineChartKitType): [EngineStatus, () => void] {
    const [status, setStatus] = useState<EngineStatus>(() =>
        isEngineLoaded(type) ? {state: 'ready'} : {state: 'loading'},
    );
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;

        if (isEngineLoaded(type)) {
            setStatus({state: 'ready'});
            return undefined;
        }

        setStatus({state: 'loading'});
        loadEngine(type).then(
            () => {
                if (!cancelled) {
                    setStatus({state: 'ready'});
                }
            },
            (error: unknown) => {
                if (!cancelled) {
                    setStatus({
                        state: 'error',
                        error: error instanceof Error ? error : new Error(String(error)),
                    });
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [type, attempt]);

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    return [status, retry];
}
