import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Label, Table} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import type {TableRow, TableWidgetData} from '../types';
import {WidgetFrame} from './WidgetFrame';

const STATUS_LABEL: Record<TableRow['status'], {text: string; theme: 'success' | 'warning' | 'danger'}> = {
    ok: {text: 'OK', theme: 'success'},
    degraded: {text: 'Деградация', theme: 'warning'},
    down: {text: 'Недоступен', theme: 'danger'},
};

const columns: TableColumnConfig<TableRow>[] = [
    {id: 'service', name: 'Сервис'},
    {
        id: 'status',
        name: 'Статус',
        template: (row) => (
            <Label theme={STATUS_LABEL[row.status].theme} size="xs">
                {STATUS_LABEL[row.status].text}
            </Label>
        ),
    },
    {id: 'latency', name: 'p95, мс', align: 'end'},
    {id: 'errors', name: 'Ошибки', align: 'end'},
];

export function TableWidget(props: PluginWidgetProps) {
    const data = props.data as unknown as TableWidgetData;

    return (
        <WidgetFrame title={data.title}>
            <Table data={data.rows} columns={columns} getRowId={(row) => row.service} />
        </WidgetFrame>
    );
}
