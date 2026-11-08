import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <main className="date-page">
      <Text as="h1" variant="header-1" id="calendar-heading" className="date-page__heading">
        Выберите дату
      </Text>
      <Text as="p" variant="body-2" className="date-page__description">
        Нажмите на нужный день в календаре.
      </Text>
      <Calendar
        aria-labelledby="calendar-heading"
        size="l"
        value={selectedDate}
        onUpdate={setSelectedDate}
      />
      <Text as="p" variant="body-2" aria-live="polite" className="date-page__selection">
        {selectedDate
          ? `Выбранная дата: ${selectedDate.format('DD.MM.YYYY')}`
          : 'Дата пока не выбрана'}
      </Text>
    </main>
  );
}
