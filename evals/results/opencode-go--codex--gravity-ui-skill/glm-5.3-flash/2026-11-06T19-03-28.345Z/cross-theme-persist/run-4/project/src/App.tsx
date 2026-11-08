import React from 'react';
import { Switch, useTheme } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={isDark}
        content={isDark ? 'Тёмная тема' : 'Светлая тема'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      />
    </div>
  );
}
