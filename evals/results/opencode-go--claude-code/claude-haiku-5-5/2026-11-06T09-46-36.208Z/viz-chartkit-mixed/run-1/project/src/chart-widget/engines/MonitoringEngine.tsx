import uPlot, {type Options} from 'uplot';
import 'uplot/dist/uPlot.min.css';
import {useEffect, useRef} from 'react';

import {alignForUplot} from '../data';
import {CHROME, type ChromeTokens} from '../palette';
import type {EngineProps} from '../types';

/** Space kept under the plot for x-axis labels, so the box height includes them. */
const AXIS_BAND = 32;

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

/**
 * "monitoring" mode: a dense time series on a canvas, rendered by uPlot.
 * Loaded lazily by the widget, so uPlot stays out of the main bundle.
 */
export default function MonitoringEngine({series, colors, theme, height, formatValue, ariaLabel}: EngineProps) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const chrome = CHROME[theme];
        const plotHeight = () => Math.max(1, height - AXIS_BAND);
        const tooltip = createTooltip(chrome);
        host.append(tooltip);

        const renderTooltip = (u: uPlot) => {
            const idx = u.cursor.idx;
            const left = u.cursor.left;
            const top = u.cursor.top;
            if (idx == null || idx < 0 || left == null || left < 0 || top == null || top < 0) {
                tooltip.hidden = true;
                return;
            }

            tooltip.replaceChildren();
            const time = document.createElement('div');
            time.className = 'cw-tooltip-time';
            time.textContent = timeFormat.format(new Date(Number(u.data[0][idx]) * 1000));
            tooltip.append(time);

            series.forEach((s, i) => {
                const value = u.data[i + 1][idx];
                const row = document.createElement('div');
                row.className = 'cw-tooltip-row';

                const key = document.createElement('span');
                key.className = 'cw-tooltip-key';
                key.style.background = colors[i];

                const name = document.createElement('span');
                name.textContent = s.name;
                name.style.color = chrome.secondary;

                const val = document.createElement('span');
                val.className = 'cw-tooltip-value';
                val.textContent = value == null ? '—' : formatValue(Number(value));

                row.append(key, name, val);
                tooltip.append(row);
            });

            // Position relative to the host, using the plot area as the origin.
            const hostRect = host.getBoundingClientRect();
            const overRect = u.over.getBoundingClientRect();
            const gap = 12;
            const tipWidth = tooltip.offsetWidth;
            let x = overRect.left - hostRect.left + left + gap;
            if (x + tipWidth > host.clientWidth) {
                x = overRect.left - hostRect.left + left - gap - tipWidth;
            }
            tooltip.style.transform = `translate(${Math.max(0, x)}px, ${Math.max(0, overRect.top - hostRect.top + top)}px)`;
            tooltip.hidden = false;
        };

        const axisStyle = {
            stroke: chrome.muted,
            font: '12px system-ui, -apple-system, "Segoe UI", sans-serif',
            grid: {stroke: chrome.gridline, width: 1},
            ticks: {stroke: chrome.baseline, width: 1},
        };

        const options: Options = {
            width: Math.max(1, host.clientWidth),
            height: plotHeight(),
            legend: {show: false},
            cursor: {drag: {x: true, y: false, setScale: false}},
            scales: {x: {time: true}},
            axes: [axisStyle, {...axisStyle, values: (_u, vals) => vals.map((v) => formatValue(v))}],
            series: [
                {},
                ...series.map((s, i) => ({
                    label: s.name,
                    stroke: colors[i],
                    width: 2,
                    points: {show: false},
                })),
            ],
            hooks: {setCursor: [renderTooltip]},
        };

        const plot = new uPlot(options, alignForUplot(series), host);

        const resizeObserver = new ResizeObserver(() => {
            plot.setSize({width: Math.max(1, host.clientWidth), height: plotHeight()});
        });
        resizeObserver.observe(host);

        return () => {
            resizeObserver.disconnect();
            plot.destroy();
            tooltip.remove();
        };
    }, [series, colors, theme, height, formatValue]);

    return <div ref={hostRef} role="group" aria-label={ariaLabel} className="cw-monitoring" style={{height, width: '100%'}} />;
}

function createTooltip(chrome: ChromeTokens): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'cw-tooltip';
    tooltip.hidden = true;
    tooltip.style.background = chrome.surface;
    tooltip.style.borderColor = chrome.border;
    tooltip.style.color = chrome.primary;
    return tooltip;
}
