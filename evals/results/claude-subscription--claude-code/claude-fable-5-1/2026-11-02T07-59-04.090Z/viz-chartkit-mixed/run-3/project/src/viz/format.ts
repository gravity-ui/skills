const numberFormatters = new Map<number, Intl.NumberFormat>();

export function formatValue(value: number | string | null | undefined, precision = 0, unit?: string) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) {
        return String(value);
    }
    let formatter = numberFormatters.get(precision);
    if (!formatter) {
        formatter = new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        });
        numberFormatters.set(precision, formatter);
    }
    const text = formatter.format(num);
    return unit ? `${text}\u00a0${unit}` : text;
}

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

/** Если все отметки лежат на границах суток, время не показываем. */
export function isDailyTimeline(timeline: number[]) {
    return timeline.every((ts) => ts % 86_400_000 === 0);
}

export function formatTimestamp(ts: number, daily: boolean) {
    return daily ? dateFormatter.format(ts) : dateTimeFormatter.format(ts);
}
