import {useEffect, useRef, useState} from 'react';
import {CpuBuffer, type CpuDataSource, type CpuSnapshot} from './cpu-data';

export function useCpuFeed(source: CpuDataSource, live: boolean) {
  const liveRef = useRef(live);
  liveRef.current = live;
  const [snapshot, setSnapshot] = useState<CpuSnapshot>({timeline: [], values: [], current: 0, average: 0, maximum: 0, p95: 0});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const publishRef = useRef<() => void>(() => {});

  useEffect(() => {
    const controller = new AbortController();
    const data = new CpuBuffer();
    let unsubscribe: (() => void) | undefined;
    let pending: number | undefined;
    setStatus('loading');

    const publish = () => {
      if (!controller.signal.aborted && liveRef.current) setSnapshot(data.snapshot());
    };
    publishRef.current = publish;

    source.loadHistory(controller.signal).then((history) => {
      if (controller.signal.aborted) return;
      data.append(history);
      setSnapshot(data.snapshot());
      setStatus('ready');
      unsubscribe = source.subscribe((samples) => {
        if (controller.signal.aborted) return;
        data.append(samples);
        // Coalesce arbitrarily frequent source messages; React and Canvas update at most 4 times/s.
        if (pending === undefined && liveRef.current) {
          pending = window.setTimeout(() => { pending = undefined; publish(); }, 250);
        }
      }, () => {
        if (!controller.signal.aborted) setStatus('error');
      });
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error');
    });

    return () => {
      controller.abort();
      unsubscribe?.();
      if (pending !== undefined) window.clearTimeout(pending);
    };
  }, [source, attempt]);

  useEffect(() => { if (live) publishRef.current(); }, [live]);

  return {snapshot, status, retry: () => setAttempt((value) => value + 1)};
}
