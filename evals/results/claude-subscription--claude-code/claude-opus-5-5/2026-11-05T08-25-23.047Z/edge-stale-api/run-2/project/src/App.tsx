import { Text } from '@gravity-ui/uikit';

import { ThemeToggle } from './ThemeToggle';

export function App() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">Настройки оформления</Text>
      <ThemeToggle />
    </div>
  );
}
