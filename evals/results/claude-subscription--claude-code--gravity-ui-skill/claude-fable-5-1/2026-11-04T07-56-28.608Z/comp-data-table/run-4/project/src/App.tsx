import { useMemo } from 'react';
import { Box, Flex, Text } from '@gravity-ui/uikit';

import { generateUsers } from './data';
import { UsersTable } from './UsersTable';

export function App() {
  const users = useMemo(() => generateUsers(137), []);

  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={5}>
        <Flex direction="column" gap={1}>
          <Text variant="header-1">Пользователи</Text>
          <Text variant="body-1" color="secondary">
            Нажмите на заголовок колонки для сортировки, отмечайте строки чекбоксами.
          </Text>
        </Flex>
        <UsersTable users={users} />
      </Flex>
    </Box>
  );
}
