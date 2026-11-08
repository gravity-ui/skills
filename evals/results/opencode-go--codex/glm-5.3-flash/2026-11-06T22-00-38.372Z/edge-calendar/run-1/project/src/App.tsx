import { useState } from 'react';

import { DatePicker } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start', padding: 24 }}>
      <DatePicker
        aria-label="Выбор даты"
        format="DD.MM.YYYY"
        placeholder="Выберите дату"
        value={selectedDate}
        onUpdate={setSelectedDate}
      />
      <Text variant="body-2">
        {selectedDate ? `Выбранная дата: ${selectedDate.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </div>
  );
}
