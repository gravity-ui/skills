# Пульс

React + TypeScript dashboard with one visualization widget and two lazy-loaded rendering engines.

```sh
npm install
npm run dev
npm run build
```

## Shared widget API

```tsx
import {ChartWidget, type ChartData} from './src/components/ChartWidget';

const data: ChartData = {
  timestamps: [1790812800, 1790899200], // Unix seconds, ascending
  series: [{
    id: 'revenue',
    name: 'Выручка',
    color: '#169b80',
    values: [42000, 51000], // One value for each timestamp
  }],
};

<ChartWidget mode="sales" data={data} height={310} showGrid unit="₽" />;
```

Use `mode="monitoring"` with the same data contract to render a dense time series. Each series must have the same length as `timestamps`. Data is numeric and timestamps are Unix seconds.

- `sales`: Recharts, a daily revenue chart with hover details and comparison series.
- `monitoring`: uPlot, a Canvas time series with hover details and drag-to-zoom. Double-click to reset zoom.
- Engines are imported through `React.lazy` and `Suspense`. Vite emits separate engine chunks. The inactive engine is not fetched until that mode is opened.
- The uPlot instance and its `ResizeObserver` are disposed when unmounted.
- Loading, empty data and rendering failure states are handled in the shared widget.

The dashboard includes period selection, series visibility, grid settings, expanded view and CSV export of visible series. Preferences are saved locally. All displayed datasets are demonstrative; no backend or production data service is connected.

Browser checks:

```sh
npx playwright install --with-deps chromium
npx playwright test
```
