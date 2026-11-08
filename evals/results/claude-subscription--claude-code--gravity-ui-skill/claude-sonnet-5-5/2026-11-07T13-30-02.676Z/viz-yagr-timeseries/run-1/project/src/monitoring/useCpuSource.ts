import React from 'react';

import {createCpuStream, type CpuSource} from './cpuStream';

/** Stable source for the lifetime of the component (StrictMode-safe). */
export function useCpuSource(): CpuSource {
  const ref = React.useRef<CpuSource>();
  ref.current ??= createCpuStream();
  return ref.current;
}
