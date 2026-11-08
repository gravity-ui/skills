import {Card, Disclosure, Flex, Table, Text} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {MONTHS, SERIES} from './data';
import {LineChart, LineChartLegend} from './LineChart';

type Row = {month: string} & Record<string, string | number>;

const formatValue = (value: number) => `${value} тыс.`;

const rows: Row[] = MONTHS.map((month, i) => ({
    month,
    ...Object.fromEntries(SERIES.map((s) => [s.id, s.values[i]])),
}));

const columns: TableColumnConfig<Row>[] = [
    {id: 'month', name: 'Месяц'},
    ...SERIES.map((s) => ({id: s.id, name: s.name, align: 'end' as const})),
];

export function App() {
    return (
        <div style={{padding: 24, maxWidth: 960}}>
            <Card view="outlined" style={{padding: 20}}>
                <Flex direction="column" gap={4}>
                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-3">Ежемесячная аудитория по платформам</Text>
                        <Text color="secondary">Тыс. пользователей, 2026 г.</Text>
                    </Flex>
                    <LineChartLegend series={SERIES} />
                    <LineChart
                        categories={MONTHS}
                        series={SERIES}
                        formatValue={formatValue}
                        ariaLabel="Линейный график ежемесячной аудитории Web, Android и iOS за 2026 год. Данные доступны в таблице ниже."
                    />
                    <Disclosure summary="Показать таблицу">
                        <Table data={rows} columns={columns} width="max" />
                    </Disclosure>
                </Flex>
            </Card>
        </div>
    );
}
