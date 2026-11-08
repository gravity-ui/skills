import React from 'react';
import {Button, Text} from '@gravity-ui/uikit';
import {ChevronLeft, ChevronRight} from '@gravity-ui/icons';

import './Calendar.css';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
});

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

interface CalendarDay {
    date: Date;
    inCurrentMonth: boolean;
}

function buildWeeks(year: number, month: number): CalendarDay[][] {
    const firstOfMonth = new Date(year, month, 1);
    // Monday-based offset of the first day of the month
    const leadingDays = (firstOfMonth.getDay() + 6) % 7;

    const start = new Date(year, month, 1 - leadingDays);
    const weeks: CalendarDay[][] = [];

    for (let week = 0; week < 6; week++) {
        const days: CalendarDay[] = [];
        for (let weekday = 0; weekday < 7; weekday++) {
            const date = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate() + week * 7 + weekday,
            );
            days.push({date, inCurrentMonth: date.getMonth() === month});
        }
        weeks.push(days);
        // Stop once the whole last row is already past the current month
        if (days.every((d) => !d.inCurrentMonth)) {
            weeks.pop();
            break;
        }
    }

    return weeks;
}

export interface CalendarProps {
    value: Date | null;
    onChange: (date: Date) => void;
}

export function Calendar({value, onChange}: CalendarProps) {
    const today = new Date();
    const [viewDate, setViewDate] = React.useState(() => value ?? today);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const weeks = buildWeeks(year, month);

    const goToMonth = (offset: number) => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const goToToday = () => {
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
        onChange(today);
    };

    return (
        <div className="calendar">
            <div className="calendar__header">
                <Button
                    view="flat"
                    size="m"
                    aria-label="Предыдущий месяц"
                    onClick={() => goToMonth(-1)}
                >
                    <ChevronLeft />
                </Button>
                <Text variant="subheader-2" className="calendar__title">
                    {monthFormatter.format(viewDate)}
                </Text>
                <Button
                    view="flat"
                    size="m"
                    aria-label="Следующий месяц"
                    onClick={() => goToMonth(1)}
                >
                    <ChevronRight />
                </Button>
            </div>

            <div className="calendar__grid" role="grid">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="calendar__weekday">
                        <Text variant="caption-2" color="secondary">
                            {day}
                        </Text>
                    </div>
                ))}

                {weeks.flat().map(({date, inCurrentMonth}) => {
                    const selected = value !== null && isSameDay(date, value);
                    const isToday = isSameDay(date, today);

                    const classNames = ['calendar__day'];
                    if (!inCurrentMonth) classNames.push('calendar__day_outside');
                    if (isToday) classNames.push('calendar__day_today');
                    if (selected) classNames.push('calendar__day_selected');

                    return (
                        <button
                            key={date.toISOString()}
                            type="button"
                            className={classNames.join(' ')}
                            aria-pressed={selected}
                            onClick={() => {
                                onChange(date);
                                if (!inCurrentMonth) {
                                    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
                                }
                            }}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="calendar__footer">
                <Button view="flat-action" size="s" onClick={goToToday}>
                    Сегодня
                </Button>
            </div>
        </div>
    );
}
