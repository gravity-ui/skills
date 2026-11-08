import { LineChart } from './LineChart';

// Демонстрационные данные
const demoData = [
  { x: 0, y: 10 },
  { x: 1, y: 25 },
  { x: 2, y: 18 },
  { x: 3, y: 40 },
  { x: 4, y: 32 },
  { x: 5, y: 55 },
  { x: 6, y: 48 },
  { x: 7, y: 62 },
  { x: 8, y: 70 },
  { x: 9, y: 65 },
  { x: 10, y: 80 },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <LineChart
        data={demoData}
        width={700}
        height={400}
        title="Линейный график"
        xLabel="Месяц"
        yLabel="Значение"
      />
    </div>
  );
}
