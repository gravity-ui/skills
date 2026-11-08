import {useCallback, useState} from 'react';
import {Button, Card, Icon, Text, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';
import type {YagrTheme} from '@gravity-ui/yagr';
import {Moon, Sun} from '@gravity-ui/icons';

import {CpuLoadChart} from './CpuLoadChart';
import {
    computeHourly,
    computeStats,
    type CpuStats,
    type CpuWindow,
    type HourlyRow,
} from './cpuData';

import './app.css';

const fmtPercent = (v: number) => `${v.toFixed(1)} %`;

const fmtHour = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});

function StatTile({label, value}: {label: string; value: string}) {
    return (
        <div className="stat">
            <Text variant="body-2" color="secondary" as="div">
                {label}
            </Text>
            <Text variant="display-2" as="div" className="stat__value">
                {value}
            </Text>
        </div>
    );
}

function MonitoringPage({onToggleTheme}: {onToggleTheme: () => void}) {
    // Реальная применённая тема провайдера ('light' | 'dark' | …-hc) —
    // график следует именно за ней.
    const themeValue = useThemeValue();
    const dark = themeValue.startsWith('dark');

    const [stats, setStats] = useState<CpuStats | null>(null);
    const [hourly, setHourly] = useState<HourlyRow[]>([]);

    const handleTick = useCallback((_sample: unknown, window: CpuWindow) => {
        setStats(computeStats(window.values));
        setHourly(computeHourly(window));
    }, []);

    return (
        <div className="page">
            <header className="page__header">
                <div>
                    <Text variant="header-2" as="h1">
                        Мониторинг
                    </Text>
                    <Text variant="body-2" color="secondary" as="div">
                        Сервер web-01 · метрики обновляются раз в секунду
                    </Text>
                </div>
                <Button view="outlined" onClick={onToggleTheme}>
                    <Icon data={dark ? Sun : Moon} size={16} />
                    {dark ? 'Светлая тема' : 'Тёмная тема'}
                </Button>
            </header>

            <section className="stats" aria-label="Сводка за 24 часа">
                <StatTile label="Загрузка сейчас" value={stats ? fmtPercent(stats.current) : '—'} />
                <StatTile label="Среднее за 24 ч" value={stats ? fmtPercent(stats.avg) : '—'} />
                <StatTile label="Пик за 24 ч" value={stats ? fmtPercent(stats.max) : '—'} />
            </section>

            <Card className="chart-card" view="raised">
                <div className="chart-card__header">
                    <Text variant="subheader-3" as="h2">
                        Загрузка CPU
                    </Text>
                    <Text variant="body-1" color="secondary">
                        Последние 24 часа · выделите область для приближения, двойной клик — сброс
                    </Text>
                </div>
                <CpuLoadChart theme={themeValue as YagrTheme} onTick={handleTick} />
            </Card>

            <details className="table-view">
                <summary>
                    <Text variant="body-2" as="span">
                        Табличное представление: среднее и пик по часам
                    </Text>
                </summary>
                <table>
                    <thead>
                        <tr>
                            <th>Час</th>
                            <th>Средняя загрузка</th>
                            <th>Пиковая загрузка</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hourly.map((row) => (
                            <tr key={row.hourStart}>
                                <td>{fmtHour.format(row.hourStart)}</td>
                                <td>{fmtPercent(row.avg)}</td>
                                <td>{fmtPercent(row.max)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </div>
    );
}

export function App() {
    const [theme, setTheme] = useState<Theme>(() =>
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light',
    );

    return (
        <ThemeProvider theme={theme}>
            <MonitoringPage
                onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            />
        </ThemeProvider>
    );
}
