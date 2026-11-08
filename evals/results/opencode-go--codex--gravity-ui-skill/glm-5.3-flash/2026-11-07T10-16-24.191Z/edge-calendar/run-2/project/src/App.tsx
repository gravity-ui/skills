import { useState } from 'react';

import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap="4" style={{ padding: 24 }}>
      <Text variant="header-1">Выбор даты</Text>
      <Text variant="body-1">
        {selectedDate ? `Выбранная дата: ${selectedDate.format('DD MMMM YYYY')}` : 'Дата не выбрана'}
      </Text>
      <Calendar
        aria-label="Выбор даты"
        size="l"
        value={selectedDate}
        onUpdate={setSelectedDate}
      />
    </Flex>
  );
}
