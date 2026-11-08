# Forma Analytics

Адаптивная аналитическая панель на React и TypeScript. Запуск: `npm install` и `npm run dev`. Production-сборка: `npm run build`.

## Единый API визуализации

```tsx
import { Visualization, type Point } from './src/components/Visualization';

const data: Point[] = [
  { time: Date.UTC(2026, 5, 1), value: 18000, previous: 16000 },
  { time: Date.UTC(2026, 5, 2), value: 21000, previous: 17000 },
];

<Visualization
  mode="sales" // 'sales' | 'monitoring'
  data={data}
  comparison={true}
  color="#8b68df"
  onHover={(point) => console.log(point)}
/>
```

`time` — Unix timestamp в миллисекундах; точки передаются по возрастанию времени. `value` — выручка в рублях для продаж или время отклика в миллисекундах для мониторинга. Необязательное `previous` — значение сравнения на той же позиции. `onHover` получает точку или `null`, когда курсор покидает график.

Продажи отрисовываются в SVG, плотный мониторинг — в Canvas с учётом devicePixelRatio и изменения размеров. Оба движка реализуют `ChartProps`. `React.lazy` с динамическими импортами создаёт независимые chunks: движок загружается при первом выборе режима. Suspense показывает загрузку, error boundary обрабатывает ошибку загрузки, пустой набор данных имеет отдельное состояние.

Панель поддерживает выбор периода, сравнение, подсказки, автообновление мониторинга, паузу и выгрузку текущего набора данных в CSV. Приложение работает с детерминированными демонстрационными данными; сервер и реальные источники данных не подключены.
