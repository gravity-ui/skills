import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <main className="date-page">
      <Text as="h1" variant="header-2" id="date-heading" className="date-page__heading">
        Выберите дату
      </Text>
      <Text as="p" variant="body-1" color="secondary" className="date-page__description">
        Нажмите на нужный день в календаре.
      </Text>
      <Calendar
        size="l"
        value={selectedDate}
        onUpdate={setSelectedDate}
        aria-labelledby="date-heading"
      />
      <Text as="p" variant="body-2" aria-live="polite" aria-atomic="true">
        {selectedDate
          ? `Выбранная дата: ${selectedDate.format('DD.MM.YYYY')}`
          : 'Дата пока не выбрана'}
      </Text>
    </main>
  );
}
