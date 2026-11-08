import { useMemo, useState } from 'react';
import './App.css';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

export function App() {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const moveMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const chooseDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="date-picker" aria-label="Выбор даты">
        <header className="card-heading">
          <div className="heading-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7.5 3.5v4M16.5 3.5v4M4 9.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M8 13h2M14 13h2M8 16.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">Планирование</p>
            <h1>Выберите дату</h1>
          </div>
        </header>

        <div className="calendar-panel">
          <div className="calendar-toolbar">
            <h2 aria-live="polite">{monthFormatter.format(visibleMonth)}</h2>
            <div className="month-controls">
              <button className="icon-button" type="button" aria-label="Предыдущий месяц" onClick={() => moveMonth(-1)}>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
              </button>
              <button className="icon-button" type="button" aria-label="Следующий месяц" onClick={() => moveMonth(1)}>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
              </button>
            </div>
          </div>

          <div className="calendar-grid" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
            {WEEKDAYS.map((day) => <div className="weekday" role="columnheader" key={day}>{day}</div>)}
            {days.map((date) => {
              const outsideMonth = date.getMonth() !== visibleMonth.getMonth();
              const isSelected = sameDay(date, selectedDate);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={dateKey(date)}
                  type="button"
                  className={`day${outsideMonth ? ' outside' : ''}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  role="gridcell"
                  aria-pressed={isSelected}
                  aria-label={fullDateFormatter.format(date)}
                  onClick={() => chooseDate(date)}
                >
                  <span>{date.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="calendar-footer">
            <span className="today-key"><i /> Сегодня</span>
            <button className="today-button" type="button" onClick={() => chooseDate(today)}>Перейти к сегодня</button>
          </div>
        </div>

        <footer className="selection-summary" aria-live="polite">
          <div className="summary-date">
            <span className="summary-label">Выбранная дата</span>
            <strong>{fullDateFormatter.format(selectedDate)}</strong>
          </div>
          <span className="check-mark" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none"><path d="m5 10.2 3.2 3.1L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </footer>
      </section>
      <p className="page-note">Выберите день в календаре, чтобы продолжить планирование</p>
    </main>
  );
}
