import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {CpuDataSource, CpuSample} from './cpu-data';
import {useCpuFeed} from './use-cpu-feed';

describe('CPU stream lifecycle', () => {
  let view: ReactTestRenderer | undefined;
  let feed: ReturnType<typeof useCpuFeed>;
  let emit: (samples: CpuSample[]) => void;
  let fail: (error: Error) => void;
  const unsubscribe = vi.fn();
  let source: CpuDataSource;

  function Harness({live = true}: {live?: boolean}) {
    feed = useCpuFeed(source, live);
    return null;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', globalThis);
    unsubscribe.mockClear();
    source = {
      loadHistory: vi.fn(async () => [{timestamp: 1, value: 10}]),
      subscribe: vi.fn((onSamples, onError) => {emit = onSamples; fail = onError; return unsubscribe;}),
    };
  });

  afterEach(() => {
    act(() => view?.unmount());
    view = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function mount() {
    await act(async () => {view = create(<Harness />);});
  }

  it('coalesces frequent batches and releases the subscription and pending update on unmount', async () => {
    await mount();
    act(() => {
      for (let timestamp = 2; timestamp < 1002; timestamp++) emit([{timestamp, value: timestamp % 100}]);
    });
    expect(feed.snapshot.timeline).toEqual([1]);
    expect(vi.getTimerCount()).toBe(1);
    act(() => {vi.advanceTimersByTime(250);});
    expect(feed.snapshot.timeline).toHaveLength(1001);
    act(() => {emit([{timestamp: 1002, value: 20}]);});
    act(() => view?.unmount());
    view = undefined;
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps ingesting while paused and immediately catches up on resume', async () => {
    await mount();
    act(() => view!.update(<Harness live={false} />));
    act(() => {emit([{timestamp: 2, value: 25}]); vi.advanceTimersByTime(1000);});
    expect(feed.snapshot.timeline).toEqual([1]);
    act(() => view!.update(<Harness live />));
    expect(feed.snapshot.timeline).toEqual([1, 2]);
    expect(feed.snapshot.current).toBe(25);
    expect(source.subscribe).toHaveBeenCalledTimes(1);
  });

  it('aborts an in-flight history request and never subscribes after unmount', async () => {
    let resolve!: (samples: CpuSample[]) => void;
    let signal!: AbortSignal;
    source.loadHistory = vi.fn((requestSignal) => {
      signal = requestSignal;
      return new Promise<CpuSample[]>((done) => {resolve = done;});
    });
    act(() => {view = create(<Harness />);});
    act(() => view!.unmount());
    view = undefined;
    await act(async () => {resolve([{timestamp: 1, value: 10}]);});
    expect(signal.aborted).toBe(true);
    expect(source.subscribe).not.toHaveBeenCalled();
  });

  it('releases a failed connection before retrying', async () => {
    await mount();
    act(() => fail(new Error('Disconnected')));
    expect(feed.status).toBe('error');
    await act(async () => feed.retry());
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(source.subscribe).toHaveBeenCalledTimes(2);
    expect(feed.status).toBe('ready');
  });
});
