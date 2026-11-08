import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import type {VisualizationSeries} from './VisualizationWidget';
const {chartProps, register} = vi.hoisted(() => ({chartProps: vi.fn(), register: vi.fn()}));
vi.mock('@gravity-ui/chartkit', () => ({default: (props: unknown) => {chartProps(props); return <div>chart</div>;}, settings: {set: register}}));
vi.mock('@gravity-ui/uikit', () => ({
  Button: ({children}: {children: React.ReactNode}) => <button>{children}</button>,
  Icon: () => <span/>,
  Loader: () => <span/>,
}));
import {VisualizationWidget} from './VisualizationWidget';
const rows: VisualizationSeries[] = [{id: 'test', name: 'Test', color: 'var(--g-color-text-positive)', points: [{timestamp: 1000, value: 20}, {timestamp: 1500, value: 30}]}];

describe('unified visualization API', () => {
  it('registers both renderers as React.lazy components', () => {
    const config = register.mock.calls[0][0];
    expect(config.plugins.map((p: {type: string}) => p.type)).toEqual(['gravity-charts', 'yagr']);
    expect(config.plugins.every((p: {renderer: {$$typeof: symbol}}) => p.renderer.$$typeof === Symbol.for('react.lazy'))).toBe(true);
  });
  it('adapts the shared series to Gravity Charts', () => {
    renderToStaticMarkup(<VisualizationWidget mode="sales" series={rows}/>);
    const props = chartProps.mock.lastCall?.[0];
    expect(props.type).toBe('gravity-charts');
    expect(props.data.series.data[0].data).toEqual([{x: 1000, y: 20}, {x: 1500, y: 30}]);
  });
  it('adapts the same shared series to Yagr', () => {
    renderToStaticMarkup(<VisualizationWidget mode="monitoring" series={rows}/>);
    const props = chartProps.mock.lastCall?.[0];
    expect(props.type).toBe('yagr');
    expect(props.data.data.timeline).toEqual([1000, 1500]);
    expect(props.data.data.graphs[0].data).toEqual([20, 30]);
  });
  it('handles empty, loading and error states before rendering an engine', () => {
    chartProps.mockClear();
    expect(renderToStaticMarkup(<VisualizationWidget mode="sales" series={[]}/>)).toContain('Пока нет данных');
    expect(renderToStaticMarkup(<VisualizationWidget mode="sales" series={rows} loading/>)).toContain('Загружаем данные');
    expect(renderToStaticMarkup(<VisualizationWidget mode="monitoring" series={rows} error="Источник недоступен"/>)).toContain('Источник недоступен');
    expect(chartProps).not.toHaveBeenCalled();
  });
});
