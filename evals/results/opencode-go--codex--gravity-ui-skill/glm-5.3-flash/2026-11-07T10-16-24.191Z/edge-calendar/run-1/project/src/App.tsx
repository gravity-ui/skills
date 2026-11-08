import React from 'react';

import type { DateTime } from '@gravity-ui/date-utils';
import { Calendar } from '@gravity-ui/date-components';

export function App() {
  const [selectedDate, setSelectedDate] = React.useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <Calendar
        value={selectedDate}
        onUpdate={setSelectedDate}
        aria-label="Выберите дату"
      />
    </div>
  );
}
