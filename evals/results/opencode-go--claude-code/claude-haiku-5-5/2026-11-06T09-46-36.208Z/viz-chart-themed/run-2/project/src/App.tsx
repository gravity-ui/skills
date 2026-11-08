import { LineChart, type LinePoint } from './LineChart';

// Sample data (placeholder): monthly active users, thousands, Jan–Oct 2026.
const MAU: LinePoint[] = [
  { label: 'Янв', value: 412 },
  { label: 'Фев', value: 438 },
  { label: 'Мар', value: 455 },
  { label: 'Апр', value: 431 },
  { label: 'Май', value: 478 },
  { label: 'Июн', value: 502 },
  { label: 'Июл', value: 496 },
  { label: 'Авг', value: 531 },
  { label: 'Сен', value: 547 },
  { label: 'Окт', value: 563 },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <LineChart
        data={MAU}
        title="Активные пользователи по месяцам"
        subtitle="Январь–октябрь 2026"
        unit="тыс."
      />
    </div>
  );
}
