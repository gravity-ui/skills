# VisualizationWidget

Один виджет, два режима, два движка:

| Режим        | Движок (плагин ChartKit)                    | Для чего                                   |
|--------------|---------------------------------------------|--------------------------------------------|
| `sales`      | `@gravity-ui/charts` (`gravity-charts`)     | обычный линейный график продаж, SVG        |
| `monitoring` | `@gravity-ui/yagr` (`yagr`, uPlot на canvas)| плотный временной ряд, тысячи точек         |

Код движков грузится лениво: `src/widget/engines/registry.ts` держит карту
`import()`-загрузчиков, а сами модули `salesEngine.ts` и `monitoringEngine.ts`
регистрируют свой плагин в `settings` ChartKit при первой загрузке. Сборка Vite
выделяет их в отдельные чанки; в основной бандл не попадает ни uPlot, ни D3.

## Использование

```tsx
import {VisualizationWidget} from './widget';

<VisualizationWidget
    title="Продажи"
    datasets={{sales: salesDataset, monitoring: monitoringDataset}}
    mode={mode}                 // или defaultMode="sales" для неуправляемого варианта
    onModeChange={setMode}
    height={380}
    onRender={({mode, library, renderTime}) => console.log(mode, library, renderTime)}
/>
```

Данные для обоих режимов — в одном формате `VizDataset`:

```ts
{
  unit?: string;          // «млн ₽», «%»
  yMin?: number; yMax?: number;
  timeZone?: string;      // «Europe/Moscow»
  series: [{id, name, points: [{t: number /* мс */, y: number | null}]}]
}
```

Цвет серии определяется её индексом в `series` и фиксированной палитрой
(`palette.ts`), поэтому скрытие соседей серию не перекрашивает.

## Расширение

Чтобы добавить режим, достаточно описать движок (`VizEngine`): режим, тип
плагина ChartKit, `buildProps(dataset, ctx)` и, при необходимости, `prepare()`
для асинхронной подготовки. Затем добавить его загрузчик в `registry.ts`.

## Проверка

```sh
npm test        # vitest: реестр ленивой загрузки и адаптеры
npm run build   # tsc + vite build; смотрите чанки *Engine-*.js и *Widget-*.js
```
