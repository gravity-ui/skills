import {useRef, useState, type KeyboardEvent} from 'react';
import {Button} from '@gravity-ui/uikit';
import './calendar.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthFormat = new Intl.DateTimeFormat('ru-RU', {month: 'long', year: 'numeric'});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric',
});
const accessibleDateFormat = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'full'});

function sameDay(a: Date, b: Date | null) {
  return b !== null && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function App() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const dayButtons = useRef(new Map<number, HTMLButtonElement>());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const offset = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function selectToday() {
    const date = new Date();
    setSelectedDate(date);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function handleDayKey(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    const steps: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
      Home: -((date.getDay() + 6) % 7), End: 6 - ((date.getDay() + 6) % 7),
    };
    if (!(event.key in steps)) return;
    event.preventDefault();
    const next = new Date(year, month, date.getDate() + steps[event.key]);
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    requestAnimationFrame(() => dayButtons.current.get(next.getDate())?.focus());
  }

  return (
    <main className="date-page">
      <section className="date-picker" aria-labelledby="calendar-title">
        <div className="calendar-heading">
          <span className="calendar-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2" />
            </svg>
          </span>
          <h1 id="calendar-title">Выберите дату</h1>
          <p>Нажмите на нужный день в календаре</p>
        </div>

        <div className="calendar-card">
          <div className="month-navigation">
            <h2 aria-live="polite" aria-atomic="true">{monthFormat.format(visibleMonth)}</h2>
            <div className="month-buttons">
              <Button view="flat" size="m" aria-label="Предыдущий месяц" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}>
                <span className="chevron" aria-hidden="true">‹</span>
              </Button>
              <Button view="flat" size="m" aria-label="Следующий месяц" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}>
                <span className="chevron" aria-hidden="true">›</span>
              </Button>
            </div>
          </div>

          <div className="calendar-grid" role="group" aria-label="Дни месяца">
            {weekdays.map((day) => <span className="weekday" key={day} aria-hidden="true">{day}</span>)}
            {Array.from({length: offset}, (_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
            {Array.from({length: daysInMonth}, (_, index) => {
              const date = new Date(year, month, index + 1);
              const isToday = sameDay(date, today);
              const isSelected = sameDay(date, selectedDate);
              return (
                <button
                  type="button"
                  key={index + 1}
                  ref={(element) => {
                    if (element) dayButtons.current.set(index + 1, element);
                    else dayButtons.current.delete(index + 1);
                  }}
                  className={`calendar-day${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                  aria-label={accessibleDateFormat.format(date)}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => setSelectedDate(date)}
                  onKeyDown={(event) => handleDayKey(event, date)}
                >
                  {index + 1}
                  {isToday && <span className="today-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="calendar-footer">
            <span className="today-legend"><span aria-hidden="true" />Сегодня</span>
            <Button view="outlined" size="m" onClick={selectToday}>Сегодня</Button>
          </div>
        </div>

        <div className="selected-date" role="status" aria-atomic="true">
          <span>Выбранная дата</span>
          <strong>{selectedDate ? dateFormat.format(selectedDate) : 'Дата не выбрана'}</strong>
        </div>
      </section>
    </main>
  );
}
