import React, { useState } from 'react';
import { DatePicker } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, maxWidth: 320 }}>
      <DatePicker
        value={selectedDate}
        onUpdate={setSelectedDate}
        placeholder="Выберите дату"
      />
    </div>
  );
}
