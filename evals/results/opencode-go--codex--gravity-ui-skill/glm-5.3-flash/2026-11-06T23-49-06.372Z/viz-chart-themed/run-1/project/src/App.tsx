import {Chart} from '@gravity-ui/charts';

const chartData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Requests',
        color: 'var(--g-color-base-brand)',
        lineWidth: 2,
        data: [
          {x: 0, y: 12},
          {x: 1, y: 24},
          {x: 2, y: 18},
          {x: 3, y: 32},
          {x: 4, y: 27},
          {x: 5, y: 38},
        ],
      },
    ],
  },
};

export function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--g-spacing-4)',
        background: 'var(--g-color-base-background)',
      }}
    >
      <div style={{width: 'min(720px, 100%)'}}>
        <div style={{height: 320}}>
          <Chart data={chartData} />
        </div>
      </div>
    </div>
  );
}
