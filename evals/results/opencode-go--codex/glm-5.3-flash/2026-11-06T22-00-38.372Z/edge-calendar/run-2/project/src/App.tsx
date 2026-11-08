import React, { useMemo, useState } from 'react';
import { Button } from '@gravity-ui/uikit';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addMonths = (date: Date, months: number) => {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
};

const isSameDay = (first: Date, second: Date) => {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
};

function DateCalendar({ value, onChange }: { value: Date | null; onChange: (date: Date) => void }) {
  const today = startOfDay(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => startOfDay(value ?? today));
  const visibleDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const daysFromMonday = (firstDay.getDay() + 6) % 7;
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - daysFromMonday);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  return (
    <div aria-label="Выбор даты" className="date-calendar" role="group">
      <div className="date-calendar__header">
        <Button aria-label="Предыдущий месяц" size="s" view="flat" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}>
          ‹
        </Button>
        <span aria-live="polite" className="date-calendar__month">
          {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </span>
        <Button aria-label="Следующий месяц" size="s" view="flat" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}>
          ›
        </Button>
      </div>

      <div className="date-calendar__grid" role="grid">
        {WEEKDAYS.map((weekday) => (
          <span aria-hidden="true" className="date-calendar__weekday" key={weekday}>
            {weekday}
          </span>
        ))}

        {visibleDays.map((date) => {
          const isSelected = Boolean(value && isSameDay(date, value));
          const isToday = isSameDay(date, today);
          const isOutside = date.getMonth() !== visibleMonth.getMonth();

          return (
            <button
              aria-current={isToday ? 'date' : undefined}
              aria-selected={isSelected}
              className={[
                'date-calendar__day',
                isOutside ? 'date-calendar__day_outside' : '',
                isToday ? 'date-calendar__day_today' : '',
                isSelected ? 'date-calendar__day_selected' : '',
              ].filter(Boolean).join(' ')}
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              onClick={() => onChange(date)}
              role="gridcell"
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <main className="page">
      <h1 className="page__title">Календарь</h1>
      <p className="page__description">
        {selectedDate ? `Выбранная дата: ${formatDate(selectedDate)}` : 'Выберите дату в календаре.'}
      </p>
      <DateCalendar onChange={setSelectedDate} value={selectedDate} />
    </main>
  );
}
