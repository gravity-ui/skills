import { useMemo } from 'react';
import { useThemeType } from '@gravity-ui/uikit';
import YagrChart from '@gravity-ui/yagr/react';
import type { MinimalValidConfig, YagrTheme } from '@gravity-ui/yagr';

const TIMELINE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function buildConfig(theme: YagrTheme): MinimalValidConfig {
  return {
    timeline: TIMELINE,
    series: [
      {
        id: 'series-1',
        name: 'Alpha',
        type: 'line',
        data: [3, 7, 2, 8, 5, 9, 4, 6, 8, 5],
      },
      {
        id: 'series-2',
        name: 'Beta',
        type: 'line',
        data: [5, 4, 6, 3, 7, 5, 8, 3, 5, 7],
      },
    ],
    chart: {
      appearance: { theme },
    },
    title: { text: 'Themed line chart' },
    axes: {
      x: { side: 'bottom' },
      y: { side: 'left' },
    },
  };
}

export function App() {
  const themeType = useThemeType();
  const config = useMemo(() => buildConfig(themeType), [themeType]);

  return (
    <div style={{ padding: 24, maxWidth: 800, height: 480 }}>
      <YagrChart id="themed-line-chart" config={config} />
    </div>
  );
}
