# Виджет визуализации с переключением движков

Один виджет `VizWidget` показывает либо обычный линейный график продаж, либо плотный
временной ряд мониторинга. Режимы переключаются внутри виджета, данные обоих режимов
описываются одним форматом `VizDataset`, а движки графиков подгружаются лениво.

```tsx
import {VizWidget} from './widget';

<VizWidget
    title="Выручка и нагрузка API"
    datasets={{sales: salesDataset, monitoring: monitoringDataset}}
    defaultMode="sales"
    height={420}
    onModeChange={(mode) => console.log(mode)}
    onEngineReady={(mode, engine) => console.log(mode, engine)}
/>
```

## Единый API

| Тип | Назначение |
| --- | --- |
| `VizDataset` | `timeline` (мс), `series[]` со значениями по этой шкале, `unit`, `precision`, `timeZone` |
| `VizEngine<T>` | описание движка: тип плагина ChartKit, `load()` для ленивой загрузки, `buildData()` — адаптер из `VizDataset` |
| `ENGINES` | соответствие режима движку: `sales` → Gravity Charts, `monitoring` → Yagr (uPlot) |

Виджет не знает про конкретные библиотеки: он берёт движок из `ENGINES[mode]`,
дожидается `loadEngine(mode)` и рендерит `<ChartKit type={engine.type} data={engine.buildData(...)} />`.

## Ленивая загрузка

- Модули плагинов `@gravity-ui/chartkit/gravity-charts` и `@gravity-ui/chartkit/yagr`
  импортируются динамически в `load()` своего движка, а не статически — иначе
  реэкспорты плагина затянули бы `@gravity-ui/charts` в основной бандл.
- Плагин регистрируется в `settings` ChartKit один раз; повторные вызовы не создают запросов,
  после ошибки загрузка повторяется.
- Пока новый движок грузится, предыдущий график остаётся на месте с пониженной прозрачностью.

Проверено сборкой Vite: точка входа не содержит ни uPlot, ни `@gravity-ui/charts`;
чанки `GravityChartsWidget-*` и `YagrWidget-*` запрашиваются только при показе своего режима.

## Команды

```sh
npm run dev     # демо-страница
npm test        # vitest: адаптеры, реестр движков, демо-данные
npm run build   # tsc --noEmit && vite build
```
