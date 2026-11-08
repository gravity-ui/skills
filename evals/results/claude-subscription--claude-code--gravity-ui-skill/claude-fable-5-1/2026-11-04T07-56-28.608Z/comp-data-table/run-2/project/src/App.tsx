import { useMemo } from 'react';
import { Flex, Text } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import { generateEmployees } from './data';

export function App() {
  const employees = useMemo(() => generateEmployees(137), []);

  return (
    <Flex direction="column" gap={5} style={{ padding: 'var(--g-spacing-6)' }}>
      <Flex direction="column" gap={1}>
        <Text variant="header-1">Сотрудники</Text>
        <Text variant="body-1" color="secondary">
          Сортировка по колонкам, постраничная навигация и выделение строк чекбоксами.
        </Text>
      </Flex>
      <DataTable data={employees} />
    </Flex>
  );
}
