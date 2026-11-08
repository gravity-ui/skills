import {Box, Flex, Text} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {EMPLOYEES} from './data';

export function App() {
  return (
    <Box spacing={{p: 6}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Сотрудники</Text>
        <DataTable rows={EMPLOYEES} />
      </Flex>
    </Box>
  );
}
