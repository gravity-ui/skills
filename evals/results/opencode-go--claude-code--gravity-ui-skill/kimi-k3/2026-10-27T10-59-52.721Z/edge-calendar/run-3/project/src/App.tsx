import React from 'react';

import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Card, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = React.useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 480 }}>
      <Text variant="header-1">Выбор даты</Text>
      <Card view="outlined" style={{ padding: 16, alignSelf: 'flex-start' }}>
        <Calendar value={value} onUpdate={setValue} />
      </Card>
      <Text variant="body-1">
        Выбранная дата: {value ? value.format('DD MMMM YYYY') : '—'}
      </Text>
    </Flex>
  );
}
