import {useMemo, useState} from 'react';
import type {KeyboardEvent, PointerEvent} from 'react';

export interface LineChartSeries {
    name: string;
    values: number[];
}

export interface LineChartProps {
    title: string;
    subtitle?: string;
    labels: string[];
    series: LineChartSeries[];
    formatValue?: (value: number) => string;
}

// Геометрия viewBox; контейнер тянется по ширине, высота следует за пропорцией.
const W = 720;
const H = 372;
const PAD = {top: 20, right: 60, bottom: 36, left: 48};
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

// Категорийные слоты 1–2 провалидированной палитры (светлая/тёмная ступени
// задаются в app.css через --viz-series-* внутри .g-root_theme_light/_dark).
const SERIES_COLORS = ['var(--viz-series-1)', 'var(--viz-series-2)'];
const SURFACE = 'var(--g-color-base-float)';

const defaultFormatter = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});

const round2 = (v: number) => Math.round(v * 100) / 100;

function niceTicks(maxValue: number, desired = 4): number[] {
    if (!(maxValue > 0)) return [0, 1];
    const raw = maxValue / desired;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const norm = raw / mag;
    const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    const niceMax = Math.ceil(maxValue / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= niceMax + 1e-9; v += step) {
        ticks.push(round2(v));
    }
    return ticks;
}

export function LineChart({title, subtitle, labels, series, formatValue}: LineChartProps) {
    const fmt = formatValue ?? ((v: number) => defaultFormatter.format(v));
    const [hover, setHover] = useState<number | null>(null);

    const n = labels.length;
    const maxValue = useMemo(() => Math.max(...series.flatMap((s) => s.values), 0), [series]);
    const ticks = useMemo(() => niceTicks(maxValue), [maxValue]);
    const yMax = ticks[ticks.length - 1] || 1;

    const x = (i: number) => PAD.left + (PLOT_W * i) / Math.max(n - 1, 1);
    const y = (v: number) => PAD.top + PLOT_H * (1 - v / yMax);

    const paths = series.map((s) =>
        s.values
            .map((v, i) => `${i === 0 ? 'M' : 'L'}${round2(x(i))},${round2(y(v))}`)
            .join(' '),
    );

    const onPointerMove = (e: PointerEvent<SVGRectElement>) => {
        const svg = e.currentTarget.ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        if (!rect.width) return;
        const px = ((e.clientX - rect.left) / rect.width) * W;
        const i = Math.round(((px - PAD.left) / PLOT_W) * (n - 1));
        setHover(Math.min(n - 1, Math.max(0, i)));
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            setHover((h) => {
                const cur = h ?? (e.key === 'ArrowLeft' ? n : -1);
                return Math.min(n - 1, Math.max(0, cur + (e.key === 'ArrowLeft' ? -1 : 1)));
            });
        } else if (e.key === 'Home') {
            e.preventDefault();
            setHover(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setHover(n - 1);
        } else if (e.key === 'Escape') {
            setHover(null);
        }
    };

    // Позиция тултипа: у перекрестия, с отражением у правого края и у верха.
    const hoverX = hover === null ? 0 : x(hover);
    const leftPct = (hoverX / W) * 100;
    const topPct =
        hover === null ? 0 : (Math.min(...series.map((s) => y(s.values[hover]))) / H) * 100;
    const flipX = leftPct > 55;
    const below = topPct < 24;
    const tooltipTransform = `translate(${
        flipX ? 'calc(-100% - 14px)' : '14px'
    }, ${below ? '18px' : 'calc(-100% - 12px)'})`;

    return (
        <div className="viz">
            <div className="viz-header">
                <div>
                    <div className="viz-title">{title}</div>
                    {subtitle ? <div className="viz-subtitle">{subtitle}</div> : null}
                </div>
                {series.length >= 2 ? (
                    <div className="viz-legend" aria-hidden="true">
                        {series.map((s, si) => (
                            <span className="viz-legend-item" key={s.name}>
                                <svg width="18" height="6" focusable="false">
                                    <line
                                        x1="1"
                                        y1="3"
                                        x2="17"
                                        y2="3"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        style={{stroke: SERIES_COLORS[si % SERIES_COLORS.length]}}
                                    />
                                </svg>
                                <span>{s.name}</span>
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>

            <div
                className="viz-chart"
                tabIndex={0}
                role="group"
                aria-label={`${title}. Линейный график, ${series.length} серии. Стрелки влево/вправо — по точкам, Escape — скрыть значения.`}
                onFocus={() => setHover((h) => h ?? n - 1)}
                onBlur={() => setHover(null)}
                onKeyDown={onKeyDown}
            >
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="viz-svg"
                    role="img"
                    aria-label={subtitle ? `${title}. ${subtitle}` : title}
                >
                    {/* Сетка и подписи оси Y */}
                    {ticks.map((t) => (
                        <g key={t}>
                            <line
                                className="viz-grid"
                                x1={PAD.left}
                                x2={PAD.left + PLOT_W}
                                y1={y(t)}
                                y2={y(t)}
                            />
                            <text
                                className="viz-tick-text"
                                x={PAD.left - 8}
                                y={y(t)}
                                textAnchor="end"
                                dominantBaseline="central"
                            >
                                {fmt(t)}
                            </text>
                        </g>
                    ))}

                    {/* Подписи оси X */}
                    {labels.map((label, i) => (
                        <text
                            className="viz-tick-text"
                            key={label}
                            x={x(i)}
                            y={PAD.top + PLOT_H + 22}
                            textAnchor="middle"
                        >
                            {label}
                        </text>
                    ))}

                    {/* Линии серий */}
                    {paths.map((d, si) => (
                        <path
                            key={series[si].name}
                            className="viz-line"
                            d={d}
                            style={{stroke: SERIES_COLORS[si % SERIES_COLORS.length]}}
                        />
                    ))}

                    {/* Конечные точки + прямые подписи значений на концах */}
                    {series.map((s, si) => {
                        const lastV = s.values[n - 1];
                        const color = SERIES_COLORS[si % SERIES_COLORS.length];
                        return (
                            <g key={s.name}>
                                <circle
                                    cx={x(n - 1)}
                                    cy={y(lastV)}
                                    r={4}
                                    style={{fill: color, stroke: SURFACE}}
                                    strokeWidth={2}
                                />
                                <text
                                    className="viz-end-label"
                                    x={x(n - 1) + 10}
                                    y={y(lastV)}
                                    dominantBaseline="central"
                                >
                                    {fmt(lastV)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Перекрестие */}
                    {hover !== null ? (
                        <g pointerEvents="none">
                            <line
                                className="viz-grid"
                                x1={hoverX}
                                x2={hoverX}
                                y1={PAD.top}
                                y2={PAD.top + PLOT_H}
                            />
                            {series.map((s, si) => (
                                <circle
                                    key={s.name}
                                    cx={hoverX}
                                    cy={y(s.values[hover])}
                                    r={4}
                                    style={{
                                        fill: SERIES_COLORS[si % SERIES_COLORS.length],
                                        stroke: SURFACE,
                                    }}
                                    strokeWidth={2}
                                />
                            ))}
                        </g>
                    ) : null}

                    {/* Зона наведения: вся область графика, перекрестие само найдёт X */}
                    <rect
                        x={PAD.left}
                        y={PAD.top}
                        width={PLOT_W}
                        height={PLOT_H}
                        fill="transparent"
                        onPointerMove={onPointerMove}
                        onPointerLeave={() => setHover(null)}
                    />
                </svg>

                {hover !== null ? (
                    <div
                        className="viz-tooltip"
                        style={{left: `${leftPct}%`, top: `${topPct}%`, transform: tooltipTransform}}
                    >
                        <div className="viz-tooltip-title">{labels[hover]}</div>
                        {series.map((s, si) => (
                            <div className="viz-tooltip-row" key={s.name}>
                                <svg width="16" height="2" focusable="false" aria-hidden="true">
                                    <line
                                        x1="0"
                                        y1="1"
                                        x2="16"
                                        y2="1"
                                        strokeWidth="2"
                                        style={{stroke: SERIES_COLORS[si % SERIES_COLORS.length]}}
                                    />
                                </svg>
                                <strong>{fmt(s.values[hover])}</strong>
                                <span className="viz-tooltip-name">{s.name}</span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <details className="viz-table">
                <summary>Данные таблицей</summary>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Месяц</th>
                            {series.map((s) => (
                                <th scope="col" className="num" key={s.name}>
                                    {s.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {labels.map((label, i) => (
                            <tr key={label}>
                                <th scope="row">{label}</th>
                                {series.map((s) => (
                                    <td className="num" key={s.name}>
                                        {fmt(s.values[i])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </div>
    );
}
