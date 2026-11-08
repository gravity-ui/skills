import { useMemo, useState } from 'react';
import './App.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function sameDate(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function App() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const moveMonth = (amount: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  const chooseDate = (date: Date) => {
    setSelectedDate(startOfDay(date));
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <section className="date-picker" aria-labelledby="page-title">
        <div className="calendar-panel">
          <header className="page-heading">
            <div className="eyebrow"><span className="eyebrow-dot" />ПЛАНИРОВАНИЕ</div>
            <h1 id="page-title">Выберите дату</h1>
            <p>Отметьте день в календаре, чтобы продолжить.</p>
          </header>

          <div className="calendar">
            <div className="calendar-toolbar">
              <h2 aria-live="polite">{monthFormatter.format(visibleMonth)}</h2>
              <div className="month-controls" aria-label="Навигация по месяцам">
                <button className="icon-button" type="button" onClick={() => moveMonth(-1)} aria-label="Предыдущий месяц">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5.5 5.5 5.5 5.5" /></svg>
                </button>
                <button className="icon-button" type="button" onClick={() => moveMonth(1)} aria-label="Следующий месяц">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5.5 5.5-5.5 5.5" /></svg>
                </button>
              </div>
            </div>

            <div className="calendar-grid" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
              {weekdays.map((weekday) => (
                <div className="weekday" role="columnheader" key={weekday}>{weekday}</div>
              ))}
              {calendarDays.map((date) => {
                const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                const isSelected = sameDate(date, selectedDate);
                const isToday = sameDate(date, today);
                const className = [
                  'day-button',
                  isCurrentMonth ? '' : 'outside-month',
                  isSelected ? 'selected' : '',
                  isToday && !isSelected ? 'today' : '',
                ].filter(Boolean).join(' ');

                return (
                  <div className="day-cell" role="gridcell" key={date.toISOString()} aria-selected={isSelected}>
                    <button
                      type="button"
                      className={className}
                      onClick={() => chooseDate(date)}
                      aria-label={fullDateFormatter.format(date)}
                      aria-pressed={isSelected}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="calendar-footer">
              <span className="today-legend"><span />Сегодня</span>
              <button className="today-button" type="button" onClick={() => chooseDate(today)}>К сегодняшнему дню</button>
            </div>
          </div>
        </div>

        <aside className="selection-panel" aria-live="polite">
          <div className="selection-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48"><rect x="7.5" y="11" width="33" height="29" rx="6" /><path d="M15 7.5v7M33 7.5v7M8 19h32" /><path d="M17 27h.01M24 27h.01M31 27h.01M17 33h.01M24 33h.01" /></svg>
          </div>
          <div className="selection-label">ВЫБРАННАЯ ДАТА</div>
          <div className="selected-date">{selectedDate.getDate()} <span>{new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(selectedDate)}</span></div>
          <div className="selected-weekday">{new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(selectedDate)}</div>
          <div className="selection-divider" />
          <div className="year-row"><span>Год</span><strong>{selectedDate.getFullYear()}</strong></div>
          <div className="selection-hint">Нажмите на любую дату в календаре, чтобы изменить выбор.</div>
          <div className="selection-decoration" aria-hidden="true">{String(selectedDate.getDate()).padStart(2, '0')}</div>
        </aside>
      </section>
      <footer className="page-footer"><span className="footer-mark" />Ваш календарь</footer>
    </main>
  );
}
