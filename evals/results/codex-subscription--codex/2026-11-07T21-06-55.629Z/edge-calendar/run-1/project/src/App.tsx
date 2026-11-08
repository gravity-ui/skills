import {useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {Button} from '@gravity-ui/uikit';
import './calendar.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric',
});
const monthLabel = new Intl.DateTimeFormat('ru-RU', {month: 'long', year: 'numeric'});

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function moveMonth(date: Date, offset: number) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + offset + 1, 0).getDate();
  return new Date(date.getFullYear(), date.getMonth() + offset, Math.min(date.getDate(), lastDay));
}

export function App() {
  const today = new Date();
  const [visibleDate, setVisibleDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState(today);
  const dayButtons = useRef(new Map<string, HTMLButtonElement>());
  const firstDay = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(1 - ((firstDay.getDay() + 6) % 7));
  const days = Array.from({length: 42}, (_, index) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );

  function selectDate(date: Date) {
    setSelectedDate(date);
    setVisibleDate(date);
    setFocusedDate(date);
  }

  function changeMonth(offset: number) {
    const next = moveMonth(visibleDate, offset);
    setVisibleDate(next);
    setFocusedDate(next);
  }

  function onDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next = new Date(date);
    const weekday = (date.getDay() + 6) % 7;
    switch (event.key) {
      case 'ArrowLeft': next.setDate(date.getDate() - 1); break;
      case 'ArrowRight': next.setDate(date.getDate() + 1); break;
      case 'ArrowUp': next.setDate(date.getDate() - 7); break;
      case 'ArrowDown': next.setDate(date.getDate() + 7); break;
      case 'Home': next.setDate(date.getDate() - weekday); break;
      case 'End': next.setDate(date.getDate() + 6 - weekday); break;
      case 'PageUp': next = moveMonth(date, -1); break;
      case 'PageDown': next = moveMonth(date, 1); break;
      default: return;
    }
    event.preventDefault();
    setFocusedDate(next);
    setVisibleDate(next);
    requestAnimationFrame(() => dayButtons.current.get(dateKey(next))?.focus());
  }

  return (
    <main className="date-page">
      <section className="date-picker" aria-labelledby="date-title">
        <h1 id="date-title">Выберите дату</h1>
        <p className="date-description">Нажмите на нужный день в календаре.</p>

        <div className="calendar">
          <div className="calendar-header">
            <Button view="flat" size="l" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}>
              <span aria-hidden="true">‹</span>
            </Button>
            <h2 id="calendar-month" aria-live="polite">{monthLabel.format(visibleDate)}</h2>
            <Button view="flat" size="l" aria-label="Следующий месяц" onClick={() => changeMonth(1)}>
              <span aria-hidden="true">›</span>
            </Button>
          </div>

          <table className="calendar-grid" role="grid" aria-labelledby="calendar-month">
            <thead>
              <tr>{weekdays.map(day => <th key={day} scope="col">{day}</th>)}</tr>
            </thead>
            <tbody>
              {Array.from({length: 6}, (_, week) => (
                <tr key={week}>
                  {days.slice(week * 7, week * 7 + 7).map(date => {
                    const key = dateKey(date);
                    const selected = selectedDate !== null && key === dateKey(selectedDate);
                    const isToday = key === dateKey(today);
                    const outside = date.getMonth() !== visibleDate.getMonth();
                    return (
                      <td key={key} aria-selected={selected}>
                        <button
                          ref={element => {
                            if (element) dayButtons.current.set(key, element);
                            else dayButtons.current.delete(key);
                          }}
                          type="button"
                          className={`calendar-day${outside ? ' outside' : ''}${selected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                          aria-label={fullDate.format(date)}
                          aria-current={isToday ? 'date' : undefined}
                          tabIndex={key === dateKey(focusedDate) ? 0 : -1}
                          onClick={() => selectDate(date)}
                          onKeyDown={event => onDayKeyDown(event, date)}
                        >
                          {date.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="calendar-actions">
            <Button view="flat" onClick={() => selectDate(new Date())}>Сегодня</Button>
            <Button view="flat-secondary" disabled={!selectedDate} onClick={() => setSelectedDate(null)}>Сбросить</Button>
          </div>
        </div>

        <div className="date-result" role="status" aria-live="polite">
          <span className="date-result-label">Выбранная дата</span>
          {selectedDate
            ? <time dateTime={dateKey(selectedDate)}>{fullDate.format(selectedDate)}</time>
            : <span className="date-placeholder">Дата пока не выбрана</span>}
        </div>
      </section>
    </main>
  );
}
