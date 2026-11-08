import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Text variant="header-1">Select a date</Text>
      <Calendar value={selectedDate} onUpdate={setSelectedDate} />
      <Text variant="body-2" color="secondary">
        {selectedDate ? `Selected: ${selectedDate.format('DD.MM.YYYY')}` : 'No date selected'}
      </Text>
    </div>
  );
}
