import React from 'react';

import {isEngineReady, loadEngine} from './engines';
import type {EngineType} from './engines';

export type EngineState = {status: 'loading'} | {status: 'ready'} | {status: 'error'; error: unknown};

export function useEngine(engine: EngineType) {
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<{engine: EngineType; value: EngineState}>(() => ({
    engine,
    value: isEngineReady(engine) ? {status: 'ready'} : {status: 'loading'},
  }));

  React.useEffect(() => {
    if (isEngineReady(engine)) {
      setState({engine, value: {status: 'ready'}});
      return;
    }

    let cancelled = false;
    setState({engine, value: {status: 'loading'}});
    loadEngine(engine).then(
      () => !cancelled && setState({engine, value: {status: 'ready'}}),
      (error: unknown) => !cancelled && setState({engine, value: {status: 'error', error}}),
    );
    return () => {
      cancelled = true;
    };
  }, [engine, attempt]);

  // Right after `engine` changes, the state still describes the previous engine.
  const value: EngineState =
    state.engine === engine ? state.value : isEngineReady(engine) ? {status: 'ready'} : {status: 'loading'};

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);
  return {...value, retry} as EngineState & {retry: () => void};
}
