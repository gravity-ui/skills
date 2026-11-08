import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {VizDataset, VizRenderContext} from '../types';

/**
 * Yagr (uPlot) рисует на canvas и ждёт общую шкалу времени: один массив
 * `timeline` и по массиву значений на серию. Собираем объединённую шкалу,
 * чтобы серии с разной сеткой времени тоже легли корректно.
 */
export function buildTimeline(dataset: VizDataset): number[] {
    const first = dataset.series[0];
    const sameGrid =
        first !== undefined &&
        dataset.series.every(
            (s) =>
                s.points.length === first.points.length &&
                s.points.every((p, i) => p.t === first.points[i]!.t),
        );
    if (sameGrid) {
        return first.points.map((p) => p.t);
    }
    const set = new Set<number>();
    for (const s of dataset.series) {
        for (const p of s.points) {
            set.add(p.t);
        }
    }
    return Array.from(set).sort((a, b) => a - b);
}

function alignValues(points: VizDataset['series'][number]['points'], timeline: number[]) {
    if (points.length === timeline.length && points.every((p, i) => p.t === timeline[i])) {
        return points.map((p) => p.y);
    }
    const byT = new Map<number, number | null>();
    for (const p of points) {
        byT.set(p.t, p.y);
    }
    return timeline.map((t) => byT.get(t) ?? null);
}

export function formatValue(value: string | number | null, unit?: string): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) {
        return String(value);
    }
    const text = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(num);
    return unit ? `${text} ${unit}` : text;
}

/**
 * Чистое преобразование единого датасета в данные плагина Yagr
 * (режим «Мониторинг»: тысячи точек, курсор-перекрестье, закрепляемый тултип).
 *
 * Цвета осей, сетки и фона задаются CSS-переменными `--yagr-*` на корне виджета,
 * поэтому здесь они не дублируются.
 */
export function toYagrData(dataset: VizDataset, ctx: VizRenderContext): YagrWidgetData {
    const timeline = buildTimeline(dataset);
    const titleFormat = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: dataset.timeZone,
    });

    const graphs = dataset.series.map((s, index) => ({
        id: s.id,
        name: s.name,
        type: 'line' as const,
        // Плотный ряд: 1.5px, иначе тысячи точек сливаются в полосу.
        width: 1.5,
        spanGaps: false,
        color: ctx.palette[index % ctx.palette.length]!,
        data: alignValues(s.points, timeline),
    }));

    return {
        data: {
            timeline,
            timeZone: dataset.timeZone,
            // Yagr собирает список серий uPlot через unshift: первая в конфиге
            // оказывается последней в легенде и тултипе. Переворачиваем, чтобы
            // порядок чтения совпадал с порядком датасета (цвета уже назначены).
            graphs: graphs.slice().reverse(),
        },
        libraryConfig: {
            chart: {
                appearance: {theme: ctx.theme, locale: 'ru'},
                series: {type: 'line', interpolation: 'linear'},
                select: {zoom: true},
                size: {adaptive: true},
            },
            scales: {
                y: {min: dataset.yMin ?? null, max: dataset.yMax ?? null, range: 'nice'},
            },
            axes: {
                x: {grid: {show: false}},
                y: {
                    precision: 'auto',
                    values: (_u, ticks) => ticks.map((v) => formatValue(v, dataset.unit)),
                },
            },
            cursor: {
                x: {visible: true},
                y: {visible: false},
                snapToValues: 'closest',
                markersSize: 6,
            },
            tooltip: {
                show: true,
                strategy: 'pin',
                sum: false,
                tracking: 'sticky',
                title: (data) => titleFormat.format(data.x),
                value: (v) => formatValue(v, dataset.unit),
            },
            legend: {show: dataset.series.length > 1, position: 'bottom'},
        },
    };
}
