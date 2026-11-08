import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Calendar value={selectedDate} onUpdate={setSelectedDate} />
      <Text variant="body-1">
        {selectedDate ? `Selected date: ${selectedDate.format('LL')}` : 'No date selected'}
      </Text>
    </div>
  );
}
