import {useThemeType} from '@gravity-ui/uikit';
import {Chart} from '@gravity-ui/charts';

import type {ChartData} from '@gravity-ui/charts';

const DATA: ChartData = {
  title: {
    text: 'Weekly activity',
    style: {
      fontSize: '18px',
      fontWeight: 600,
      fontColor: 'var(--g-color-text-primary)',
    },
  },
  xAxis: {
    type: 'category',
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: [
    {
      title: {text: 'Minutes'},
    },
  ],
  series: {
    data: [
      {
        type: 'line',
        name: 'Focus time',
        color: 'var(--g-color-base-brand)',
        lineWidth: 3,
        interpolation: {type: 'monotone'},
        data: [
          {x: 'Mon', y: 34},
          {x: 'Tue', y: 52},
          {x: 'Wed', y: 41},
          {x: 'Thu', y: 68},
          {x: 'Fri', y: 59},
          {x: 'Sat', y: 24},
          {x: 'Sun', y: 47},
        ],
      },
    ],
  },
  legend: {
    enabled: true,
    position: 'bottom',
  },
};

export function App() {
  const themeType = useThemeType();

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 24,
        backgroundColor: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
        fontFamily: 'var(--g-font-family-sans, sans-serif)',
      }}
    >
      <section
        style={{
          height: 420,
          padding: 24,
          borderRadius: 16,
          backgroundColor: 'var(--g-color-base-float)',
          border: '1px solid var(--g-color-line-generic)',
        }}
      >
        <div
          style={{
            height: '100%',
            fontFamily: 'var(--g-font-family-sans)',
            color: 'var(--g-color-text-primary)',
          }}
        >
          <Chart data={DATA} lang="en" key={themeType} />
        </div>
      </section>
    </main>
  );
}
