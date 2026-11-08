import React from 'react';
import {Button} from '@gravity-ui/uikit';

import './line-chart.css';

export interface LineSeries {
    name: string;
    values: number[];
}

export interface LineChartProps {
    title: string;
    subtitle?: string;
    /** X categories, one per point. */
    labels: string[];
    /** 1–4 series; colors come from fixed categorical slots in order. */
    series: LineSeries[];
    /** Value unit shown in labels/tooltip, e.g. "тыс.". */
    unit?: string;
    /** Caption of the first table column. */
    xCaption?: string;
}

const W = 760;
const H = 296;
const M = {top: 20, right: 140, bottom: 36, left: 44};
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
/** Two stacked end-label lines need this much vertical room. */
const END_LABEL_MIN_GAP = 20;

/** Round-to-clean-number y ticks: 0 .. niceCeil(max). */
function niceTicks(max: number, count = 4): number[] {
    if (max <= 0) {
        return [0, 1];
    }
    const raw = max / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const top = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= top; v += step) {
        ticks.push(v);
    }
    return ticks;
}

export function LineChart({title, subtitle, labels, series, unit, xCaption}: LineChartProps) {
    const n = labels.length;
    const max = Math.max(0, ...series.flatMap((s) => s.values));
    const ticks = niceTicks(max);
    const yTop = ticks[ticks.length - 1];

    const x = (i: number) => M.left + (n > 1 ? (PLOT_W * i) / (n - 1) : PLOT_W / 2);
    const y = (v: number) => M.top + PLOT_H * (1 - v / yTop);

    const [active, setActive] = React.useState<number | null>(null);
    const [showTable, setShowTable] = React.useState(false);

    const colorOf = (i: number) => `var(--lc-series-${(i % 8) + 1})`;
    const format = (v: number) => v.toLocaleString('ru-RU');
    const fmtUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));

    const linePath = (values: number[]) =>
        values
            .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`)
            .join(' ');

    // Direct end labels ride the line ends — but only when the endpoints
    // separate at the right edge. When they converge, drop the labels
    // entirely; the legend + tooltip carry identity instead of stacked text.
    const ends = series
        .map((s, i) => ({i, y: y(s.values[n - 1])}))
        .sort((a, b) => a.y - b.y);
    const endLabelsCollide = ends.some((e, k) => k > 0 && e.y - ends[k - 1].y < END_LABEL_MIN_GAP);

    const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * PLOT_W;
        const idx = Math.round((relX / PLOT_W) * (n - 1));
        setActive(Math.max(0, Math.min(n - 1, idx)));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            setActive((cur) => {
                const base = cur ?? (delta > 0 ? -1 : n);
                return Math.max(0, Math.min(n - 1, base + delta));
            });
        } else if (e.key === 'Home') {
            e.preventDefault();
            setActive(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setActive(n - 1);
        } else if (e.key === 'Escape') {
            setActive(null);
        }
    };

    const summary = `${title}. ${series
        .map((s) => `${s.name}: от ${fmtUnit(s.values[0])} до ${fmtUnit(s.values[n - 1])}`)
        .join('; ')}. Полные данные — в таблице ниже.`;

    // Tooltip placement: centered on the crosshair, above the highest point;
    // flips below near the top edge, clamped horizontally inside the plot.
    const tipXPct = active === null ? 0 : Math.min(Math.max((x(active) / W) * 100, 13), 87);
    const tipTopPct =
        active === null ? 0 : (Math.min(...series.map((s) => y(s.values[active]))) / H) * 100;
    const tipBelow = tipTopPct < 24;

    return (
        <div className="lc-root">
            <div className="lc-head">
                <div>
                    <h3 className="lc-title">{title}</h3>
                    {subtitle ? <p className="lc-subtitle">{subtitle}</p> : null}
                </div>
                {series.length >= 2 ? (
                    <ul className="lc-legend">
                        {series.map((s, i) => (
                            <li key={s.name}>
                                <span className="lc-key" style={{background: colorOf(i)}} />
                                <span>{s.name}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <div
                className="lc-plot"
                role="group"
                tabIndex={0}
                aria-label={`${title}. Интерактивный график: стрелки влево и вправо переключают точки, Escape скрывает значения.`}
                onKeyDown={handleKeyDown}
                onFocus={() => setActive((cur) => cur ?? n - 1)}
                onBlur={() => setActive(null)}
            >
                <svg className="lc-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
                    {ticks.map((t) => (
                        <g key={t}>
                            <line
                                className={t === 0 ? 'lc-axis-line' : 'lc-grid'}
                                x1={M.left}
                                x2={M.left + PLOT_W}
                                y1={y(t)}
                                y2={y(t)}
                            />
                            <text className="lc-tick" x={M.left - 8} y={y(t) + 4} textAnchor="end">
                                {format(t)}
                            </text>
                        </g>
                    ))}

                    {labels.map((l, i) => (
                        <text key={i} className="lc-tick" x={x(i)} y={H - 10} textAnchor="middle">
                            {l}
                        </text>
                    ))}

                    {series.map((s, i) => (
                        <path
                            key={s.name}
                            className="lc-line"
                            style={{stroke: colorOf(i)}}
                            d={linePath(s.values)}
                        />
                    ))}

                    {series.map((s, i) => {
                        const ex = x(n - 1);
                        const ey = y(s.values[n - 1]);
                        return (
                            <g key={`end-${s.name}`}>
                                <circle
                                    cx={ex}
                                    cy={ey}
                                    r={4.5}
                                    strokeWidth={2}
                                    style={{fill: colorOf(i), stroke: 'var(--lc-surface)'}}
                                />
                                {!endLabelsCollide ? (
                                    <text className="lc-end-label" x={ex + 10} y={ey + 4}>
                                        <tspan className="lc-end-name">{s.name}</tspan>
                                        {' '}
                                        <tspan className="lc-end-value">
                                            {format(s.values[n - 1])}
                                        </tspan>
                                    </text>
                                ) : null}
                            </g>
                        );
                    })}

                    {active !== null ? (
                        <g>
                            <line
                                className="lc-cross-line"
                                x1={x(active)}
                                x2={x(active)}
                                y1={M.top}
                                y2={M.top + PLOT_H}
                            />
                            {series.map((s, i) => (
                                <circle
                                    key={s.name}
                                    cx={x(active)}
                                    cy={y(s.values[active])}
                                    r={4.5}
                                    strokeWidth={2}
                                    style={{fill: colorOf(i), stroke: 'var(--lc-surface)'}}
                                />
                            ))}
                        </g>
                    ) : null}

                    <rect
                        className="lc-overlay"
                        x={M.left}
                        y={M.top}
                        width={PLOT_W}
                        height={PLOT_H}
                        onPointerMove={handlePointerMove}
                        onPointerLeave={() => setActive(null)}
                    />
                </svg>

                {active !== null ? (
                    <div
                        className="lc-tip"
                        aria-live="polite"
                        style={{
                            left: `${tipXPct}%`,
                            top: `${tipTopPct}%`,
                            transform: tipBelow
                                ? 'translate(-50%, 16px)'
                                : 'translate(-50%, calc(-100% - 16px))',
                        }}
                    >
                        <div className="lc-tip-title">{labels[active]}</div>
                        {series.map((s, i) => (
                            <div className="lc-tip-row" key={s.name}>
                                <span className="lc-tip-key" style={{background: colorOf(i)}} />
                                <span className="lc-tip-name">{s.name}</span>
                                <span className="lc-tip-value">{fmtUnit(s.values[active])}</span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="lc-foot">
                <Button
                    view="flat-secondary"
                    size="s"
                    aria-expanded={showTable}
                    onClick={() => setShowTable((v) => !v)}
                >
                    {showTable ? 'Скрыть таблицу' : 'Показать таблицу'}
                </Button>
            </div>

            {showTable ? (
                <div className="lc-table-wrap">
                    <table className="lc-table">
                        <caption className="lc-visually-hidden">{title}</caption>
                        <thead>
                            <tr>
                                <th scope="col">{xCaption ?? 'Месяц'}</th>
                                {series.map((s) => (
                                    <th scope="col" key={s.name}>
                                        {s.name}
                                        {unit ? `, ${unit}` : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {labels.map((l, i) => (
                                <tr key={i}>
                                    <th scope="row">{l}</th>
                                    {series.map((s) => (
                                        <td key={s.name}>{format(s.values[i])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}
