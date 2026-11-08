import {useMemo} from 'react';
import {Flex} from '@gravity-ui/uikit';

import {TimeSeriesWidget} from './widget';
import type {WidgetSeries} from './widget';

// Детерминированные демо-данные: почасовые значения за 14 дней, одинаковые при каждом запуске.
const START = Date.UTC(2026, 9, 25);
const HOUR = 3_600_000;
const HOURS = 14 * 24;

function buildDemoSeries(): WidgetSeries[] {
    const online: WidgetSeries = {id: 'online', name: 'Онлайн', points: []};
    const offline: WidgetSeries = {id: 'offline', name: 'Офлайн', points: []};
    for (let i = 0; i < HOURS; i++) {
        const t = START + i * HOUR;
        const daily = Math.sin((i / 24) * 2 * Math.PI);
        const weekly = Math.sin((i / (24 * 7)) * 2 * Math.PI);
        online.points.push({t, v: Math.round(1000 + 300 * daily + 120 * weekly + (i % 5) * 9)});
        // Периодические пропуски: проверка, что движок рисует разрыв, а не выдуманные значения.
        offline.points.push({t, v: i % 53 === 0 ? null : Math.round(700 + 200 * daily + 80 * weekly)});
    }
    return [online, offline];
}

export function App() {
    const series = useMemo(buildDemoSeries, []);
    return (
        <Flex direction="column" gap={4} style={{padding: 24}}>
            <TimeSeriesWidget title="Продажи по часам" series={series} defaultMode="sales" />
        </Flex>
    );
}
