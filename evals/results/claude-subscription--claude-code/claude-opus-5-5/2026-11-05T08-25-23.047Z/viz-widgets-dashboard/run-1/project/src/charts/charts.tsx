import { useId, useMemo, useState } from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';

import { fmt, niceTicks } from '../data';
import { useSize } from './useSize';

// ---------------------------------------------------------------- tooltip

interface TooltipRow {
    key: string;
    value: string;
    label: string;
    color?: string;
    mark?: 'line' | 'rect';
}

/** Values lead, labels follow; series keyed by a short stroke of their color. */
function ChartTooltip({
    x,
    y,
    containerWidth,
    title,
    rows,
}: {
    x: number;
    y: number;
    containerWidth: number;
    title?: string;
    rows: TooltipRow[];
}) {
    const flip = x > containerWidth / 2;
    return (
        <div
            className="viz-tooltip"
            role="status"
            style={{
                left: x,
                top: y,
                transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
            }}
        >
            {title && <div className="viz-tooltip__title">{title}</div>}
            {rows.map((row) => (
                <div className="viz-tooltip__row" key={row.key}>
                    {row.color && (
                        <span
                            className={`viz-key viz-key_${row.mark ?? 'line'}`}
                            style={{ background: row.color }}
                            aria-hidden
                        />
                    )}
                    <span className="viz-tooltip__value">{row.value}</span>
                    <span className="viz-tooltip__label">{row.label}</span>
                </div>
            ))}
        </div>
    );
}

export function Legend({ items, mark }: { items: { name: string; color: string }[]; mark: 'line' | 'rect' }) {
    return (
        <ul className="viz-legend" aria-label="Легенда">
            {items.map((item) => (
                <li key={item.name}>
                    <span className={`viz-key viz-key_${mark}`} style={{ background: item.color }} aria-hidden />
                    {item.name}
                </li>
            ))}
        </ul>
    );
}

// ---------------------------------------------------------------- line chart

export interface LineSeries {
    id: string;
    name: string;
    color: string;
    values: number[];
}

export function LineChart({
    series,
    dates,
    format,
    label,
}: {
    series: LineSeries[];
    dates: Date[];
    format: (v: number) => string;
    label: string;
}) {
    const [ref, { width, height }] = useSize<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);

    const n = dates.length;
    const max = Math.max(...series.flatMap((s) => s.values));
    const ticks = useMemo(() => niceTicks(max, height < 160 ? 2 : 4), [max, height]);
    const yMax = ticks[ticks.length - 1];

    const axisLabelW = Math.max(...ticks.map((t) => fmt.axis(t, yMax).length)) * 7 + 10;
    const showEndLabels = width > 360;
    const m = { top: 10, right: showEndLabels ? 64 : 12, bottom: 24, left: axisLabelW };
    const plotW = Math.max(0, width - m.left - m.right);
    const plotH = Math.max(0, height - m.top - m.bottom);

    const xAt = (k: number) => m.left + (n <= 1 ? plotW / 2 : (k / (n - 1)) * plotW);
    const yAt = (v: number) => m.top + plotH - (v / yMax) * plotH;

    const xTickCount = Math.max(2, Math.min(n, Math.floor(plotW / 90)));
    const xTicks = Array.from(new Set(
        Array.from({ length: xTickCount }, (_, k) => Math.round((k / (xTickCount - 1)) * (n - 1))),
    ));

    // End labels only when they don't collide; otherwise legend + tooltip carry the values.
    const endYs = series.map((s) => yAt(s.values[n - 1]));
    const endLabelsFit =
        showEndLabels && endYs.every((y, k) => endYs.every((o, j) => j === k || Math.abs(o - y) >= 16));

    const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const k = Math.round(((px - m.left) / Math.max(plotW, 1)) * (n - 1));
        setActive(Math.min(n - 1, Math.max(0, k)));
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
        e.preventDefault();
        setActive((cur) => {
            const k = cur ?? n - 1;
            if (e.key === 'Home') return 0;
            if (e.key === 'End') return n - 1;
            return Math.min(n - 1, Math.max(0, k + (e.key === 'ArrowLeft' ? -1 : 1)));
        });
    };

    return (
        <div className="viz-line">
            {series.length > 1 && <Legend items={series} mark="line" />}
            <div
                ref={ref}
                className="viz-plot"
                tabIndex={0}
                role="img"
                aria-label={`${label}. Стрелки влево/вправо — значения по дням.`}
                onKeyDown={onKeyDown}
                onFocus={() => setActive((cur) => cur ?? n - 1)}
                onBlur={() => setActive(null)}
            >
                {width > 0 && height > 0 && (
                    <svg
                        width={width}
                        height={height}
                        onPointerMove={onPointerMove}
                        onPointerLeave={() => setActive(null)}
                    >
                        {ticks.map((t) => (
                            <g key={t}>
                                <line
                                    className={t === 0 ? 'viz-baseline' : 'viz-grid'}
                                    x1={m.left}
                                    x2={m.left + plotW}
                                    y1={yAt(t)}
                                    y2={yAt(t)}
                                />
                                <text className="viz-axis-text" x={m.left - 8} y={yAt(t)} dy="0.32em" textAnchor="end">
                                    {fmt.axis(t, yMax)}
                                </text>
                            </g>
                        ))}
                        {xTicks.map((k, idx) => (
                            <text
                                key={k}
                                className="viz-axis-text"
                                x={xAt(k)}
                                y={m.top + plotH + 16}
                                textAnchor={idx === 0 ? 'start' : idx === xTicks.length - 1 ? 'end' : 'middle'}
                            >
                                {fmt.date(dates[k])}
                            </text>
                        ))}

                        {/* Draw later series first so series 1 sits on top. */}
                        {[...series].reverse().map((s) => (
                            <path
                                key={s.id}
                                className="viz-line__path"
                                stroke={s.color}
                                d={s.values.map((v, k) => `${k ? 'L' : 'M'}${xAt(k)},${yAt(v)}`).join('')}
                            />
                        ))}

                        {active === null &&
                            series.map((s) => (
                                <circle key={s.id} className="viz-dot" cx={xAt(n - 1)} cy={yAt(s.values[n - 1])} r={4} fill={s.color} />
                            ))}
                        {active === null &&
                            endLabelsFit &&
                            series.map((s) => (
                                <text key={s.id} className="viz-end-label" x={xAt(n - 1) + 10} y={yAt(s.values[n - 1])} dy="0.32em">
                                    {fmt.compact(s.values[n - 1])}
                                </text>
                            ))}

                        {active !== null && (
                            <g>
                                <line className="viz-crosshair" x1={xAt(active)} x2={xAt(active)} y1={m.top} y2={m.top + plotH} />
                                {series.map((s) => (
                                    <circle key={s.id} className="viz-dot" cx={xAt(active)} cy={yAt(s.values[active])} r={4} fill={s.color} />
                                ))}
                            </g>
                        )}
                    </svg>
                )}
                {active !== null && width > 0 && (
                    <ChartTooltip
                        x={xAt(active)}
                        y={m.top + plotH / 2}
                        containerWidth={width}
                        title={fmt.date(dates[active])}
                        rows={series.map((s) => ({
                            key: s.id,
                            value: format(s.values[active]),
                            label: s.name,
                            color: s.color,
                        }))}
                    />
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------- horizontal bars

export function BarList({
    items,
    color,
    format,
}: {
    items: { name: string; value: number }[];
    color: string;
    format: (v: number) => string;
}) {
    const [ref, { width }] = useSize<HTMLDivElement>();
    const [active, setActive] = useState<{ index: number; x: number; y: number } | null>(null);
    const max = Math.max(...items.map((i) => i.value), 1);
    const total = items.reduce((s, i) => s + i.value, 0);

    const show = (index: number, el: HTMLElement, clientX?: number) => {
        const host = ref.current!.getBoundingClientRect();
        const row = el.getBoundingClientRect();
        setActive({
            index,
            x: (clientX ?? row.left + row.width / 2) - host.left,
            y: row.top + row.height / 2 - host.top,
        });
    };

    return (
        <div ref={ref} className="viz-bars" role="list" onPointerLeave={() => setActive(null)}>
            {items.map((item, index) => (
                <div
                    key={item.name}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${item.name}: ${format(item.value)}`}
                    className={`viz-bars__row${active?.index === index ? ' viz-bars__row_active' : ''}`}
                    onPointerMove={(e) => show(index, e.currentTarget, e.clientX)}
                    onFocus={(e) => show(index, e.currentTarget)}
                    onBlur={() => setActive(null)}
                >
                    <span className="viz-bars__name" title={item.name}>
                        {item.name}
                    </span>
                    <span className="viz-bars__track">
                        <span
                            className="viz-bars__bar"
                            style={{ width: `calc((100% - 64px) * ${item.value / max})`, background: color }}
                        />
                        <span className="viz-bars__value">{fmt.compact(item.value)}</span>
                    </span>
                </div>
            ))}
            {active && (
                <ChartTooltip
                    x={active.x}
                    y={active.y}
                    containerWidth={width}
                    title={items[active.index].name}
                    rows={[
                        {
                            key: 'v',
                            value: format(items[active.index].value),
                            label: `${fmt.pct(items[active.index].value / total)} от всего`,
                            color,
                            mark: 'rect',
                        },
                    ]}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------- tall segmented bar

export function SegmentedBar({
    parts,
    format,
    label,
}: {
    parts: { name: string; value: number; color: string; ink: string }[];
    format: (v: number) => string;
    label: string;
}) {
    const [ref, { width }] = useSize<HTMLDivElement>();
    const [active, setActive] = useState<{ index: number; x: number } | null>(null);
    const total = parts.reduce((s, p) => s + p.value, 0);
    const visible = parts.filter((p) => p.value > 0);
    const gaps = (visible.length - 1) * 2;

    return (
        <div className="viz-seg">
            <div
                ref={ref}
                className="viz-seg__bar"
                role="group"
                aria-label={`${label}: ${parts.map((p) => `${p.name} ${fmt.pct(p.value / total)}`).join(', ')}`}
                onPointerLeave={() => setActive(null)}
            >
                {visible.map((part, index) => {
                    const share = part.value / total;
                    const pxWidth = (width - gaps) * share;
                    const text = fmt.pct(share);
                    const fits = pxWidth >= text.length * 7.5 + 16;
                    return (
                        <div
                            key={part.name}
                            className="viz-seg__part"
                            tabIndex={0}
                            aria-label={`${part.name}: ${format(part.value)}, ${text}`}
                            style={{ flexGrow: part.value, background: part.color, color: part.ink }}
                            onPointerMove={(e) => {
                                const host = ref.current!.getBoundingClientRect();
                                setActive({ index, x: e.clientX - host.left });
                            }}
                            onFocus={(e) => {
                                const host = ref.current!.getBoundingClientRect();
                                const r = e.currentTarget.getBoundingClientRect();
                                setActive({ index, x: r.left + r.width / 2 - host.left });
                            }}
                            onBlur={() => setActive(null)}
                        >
                            {fits && text}
                        </div>
                    );
                })}
                {active && (
                    <ChartTooltip
                        x={active.x}
                        y={14}
                        containerWidth={width}
                        title={visible[active.index].name}
                        rows={[
                            {
                                key: 'v',
                                value: format(visible[active.index].value),
                                label: fmt.pct(visible[active.index].value / total),
                                color: visible[active.index].color,
                                mark: 'rect',
                            },
                        ]}
                    />
                )}
            </div>
            <Legend items={parts.map((p) => ({ name: p.name, color: p.color }))} mark="rect" />
        </div>
    );
}

// ---------------------------------------------------------------- sparkline

/** De-emphasised history, current period in the accent. */
export function Sparkline({ values }: { values: number[] }) {
    const [ref, { width, height }] = useSize<HTMLDivElement>();
    const gradientId = useId();
    const n = values.length;
    if (n < 2) return <div ref={ref} className="viz-spark" />;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = 5;
    const x = (k: number) => pad + (k / (n - 1)) * (width - pad * 2);
    const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
    const d = values.map((v, k) => `${k ? 'L' : 'M'}${x(k)},${y(v)}`).join('');

    return (
        <div ref={ref} className="viz-spark" aria-hidden>
            {width > 0 && height > 0 && (
                <svg width={width} height={height}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="var(--viz-series-1)" stopOpacity="0.1" />
                            <stop offset="1" stopColor="var(--viz-series-1)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`${d}L${x(n - 1)},${height}L${x(0)},${height}Z`} fill={`url(#${gradientId})`} />
                    <path d={d} className="viz-spark__history" />
                    <path
                        d={`M${x(n - 2)},${y(values[n - 2])}L${x(n - 1)},${y(values[n - 1])}`}
                        className="viz-spark__current"
                    />
                    <circle className="viz-dot" cx={x(n - 1)} cy={y(values[n - 1])} r={4} fill="var(--viz-series-1)" />
                </svg>
            )}
        </div>
    );
}

// ---------------------------------------------------------------- meter

export function Meter({
    value,
    max,
    marker,
    severity,
    label,
    children,
}: {
    value: number;
    max: number;
    /** Optional expected-pace marker, 0…1. */
    marker?: { share: number; label: string };
    severity: 'accent' | 'warning' | 'danger';
    label: string;
    children?: ReactNode;
}) {
    const share = Math.min(1, Math.max(0, value / max));
    return (
        <div className="viz-meter">
            <div
                className={`viz-meter__track viz-meter_${severity}`}
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={fmt.pct(value / max)}
            >
                <div className="viz-meter__fill" style={{ width: `${share * 100}%` }} />
                {marker && (
                    <div className="viz-meter__marker" style={{ left: `${marker.share * 100}%` }} title={marker.label} />
                )}
            </div>
            {children}
        </div>
    );
}
