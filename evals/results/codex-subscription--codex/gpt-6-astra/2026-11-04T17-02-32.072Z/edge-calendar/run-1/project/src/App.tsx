import {useRef, useState, type KeyboardEvent} from 'react';
import {Button} from '@gravity-ui/uikit';
import './styles.css';

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
const accessibleDate = new Intl.DateTimeFormat('ru-RU', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
const sameDay = (a: Date, b: Date | null) => b !== null && a.toDateString() === b.toDateString();
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

function CalendarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/></svg>;
}

export function App() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState(today);
  const dayButtons = useRef(new Map<string, HTMLButtonElement>());
  const startOffset = (visibleMonth.getDay() + 6) % 7;
  const days = Array.from({length: 42}, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - startOffset + 1));

  function selectDate(date: Date) {
    setSelectedDate(date);
    setFocusedDate(date);
    setVisibleMonth(monthStart(date));
  }

  function changeMonth(offset: number) {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(next);
    setFocusedDate(next);
  }

  function onDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next = new Date(date);
    const offsets: Record<string, number> = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -((date.getDay() + 6) % 7), End: 6 - ((date.getDay() + 6) % 7)};
    if (event.key in offsets) {
      next.setDate(date.getDate() + offsets[event.key]);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const target = new Date(date.getFullYear(), date.getMonth() + (event.key === 'PageUp' ? -1 : 1), 1);
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      next = new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
    } else {
      return;
    }
    event.preventDefault();
    setFocusedDate(next);
    setVisibleMonth(monthStart(next));
    requestAnimationFrame(() => dayButtons.current.get(next.toDateString())?.focus());
  }

  return (
    <div className="page">
      <header className="page-header"><a className="brand" href="./"><span className="brand-icon"><CalendarIcon /></span>Календарь</a><span className="header-note">Всё начинается с даты</span></header>
      <main>
        <div className="intro"><span className="eyebrow">ВАШИ ПЛАНЫ</span><h1>Выберите дату</h1><p>Найдите подходящий день в календаре.</p></div>
        <section className="calendar-card" aria-label="Выбор даты">
          <div className="selection"><span className="selection-icon"><CalendarIcon /></span><div><span className="field-label">Выбранная дата</span><p className={selectedDate ? 'date-value' : 'date-value placeholder'} aria-live="polite">{selectedDate ? fullDate.format(selectedDate) : 'Дата не выбрана'}</p></div>{selectedDate && <span className="selected-check" aria-hidden="true">✓</span>}</div>
          <div className="calendar-body">
            <div className="month-navigation"><h2 id="month-heading" aria-live="polite">{months[visibleMonth.getMonth()]} <span>{visibleMonth.getFullYear()}</span></h2><div className="month-buttons"><Button view="flat" size="m" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}><span className="chevron">‹</span></Button><Button view="flat" size="m" aria-label="Следующий месяц" onClick={() => changeMonth(1)}><span className="chevron">›</span></Button></div></div>
            <table className="calendar" aria-labelledby="month-heading"><thead><tr>{weekdays.map((day, index) => <th key={day} scope="col" className={index > 4 ? 'weekend' : ''}>{day}</th>)}</tr></thead><tbody>{Array.from({length: 6}, (_, week) => <tr key={week}>{days.slice(week * 7, week * 7 + 7).map(date => {
              const selected = sameDay(date, selectedDate);
              const isToday = sameDay(date, today);
              const outside = date.getMonth() !== visibleMonth.getMonth();
              return <td key={date.toDateString()}><button type="button" ref={element => { if (element) dayButtons.current.set(date.toDateString(), element); else dayButtons.current.delete(date.toDateString()); }} className={`day${outside ? ' outside' : ''}${selected ? ' selected' : ''}${isToday ? ' today' : ''}`} aria-label={accessibleDate.format(date)} aria-pressed={selected} aria-current={isToday ? 'date' : undefined} tabIndex={sameDay(date, focusedDate) ? 0 : -1} onClick={() => selectDate(date)} onKeyDown={event => onDayKeyDown(event, date)}>{date.getDate()}{isToday && <span className="today-dot" />}</button></td>;
            })}</tr>)}</tbody></table>
            <div className="calendar-actions"><Button view="outlined" size="m" onClick={() => selectDate(new Date())}>Сегодня</Button><Button view="flat-secondary" size="m" disabled={!selectedDate} onClick={() => setSelectedDate(null)}>Сбросить</Button></div>
          </div>
          <div className="calendar-footer"><span className="legend-dot" />Сегодня<span className="footer-divider" />Выберите день, чтобы отметить дату</div>
        </section>
        <p className="keyboard-hint">Используйте стрелки для навигации и Enter для выбора</p>
      </main>
      <footer className="page-footer">Хороший день для новых планов</footer>
    </div>
  );
}
