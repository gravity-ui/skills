import {describe, expect, it, vi} from 'vitest';

import {SimulatedCpuLoadSource} from './cpuLoadSource';

describe('SimulatedCpuLoadSource', () => {
  it('заполняет окно историей нужного размера с равномерным шагом', () => {
    let now = 1_000_000;
    const source = new SimulatedCpuLoadSource({intervalMs: 100, windowMs: 10_000, now: () => now});
    const {timeline, values} = source.getSnapshot();

    expect(timeline).toHaveLength(100);
    expect(values).toHaveLength(100);
    expect(timeline[timeline.length - 1]).toBe(now);
    expect(timeline[1] - timeline[0]).toBe(100);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('на каждом тике добавляет одну точку, держит окно и уведомляет подписчиков', () => {
    let now = 1_000_000;
    const source = new SimulatedCpuLoadSource({intervalMs: 100, windowMs: 10_000, now: () => now});
    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);

    now += 100;
    source.tick();

    expect(listener).toHaveBeenCalledTimes(1);
    const batch = listener.mock.calls[0][0];
    expect(batch.timeline).toEqual([now]);
    expect(batch.values).toHaveLength(1);

    const snapshot = source.getSnapshot();
    expect(snapshot.timeline).toHaveLength(100);
    expect(snapshot.timeline[snapshot.timeline.length - 1]).toBe(now);

    unsubscribe();
    now += 100;
    source.tick();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('снимок — копия: внешняя мутация не ломает источник', () => {
    const source = new SimulatedCpuLoadSource({intervalMs: 100, windowMs: 1_000, now: () => 5_000});
    const snapshot = source.getSnapshot();
    snapshot.timeline.length = 0;
    expect(source.getSnapshot().timeline).toHaveLength(10);
  });

  it('start/stop управляют таймером и идемпотентны', () => {
    vi.useFakeTimers();
    try {
      const source = new SimulatedCpuLoadSource({intervalMs: 100, windowMs: 1_000});
      const listener = vi.fn();
      source.subscribe(listener);

      source.start();
      source.start();
      vi.advanceTimersByTime(350);
      expect(listener).toHaveBeenCalledTimes(3);

      source.stop();
      source.stop();
      vi.advanceTimersByTime(500);
      expect(listener).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });
});
