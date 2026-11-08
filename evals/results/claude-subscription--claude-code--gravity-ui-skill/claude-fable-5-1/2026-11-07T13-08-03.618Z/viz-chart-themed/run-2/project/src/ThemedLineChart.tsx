import { useMemo } from 'react';
import { Chart } from '@gravity-ui/charts';
import type { ChartData, LineSeries } from '@gravity-ui/charts';
import { useThemeType } from '@gravity-ui/uikit';

import { CHART_SERIES_COLORS } from './chartPalette';

export interface ThemedLineChartSeries {
  name: string;
  /** Points as `[timestampMs, value]`. */
  points: Array<[number, number | null]>;
}

export interface ThemedLineChartProps {
  title: string;
  series: ThemedLineChartSeries[];
  yAxisTitle?: string;
  /** Container height in px. `Chart` fills its parent, so a height is required. */
  height?: number;
}

/**
 * Line chart that follows the active uikit theme.
 *
 * Axes, grid, labels, legend and tooltip are themed by `@gravity-ui/charts`
 * itself through `--g-*` tokens. Series colors are resolved from the current
 * theme type (light / dark) with a palette validated for each surface.
 */
export function ThemedLineChart({ title, series, yAxisTitle, height = 320 }: ThemedLineChartProps) {
  const themeType = useThemeType();

  const data = useMemo<ChartData>(() => {
    const colors = CHART_SERIES_COLORS[themeType];

    const lines: LineSeries[] = series.map((item, index) => ({
      type: 'line',
      name: item.name,
      color: colors[index % colors.length],
      lineWidth: 2,
      data: item.points.map(([x, y]) => ({ x, y })),
    }));

    return {
      title: { text: title },
      colors,
      series: { data: lines },
      xAxis: {
        type: 'datetime',
        grid: { enabled: false },
      },
      yAxis: [
        {
          title: yAxisTitle ? { text: yAxisTitle } : undefined,
          lineVisible: false,
        },
      ],
      legend: { enabled: true },
      tooltip: { enabled: true },
    };
  }, [themeType, title, series, yAxisTitle]);

  return (
    <div style={{ height }}>
      <Chart data={data} />
    </div>
  );
}
