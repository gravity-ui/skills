import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={3} style={{ padding: 24 }}>
      <Text variant="subheader-3">Select a date</Text>
      <Calendar value={date} onUpdate={setDate} />
      <Text color="secondary">
        Selected date: {date ? date.format('DD.MM.YYYY') : 'none'}
      </Text>
    </Flex>
  );
}
