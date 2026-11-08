import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime } from '@gravity-ui/date-utils';
import type { DateTime } from '@gravity-ui/date-utils';
import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(() => dateTime());

  return (
    <main className="date-page">
      <section className="date-layout" aria-labelledby="page-title">
        <header className="date-intro">
          <p className="date-eyebrow">Планирование</p>
          <h1 id="page-title">Выберите дату</h1>
          <p className="date-description">
            Отметьте день в календаре, чтобы посмотреть выбранную дату.
          </p>
        </header>

        <div className="date-card">
          <div className="calendar-panel">
            <Calendar
              aria-label="Календарь выбора даты"
              value={selectedDate}
              onUpdate={setSelectedDate}
              size="l"
            />
          </div>

          <aside className="selection-panel" aria-live="polite">
            <p className="selection-label">Выбранная дата</p>
            {selectedDate ? (
              <>
                <p className="selection-day">{selectedDate.format('D')}</p>
                <p className="selection-date">
                  {selectedDate.format('dddd')}
                  <br />
                  {selectedDate.format('D MMMM YYYY')}
                </p>
              </>
            ) : (
              <p className="selection-empty">Дата не выбрана</p>
            )}
            <p className="selection-hint">Нажмите на день в календаре, чтобы изменить выбор.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
