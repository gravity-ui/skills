import {useRef, useState} from 'react';
import {Button, Select} from '@gravity-ui/uikit';
import './App.css';

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const fullDate = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const sameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b);

function CalendarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M7.5 3v4M16.5 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M8 14h2v2H8zM14 14h2v2h-2z" fill="currentColor"/></svg>;
}

export function App() {
  const today = new Date();
  const [visible, setVisible] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);
  const [focused, setFocused] = useState(today);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const year = visible.getFullYear();
  const month = visible.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = Array.from({length: 42}, (_, index) => new Date(year, month, index - offset + 1));
  const years = Array.from({length: 201}, (_, index) => today.getFullYear() - 100 + index);
  if (!years.includes(year)) years.push(year);
  years.sort((a, b) => a - b);

  function showMonth(nextYear: number, nextMonth: number) {
    const next = new Date(nextYear, nextMonth, 1);
    setVisible(next);
    setFocused(next);
  }

  function choose(date: Date) {
    setSelected(date);
    setFocused(date);
    setVisible(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, date: Date) {
    const next = new Date(date);
    const shifts: Record<string, number> = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7};
    if (event.key in shifts) next.setDate(date.getDate() + shifts[event.key]);
    else if (event.key === 'Home') next.setDate(date.getDate() - (date.getDay() + 6) % 7);
    else if (event.key === 'End') next.setDate(date.getDate() + 6 - (date.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      next.setDate(1);
      next.setMonth(date.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      next.setDate(Math.min(date.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    } else return;
    event.preventDefault();
    setFocused(next);
    setVisible(new Date(next.getFullYear(), next.getMonth(), 1));
    requestAnimationFrame(() => dayRefs.current.get(dateKey(next))?.focus());
  }

  return (
    <main className="page">
      <header className="page-heading">
        <div className="eyebrow"><span className="small-mark" /> ПЛАНИРУЙТЕ СВОЁ ВРЕМЯ</div>
        <h1>Календарь</h1>
        <p>Хорошие планы начинаются с даты.</p>
      </header>
      <section className="calendar-card" aria-labelledby="calendar-title">
        <div className="card-heading">
          <div className="icon-tile"><CalendarIcon /></div>
          <div><h2 id="calendar-title">Выберите дату</h2><p>Найдите подходящий день в календаре</p></div>
        </div>
        <div className="calendar-body">
          <div className="calendar-toolbar">
            <div className="month-selectors">
              <Select aria-label="Месяц" value={[String(month)]} onUpdate={([value]) => showMonth(year, Number(value))} options={months.map((label, value) => ({value: String(value), content: label}))} size="l" />
              <Select aria-label="Год" value={[String(year)]} onUpdate={([value]) => showMonth(Number(value), month)} options={years.map(value => ({value: String(value), content: String(value)}))} size="l" />
            </div>
            <div className="month-navigation">
              <Button view="flat" size="l" aria-label="Предыдущий месяц" onClick={() => showMonth(year, month - 1)}><span className="chevron">‹</span></Button>
              <Button view="flat" size="l" aria-label="Следующий месяц" onClick={() => showMonth(year, month + 1)}><span className="chevron">›</span></Button>
            </div>
          </div>
          <span className="sr-only" aria-live="polite">{months[month]} {year}</span>
          <div className="weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
          <div className="days" role="group" aria-label={`${months[month]} ${year}`}>
            {days.map(date => {
              const isSelected = selected !== null && sameDay(date, selected);
              const isToday = sameDay(date, today);
              return <button
                key={dateKey(date)}
                ref={element => {if (element) dayRefs.current.set(dateKey(date), element); else dayRefs.current.delete(dateKey(date));}}
                type="button"
                className={`day ${date.getMonth() !== month ? 'outside' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                aria-label={fullDate.format(date)}
                aria-pressed={isSelected}
                aria-current={isToday ? 'date' : undefined}
                tabIndex={sameDay(date, focused) ? 0 : -1}
                onClick={() => choose(date)}
                onKeyDown={event => moveFocus(event, date)}
              >{date.getDate()}{isToday && <span className="today-dot" />}</button>;
            })}
          </div>
          <div className="calendar-footer">
            <span className="today-legend"><span /> Сегодня, {today.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}</span>
            <Button view="outlined" size="m" onClick={() => choose(new Date())}>Сегодня</Button>
          </div>
        </div>
        <div className="selection-panel">
          <div aria-live="polite" aria-atomic="true"><span className="selection-label">ВЫБРАННАЯ ДАТА</span><div className={`selection-value ${selected ? 'has-selection' : ''}`}>{selected ? fullDate.format(selected) : 'Дата пока не выбрана'}</div></div>
          {selected && <Button view="flat-secondary" aria-label="Сбросить выбранную дату" onClick={() => setSelected(null)}>Сбросить</Button>}
        </div>
      </section>
      <p className="page-note">Нажмите на день в календаре, чтобы выбрать дату</p>
    </main>
  );
}
