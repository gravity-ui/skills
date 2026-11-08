import {useRef, useState, type KeyboardEvent} from 'react';
import {Button} from '@gravity-ui/uikit';

import './App.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric',
});
const monthLabel = new Intl.DateTimeFormat('ru-RU', {month: 'long', year: 'numeric'});

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function moveMonth(date: Date, offset: number) {
  const first = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), lastDay));
}

export function App() {
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [visibleDate, setVisibleDate] = useState(today);
  const [focusedDate, setFocusedDate] = useState(today);
  const pendingFocus = useRef<string | null>(null);

  const firstDay = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const days = Array.from({length: 42}, (_, index) =>
    new Date(firstDay.getFullYear(), firstDay.getMonth(), index - mondayOffset + 1),
  );

  function selectDate(date: Date) {
    setSelected(date);
    setVisibleDate(date);
    setFocusedDate(date);
  }

  function changeMonth(offset: number) {
    const next = moveMonth(visibleDate, offset);
    setVisibleDate(next);
    setFocusedDate(next);
  }

  function handleDayKey(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
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
    pendingFocus.current = dateKey(next);
    setVisibleDate(next);
    setFocusedDate(next);
  }

  return (
    <main className="date-page">
      <section className="date-picker" aria-labelledby="date-heading">
        <h1 id="date-heading">Выберите дату</h1>
        <p className="date-description">Нажмите на нужный день в календаре.</p>

        <div className="calendar">
          <div className="calendar-header">
            <Button view="flat" size="l" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}>
              <Chevron direction="left" />
            </Button>
            <h2 id="calendar-month" aria-live="polite">{monthLabel.format(visibleDate)}</h2>
            <Button view="flat" size="l" aria-label="Следующий месяц" onClick={() => changeMonth(1)}>
              <Chevron direction="right" />
            </Button>
          </div>

          <table className="calendar-grid" aria-labelledby="calendar-month">
            <thead>
              <tr>{weekdays.map((day) => <th key={day} scope="col">{day}</th>)}</tr>
            </thead>
            <tbody>
              {Array.from({length: 6}, (_, week) => (
                <tr key={week}>
                  {days.slice(week * 7, week * 7 + 7).map((date) => {
                    const key = dateKey(date);
                    const isSelected = selected !== null && key === dateKey(selected);
                    const isToday = key === dateKey(today);
                    return (
                      <td key={key}>
                        <Button
                          ref={(node: HTMLButtonElement | null) => {
                            if (node && pendingFocus.current === key) {
                              pendingFocus.current = null;
                              node.focus();
                            }
                          }}
                          className={[
                            'calendar-day',
                            date.getMonth() !== visibleDate.getMonth() ? 'calendar-day-outside' : '',
                            isToday && !isSelected ? 'calendar-day-today' : '',
                          ].filter(Boolean).join(' ')}
                          view={isSelected ? 'action' : 'flat'}
                          size="l"
                          width="max"
                          aria-label={fullDate.format(date)}
                          aria-pressed={isSelected}
                          aria-current={isToday ? 'date' : undefined}
                          tabIndex={key === dateKey(focusedDate) ? 0 : -1}
                          onFocus={() => setFocusedDate(date)}
                          onKeyDown={(event) => handleDayKey(event, date)}
                          onClick={() => selectDate(date)}
                        >
                          {date.getDate()}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="calendar-footer">
            <Button view="flat" onClick={() => selectDate(today)}>Сегодня</Button>
            <Button view="flat-secondary" disabled={!selected} onClick={() => setSelected(null)}>
              Сбросить
            </Button>
          </div>
        </div>

        <div className="date-result" role="status" aria-live="polite" aria-atomic="true">
          <span className="date-result-label">Выбранная дата</span>
          <span className="date-result-value">{selected ? fullDate.format(selected) : 'Дата не выбрана'}</span>
        </div>
      </section>
    </main>
  );
}

function Chevron({direction}: {direction: 'left' | 'right'}) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12 5L7 10L12 15' : 'M8 5L13 10L8 15'}
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
