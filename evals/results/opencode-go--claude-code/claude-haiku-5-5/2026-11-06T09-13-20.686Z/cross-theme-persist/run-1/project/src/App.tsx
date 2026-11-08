import { Text } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Text variant="subheader-2">Theme</Text>
      <ThemeSwitcher />
    </div>
  );
}
