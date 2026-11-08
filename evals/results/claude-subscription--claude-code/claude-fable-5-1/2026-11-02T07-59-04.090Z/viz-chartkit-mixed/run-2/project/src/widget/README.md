# ChartWidget

Единый виджет визуализации временных рядов с двумя режимами:

| Режим | Движок | Для чего |
|---|---|---|
| `sales` | `gravity-charts` (SVG) | разреженный ряд — десятки точек, подписи значений, плавные линии |
| `monitoring` | `yagr` / uPlot (canvas) | плотный ряд — тысячи точек, зум выделением, липкий tooltip |

Оба режима принимают один и тот же формат данных (`TimeSeriesDataset`) и рендерятся
через `ChartKit`. Модуль движка (`engines/sales.ts`, `engines/monitoring.ts`) и
рендерер плагина ChartKit загружаются лениво при первом включении режима и
регистрируются в `settings.plugins` один раз.

```tsx
import {ChartWidget} from './widget';

<ChartWidget
    title="Выручка по каналам"
    data={{sales: salesDataset, monitoring: monitoringDataset}} // или один TimeSeriesDataset на оба режима
    defaultMode="sales"                                           // либо mode + onModeChange
    height={380}
/>
```

`TimeSeriesDataset`: `{series: [{id, name, points: [{x: unixMs, y: number | null}]}], valueLabel?, unit?, precision?, timeZone?}`.

Палитра: первые три категориальных слота, проверенные валидатором в светлой и тёмной теме;
серии сверх трёх в график не попадают. Кнопка «Таблица» даёт доступную альтернативу графику.

Новый движок = новый файл в `engines/` + запись в `loaders` в `engines/registry.ts`.
