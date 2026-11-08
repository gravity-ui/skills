import {ChartWidget} from './widgets/ChartWidget';
import type {ChartWidgetData} from './widgets/ChartWidget';

function makeSalesData() {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months.map((m) => ({label: m, value: Math.floor(Math.random() * 80000 + 20000)}));
}

function makeMonitorData() {
  const now = Date.now();
  return Array.from({length: 60}, (_, i) => ({
    ts: now - (59 - i) * 60_000,
    value: Math.round((Math.sin(i * 0.25) * 15 + 40 + Math.random() * 6) * 10) / 10,
  }));
}

const DEMO_DATA: ChartWidgetData = {
  sales: makeSalesData(),
  monitor: makeMonitorData(),
};

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 700, margin: '0 auto'}}>
      <ChartWidget data={DEMO_DATA} />
    </div>
  );
}
