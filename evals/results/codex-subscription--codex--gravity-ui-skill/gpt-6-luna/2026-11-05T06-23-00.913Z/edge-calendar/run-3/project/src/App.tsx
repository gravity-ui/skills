import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime, type DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(() => dateTime());

  return (
    <main className="date-page">
      <section className="date-picker" aria-labelledby="date-picker-title">
        <header className="date-picker__header">
          <Text variant="header-2" as="h1" id="date-picker-title">
            Выберите дату
          </Text>
          <Text variant="body-2" color="secondary">
            Отметьте нужный день в календаре
          </Text>
        </header>

        <div className="date-picker__calendar">
          <Calendar
            aria-label="Календарь выбора даты"
            size="l"
            value={selectedDate}
            onUpdate={setSelectedDate}
          />
        </div>

        <div className="date-picker__selection" aria-live="polite">
          <Text variant="body-2" color="secondary">
            Выбранная дата
          </Text>
          <Text variant="subheader-2">
            {selectedDate ? selectedDate.format('D MMMM YYYY') : 'Дата не выбрана'}
          </Text>
        </div>
      </section>
    </main>
  );
}
