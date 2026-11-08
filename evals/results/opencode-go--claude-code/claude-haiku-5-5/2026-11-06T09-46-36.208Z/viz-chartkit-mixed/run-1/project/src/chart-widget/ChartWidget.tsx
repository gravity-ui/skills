import {SegmentedRadioGroup, useThemeType} from '@gravity-ui/uikit';
import {Suspense, useMemo, useState, type CSSProperties} from 'react';

import './chart-widget.css';
import {capSeries, defaultFormatValue, summarize} from './data';
import {ENGINES} from './engines/registry';
import {CHROME, MAX_SERIES, seriesColors, type ChromeTokens} from './palette';
import type {ChartMode, ChartSeries, ChartTheme, ChartWidgetProps} from './types';

const MODE_LABEL: Record<ChartMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

const DEFAULT_HEIGHT = 360;

/**
 * One widget, two visual modes. The same props drive both: pick the data with
 * `datasets[mode]`, and the matching engine is loaded on first use.
 */
export function ChartWidget({
    title,
    datasets,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    height = DEFAULT_HEIGHT,
    formatValue = defaultFormatValue,
    refreshing = false,
}: ChartWidgetProps) {
    const [uncontrolledMode, setUncontrolledMode] = useState<ChartMode>(defaultMode);
    const mode = controlledMode ?? uncontrolledMode;
    const theme: ChartTheme = useThemeType() === 'dark' ? 'dark' : 'light';
    const chrome = CHROME[theme];

    const dataset = datasets[mode];
    const {visible, hiddenCount} = useMemo(() => capSeries(dataset.series), [dataset.series]);
    const colors = useMemo(() => seriesColors(theme, visible.length), [theme, visible.length]);
    const format = useMemo(
        () => (value: number) => formatValue(value, dataset.unit),
        [formatValue, dataset.unit],
    );

    const handleModeChange = (next: ChartMode) => {
        if (controlledMode === undefined) {
            setUncontrolledMode(next);
        }
        onModeChange?.(next);
    };

    const ariaLabel = `${title}: ${MODE_LABEL[mode]}`;
    const Engine = ENGINES[mode];

    return (
        <section style={cardStyle(chrome)} aria-label={ariaLabel}>
            <header style={headerStyle}>
                <h2 style={{...titleStyle, color: chrome.primary}}>{title}</h2>
                <SegmentedRadioGroup<ChartMode>
                    size="m"
                    value={mode}
                    onUpdate={handleModeChange}
                    aria-label="Режим графика"
                >
                    <SegmentedRadioGroup.Option value="sales">{MODE_LABEL.sales}</SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="monitoring">{MODE_LABEL.monitoring}</SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
            </header>

            <Legend series={visible} colors={colors} chrome={chrome} />

            <div
                aria-busy={refreshing}
                style={{opacity: refreshing ? 0.5 : 1, transition: 'opacity 150ms ease'}}
            >
                {/* The fallback reserves the same height, so loading the engine does not shift the layout. */}
                <Suspense fallback={<div style={{height, width: '100%'}} aria-busy="true" />}>
                    <Engine
                        key={mode}
                        series={visible}
                        colors={colors}
                        theme={theme}
                        height={height}
                        unit={dataset.unit}
                        formatValue={format}
                        ariaLabel={ariaLabel}
                    />
                </Suspense>
            </div>

            {hiddenCount > 0 && (
                <p style={{...noteStyle, color: chrome.secondary}}>
                    {`Выведены первые ${MAX_SERIES} серии. Палитра рассчитана на ${MAX_SERIES}, поэтому остальные (${hiddenCount}) не выведены.`}
                </p>
            )}

            <details style={{marginTop: 12}}>
                <summary style={{...noteStyle, color: chrome.secondary, cursor: 'pointer'}}>Таблица значений</summary>
                <SummaryTable series={visible} format={format} chrome={chrome} />
            </details>
        </section>
    );
}

function Legend({series, colors, chrome}: {series: ChartSeries[]; colors: string[]; chrome: ChromeTokens}) {
    // A single series is named by the title, so a legend would only repeat it.
    if (series.length < 2) return null;
    return (
        <ul aria-label="Легенда" style={legendStyle}>
            {series.map((s, i) => (
                <li key={s.id} style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 12}}>
                    {/* A line key, matching the 2px line mark. Text stays in ink tokens, not the series color. */}
                    <span aria-hidden="true" style={{width: 12, height: 2, borderRadius: 1, background: colors[i]}} />
                    <span style={{color: chrome.secondary}}>{s.name}</span>
                </li>
            ))}
        </ul>
    );
}

function SummaryTable({
    series,
    format,
    chrome,
}: {
    series: ChartSeries[];
    format: (value: number) => string;
    chrome: ChromeTokens;
}) {
    const cell: CSSProperties = {
        padding: '6px 10px',
        borderBottom: `1px solid ${chrome.gridline}`,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        color: chrome.primary,
    };
    const headCell: CSSProperties = {...cell, color: chrome.secondary, fontWeight: 500};
    const show = (value: number | null) => (value == null ? '—' : format(value));

    return (
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 13}}>
            <caption style={{...noteStyle, color: chrome.secondary, textAlign: 'left', captionSide: 'top'}}>
                Сводка по сериям
            </caption>
            <thead>
                <tr>
                    <th scope="col" style={{...headCell, textAlign: 'left'}}>Серия</th>
                    <th scope="col" style={headCell}>Точек</th>
                    <th scope="col" style={headCell}>Последнее</th>
                    <th scope="col" style={headCell}>Среднее</th>
                    <th scope="col" style={headCell}>Мин.</th>
                    <th scope="col" style={headCell}>Макс.</th>
                </tr>
            </thead>
            <tbody>
                {series.map((s) => {
                    const stats = summarize(s.points);
                    return (
                        <tr key={s.id}>
                            <th scope="row" style={{...cell, textAlign: 'left', fontWeight: 500}}>{s.name}</th>
                            <td style={cell}>{stats.count.toLocaleString('ru-RU')}</td>
                            <td style={cell}>{show(stats.last)}</td>
                            <td style={cell}>{show(stats.avg)}</td>
                            <td style={cell}>{show(stats.min)}</td>
                            <td style={cell}>{show(stats.max)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

const cardStyle = (chrome: ChromeTokens): CSSProperties => ({
    padding: 20,
    borderRadius: 8,
    border: `1px solid ${chrome.border}`,
    background: chrome.surface,
    color: chrome.primary,
});

const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
};

const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
};

const legendStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    listStyle: 'none',
    margin: '0 0 8px',
    padding: 0,
};

const noteStyle: CSSProperties = {
    margin: '8px 0 0',
    fontSize: 12,
};
