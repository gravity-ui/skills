import { Text } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ThemeSwitcher />
      <Text variant="body-2">Текст, который меняет цвет вместе с темой.</Text>
    </div>
  );
}
