import {DAY_MS, type CpuSample} from './cpuData';

export interface CpuSource {
  loadHistory(options: {from: number; to: number; signal: AbortSignal}): Promise<readonly CpuSample[]>;
  /** Subscribe before loading history to avoid losing points during the request.
   * Batches are chronological, timestamps are Unix milliseconds, CPU is 0–100.
   * The returned function must close the transport and remove its listeners.
   */
  subscribe(onSamples: (samples: readonly CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

function valueAt(timestamp: number) {
  const t = timestamp / 1000;
  const baseline = 33 + 14 * Math.sin(t / 7100) + 7 * Math.sin(t / 930);
  const spike = 30 * Math.pow(Math.max(0, Math.sin(t / 2500)), 18);
  return Math.round(Math.min(100, Math.max(0, baseline + spike + 3 * Math.sin(t * 1.7))) * 10) / 10;
}

/** Demo adapter. Replace this object with an API/WebSocket adapter in production. */
export const demoCpuSource: CpuSource = {
  async loadHistory({from, to, signal}) {
    signal.throwIfAborted();
    const points: CpuSample[] = [];
    for (let timestamp = Math.ceil(Math.max(from, to - DAY_MS) / 2000) * 2000;
      timestamp <= to; timestamp += 2000) {
      points.push({timestamp, value: valueAt(timestamp)});
    }
    return points;
  },
  subscribe(onSamples) {
    const timer = window.setInterval(() => {
      const timestamp = Math.floor(Date.now() / 2000) * 2000;
      onSamples([{timestamp, value: valueAt(timestamp)}]);
    }, 2000);
    return () => window.clearInterval(timer);
  },
};
