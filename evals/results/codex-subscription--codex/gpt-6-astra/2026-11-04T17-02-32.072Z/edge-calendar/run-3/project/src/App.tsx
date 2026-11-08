import {useRef, useState, type KeyboardEvent} from 'react';
import {Button} from '@gravity-ui/uikit';
import './calendar.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'full'});
const monthTitle = new Intl.DateTimeFormat('ru-RU', {month: 'long', year: 'numeric'});
const sameDay = (a: Date | null, b: Date) => a?.toDateString() === b.toDateString();
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

function shiftMonth(date: Date, offset: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(date.getDate(), lastDay));
  return next;
}

export function App() {
  const today = new Date();
  const [selected, setSelected] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(today));
  const [focused, setFocused] = useState(today);
  const dayButtons = useRef<Map<string, HTMLButtonElement>>(new Map());
  const firstWeekday = (visibleMonth.getDay() + 6) % 7;
  const days = Array.from({length: 42}, (_, index) =>
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstWeekday + 1),
  );

  function choose(date: Date) {
    setSelected(date);
    setFocused(date);
    setVisibleMonth(monthStart(date));
  }

  function changeMonth(offset: number) {
    const next = shiftMonth(visibleMonth, offset);
    setVisibleMonth(next);
    setFocused(next);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    const next = new Date(date);
    const offsets: Record<string, number> = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7};
    if (event.key in offsets) next.setDate(next.getDate() + offsets[event.key]);
    else if (event.key === 'Home') next.setDate(next.getDate() - (next.getDay() + 6) % 7);
    else if (event.key === 'End') next.setDate(next.getDate() + 6 - (next.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      next.setTime(shiftMonth(date, event.key === 'PageUp' ? -1 : 1).getTime());
    } else return;
    event.preventDefault();
    setFocused(next);
    setVisibleMonth(monthStart(next));
    requestAnimationFrame(() => dayButtons.current.get(next.toDateString())?.focus());
  }

  return (
    <main className="date-page">
      <section className="date-picker" aria-labelledby="date-heading">
        <div className="calendar-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3m-10 3h3" />
          </svg>
        </div>
        <h1 id="date-heading">Выберите дату</h1>
        <p className="description">Найдите нужный день в календаре</p>
        <div className="date-summary" aria-live="polite" aria-atomic="true">
          <span className="summary-label">Выбранная дата</span>
          <span className={selected ? 'summary-value' : 'summary-value placeholder'}>
            {selected ? fullDate.format(selected) : 'Дата не выбрана'}
          </span>
        </div>
        <div className="calendar">
          <div className="calendar-toolbar">
            <h2 id="month-heading" aria-live="polite">{monthTitle.format(visibleMonth).replace(' г.', '')}</h2>
            <div className="month-controls">
              <Button view="flat" size="m" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m10 4-4 4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Button>
              <Button view="flat" size="m" aria-label="Следующий месяц" onClick={() => changeMonth(1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Button>
            </div>
          </div>
          <table className="calendar-table" aria-labelledby="month-heading">
            <thead><tr>{weekdays.map((day) => <th key={day} scope="col">{day}</th>)}</tr></thead>
            <tbody>{Array.from({length: 6}, (_, week) => (
              <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((date) => (
                <td key={date.toDateString()}>
                  <button
                    type="button"
                    ref={(element) => {
                      if (element) dayButtons.current.set(date.toDateString(), element);
                      else dayButtons.current.delete(date.toDateString());
                    }}
                    className={[
                      'calendar-day',
                      date.getMonth() !== visibleMonth.getMonth() ? 'outside-month' : '',
                      sameDay(today, date) ? 'today' : '',
                      sameDay(selected, date) ? 'selected' : '',
                    ].join(' ')}
                    aria-label={fullDate.format(date)}
                    aria-pressed={sameDay(selected, date)}
                    aria-current={sameDay(today, date) ? 'date' : undefined}
                    tabIndex={sameDay(focused, date) ? 0 : -1}
                    onClick={() => choose(date)}
                    onKeyDown={(event) => handleKey(event, date)}
                  >{date.getDate()}</button>
                </td>
              ))}</tr>
            ))}</tbody>
          </table>
          <div className="calendar-footer">
            <Button view="outlined" size="m" onClick={() => choose(new Date())}>Сегодня</Button>
            <Button view="flat-secondary" size="m" disabled={!selected} onClick={() => setSelected(null)}>Сбросить</Button>
          </div>
        </div>
        <p className="calendar-hint"><span aria-hidden="true" /> Точкой отмечен сегодняшний день</p>
      </section>
    </main>
  );
}
