import React from 'react';
import { Box, Flex, Text } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import { generateUsers } from './data';

export function App() {
  const rows = React.useMemo(() => generateUsers(47), []);

  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={1}>
          <Text variant="header-1">Пользователи</Text>
          <Text variant="body-1" color="secondary">
            Сортировка по колонкам, выделение строк чекбоксами и постраничная навигация.
          </Text>
        </Flex>
        <DataTable rows={rows} />
      </Flex>
    </Box>
  );
}
