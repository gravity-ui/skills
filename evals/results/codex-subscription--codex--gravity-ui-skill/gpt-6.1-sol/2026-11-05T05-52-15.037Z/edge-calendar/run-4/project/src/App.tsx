import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime} from '@gravity-ui/date-utils';
import {Button, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState(() => dateTime());
  const [focusedDate, setFocusedDate] = useState(selectedDate);
  const [mode, setMode] = useState<'days' | 'months' | 'quarters' | 'years'>('days');

  const selectToday = () => {
    const today = dateTime();
    setSelectedDate(today);
    setFocusedDate(today);
    setMode('days');
  };

  return (
    <main className="date-page">
      <section className="date-section" aria-labelledby="date-heading">
        <header className="date-heading">
          <Text as="h1" variant="header-2" id="date-heading">Выберите дату</Text>
          <Text as="p" variant="body-2" color="secondary">
            Нажмите на нужный день в календаре.
          </Text>
        </header>

        <div className="date-card">
          <Calendar
            aria-label="Выбор даты"
            size="l"
            value={selectedDate}
            onUpdate={setSelectedDate}
            focusedValue={focusedDate}
            onFocusUpdate={setFocusedDate}
            mode={mode}
            onUpdateMode={setMode}
          />

          <div className="date-selection" role="status" aria-atomic="true">
            <Text variant="body-1" color="secondary">Выбранная дата</Text>
            <Text as="time" dateTime={selectedDate.format('YYYY-MM-DD')} variant="subheader-2">
              {selectedDate.format('D MMMM YYYY')} г.
            </Text>
          </div>

          <Button view="outlined" size="l" width="max" onClick={selectToday}>
            Сегодня
          </Button>
        </div>
      </section>
    </main>
  );
}
