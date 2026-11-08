import { LineChart } from './LineChart';

const sampleData = [
  { x: 'Jan', y: 120 },
  { x: 'Feb', y: 200 },
  { x: 'Mar', y: 150 },
  { x: 'Apr', y: 280 },
  { x: 'May', y: 230 },
  { x: 'Jun', y: 310 },
  { x: 'Jul', y: 340 },
  { x: 'Aug', y: 400 },
  { x: 'Sep', y: 370 },
  { x: 'Oct', y: 450 },
  { x: 'Nov', y: 480 },
  { x: 'Dec', y: 520 },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <LineChart data={sampleData} width={700} height={420} />
    </div>
  );
}
