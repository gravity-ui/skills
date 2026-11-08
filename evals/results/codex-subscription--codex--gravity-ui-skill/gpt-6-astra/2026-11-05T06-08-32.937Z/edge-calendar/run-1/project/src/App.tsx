import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <main className="date-page">
      <section className="date-card" aria-labelledby="date-heading">
        <Text as="h1" variant="header-1" id="date-heading" className="date-heading">
          Выберите дату
        </Text>
        <Text as="p" variant="body-1" color="secondary" className="date-description">
          Нажмите на нужный день в календаре.
        </Text>
        <Calendar
          size="l"
          value={selectedDate}
          onUpdate={setSelectedDate}
          aria-labelledby="date-heading"
          className="date-calendar"
        />
        <div className="date-selection" role="status" aria-live="polite" aria-atomic="true">
          <Text variant="body-1" color="secondary">Выбранная дата</Text>
          <Text variant="subheader-2">
            {selectedDate ? selectedDate.format('D MMMM YYYY') : 'Дата пока не выбрана'}
          </Text>
        </div>
      </section>
    </main>
  );
}
