import { Flex, Text } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import { generateOrders } from './data';

const ORDERS = generateOrders(53);

export function App() {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-2">Заказы</Text>
      <DataTable data={ORDERS} />
    </Flex>
  );
}
