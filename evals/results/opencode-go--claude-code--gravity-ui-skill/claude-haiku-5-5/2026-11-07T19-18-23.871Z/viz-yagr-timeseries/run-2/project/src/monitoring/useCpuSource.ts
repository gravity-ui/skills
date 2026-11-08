import {useEffect, useState} from 'react';

import {type CpuSampleSource, createSimulatedCpuSource} from './cpuSource';

/**
 * Создаёт источник данных при монтировании и диспоузит его при размонтировании.
 * Источник создаётся в эффекте, а не в useState-инициализаторе: в StrictMode инициализатор
 * вызывается дважды, и второй экземпляр таймера никогда бы не остановился.
 */
export function useCpuSource(): CpuSampleSource | null {
  const [source, setSource] = useState<CpuSampleSource | null>(null);

  useEffect(() => {
    const next = createSimulatedCpuSource();
    setSource(next);
    return () => {
      next.dispose();
    };
  }, []);

  return source;
}
