import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';

const data: ChartData = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Visitors',
        data: [
          {x: 0, y: 120},
          {x: 1, y: 210},
          {x: 2, y: 165},
          {x: 3, y: 280},
          {x: 4, y: 320},
          {x: 5, y: 250},
          {x: 6, y: 410},
        ],
      },
      {
        type: 'line',
        name: 'Subscribers',
        data: [
          {x: 0, y: 45},
          {x: 1, y: 80},
          {x: 2, y: 70},
          {x: 3, y: 110},
          {x: 4, y: 130},
          {x: 5, y: 105},
          {x: 6, y: 170},
        ],
      },
    ],
  },
  xAxis: {
    type: 'category',
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: [
    {
      title: {text: 'Count'},
    },
  ],
  title: {text: 'Weekly Stats'},
  legend: {enabled: true},
  tooltip: {enabled: true},
};

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
      <div style={{height: 400}}>
        <Chart data={data} />
      </div>
    </div>
  );
}
