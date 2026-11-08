import {useState, type CSSProperties} from 'react';
import {Text, useThemeType} from '@gravity-ui/uikit';

import {CHART_PALETTE} from './chartPalette';
import {CpuChart} from './CpuChart';
import {createCpuFeed} from './cpuFeed';
import './App.css';

export function App() {
  const [feed] = useState(createCpuFeed);
  const palette = CHART_PALETTE[useThemeType()];

  return (
    <main className="cpu-page">
      <header className="cpu-header">
        <Text as="h1" variant="header-2">
          Загрузка CPU
        </Text>
        <Text color="secondary" variant="body-1">
          Последние 24 часа · обновление каждые 2 с
        </Text>
      </header>
      <section
        className="cpu-card"
        style={{'--cpu-surface': palette.surface} as CSSProperties}
      >
        <CpuChart feed={feed} />
      </section>
    </main>
  );
}
