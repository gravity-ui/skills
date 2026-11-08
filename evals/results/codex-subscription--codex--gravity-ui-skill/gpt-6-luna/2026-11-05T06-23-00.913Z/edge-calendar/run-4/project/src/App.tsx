import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTimeParse, type DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(
    () => dateTimeParse('now/d') ?? null,
  );

  return (
    <main className="date-page">
      <section className="date-panel" aria-labelledby="page-title">
        <header className="date-panel__header">
          <Text variant="header-1" id="page-title">
            Выберите дату
          </Text>
          <Text variant="body-2" color="secondary">
            Отметьте нужный день в календаре
          </Text>
        </header>

        <div className="date-panel__calendar">
          <Calendar
            size="l"
            value={selectedDate}
            onUpdate={setSelectedDate}
            aria-label="Календарь для выбора даты"
          />
        </div>

        <div className="date-panel__selection" aria-live="polite">
          <Text variant="caption-1" color="secondary">
            Выбранная дата
          </Text>
          <Text variant="subheader-1">
            {selectedDate ? selectedDate.format('D MMMM YYYY') : 'Дата не выбрана'}
          </Text>
        </div>
      </section>
    </main>
  );
}
