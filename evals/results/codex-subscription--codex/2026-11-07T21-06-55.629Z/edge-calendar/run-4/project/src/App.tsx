import { useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@gravity-ui/uikit';
import './calendar.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric',
});
const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const sameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b);
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

function moveMonth(date: Date, offset: number) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + offset + 1, 0).getDate();
  return new Date(date.getFullYear(), date.getMonth() + offset, Math.min(date.getDate(), lastDay));
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={direction === 'left' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function App() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const dayButtons = useRef(new Map<string, HTMLButtonElement>());
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = addDays(firstDay, -((firstDay.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

  function selectDate(date: Date) {
    setSelectedDate(date);
    setFocusedDate(date);
    setViewDate(date);
  }

  function changeMonth(offset: number) {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(next);
    setFocusedDate(next);
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft': next = addDays(date, -1); break;
      case 'ArrowRight': next = addDays(date, 1); break;
      case 'ArrowUp': next = addDays(date, -7); break;
      case 'ArrowDown': next = addDays(date, 7); break;
      case 'Home': next = addDays(date, -((date.getDay() + 6) % 7)); break;
      case 'End': next = addDays(date, 6 - ((date.getDay() + 6) % 7)); break;
      case 'PageUp': next = moveMonth(date, event.shiftKey ? -12 : -1); break;
      case 'PageDown': next = moveMonth(date, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    setFocusedDate(next);
    setViewDate(next);
    requestAnimationFrame(() => dayButtons.current.get(dateKey(next))?.focus());
  }

  return (
    <main className="date-page">
      <div className="date-content">
        <div className="calendar-icon" aria-hidden="true">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
            <path d="M7.5 3v4M16.5 3v4M4 10h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <rect x="8" y="13" width="3" height="3" rx="1" fill="currentColor" />
          </svg>
        </div>
        <p className="eyebrow">ВАШИ ПЛАНЫ НАЧИНАЮТСЯ ЗДЕСЬ</p>
        <h1>Выберите дату</h1>
        <p className="page-description">Найдите нужный день в календаре.</p>

        <section className="calendar-card" aria-label="Календарь для выбора даты">
          <div className="calendar-heading">
            <h2 id="calendar-month" aria-live="polite">{monthName.format(viewDate)}</h2>
            <div className="month-navigation">
              <Button view="flat" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}><Chevron direction="left" /></Button>
              <Button view="flat" aria-label="Следующий месяц" onClick={() => changeMonth(1)}><Chevron direction="right" /></Button>
            </div>
          </div>

          <table className="calendar-table" aria-labelledby="calendar-month">
            <thead><tr>{weekdays.map((day, index) => <th key={day} scope="col" className={index > 4 ? 'weekend' : ''}>{day}</th>)}</tr></thead>
            <tbody>{Array.from({ length: 6 }, (_, week) => (
              <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((date) => {
                const selected = selectedDate !== null && sameDay(date, selectedDate);
                const isToday = sameDay(date, today);
                return <td key={dateKey(date)}>
                  <button
                    type="button"
                    ref={(element) => { if (element) dayButtons.current.set(dateKey(date), element); else dayButtons.current.delete(dateKey(date)); }}
                    className={['calendar-day', date.getMonth() !== viewDate.getMonth() ? 'outside-month' : '', selected ? 'selected' : '', isToday ? 'today' : ''].filter(Boolean).join(' ')}
                    aria-label={fullDate.format(date)}
                    aria-pressed={selected}
                    aria-current={isToday ? 'date' : undefined}
                    tabIndex={sameDay(date, focusedDate) ? 0 : -1}
                    onClick={() => selectDate(date)}
                    onFocus={() => setFocusedDate(date)}
                    onKeyDown={(event) => handleDayKeyDown(event, date)}
                  >{date.getDate()}</button>
                </td>;
              })}</tr>
            ))}</tbody>
          </table>

          <div className="calendar-actions">
            <span className="today-legend"><span />Сегодня</span>
            <Button view="outlined" size="m" onClick={() => selectDate(new Date())}>Сегодня</Button>
          </div>
          <div className={`date-selection${selectedDate ? ' has-selection' : ''}`}>
            <div role="status" aria-live="polite">
              <span className="selection-label">Выбранная дата</span>
              <p>{selectedDate ? fullDate.format(selectedDate) : 'Пока не выбрана'}</p>
            </div>
            {selectedDate && <Button view="flat" size="s" onClick={() => setSelectedDate(null)} aria-label="Сбросить выбранную дату">Сбросить</Button>}
          </div>
        </section>
        <p className="calendar-hint">Каждый большой план начинается с одного дня.</p>
      </div>
    </main>
  );
}
