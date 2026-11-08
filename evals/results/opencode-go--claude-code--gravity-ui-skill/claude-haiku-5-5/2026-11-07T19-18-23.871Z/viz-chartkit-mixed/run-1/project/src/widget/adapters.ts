// Чистые преобразования общего формата виджета в формат каждого движка.
// Модуль не импортирует движки во время выполнения (только типы), поэтому остаётся лёгким
// и не тянет код графиков в основной бандл.
import type {ChartData} from '@gravity-ui/charts';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import type {ThemeType} from '@gravity-ui/uikit';

import type {WidgetSeries} from './types';

/** Объединённая временная шкала всех рядов: отсортированные уникальные метки времени. */
export function buildTimeline(series: WidgetSeries[]): number[] {
    const stamps = new Set<number>();
    for (const s of series) {
        for (const p of s.points) {
            stamps.add(p.t);
        }
    }
    return [...stamps].sort((a, b) => a - b);
}

/**
 * Выравнивает значения ряда по общей шкале. Метки, которых у ряда нет, становятся `null`,
 * чтобы движок показал разрыв, а не интерполировал выдуманные значения.
 */
export function alignSeries(series: WidgetSeries, timeline: number[]): (number | null)[] {
    const byTime = new Map<number, number | null>();
    for (const p of series.points) {
        byTime.set(p.t, p.v);
    }
    return timeline.map((t) => byTime.get(t) ?? null);
}

/** Формат `@gravity-ui/charts`: `series.data[]` с линейными сериями и временной осью. */
export function toChartsData(series: WidgetSeries[], colors: string[]): ChartData {
    return {
        colors,
        xAxis: {type: 'datetime'},
        legend: {enabled: series.length > 1},
        series: {
            data: series.map((s, i) => ({
                type: 'line' as const,
                name: s.name,
                color: colors[i],
                lineWidth: 2,
                nullMode: 'skip' as const,
                data: s.points.map((p) => ({x: p.t, y: p.v})),
            })),
        },
    };
}

/** Формат `@gravity-ui/yagr`: общий `timeline` и выровненные значения рядов (в миллисекундах). */
export function toYagrConfig(series: WidgetSeries[], colors: string[], themeType: ThemeType): MinimalValidConfig {
    const timeline = buildTimeline(series);
    return {
        timeline,
        series: series.map((s, i) => ({
            id: s.id,
            name: s.name,
            type: 'line' as const,
            color: colors[i],
            width: 2,
            data: alignSeries(s, timeline),
        })),
        legend: {show: series.length > 1, position: 'bottom'},
        chart: {appearance: {theme: themeType}},
    };
}
