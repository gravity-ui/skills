import { DatePicker } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { useState } from 'react';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <div style={{ maxWidth: 320, padding: 24 }}>
      <DatePicker
        label="Дата"
        placeholder="Выберите дату"
        format="DD.MM.YYYY"
        hasClear
        value={selectedDate}
        onUpdate={setSelectedDate}
      />
      {selectedDate && <p>Выбрано: {selectedDate.format('DD MMMM YYYY')}</p>}
    </div>
  );
}
