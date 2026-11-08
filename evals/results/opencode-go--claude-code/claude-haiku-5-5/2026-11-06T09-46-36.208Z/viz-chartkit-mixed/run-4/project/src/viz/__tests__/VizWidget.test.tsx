// @vitest-environment jsdom
import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';

// ChartKit itself is replaced by a stub that reports which engine type it was asked for.
// This test covers the widget's state machine (requested vs shown, controlled vs
// uncontrolled), not the engines' drawing, which needs a real browser.
vi.mock('@gravity-ui/chartkit', async () => {
  const ReactModule = await import('react');
  const ChartKitStub = (props: {type: string}) =>
    ReactModule.createElement('div', {'data-testid': 'chartkit', 'data-type': props.type});
  return {default: ChartKitStub, settings: {set: vi.fn()}};
});
vi.mock('@gravity-ui/chartkit/gravity-charts', () => ({
  GravityChartsPlugin: {type: 'gravity-charts', renderer: () => null},
}));
vi.mock('@gravity-ui/chartkit/yagr', () => ({
  YagrPlugin: {type: 'yagr', renderer: () => null},
}));

import {VizWidget} from '../VizWidget';
import type {VizSeries, VizWidgetProps} from '../types';

const series: VizSeries[] = [
  {id: 'site', name: 'Сайт', points: [{t: 1, v: 1500}, {t: 2, v: null}]},
  {id: 'app', name: 'Приложение', points: [{t: 1, v: 900}, {t: 2, v: 1200}]},
];

function renderWidget(overrides: Partial<VizWidgetProps> = {}) {
  return render(<VizWidget title="Выручка" series={series} unit="₽" {...overrides} />);
}

describe('VizWidget', () => {
  afterEach(() => {
    cleanup();
  });

  it('starts in sales mode and shows the gravity-charts engine once it is loaded', async () => {
    renderWidget();
    const chart = await screen.findByTestId('chartkit');
    expect(chart.getAttribute('data-type')).toBe('gravity-charts');
  });

  it('switches to the monitoring engine and reports the change', async () => {
    const onModeChange = vi.fn();
    renderWidget({onModeChange});
    await screen.findByTestId('chartkit');

    fireEvent.click(screen.getByRole('radio', {name: 'Мониторинг'}));

    await waitFor(() => {
      expect(screen.getByTestId('chartkit').getAttribute('data-type')).toBe('yagr');
    });
    expect(onModeChange).toHaveBeenCalledWith('monitoring');
  });

  it('in controlled mode keeps the shown engine until the parent changes `mode`', async () => {
    const onModeChange = vi.fn();
    const {rerender} = renderWidget({mode: 'sales', onModeChange});
    await screen.findByTestId('chartkit');

    fireEvent.click(screen.getByRole('radio', {name: 'Мониторинг'}));
    expect(onModeChange).toHaveBeenCalledWith('monitoring');
    // The parent has not updated `mode`, so the sales chart stays on screen.
    expect(screen.getByTestId('chartkit').getAttribute('data-type')).toBe('gravity-charts');

    rerender(<VizWidget title="Выручка" series={series} unit="₽" mode="monitoring" onModeChange={onModeChange} />);
    await waitFor(() => {
      expect(screen.getByTestId('chartkit').getAttribute('data-type')).toBe('yagr');
    });
  });

  it('renders the table twin with formatted last, min, max and gap counts', async () => {
    renderWidget();
    await screen.findByTestId('chartkit');

    const siteRow = screen.getByRole('rowheader', {name: 'Сайт'}).closest('tr') as HTMLElement;
    const cells = Array.from(siteRow.querySelectorAll('td')).map((td) => td.textContent);
    // Last real value is 1500 (the null at t=2 is a gap, not a value).
    expect(cells[0]).toBe('1 500 ₽');
    expect(cells[cells.length - 1]).toBe('1');
  });

  it('refuses more than three series and renders no chart', async () => {
    const four: VizSeries[] = ['a', 'b', 'c', 'd'].map((id) => ({id, name: id, points: []}));
    renderWidget({series: four});
    expect(await screen.findByText('Не удалось построить график')).toBeTruthy();
    expect(screen.queryByTestId('chartkit')).toBeNull();
  });
});
