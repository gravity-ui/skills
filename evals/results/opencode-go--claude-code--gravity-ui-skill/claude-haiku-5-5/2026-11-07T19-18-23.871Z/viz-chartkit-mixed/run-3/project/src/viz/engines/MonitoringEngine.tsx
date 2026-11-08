import {useId, useMemo} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import YagrChart from '@gravity-ui/yagr/react';
import '@gravity-ui/yagr/index.css';

import {toYagrConfig} from '../adapters';
import type {VizEngineProps} from '../types';

// Загружается лениво из VizWidget: код @gravity-ui/yagr (uPlot) не попадает в начальный бандл.
export default function MonitoringEngine({dataset, height}: VizEngineProps) {
  const themeType = useThemeType();
  const yagrTheme = themeType === 'dark' ? 'dark' : 'light';
  const config = useMemo(() => toYagrConfig(dataset, yagrTheme), [dataset, yagrTheme]);

  // useId даёт ":r0:" — для id DOM-узла оставляем только безопасные символы.
  const chartId = `monitoring-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div style={{height}}>
      <YagrChart id={chartId} config={config} />
    </div>
  );
}
