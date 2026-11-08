import { LineChart, type Point } from './LineChart';

const ORDERS: Point[] = [
  { label: 'Дек 25', value: 1240 },
  { label: 'Янв 26', value: 1310 },
  { label: 'Фев 26', value: 1275 },
  { label: 'Мар 26', value: 1420 },
  { label: 'Апр 26', value: 1502 },
  { label: 'Май 26', value: 1468 },
  { label: 'Июн 26', value: 1590 },
  { label: 'Июл 26', value: 1655 },
  { label: 'Авг 26', value: 1620 },
  { label: 'Сен 26', value: 1744 },
  { label: 'Окт 26', value: 1801 },
  { label: 'Ноя 26', value: 1868 },
];

export function App() {
  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <LineChart
        title="Заказы по месяцам"
        subtitle="Последние 12 месяцев, шт."
        seriesName="Заказы"
        data={ORDERS}
      />
    </div>
  );
}
