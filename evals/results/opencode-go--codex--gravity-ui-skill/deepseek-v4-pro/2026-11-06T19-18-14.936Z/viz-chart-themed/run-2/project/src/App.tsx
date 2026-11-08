import {Chart} from '@gravity-ui/charts';

const data = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Продажи',
        data: [
          {x: 'Янв', y: 120},
          {x: 'Фев', y: 200},
          {x: 'Мар', y: 150},
          {x: 'Апр', y: 280},
          {x: 'Май', y: 350},
          {x: 'Июн', y: 220},
          {x: 'Июл', y: 400},
          {x: 'Авг', y: 370},
          {x: 'Сен', y: 420},
          {x: 'Окт', y: 500},
          {x: 'Ноя', y: 460},
          {x: 'Дек', y: 550},
        ],
      },
      {
        type: 'line' as const,
        name: 'Расходы',
        data: [
          {x: 'Янв', y: 100},
          {x: 'Фев', y: 160},
          {x: 'Мар', y: 130},
          {x: 'Апр', y: 220},
          {x: 'Май', y: 280},
          {x: 'Июн', y: 190},
          {x: 'Июл', y: 320},
          {x: 'Авг', y: 300},
          {x: 'Сен', y: 350},
          {x: 'Окт', y: 410},
          {x: 'Ноя', y: 380},
          {x: 'Дек', y: 450},
        ],
      },
    ],
  },
  title: {text: 'Годовой отчёт'},
  legend: {enabled: true},
};

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
      <div style={{height: 400}}>
        <Chart data={data} />
      </div>
    </div>
  );
}
