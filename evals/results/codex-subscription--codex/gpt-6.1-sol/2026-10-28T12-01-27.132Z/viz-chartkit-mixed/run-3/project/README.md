# Pulse

Адаптивная аналитическая панель на React и TypeScript. Запуск: `npm install`, `npm run dev`. Проверки: `npm run build`, `npx vitest run`.

## Единый API визуализации

```tsx
import {VisualizationWidget} from './src/components/VisualizationWidget';
import type {ChartMode, DataPoint, TimeRange} from './src/components/charts/types';

<VisualizationWidget
  mode={mode}                 // 'sales' | 'monitoring'
  onModeChange={setMode}
  range={range}               // '7d' | '30d' | '90d': три пресета
  onRangeChange={setRange}
  data={data}                 // DataPoint[]
  loading={false}
/>
```

`DataPoint`: `{timestamp: number, value: number, comparison: number}`. Время передаётся в миллисекундах Unix. Значения для продаж — рубли, для мониторинга — миллисекунды. Данные следует передавать по возрастанию времени.

В демонстрации пресеты соответствуют 7/30/90 дням продаж и 1/6/24 часам мониторинга. Приложение управляет выборкой, виджет вызывает `onRangeChange`. Для интеграции замените `createData` своим источником и передавайте `loading` во время запроса.

`SalesEngine` рисует обычный ряд в SVG. `MonitoringEngine` использует Canvas и сохраняет минимальные и максимальные значения в каждом пиксельном интервале, чтобы пики плотного ряда оставались видны. Оба движка реализуют `ChartEngineProps` и импортируются через `React.lazy(() => import(...))` только при первом открытии соответствующего режима. `Suspense` показывает загрузку, граница ошибок предлагает повторную загрузку страницы.

Реализованы выбор периода, сравнение с предыдущим периодом, подсказки, экспорт текущей выборки в CSV, обновление мониторинга каждые 3 секунды с паузой, фильтр заказов по каналу и просмотр заказа. Поиск открывается по Ctrl/Cmd+K. Все данные демонстрационные, внешние подключения не выполняются.
