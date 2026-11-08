import { useMemo, useState } from 'react';
import './calendar.css';

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sameDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b);
}

export function App() {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
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

  const moveMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date(today));
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <main className="page-shell">
      <section className="date-picker" aria-label="Выбор даты">
        <div className="picker-heading">
          <div>
            <span className="eyebrow">ПЛАНИРОВАНИЕ</span>
            <h1>Выберите дату</h1>
            <p className="intro">Отметьте нужный день в календаре</p>
          </div>
          <div className="calendar-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 3.5v4M16 3.5v4M4 9.5h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="m9.5 14 1.6 1.6 3.7-3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="calendar-card">
          <div className="calendar-toolbar">
            <div className="month-label" aria-live="polite">{monthFormatter.format(visibleMonth)}</div>
            <div className="month-controls">
              <button className="today-button" type="button" onClick={goToToday}>Сегодня</button>
              <button className="nav-button" type="button" aria-label="Предыдущий месяц" onClick={() => moveMonth(-1)}>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
              </button>
              <button className="nav-button" type="button" aria-label="Следующий месяц" onClick={() => moveMonth(1)}>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
              </button>
            </div>
          </div>

          <div className="calendar-grid" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
            {weekdays.map((weekday, index) => (
              <div className={`weekday${index > 4 ? ' weekend' : ''}`} role="columnheader" key={weekday}>{weekday}</div>
            ))}
            {calendarDays.map((date) => {
              const inMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = sameDay(date, selectedDate);
              const isToday = sameDay(date, today);
              const classes = [
                'day-button',
                !inMonth && 'outside-month',
                isSelected && 'selected',
                isToday && !isSelected && 'today',
              ].filter(Boolean).join(' ');
              return (
                <button
                  className={classes}
                  type="button"
                  role="gridcell"
                  key={dayKey(date)}
                  aria-label={fullDateFormatter.format(date)}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedDate(date);
                    if (!inMonth) setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="calendar-footer">
            <div className="selected-date">
              <span className="selected-caption">ВЫБРАННАЯ ДАТА</span>
              <strong>{fullDateFormatter.format(selectedDate)}</strong>
            </div>
            <span className="date-indicator" aria-hidden="true"><span /></span>
          </div>
        </div>
        <p className="helper-text">Нажмите на день, чтобы выбрать дату</p>
      </section>
    </main>
  );
}
