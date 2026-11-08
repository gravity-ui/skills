import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime>(() => dateTime());

  return (
    <div style={{ padding: 24 }}>
      <Flex direction="column" gap={3} alignItems="flex-start">
        <Text variant="header-1">Select a date</Text>
        <Calendar value={date} onUpdate={setDate} />
        <Text color="secondary">Selected: {date.format('DD.MM.YYYY')}</Text>
      </Flex>
    </div>
  );
}
