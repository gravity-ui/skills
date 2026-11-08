import { LineChart } from './LineChart';
import type { LinePoint } from './LineChart';

// Sample data (illustrative values, not real metrics)
const MONTHLY_USERS: LinePoint[] = [
  { label: 'Дек', value: 12.4 },
  { label: 'Янв', value: 13.1 },
  { label: 'Фев', value: 13.8 },
  { label: 'Мар', value: 14.2 },
  { label: 'Апр', value: 13.9 },
  { label: 'Май', value: 15.0 },
  { label: 'Июн', value: 16.2 },
  { label: 'Июл', value: 17.1 },
  { label: 'Авг', value: 16.8 },
  { label: 'Сен', value: 18.0 },
  { label: 'Окт', value: 19.2 },
  { label: 'Ноя', value: 20.1 },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          maxWidth: 960,
          background: 'var(--g-color-base-background)',
          border: '1px solid var(--g-color-line-generic)',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <LineChart
          title="Активные пользователи"
          subtitle="По месяцам, декабрь 2025 – ноябрь 2026"
          unit="тыс."
          data={MONTHLY_USERS}
        />
      </div>
    </div>
  );
}
