import React from 'react';
import {act, render} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {CpuLoadChart, type CpuLoadChartHandle} from './CpuLoadChart';
import {SimulatedCpuLoadSource} from './cpuLoadSource';

function createSource() {
  let now = 1_000_000;
  const source = new SimulatedCpuLoadSource({intervalMs: 1000, windowMs: 60_000, now: () => now});
  return {
    source,
    advance(ms: number) {
      now += ms;
      source.tick();
    },
  };
}

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  });
}

describe('CpuLoadChart', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('монтирует canvas-график с полным окном данных', () => {
    const {source} = createSource();
    const {container} = render(
      <ThemeProvider theme="light">
        <CpuLoadChart source={source} windowMs={60_000} />
      </ThemeProvider>,
    );
    const root = container.querySelector('.cpu-load-chart');
    expect(root).not.toBeNull();
    expect(root!.classList.contains('yagr')).toBe(true);
    expect(root!.classList.contains('yagr_theme_light')).toBe(true);
    expect(root!.querySelector('canvas')).not.toBeNull();
  });

  it('применяет новые точки инкрементально, одним кадром и держит размер окна', async () => {
    const {source, advance} = createSource();
    const handle = React.createRef<CpuLoadChartHandle>();
    render(
      <ThemeProvider theme="light">
        <CpuLoadChart ref={handle} source={source} windowMs={60_000} />
      </ThemeProvider>,
    );
    const chart = handle.current!.getChart()!;
    expect(chart.config.timeline).toHaveLength(60);
    const setSeriesSpy = vi.spyOn(chart, 'setSeries');

    act(() => {
      advance(1000);
      advance(1000);
    });
    // До кадра график не трогаем.
    expect(setSeriesSpy).not.toHaveBeenCalled();
    await nextFrame();

    // Две точки применены одним инкрементальным вызовом, окно осталось 60 точек.
    expect(setSeriesSpy).toHaveBeenCalledTimes(1);
    expect(setSeriesSpy).toHaveBeenCalledWith([1_001_000, 1_002_000], [{id: 'cpu', data: expect.any(Array)}], {
      incremental: true,
      splice: true,
    });
    expect(chart.config.timeline).toHaveLength(60);
    expect(chart.config.timeline[59]).toBe(1_002_000);
    expect(chart.uplot.data[0]).toHaveLength(60);
    expect(chart.uplot.data[0][59]).toBe(1_002_000);
  });

  it('после паузы в данных пересобирает окно по времени', async () => {
    const {source, advance} = createSource();
    const handle = React.createRef<CpuLoadChartHandle>();
    render(
      <ThemeProvider theme="light">
        <CpuLoadChart ref={handle} source={source} windowMs={60_000} />
      </ThemeProvider>,
    );

    // Пропуск 30 с: пришла одна точка, а устарело 30 из 60 (941 000 … 970 000).
    act(() => advance(30_000));
    await nextFrame();

    const chart = handle.current!.getChart()!;
    const timeline = chart.config.timeline;
    expect(timeline[timeline.length - 1]).toBe(1_030_000);
    expect(timeline[0]).toBe(971_000);
    expect(timeline).toHaveLength(31);
    expect(chart.uplot.data[0]).toHaveLength(31);
  });

  it('переключает тему без пересоздания графика', () => {
    const {source} = createSource();
    const handle = React.createRef<CpuLoadChartHandle>();
    const {container, rerender} = render(
      <ThemeProvider theme="light">
        <CpuLoadChart ref={handle} source={source} windowMs={60_000} />
      </ThemeProvider>,
    );
    const root = container.querySelector('.cpu-load-chart')!;
    const canvasBefore = root.querySelector('canvas');
    const chart = handle.current!.getChart()!;
    expect(chart.uplot.series[1].color).toBe('#348bdc');

    rerender(
      <ThemeProvider theme="dark">
        <CpuLoadChart ref={handle} source={source} windowMs={60_000} />
      </ThemeProvider>,
    );
    expect(root.classList.contains('yagr_theme_dark')).toBe(true);
    expect(root.classList.contains('yagr_theme_light')).toBe(false);
    expect(root.querySelector('canvas')).toBe(canvasBefore);
    expect(handle.current!.getChart()).toBe(chart);
    expect(chart.uplot.series[1].color).toBe('#3697f1');
  });

  it('при размонтировании отписывается от источника и освобождает DOM', async () => {
    const {source, advance} = createSource();
    const unsubscribe = vi.fn();
    const subscribeSpy = vi.spyOn(source, 'subscribe').mockImplementation((listener) => {
      const off = SimulatedCpuLoadSource.prototype.subscribe.call(source, listener);
      return () => {
        unsubscribe();
        off();
      };
    });
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const {container, unmount} = render(
      <ThemeProvider theme="light">
        <CpuLoadChart source={source} windowMs={60_000} />
      </ThemeProvider>,
    );
    expect(subscribeSpy).toHaveBeenCalled();
    const root = container.querySelector('.cpu-load-chart')!;
    expect(root.querySelector('.uplot')).not.toBeNull();

    // Кадр запланирован, но ещё не выполнен — при размонтировании его нужно отменить.
    act(() => advance(1000));
    expect(rafSpy).toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
    expect(cafSpy).toHaveBeenCalled();
    expect(root.querySelector('.uplot')).toBeNull();
    expect(document.querySelector('.yagr-tooltip')).toBeNull();

    // Новые точки после размонтирования не доходят до графика.
    const rafCallsBefore = rafSpy.mock.calls.length;
    act(() => advance(1000));
    expect(rafSpy.mock.calls.length).toBe(rafCallsBefore);
  });
});
