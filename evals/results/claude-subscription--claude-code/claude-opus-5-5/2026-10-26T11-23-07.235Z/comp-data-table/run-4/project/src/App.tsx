import * as React from 'react';
import { Button, Flex, Label, Text } from '@gravity-ui/uikit';
import type { LabelProps } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { generateEmployees } from './data';
import type { Employee, EmployeeStatus } from './data';

const STATUS_META: Record<EmployeeStatus, { title: string; theme: LabelProps['theme']; order: number }> = {
    active: { title: 'Работает', theme: 'success', order: 0 },
    vacation: { title: 'В отпуске', theme: 'warning', order: 1 },
    fired: { title: 'Уволен', theme: 'danger', order: 2 },
};

const salaryFormat = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC' });

const columns: DataTableColumn<Employee>[] = [
    { id: 'id', name: '№', align: 'end', width: 60, sortable: (a, b) => Number(a.id) - Number(b.id) },
    { id: 'name', name: 'Сотрудник', sortable: true, primary: true },
    { id: 'department', name: 'Отдел', sortable: true },
    { id: 'position', name: 'Должность', sortable: true },
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        sortable: true,
        defaultSortOrder: 'desc',
        template: (item) => salaryFormat.format(item.salary),
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        sortable: true,
        defaultSortOrder: 'desc',
        template: (item) => dateFormat.format(new Date(item.hiredAt)),
    },
    {
        id: 'status',
        name: 'Статус',
        sortable: (a, b) => STATUS_META[a.status].order - STATUS_META[b.status].order,
        template: (item) => {
            const { title, theme } = STATUS_META[item.status];
            return (
                <Label theme={theme} size="xs">
                    {title}
                </Label>
            );
        },
    },
];

const getRowId = (item: Employee) => item.id;

export function App() {
    const [employees, setEmployees] = React.useState(() => generateEmployees(137));
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    const handleDelete = () => {
        const selected = new Set(selectedIds);
        setEmployees((prev) => prev.filter((item) => !selected.has(item.id)));
        setSelectedIds([]);
    };

    return (
        <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Flex alignItems="center" justifyContent="space-between" gap={3}>
                <Text variant="header-2">Сотрудники</Text>
                <Button view="outlined-danger" disabled={selectedIds.length === 0} onClick={handleDelete}>
                    Удалить выбранные{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </Button>
            </Flex>

            <DataTable
                data={employees}
                columns={columns}
                getRowId={getRowId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                defaultSortState={[{ column: 'name', order: 'asc' }]}
                pageSizeOptions={[10, 20, 50]}
            />
        </Flex>
    );
}
