import {Flex, Text} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './theme';

export function App() {
  return (
    <Flex alignItems="center" justifyContent="space-between" gap={4} style={{padding: 24}}>
      <Text variant="header-1" style={{flex: 1, minWidth: 0}}>
        Тема оформления
      </Text>
      <div style={{flexShrink: 0}}>
        <ThemeSwitcher />
      </div>
    </Flex>
  );
}
