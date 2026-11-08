import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Label, Table} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

type Status = 'ok' | 'warning' | 'error';

export interface TableRow {
    id: string;
    name: string;
    requests: number;
    latencyMs: number;
    status: Status;
}

export interface TableWidgetData {
    title: string;
    rows: TableRow[];
}

const STATUS: Record<Status, {theme: 'success' | 'warning' | 'danger'; text: string}> = {
    ok: {theme: 'success', text: 'В норме'},
    warning: {theme: 'warning', text: 'Внимание'},
    error: {theme: 'danger', text: 'Сбой'},
};

const columns: TableColumnConfig<TableRow>[] = [
    {id: 'name', name: 'Сервис', primary: true},
    {
        id: 'requests',
        name: 'Запросы',
        align: 'end',
        className: 'dashboard-widget__num',
        template: (row) => row.requests.toLocaleString('ru-RU'),
    },
    {
        id: 'latencyMs',
        name: 'Задержка',
        align: 'end',
        className: 'dashboard-widget__num',
        template: (row) => `${row.latencyMs} мс`,
    },
    {
        id: 'status',
        name: 'Статус',
        template: (row) => (
            <Label theme={STATUS[row.status].theme} size="xs">
                {STATUS[row.status].text}
            </Label>
        ),
    },
];

function TableWidget({data}: PluginWidgetProps) {
    const {title, rows} = data as unknown as TableWidgetData;

    return (
        <WidgetFrame title={title}>
            <div className="dashboard-widget__scroll">
                <Table data={rows} columns={columns} getRowId="id" emptyMessage="Нет данных" />
            </div>
        </WidgetFrame>
    );
}

export const tablePlugin: Plugin = {
    type: 'table',
    defaultLayout: {w: 18, h: 12, minW: 12, minH: 6},
    renderer: (props) => <TableWidget {...props} />,
};
