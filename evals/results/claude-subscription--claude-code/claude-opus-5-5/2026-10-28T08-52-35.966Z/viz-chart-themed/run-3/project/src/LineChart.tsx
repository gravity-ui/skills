import * as React from 'react';
import { useThemeType } from '@gravity-ui/uikit';

import { CHROME, SERIES_COLORS } from './chartTheme';
import './LineChart.css';

export interface LineSeries {
    id: string;
    name: string;
    values: number[];
}

export interface LineChartProps {
    categories: string[];
    series: LineSeries[];
    height?: number;
    formatValue?: (value: number) => string;
    formatTick?: (value: number) => string;
    ariaLabel: string;
}

const MARGIN = { top: 12, right: 72, bottom: 32, left: 64 };
const MIN_LABEL_GAP = 16;

const defaultFormat = (v: number) => v.toLocaleString('ru-RU');

function niceStep(max: number, count: number) {
    const raw = max / count;
    const power = 10 ** Math.floor(Math.log10(raw));
    const n = raw / power;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return nice * power;
}

function useWidth<T extends HTMLElement>() {
    const ref = React.useRef<T>(null);
    const [width, setWidth] = React.useState(0);
    React.useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(node);
        setWidth(node.getBoundingClientRect().width);
        return () => observer.disconnect();
    }, []);
    return [ref, width] as const;
}

export function LineChart({
    categories,
    series,
    height = 320,
    formatValue = defaultFormat,
    formatTick = formatValue,
    ariaLabel,
}: LineChartProps) {
    const themeType = useThemeType();
    const palette = SERIES_COLORS[themeType];
    const [containerRef, width] = useWidth<HTMLDivElement>();
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
    const plotHeight = height - MARGIN.top - MARGIN.bottom;
    const last = categories.length - 1;

    const maxValue = Math.max(...series.flatMap((s) => s.values));
    const step = niceStep(maxValue, 5);
    const yMax = Math.ceil(maxValue / step) * step;
    const yTicks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);

    const x = (i: number) => MARGIN.left + (last > 0 ? (i / last) * plotWidth : plotWidth / 2);
    const y = (v: number) => MARGIN.top + plotHeight - (v / yMax) * plotHeight;

    // Label every Nth month so ticks never collide on narrow containers.
    const xTickEvery = Math.max(1, Math.ceil(categories.length / Math.max(1, Math.floor(plotWidth / 56))));

    // End labels only when they don't collide; otherwise legend + tooltip carry identity.
    const endYs = series.map((s) => y(s.values[last]));
    const sortedEndYs = [...endYs].sort((a, b) => a - b);
    const showEndLabels = sortedEndYs.every((v, i) => i === 0 || v - sortedEndYs[i - 1] >= MIN_LABEL_GAP);

    const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        setActiveIndex(Math.min(last, Math.max(0, Math.round(ratio * last))));
    };

    const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const delta = event.key === 'ArrowRight' ? 1 : -1;
            setActiveIndex((i) => Math.min(last, Math.max(0, (i ?? (delta > 0 ? -1 : last + 1)) + delta)));
        } else if (event.key === 'Escape') {
            setActiveIndex(null);
        }
    };

    const tooltipOnLeft = activeIndex !== null && x(activeIndex) > width / 2;

    return (
        <div className="line-chart">
            {series.length > 1 && (
                <ul className="line-chart__legend">
                    {series.map((s, i) => (
                        <li key={s.id} className="line-chart__legend-item">
                            <span className="line-chart__key" style={{ background: palette[i] }} />
                            {s.name}
                        </li>
                    ))}
                </ul>
            )}

            <div ref={containerRef} className="line-chart__canvas" style={{ height }}>
                {width > 0 && (
                    <svg
                        width={width}
                        height={height}
                        role="img"
                        aria-label={ariaLabel}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setActiveIndex(null)}
                        className="line-chart__svg"
                    >
                        {yTicks.map((tick) => (
                            <g key={tick}>
                                <line
                                    x1={MARGIN.left}
                                    x2={MARGIN.left + plotWidth}
                                    y1={y(tick)}
                                    y2={y(tick)}
                                    stroke={tick === 0 ? CHROME.axis : CHROME.grid}
                                    shapeRendering="crispEdges"
                                />
                                <text
                                    x={MARGIN.left - 8}
                                    y={y(tick)}
                                    dy="0.32em"
                                    textAnchor="end"
                                    className="line-chart__tick"
                                >
                                    {formatTick(tick)}
                                </text>
                            </g>
                        ))}

                        {categories.map((category, i) =>
                            i % xTickEvery === 0 ? (
                                <text
                                    key={category}
                                    x={x(i)}
                                    y={MARGIN.top + plotHeight + 20}
                                    textAnchor="middle"
                                    className="line-chart__tick"
                                >
                                    {category}
                                </text>
                            ) : null,
                        )}

                        {activeIndex !== null && (
                            <line
                                x1={x(activeIndex)}
                                x2={x(activeIndex)}
                                y1={MARGIN.top}
                                y2={MARGIN.top + plotHeight}
                                stroke={CHROME.axis}
                                shapeRendering="crispEdges"
                            />
                        )}

                        {series.map((s, si) => (
                            <path
                                key={s.id}
                                d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')}
                                fill="none"
                                stroke={palette[si]}
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        ))}

                        {series.map((s, si) => {
                            const i = activeIndex ?? last;
                            return (
                                <circle
                                    key={s.id}
                                    cx={x(i)}
                                    cy={y(s.values[i])}
                                    r={4}
                                    fill={palette[si]}
                                    stroke={CHROME.surface}
                                    strokeWidth={2}
                                />
                            );
                        })}

                        {showEndLabels &&
                            series.map((s, si) => (
                                <text
                                    key={s.id}
                                    x={x(last) + 10}
                                    y={endYs[si]}
                                    dy="0.32em"
                                    className="line-chart__end-label"
                                >
                                    {formatTick(s.values[last])}
                                </text>
                            ))}

                        <rect
                            x={MARGIN.left}
                            y={MARGIN.top}
                            width={plotWidth}
                            height={plotHeight}
                            fill="transparent"
                            onPointerMove={handlePointerMove}
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
                        {series.map((s, si) => (
                            <div key={s.id} className="line-chart__tooltip-row">
                                <span className="line-chart__key" style={{ background: palette[si] }} />
                                <span className="line-chart__tooltip-name">{s.name}</span>
                                <span className="line-chart__tooltip-value">
                                    {formatValue(s.values[activeIndex])}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
