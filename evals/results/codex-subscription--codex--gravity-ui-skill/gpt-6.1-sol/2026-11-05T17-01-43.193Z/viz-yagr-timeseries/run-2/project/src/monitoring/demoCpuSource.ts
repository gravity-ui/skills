import {DAY_MS, type CpuSource} from './cpuData';

const STEP_MS = 2_000;

function sample(timestamp: number) {
  const t = timestamp / STEP_MS;
  const wave = 35 + 14 * Math.sin(t / 2500) + 8 * Math.sin(t / 170);
  const peak = 28 * Math.max(0, Math.sin(t / 530)) ** 12;
  return {timestamp, value: Math.min(100, Math.max(0, wave + peak + 4 * Math.sin(t * 1.7)))};
}

/** Demo only. Replace with an HTTP history request and a WebSocket/SSE subscription. */
export const demoCpuSource: CpuSource = {
  async loadHistory(from, to, signal) {
    signal.throwIfAborted();
    const end = Math.floor(to / STEP_MS) * STEP_MS;
    const start = Math.ceil(Math.max(from, end - DAY_MS) / STEP_MS) * STEP_MS;
    return Array.from({length: Math.floor((end - start) / STEP_MS) + 1}, (_, i) =>
      sample(start + i * STEP_MS),
    );
  },
  subscribe(onSamples) {
    let last = Math.floor(Date.now() / STEP_MS) * STEP_MS;
    const timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / STEP_MS) * STEP_MS;
      // Bound catch-up work after the browser has suspended a background tab.
      last = Math.max(last, now - DAY_MS);
      const samples = [];
      while (last < now) {
        last += STEP_MS;
        samples.push(sample(last));
      }
      if (samples.length) onSamples(samples);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  },
};
