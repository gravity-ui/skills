import {ChartWidget} from './widget';
import {DEMO_DATASETS} from './widget/demo-data';

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 1040}}>
      <ChartWidget title="Показатели" datasets={DEMO_DATASETS} />
    </div>
  );
}
