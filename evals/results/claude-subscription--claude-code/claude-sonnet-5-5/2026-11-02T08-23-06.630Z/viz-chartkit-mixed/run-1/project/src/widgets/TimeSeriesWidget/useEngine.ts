import React from 'react';

import {ENGINE_BY_MODE, loadEngine} from './engines';
import type {TimeSeriesMode} from './types';

type EngineState =
  | {status: 'loading'}
  | {status: 'ready'; ChartKit: Awaited<ReturnType<typeof loadEngine>>}
  | {status: 'error'; error: Error};

/** Лениво подгружает движок активного режима; статус привязан к режиму, без «мигания» чужим графиком. */
export function useEngine(mode: TimeSeriesMode, attempt = 0) {
  const [state, setState] = React.useState<{mode: TimeSeriesMode; attempt: number; value: EngineState}>({
    mode,
    attempt,
    value: {status: 'loading'},
  });

  React.useEffect(() => {
    let cancelled = false;
    loadEngine(ENGINE_BY_MODE[mode]).then(
      (ChartKit) => !cancelled && setState({mode, attempt, value: {status: 'ready', ChartKit}}),
      (error) =>
        !cancelled &&
        setState({mode, attempt, value: {status: 'error', error: error instanceof Error ? error : new Error(String(error))}}),
    );
    return () => {
      cancelled = true;
    };
  }, [mode, attempt]);

  // результат от предыдущего режима/попытки считаем «ещё грузится»
  return state.mode === mode && state.attempt === attempt ? state.value : ({status: 'loading'} as EngineState);
}
