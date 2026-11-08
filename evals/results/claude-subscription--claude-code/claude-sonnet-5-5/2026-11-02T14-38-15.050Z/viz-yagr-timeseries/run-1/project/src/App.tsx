import './App.css';

import React from 'react';
import {SegmentedRadioGroup, Text, type Theme} from '@gravity-ui/uikit';

import {CpuLoadChart} from './cpu/CpuLoadChart';
import {createSimulatedCpuSource} from './cpu/cpuSource';

export interface AppProps {
  theme?: Theme;
  /** Если не передан, переключатель темы не показывается: тему задаёт оболочка приложения. */
  onThemeChange?: (theme: Theme) => void;
}

export function App({theme, onThemeChange}: AppProps = {}) {
  // Источник данных живёт столько же, сколько страница. Замените на реальный API-клиент.
  const source = React.useMemo(() => createSimulatedCpuSource(), []);

  return (
    <main className="monitoring">
      <div className="monitoring__top">
        <Text variant="header-1" as="h1" className="monitoring__heading">
          Мониторинг
        </Text>
        {theme && onThemeChange ? (
          <SegmentedRadioGroup
            aria-label="Тема оформления"
            value={theme}
            onUpdate={(value) => onThemeChange(value as Theme)}
            options={[
              {value: 'light', content: 'Светлая'},
              {value: 'dark', content: 'Тёмная'},
              {value: 'system', content: 'Системная'},
            ]}
          />
        ) : null}
      </div>
      <div className="monitoring__chart">
        <CpuLoadChart source={source} />
      </div>
    </main>
  );
}
