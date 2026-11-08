import { LineChart } from './LineChart';

const visits = [
  { x: '01', y: 240 },
  { x: '02', y: 300 },
  { x: '03', y: 260 },
  { x: '04', y: 350 },
  { x: '05', y: 320 },
  { x: '06', y: 410 },
  { x: '07', y: 450 },
  { x: '08', y: 390 },
  { x: '09', y: 470 },
  { x: '10', y: 520 },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <LineChart data={visits} />
    </div>
  );
}
