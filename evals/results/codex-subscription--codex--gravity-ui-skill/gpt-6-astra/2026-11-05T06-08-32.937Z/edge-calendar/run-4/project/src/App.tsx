import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <main className="date-page">
      <Text as="h1" variant="header-1" id="calendar-heading" className="date-page__title">
        Выберите дату
      </Text>
      <Text as="p" variant="body-1" color="secondary" className="date-page__description">
        Нажмите на нужный день в календаре.
      </Text>
      <Calendar
        aria-labelledby="calendar-heading"
        value={selectedDate}
        onUpdate={setSelectedDate}
      />
      <Text as="p" variant="body-1" aria-live="polite" aria-atomic="true">
        {selectedDate
          ? `Выбранная дата: ${selectedDate.format('DD.MM.YYYY')}`
          : 'Дата пока не выбрана'}
      </Text>
    </main>
  );
}
