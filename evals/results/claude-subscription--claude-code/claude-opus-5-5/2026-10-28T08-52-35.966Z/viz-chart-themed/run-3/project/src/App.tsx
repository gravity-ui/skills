import * as React from 'react';
import { Card, SegmentedRadioGroup, Table, Text } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';

import { LineChart } from './LineChart';
import type { LineSeries } from './LineChart';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const SERIES: LineSeries[] = [
    {
        id: 'mobile',
        name: 'Мобильное приложение',
        values: [182000, 196000, 214000, 231000, 248000, 262000, 289000, 305000, 331000, 356000, 384000, 412000],
    },
    {
        id: 'web',
        name: 'Веб-версия',
        values: [241000, 238000, 246000, 252000, 249000, 255000, 247000, 243000, 258000, 266000, 271000, 279000],
    },
];

const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('ru-RU');

type Row = { month: string } & Record<string, string>;

const tableData: Row[] = MONTHS.map((month, i) => ({
    month,
    ...Object.fromEntries(SERIES.map((s) => [s.id, full.format(s.values[i])])),
}));

const tableColumns: TableColumnConfig<Row>[] = [
    { id: 'month', name: 'Месяц' },
    ...SERIES.map((s) => ({ id: s.id, name: s.name, align: 'end' as const })),
];

export function App() {
    const [view, setView] = React.useState<'chart' | 'table'>('chart');

    return (
        <div style={{ padding: 24 }}>
            <Card view="outlined" style={{ padding: 20, maxWidth: 880 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                        <Text as="h2" variant="subheader-3" style={{ margin: 0 }}>
                            Активные пользователи в месяц
                        </Text>
                        <Text as="p" color="secondary" style={{ margin: '4px 0 16px' }}>
                            MAU по платформам, 2025 год
                        </Text>
                    </div>
                    <SegmentedRadioGroup value={view} onUpdate={setView} aria-label="Представление">
                        <SegmentedRadioGroup.Option value="chart">График</SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="table">Таблица</SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                </div>

                {view === 'chart' ? (
                    <LineChart
                        categories={MONTHS}
                        series={SERIES}
                        formatValue={(v) => full.format(v)}
                        formatTick={(v) => compact.format(v)}
                        ariaLabel="Линейный график MAU по месяцам 2025 года: мобильное приложение выросло с 182 до 412 тыс., веб-версия — с 241 до 279 тыс."
                    />
                ) : (
                    <Table data={tableData} columns={tableColumns} width="max" />
                )}
            </Card>
        </div>
    );
}
