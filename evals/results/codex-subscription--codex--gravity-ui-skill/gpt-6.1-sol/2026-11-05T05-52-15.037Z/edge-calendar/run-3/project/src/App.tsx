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
      <div className="date-page__content">
        <header className="date-page__header">
          <Text as="h1" variant="header-2">Календарь</Text>
          <Text as="p" variant="body-2" color="secondary">
            Выберите удобную для вас дату.
          </Text>
        </header>

        <section className="date-card" aria-label="Выбор даты">
          <div className="date-card__heading">
            <Text as="h2" variant="subheader-2">Выберите дату</Text>
            <Button view="outlined" size="m" onClick={selectToday}>Сегодня</Button>
          </div>

          <div className="date-card__calendar">
            <Calendar
              size="l"
              aria-label="Календарь для выбора даты"
              value={selectedDate}
              onUpdate={setSelectedDate}
              focusedValue={focusedDate}
              onFocusUpdate={setFocusedDate}
              mode={mode}
              onUpdateMode={setMode}
            />
          </div>

          <div className="date-card__selection" role="status" aria-live="polite" aria-atomic="true">
            <Text variant="caption-2" color="secondary">Выбранная дата</Text>
            <Text as="p" variant="body-2" color={selectedDate ? 'primary' : 'secondary'}>
              {selectedDate ? selectedDate.locale('ru').format('D MMMM YYYY [г.]') : 'Дата пока не выбрана'}
            </Text>
          </div>
          <div className="date-card__footer">
            <Text variant="caption-2" color="secondary">Нажмите на день в календаре</Text>
            <Button view="flat-secondary" size="s" disabled={!selectedDate} onClick={() => setSelectedDate(null)}>
              Сбросить
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
