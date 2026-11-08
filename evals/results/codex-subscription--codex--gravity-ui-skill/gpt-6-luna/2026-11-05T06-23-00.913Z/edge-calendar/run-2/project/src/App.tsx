import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(() => dateTime({lang: 'ru'}));

  return (
    <main className="date-page">
      <section className="date-card" aria-labelledby="page-title">
        <header className="date-card__header">
          <p className="date-card__eyebrow">Планирование</p>
          <h1 id="page-title" className="date-card__title">Выберите дату</h1>
          <p className="date-card__description">Отметьте нужный день в календаре</p>
        </header>

        <div className="date-card__content">
          <Calendar
            size="l"
            value={selectedDate}
            onUpdate={setSelectedDate}
            aria-label="Календарь для выбора даты"
          />

          <aside className="selected-date" aria-live="polite">
            <span className="selected-date__label">Выбранная дата</span>
            <span className="selected-date__value">
              {selectedDate ? selectedDate.format('D MMMM YYYY') : 'Дата не выбрана'}
            </span>
          </aside>
        </div>
      </section>
    </main>
  );
}
