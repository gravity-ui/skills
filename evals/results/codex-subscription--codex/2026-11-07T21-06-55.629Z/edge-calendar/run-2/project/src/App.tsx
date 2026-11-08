import { useRef, useState, type KeyboardEvent } from 'react';
import './calendar.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });
const monthTitle = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function moveMonth(date: Date, amount: number) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + amount + 1, 0).getDate();
  return new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), lastDay));
}

export function App() {
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [activeDate, setActiveDate] = useState(today);
  const calendarRef = useRef<HTMLDivElement>(null);
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
  const dates = Array.from({ length: cellCount }, (_, index) => new Date(year, month, index - offset + 1));

  function focusDate(date: Date) {
    setActiveDate(date);
    requestAnimationFrame(() => {
      calendarRef.current?.querySelector<HTMLButtonElement>(`[data-date="${dateKey(date)}"]`)?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next: Date;
    const weekday = (date.getDay() + 6) % 7;
    switch (event.key) {
      case 'ArrowLeft': next = new Date(year, month, date.getDate() - 1); break;
      case 'ArrowRight': next = new Date(year, month, date.getDate() + 1); break;
      case 'ArrowUp': next = new Date(year, month, date.getDate() - 7); break;
      case 'ArrowDown': next = new Date(year, month, date.getDate() + 7); break;
      case 'Home': next = new Date(year, month, date.getDate() - weekday); break;
      case 'End': next = new Date(year, month, date.getDate() + 6 - weekday); break;
      case 'PageUp': next = moveMonth(date, event.shiftKey ? -12 : -1); break;
      case 'PageDown': next = moveMonth(date, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    focusDate(next);
  }

  return (
    <main className="date-page">
      <section className="date-card" aria-labelledby="date-heading">
        <div className="calendar-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2" />
          </svg>
        </div>
        <h1 id="date-heading">Выберите дату</h1>
        <p className="date-description">Найдите нужный день в календаре.</p>

        <div className="date-selection" role="status" aria-live="polite" aria-atomic="true">
          <span className="date-label">Выбранная дата</span>
          <span className={selected ? 'date-value' : 'date-value date-placeholder'}>
            {selected ? fullDate.format(selected) : 'Дата не выбрана'}
          </span>
        </div>

        <div className="calendar" ref={calendarRef}>
          <div className="calendar-header">
            <button className="month-arrow" type="button" aria-label="Предыдущий месяц" onClick={() => setActiveDate(moveMonth(activeDate, -1))}>
              <span aria-hidden="true">‹</span>
            </button>
            <h2 id="month-heading" aria-live="polite">{monthTitle.format(activeDate).replace(' г.', '')}</h2>
            <button className="month-arrow" type="button" aria-label="Следующий месяц" onClick={() => setActiveDate(moveMonth(activeDate, 1))}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
          <table className="calendar-table" aria-labelledby="month-heading">
            <thead><tr>{weekdays.map(day => <th key={day} scope="col">{day}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: cellCount / 7 }, (_, week) => (
                <tr key={week}>
                  {dates.slice(week * 7, week * 7 + 7).map(date => {
                    const isSelected = selected !== null && dateKey(date) === dateKey(selected);
                    const isToday = dateKey(date) === dateKey(today);
                    return (
                      <td key={dateKey(date)}>
                        <button
                          type="button"
                          className={`calendar-day${date.getMonth() !== month ? ' outside-month' : ''}${isSelected ? ' selected' : ''}`}
                          data-date={dateKey(date)}
                          tabIndex={dateKey(date) === dateKey(activeDate) ? 0 : -1}
                          aria-label={fullDate.format(date)}
                          aria-pressed={isSelected}
                          aria-current={isToday ? 'date' : undefined}
                          onKeyDown={event => handleKeyDown(event, date)}
                          onClick={() => { setSelected(date); focusDate(date); }}
                        >
                          {date.getDate()}
                          {isToday && <span className="today-dot" aria-hidden="true" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="calendar-footer">
            <button type="button" className="calendar-action" onClick={() => { setSelected(today); setActiveDate(today); }}>Сегодня</button>
            <button type="button" className="calendar-action clear-action" disabled={!selected} onClick={() => setSelected(null)}>Сбросить</button>
          </div>
        </div>
        <p className="calendar-hint">Точка отмечает сегодняшний день</p>
      </section>
    </main>
  );
}
