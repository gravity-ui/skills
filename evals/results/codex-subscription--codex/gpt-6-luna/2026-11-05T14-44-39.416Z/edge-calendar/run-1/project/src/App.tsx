import { useMemo, useState } from 'react';
import './App.css';

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const selectedFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

function makeCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const firstCell = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstCell);
    day.setDate(firstCell.getDate() + index);
    return day;
  });
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="arrow-icon">
      <path d={direction === 'left' ? 'm12.5 4.5-5.5 5.5 5.5 5.5' : 'm7.5 4.5 5.5 5.5-5.5 5.5'} />
    </svg>
  );
}

export function App() {
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const calendarDays = useMemo(() => makeCalendarDays(visibleMonth), [visibleMonth]);

  const shiftMonth = (amount: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  const selectDay = (day: Date) => {
    setSelected(day);
    if (day.getMonth() !== visibleMonth.getMonth() || day.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  const goToToday = () => {
    setSelected(today);
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <main className="page-shell">
      <div className="date-picker">
        <section className="calendar-panel" aria-label="Календарь">
          <div className="calendar-topline">
            <div>
              <p className="eyebrow">Планирование</p>
              <h1>Выберите дату</h1>
            </div>
            <button className="today-button" type="button" onClick={goToToday}>Сегодня</button>
          </div>

          <div className="month-toolbar">
            <h2 aria-live="polite">{monthFormatter.format(visibleMonth)}</h2>
            <div className="month-controls">
              <button className="icon-button" type="button" aria-label="Предыдущий месяц" onClick={() => shiftMonth(-1)}>
                <Arrow direction="left" />
              </button>
              <button className="icon-button" type="button" aria-label="Следующий месяц" onClick={() => shiftMonth(1)}>
                <Arrow direction="right" />
              </button>
            </div>
          </div>

          <div className="calendar-grid" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
            {weekdays.map((weekday) => (
              <div className="weekday" role="columnheader" key={weekday}>{weekday}</div>
            ))}
            {calendarDays.map((day) => {
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const isSelected = sameDay(day, selected);
              const isToday = sameDay(day, today);
              const classNames = [
                'day-button',
                !isCurrentMonth && 'outside-month',
                isToday && 'is-today',
                isSelected && 'is-selected',
              ].filter(Boolean).join(' ');
              return (
                <button
                  key={dateKey(day)}
                  type="button"
                  role="gridcell"
                  aria-pressed={isSelected}
                  aria-label={selectedFormatter.format(day)}
                  className={classNames}
                  onClick={() => selectDay(day)}
                >
                  <span>{day.getDate()}</span>
                </button>
              );
            })}
          </div>
          <div className="calendar-legend"><span className="legend-dot" /> Сегодня</div>
        </section>

        <aside className="selection-panel" aria-live="polite">
          <div className="selection-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" /><path d="m9.5 14 1.7 1.7 3.6-3.8" /></svg>
          </div>
          <p className="eyebrow">Выбранная дата</p>
          <p className="selected-date">{selected.getDate()}</p>
          <p className="selected-month">{new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(selected)}</p>
          <p className="selected-weekday">{new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(selected)}</p>
          <div className="selection-divider" />
          <p className="selection-hint">Нажмите на любой день в календаре, чтобы выбрать дату</p>
          <div className="selected-full-date">{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(selected)}</div>
        </aside>
      </div>
      <p className="page-caption">Ваше расписание начинается с выбранного дня</p>
    </main>
  );
}
