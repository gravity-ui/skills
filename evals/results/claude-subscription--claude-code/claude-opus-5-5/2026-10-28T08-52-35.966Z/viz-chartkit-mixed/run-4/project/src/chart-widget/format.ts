import type {ChartWidgetValueFormat} from './types';

export function createValueFormatter({precision = 0, unit, compact}: ChartWidgetValueFormat = {}) {
    const formatter = new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: precision,
        minimumFractionDigits: compact ? 0 : precision,
        notation: compact ? 'compact' : 'standard',
    });

    return (value: number | null | undefined) => {
        if (value === null || value === undefined || Number.isNaN(value)) {
            return '—';
        }

        const formatted = formatter.format(value);
        return unit ? `${formatted} ${unit}` : formatted;
    };
}
