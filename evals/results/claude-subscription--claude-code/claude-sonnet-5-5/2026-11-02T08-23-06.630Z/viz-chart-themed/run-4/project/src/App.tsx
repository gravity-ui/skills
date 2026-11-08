import { LineChart, type Point } from './LineChart';

// Sample data: 30 days of daily sessions.
const data: Point[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 9, 1 + i);
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const value = Math.round(1200 + i * 22 + Math.sin(i / 2.2) * 140 + (i % 7 > 4 ? -180 : 0));
  return { label, value };
});

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <LineChart title="Daily sessions" seriesName="Sessions" data={data} />
    </div>
  );
}
