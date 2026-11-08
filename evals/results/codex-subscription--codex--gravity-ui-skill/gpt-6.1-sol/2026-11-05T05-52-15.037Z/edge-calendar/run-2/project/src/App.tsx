import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime, type DateTime} from '@gravity-ui/date-utils';
import {Button, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);
  const [focusedDate, setFocusedDate] = useState(() => dateTime());
  const [mode, setMode] = useState<'days' | 'months' | 'quarters' | 'years'>('days');

  const selectToday = () => {
    const today = dateTime();
    setSelectedDate(today);
    setFocusedDate(today);
    setMode('days');
  };

  return (
    <main className="date-page">
      <section className="date-section" aria-labelledby="date-title">
        <header className="date-heading">
          <Text as="h1" variant="header-2" id="date-title">Выберите дату</Text>
          <Text as="p" variant="body-2" color="secondary">
            Нажмите на нужный день в календаре.
          </Text>
        </header>

        <div className="date-card">
          <div className="date-calendar">
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
          </div>

          <div className="date-summary">
            <div className="date-selection" role="status" aria-live="polite" aria-atomic="true">
              <Text as="div" variant="caption-2" color="secondary">Выбранная дата</Text>
              {selectedDate ? (
                <Text as="time" dateTime={selectedDate.format('YYYY-MM-DD')} variant="subheader-1">
                  {selectedDate.format('D MMMM YYYY')}
                </Text>
              ) : (
                <Text as="div" variant="body-2" color="secondary">Пока не выбрана</Text>
              )}
            </div>
            <Button view="outlined" size="m" onClick={selectToday}>Сегодня</Button>
          </div>
        </div>
        <Text as="p" className="date-hint" variant="caption-2" color="secondary">
          Для выбора месяца или года нажмите на заголовок календаря.
        </Text>
      </section>
    </main>
  );
}
