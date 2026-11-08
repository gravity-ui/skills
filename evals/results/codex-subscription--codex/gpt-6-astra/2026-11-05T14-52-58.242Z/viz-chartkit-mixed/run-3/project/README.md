# Signal

Аналитическая панель с единым виджетом продаж и мониторинга.

```sh
npm install
npm run dev
npm run build
```

## API виджета

```tsx
import { ChartWidget, type ChartPoint } from './src/components/ChartWidget';

const data: ChartPoint[] = [
  { timestamp: Date.UTC(2026, 3, 1), value: 43000, previous: 37000 },
  { timestamp: Date.UTC(2026, 3, 2), value: 49000, previous: 41000 },
];

<ChartWidget
  mode="sales" // 'sales' | 'monitoring'
  data={data} // timestamp: Unix milliseconds, ascending and unique
  comparison={true}
  visible={true}
  height={300}
  onPointSelect={(point) => console.log(point)}
/>
```

Оба движка принимают одинаковые данные и параметры. Recharts (SVG, продажи) и uPlot (Canvas, мониторинг) импортируются только через `React.lazy`. Стили uPlot также загружаются отдельно вместе с режимом мониторинга. Vite создаёт отдельные чанки обоих движков.

Поддерживаются смена периода, сравнение, отключение рядов, подсказки, выбор точки и экспорт выбранного набора данных в CSV. В мониторинге можно выделить диапазон мышью для увеличения и сбросить масштаб двойным нажатием. Кнопка паузы останавливает симуляцию обновлений.

Данные демонстрационные: продажи за апрель 2026 и детерминированная симуляция мониторинга (одна точка в минуту, новое значение каждые три секунды). Для подключения реального источника передайте данные в `ChartWidget`; движки не выполняют запросы самостоятельно. Параметры интерфейса хранятся в состоянии текущей сессии.
