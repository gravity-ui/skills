import React from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Card, Text } from '@gravity-ui/uikit';

export function App() {
  const [selectedDate, setSelectedDate] = React.useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Text variant="header-2">Select a date</Text>

      <Card view="outlined" style={{ padding: 8 }}>
        <Calendar value={selectedDate} onUpdate={setSelectedDate} />
      </Card>

      <Text variant="body-1">
        {selectedDate ? `Selected date: ${selectedDate.format('LL')}` : 'No date selected'}
      </Text>
    </div>
  );
}
