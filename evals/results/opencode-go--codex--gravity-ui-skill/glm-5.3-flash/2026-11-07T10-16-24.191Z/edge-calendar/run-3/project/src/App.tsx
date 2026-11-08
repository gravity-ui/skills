import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <Calendar
        aria-label="Выбор даты"
        value={selectedDate}
        onUpdate={setSelectedDate}
      />
    </div>
  );
}
