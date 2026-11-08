import {demoSeries} from './demo/demoSeries';
import {ChartWidget} from './widget';

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 1040}}>
      <ChartWidget
        title="Продажи по регионам, тыс. ₽ · интервал 15 мин"
        series={demoSeries}
        defaultMode="sales"
        height={360}
      />
    </div>
  );
}
