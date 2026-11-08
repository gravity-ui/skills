import * as React from 'react';

import {Switch, Text} from '@gravity-ui/uikit';

import {VizWidget} from './widget/VizWidget';
import {buildDemoModes} from './widget/demo-data';
import './widget/viz.css';

interface AppProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({theme, onThemeChange}: AppProps) {
  // данные строятся один раз — детерминированно
  const modes = React.useMemo(buildDemoModes, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Text variant="header-1">Виджет визуализации</Text>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
          content="Тёмная тема"
        />
      </div>

      <VizWidget
        title="Продажи и нагрузка сервисов"
        subtitle="Один виджет — два режима; движки графиков подгружаются лениво"
        modes={modes}
        defaultMode="sales"
        height={280}
      />
    </div>
  );
}
