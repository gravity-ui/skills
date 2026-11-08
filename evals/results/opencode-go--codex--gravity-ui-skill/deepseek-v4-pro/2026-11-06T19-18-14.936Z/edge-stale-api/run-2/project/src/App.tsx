import React from 'react';
import { Text, Flex } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <Flex gap={2} alignItems="center">
        <Text variant="body-1">Theme</Text>
        <ThemeSwitcher />
      </Flex>
    </div>
  );
}
