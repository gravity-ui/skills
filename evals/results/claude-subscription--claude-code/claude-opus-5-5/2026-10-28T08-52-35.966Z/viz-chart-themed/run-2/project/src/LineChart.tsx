import React from 'react';
import {useThemeType} from '@gravity-ui/uikit';

import type {Series} from './data';
import {SERIES_COLORS} from './palette';
import './LineChart.css';

interface LineChartProps {
    categories: string[];
    series: Series[];
    height?: number;
    formatValue?: (value: number) => string;
    ariaLabel: string;
}

const MARGIN = {top: 12, right: 128, bottom: 28, left: 40};
const END_LABEL_MIN_GAP = 16;

function niceTicks(max: number, count = 4): number[] {
    const raw = max / count;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
    const ticks: number[] = [];
    for (let v = 0; v <= max + step * 0.999; v += step) {
        ticks.push(v);
        if (v >= max) break;
    }
    return ticks;
}

function compact(value: number): string {
    return value >= 1000 ? `${Math.round(value / 100) / 10}K` : String(value);
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
    const ref = React.useRef<T>(null);
    const [width, setWidth] = React.useState(0);
    React.useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        setWidth(el.clientWidth);
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return [ref, width];
}

export function LineChart({
    categories,
    series,
    height = 320,
    formatValue = String,
    ariaLabel,
}: LineChartProps) {
    const themeType = useThemeType();
    const colors = SERIES_COLORS[themeType];
    const [containerRef, width] = useWidth<HTMLDivElement>();
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
    const innerHeight = height - MARGIN.top - MARGIN.bottom;
    const ticks = niceTicks(Math.max(...series.flatMap((s) => s.values)));
    const yMax = ticks[ticks.length - 1];
    const step = categories.length > 1 ? innerWidth / (categories.length - 1) : 0;

    const x = (i: number) => MARGIN.left + i * step;
    const y = (v: number) => MARGIN.top + innerHeight - (v / yMax) * innerHeight;

    const lastIndex = categories.length - 1;
    const endLabels = series
        .map((s, i) => ({s, color: colors[i], y: y(s.values[lastIndex])}))
        .sort((a, b) => a.y - b.y);
    // Converging end labels are dropped rather than nudged off their lines;
    // the legend and tooltip still carry identity and values.
    const showEndLabels = endLabels.every(
        (l, i) => i === 0 || l.y - endLabels[i - 1].y >= END_LABEL_MIN_GAP,
    );

    const indexFromPointer = (event: React.PointerEvent<SVGRectElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const i = Math.round((event.clientX - rect.left) / step);
        return Math.min(lastIndex, Math.max(0, i));
    };

    const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const delta = event.key === 'ArrowRight' ? 1 : -1;
            setActiveIndex((i) => Math.min(lastIndex, Math.max(0, (i ?? lastIndex) + delta)));
        } else if (event.key === 'Escape') {
            setActiveIndex(null);
        }
    };

    const tooltipOnLeft = activeIndex !== null && x(activeIndex) > width / 2;

    return (
        <div ref={containerRef} className="line-chart">
            {width > 0 && (
                <svg
                    width={width}
                    height={height}
                    role="img"
                    aria-label={ariaLabel}
                    tabIndex={0}
                    onFocus={() => setActiveIndex((i) => i ?? lastIndex)}
                    onBlur={() => setActiveIndex(null)}
                    onKeyDown={handleKeyDown}
                >
                    <g className="line-chart__grid">
                        {ticks.map((t) => (
                            <g key={t}>
                                <line
                                    x1={MARGIN.left}
                                    x2={MARGIN.left + innerWidth}
                                    y1={y(t)}
                                    y2={y(t)}
                                    className={t === 0 ? 'line-chart__baseline' : undefined}
                                />
                                <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                                    {compact(t)}
                                </text>
                            </g>
                        ))}
                    </g>

                    <g className="line-chart__x-axis">
                        {categories.map((c, i) => (
                            <text key={c} x={x(i)} y={height - 8} textAnchor="middle">
                                {c}
                            </text>
                        ))}
                    </g>

                    {activeIndex !== null && (
                        <line
                            className="line-chart__crosshair"
                            x1={x(activeIndex)}
                            x2={x(activeIndex)}
                            y1={MARGIN.top}
                            y2={MARGIN.top + innerHeight}
                        />
                    )}

                    {series.map((s, i) => (
                        <path
                            key={s.id}
                            className="line-chart__line"
                            stroke={colors[i]}
                            d={s.values.map((v, j) => `${j ? 'L' : 'M'}${x(j)},${y(v)}`).join('')}
                        />
                    ))}

                    {series.map((s, i) => {
                        const j = activeIndex ?? lastIndex;
                        return (
                            <circle
                                key={s.id}
                                className="line-chart__marker"
                                cx={x(j)}
                                cy={y(s.values[j])}
                                r={4}
                                fill={colors[i]}
                            />
                        );
                    })}

                    {showEndLabels &&
                        endLabels.map(({s, y: ly}) => (
                            <text
                                key={s.id}
                                className="line-chart__end-label"
                                x={x(lastIndex) + 10}
                                y={ly}
                                dy="0.32em"
                            >
                                <tspan className="line-chart__end-value">
                                    {formatValue(s.values[lastIndex])}
                                </tspan>
                                <tspan dx={6}>{s.name}</tspan>
                            </text>
                        ))}

                    <rect
                        className="line-chart__hit-area"
                        x={MARGIN.left - step / 2}
                        y={MARGIN.top}
                        width={innerWidth + step}
                        height={innerHeight}
                        onPointerMove={(e) => setActiveIndex(indexFromPointer(e))}
                        onPointerLeave={() => setActiveIndex(null)}
                    />
                </svg>
            )}

            {activeIndex !== null && (
                <div
                    className="line-chart__tooltip"
                    role="status"
                    style={{
                        top: MARGIN.top,
                        left: tooltipOnLeft ? undefined : x(activeIndex) + 12,
                        right: tooltipOnLeft ? width - x(activeIndex) + 12 : undefined,
                    }}
                >
                    <div className="line-chart__tooltip-title">{categories[activeIndex]}</div>
                    {series
                        .map((s, i) => ({s, color: colors[i]}))
                        .sort((a, b) => b.s.values[activeIndex] - a.s.values[activeIndex])
                        .map(({s, color}) => (
                            <div key={s.id} className="line-chart__tooltip-row">
                                <span className="line-chart__key" style={{background: color}} />
                                <span className="line-chart__tooltip-value">
                                    {formatValue(s.values[activeIndex])}
                                </span>
                                <span className="line-chart__tooltip-name">{s.name}</span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

export function LineChartLegend({series}: {series: Series[]}) {
    const colors = SERIES_COLORS[useThemeType()];
    return (
        <ul className="line-chart-legend">
            {series.map((s, i) => (
                <li key={s.id}>
                    <span className="line-chart__key" style={{background: colors[i]}} />
                    {s.name}
                </li>
            ))}
        </ul>
    );
}
