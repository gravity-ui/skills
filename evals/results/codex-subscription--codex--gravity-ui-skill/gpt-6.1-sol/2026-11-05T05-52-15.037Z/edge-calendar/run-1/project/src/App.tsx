import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime, type DateTime} from '@gravity-ui/date-utils';
import {Button, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);
  const [focusedDate, setFocusedDate] = useState(() => dateTime());
  const [mode, setMode] = useState<'days' | 'months' | 'quarters' | 'years'>('days');

  function selectToday() {
    const today = dateTime();
    setSelectedDate(today);
    setFocusedDate(today);
    setMode('days');
  }

  return (
    <main className="date-page">
      <div className="date-heading">
        <Text as="h1" variant="header-1">Выберите дату</Text>
        <Text as="p" variant="body-2" color="secondary">
          Найдите нужный месяц и нажмите на день в календаре.
        </Text>
      </div>

      <section className="date-card" aria-label="Выбор даты">
        <Calendar
          size="l"
          aria-label="Календарь выбора даты"
          value={selectedDate}
          onUpdate={setSelectedDate}
          focusedValue={focusedDate}
          onFocusUpdate={setFocusedDate}
          mode={mode}
          onUpdateMode={setMode}
        />

        <div className="date-selection" role="status" aria-live="polite" aria-atomic="true">
          <Text variant="body-1" color="secondary">Выбранная дата</Text>
          <Text variant="subheader-2">
            {selectedDate ? selectedDate.format('D MMMM YYYY') : 'Дата не выбрана'}
          </Text>
        </div>

        <div className="date-actions">
          <Button view="outlined" onClick={selectToday}>Сегодня</Button>
          <Button view="flat" disabled={!selectedDate} onClick={() => setSelectedDate(null)}>
            Сбросить
          </Button>
        </div>
      </section>
    </main>
  );
}
