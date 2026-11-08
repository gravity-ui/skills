import React from 'react';
import {Text} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {generateEmployees} from './data';

const employees = generateEmployees(57);

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 1100, margin: '0 auto'}}>
      <Text variant="header-1" as="h1" style={{margin: '0 0 16px'}}>
        Сотрудники
      </Text>
      <DataTable data={employees} />
    </div>
  );
}
