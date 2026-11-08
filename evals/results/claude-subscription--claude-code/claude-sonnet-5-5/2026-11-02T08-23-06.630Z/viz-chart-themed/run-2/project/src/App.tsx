import { LineChart } from './LineChart';

const DATA = [
  { label: 'Янв', value: 1240 },
  { label: 'Фев', value: 1385 },
  { label: 'Мар', value: 1310 },
  { label: 'Апр', value: 1520 },
  { label: 'Май', value: 1710 },
  { label: 'Июн', value: 1665 },
  { label: 'Июл', value: 1890 },
  { label: 'Авг', value: 2045 },
  { label: 'Сен', value: 2210 },
  { label: 'Окт', value: 2380 },
];

export function App() {
  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <LineChart
        title="Активные пользователи"
        subtitle="По месяцам, 2026"
        seriesName="Пользователи"
        data={DATA}
      />
    </div>
  );
}
