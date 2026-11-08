import '@gravity-ui/yagr/index.css';

import {useEffect, useMemo, useState} from 'react';
import {useThemeValue} from '@gravity-ui/uikit';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import YagrChart from '@gravity-ui/yagr/react';

import type {CpuLoadData} from './cpuLoad';

interface ChartPalette {
    /** Цвет линии — семантический info-токен текущей темы */
    line: string;
    /** Заливка области под линией — тот же токен с альфой */
    fill: string;
}

function withAlpha(color: string, alpha: number): string {
    const rgb = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (rgb) {
        return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
    }

    const hex = color.replace('#', '');
    if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
        const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
        const num = Number.parseInt(full, 16);
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    return color;
}

/**
 * Читает семантические токены темы (`--g-color-text-info`) из computed style.
 * Вызывается из эффекта: к этому моменту ThemeProvider уже повесил
 * класс темы на body (он делает это в layout-эффекте), поэтому токены
 * всегда соответствуют актуальной светлой/тёмной теме.
 */
function readPalette(): ChartPalette {
    const line = getComputedStyle(document.body).getPropertyValue('--g-color-text-info').trim();

    return {
        // Запасной вариант на случай отсутствия токена (стили uikit не подключены).
        line: line || '#328adb',
        fill: withAlpha(line || '#328adb', 0.15),
    };
}

export function CpuLoadChart({timeline, values}: CpuLoadData) {
    const themeValue = useThemeValue();
    const yagrTheme = themeValue.startsWith('dark') ? 'dark' : 'light';

    // Палитра пересчитывается при смене темы — серия перекрашивается
    // без пересоздания графика.
    const [palette, setPalette] = useState<ChartPalette | null>(null);
    useEffect(() => {
        setPalette(readPalette());
    }, [themeValue]);

    const config = useMemo<MinimalValidConfig | null>(() => {
        if (!palette) {
            return null;
        }

        return {
            timeline,
            series: [
                {
                    id: 'cpu',
                    name: 'CPU, %',
                    type: 'area',
                    data: values,
                    color: palette.fill,
                    lineColor: palette.line,
                    lineWidth: 2,
                    precision: 1,
                    spanGaps: true,
                },
            ],
            chart: {
                appearance: {
                    // Тёмная/светлая тема yagr синхронизирована с темой uikit.
                    theme: yagrTheme,
                    locale: 'ru',
                },
                timeMultiplier: 1, // timeline в миллисекундах
                series: {
                    type: 'area',
                    lineWidth: 2,
                    spanGaps: true,
                },
                // adaptive (по умолчанию true) — график следит за размером
                // контейнера через ResizeObserver и перерисовывается.
                size: {
                    adaptive: true,
                    resizeDebounceMs: 50,
                },
                select: {
                    zoom: true, // выделение диапазона мышью — зум, даблклик — сброс
                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    range: 'nice',
                },
            },
            axes: {
                y: {
                    precision: 0,
                },
            },
            // Одна серия — легенда не нужна, серию называет заголовок карточки.
            legend: {show: false},
            // Маркеры на 86k точках не нужны и вредят производительности;
            // точка под курсором рисуется cursor-плагином.
            markers: {show: false},
            tooltip: {show: true},
            cursor: {snapToValues: 'closest'},
        };
    }, [timeline, values, palette, yagrTheme]);

    return (
        <div
            className="cpu-chart"
            role="img"
            aria-label="График загрузки CPU в процентах за последние 24 часа"
        >
            {config ? (
                <YagrChart id="cpu-load-chart" className="cpu-chart__root" config={config} />
            ) : null}
        </div>
    );
}
