# Pulse — единый виджет аналитики

React + TypeScript. Интерфейс и демонстрационные данные на русском языке.

```sh
npm install
npm run dev
```

`npm run build` проверяет TypeScript и создаёт production-сборку.

## API виджета

Оба режима используют компонент `VisualizationWidget` и одинаковый формат точек:

```tsx
import { VisualizationWidget } from "./src/components/VisualizationWidget";
import type { ChartMode, ChartPoint, Period } from "./src/charts/types";

const [mode, setMode] = useState<ChartMode>("sales");
const [period, setPeriod] = useState<Period>("month");

<VisualizationWidget
  mode={mode}
  onModeChange={setMode}
  period={period}
  onPeriodChange={setPeriod}
  endDate={Date.UTC(2026, 5, 30, 23, 59)}
  data={points}
  onDataChange={handleSnapshot}
/>;
```

`data` — необязательный массив `ChartPoint[]`, отсортированный по времени:

```ts
type ChartPoint = {
  timestamp: number; // UTC, миллисекунды
  value: number; // sales: рубли; monitoring: миллисекунды
  previous: number; // значение сопоставимого предыдущего периода
};
```

Если `data` не передан, виджет показывает демонстрационные данные. В мониторинге генерируются 2 400 точек с обновлением каждые 4 секунды; есть пауза и возобновление. Для внешних данных обновляйте `data` из своего источника. `onDataChange` сообщает текущий снимок данных, в том числе после обновления демопотока; верхняя кнопка экспорта использует этот снимок.

Переключение режимов сохраняет период и настройку сравнения. Общие элементы управления: день/неделя/месяц/год, сравнение, CSV, полноэкранный вид и подсказки. Пустой массив показывает состояние «Нет данных».

## Движки и загрузка

- `sales` → ChartKit `gravity-charts`, линейный график.
- `monitoring` → ChartKit `yagr`, временной ряд на Canvas с масштабированием выделением.

Модули `SalesEngine.tsx` и `MonitoringEngine.tsx` загружаются через `React.lazy(() => import(...))`. Каждый регистрирует свой плагин до рендера `ChartKit`; сами плагины дополнительно загружают рендереры лениво. Тяжёлых движков нет в начальном JS-бандле. `Suspense` показывает индикатор загрузки, error boundary обрабатывает ошибки загрузки и рендера.

## Проверки

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

Playwright запускает production-сборку и проверяет сетевые запросы движков, оба режима, сохранение общих настроек, CSV, мобильную ширину и разворачивание графика.

Остальные показатели дашборда и источники в демопроекте иллюстративные; серверные интеграции не настроены.
