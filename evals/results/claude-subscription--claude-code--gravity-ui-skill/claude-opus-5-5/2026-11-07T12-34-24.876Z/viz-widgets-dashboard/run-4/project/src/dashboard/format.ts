const compact = new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1});
const currencyCompact = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    notation: 'compact',
    maximumFractionDigits: 1,
});
const currencyFull = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export function formatMetric(value: number, unit: 'currency' | 'percent' | 'count' = 'count') {
    switch (unit) {
        case 'currency':
            return currencyCompact.format(value);
        case 'percent':
            return `${percent.format(value)} %`;
        default:
            return compact.format(value);
    }
}

export function formatCurrency(value: number) {
    return currencyFull.format(value);
}

export function formatDelta(delta: number) {
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
    return `${sign}${percent.format(Math.abs(delta))} %`;
}

export function formatCount(value: number) {
    return compact.format(value);
}
