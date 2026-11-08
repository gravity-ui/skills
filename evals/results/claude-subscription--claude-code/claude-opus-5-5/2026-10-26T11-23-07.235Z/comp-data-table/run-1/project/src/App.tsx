import * as React from 'react';
import { Button, Label, Text } from '@gravity-ui/uikit';
import type { LabelProps } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { generateEmployees } from './employees';
import type { Employee, EmployeeStatus } from './employees';

const STATUS_LABELS: Record<EmployeeStatus, { text: string; theme: LabelProps['theme'] }> = {
    active: { text: 'Работает', theme: 'success' },
    vacation: { text: 'В отпуске', theme: 'info' },
    sick: { text: 'На больничном', theme: 'warning' },
};

const STATUS_ORDER: Record<EmployeeStatus, number> = { active: 0, vacation: 1, sick: 2 };

const salaryFormat = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU');

const columns: DataTableColumn<Employee>[] = [
    { id: 'id', name: 'ID', sortable: true, width: 90 },
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
        id: 'hireDate',
        name: 'Дата найма',
        sortable: true,
        defaultSortOrder: 'desc',
        template: (item) => dateFormat.format(item.hireDate),
    },
    {
        id: 'status',
        name: 'Статус',
        sortable: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
        template: (item) => {
            const { text, theme } = STATUS_LABELS[item.status];
            return <Label theme={theme}>{text}</Label>;
        },
    },
];

const getEmployeeId = (item: Employee) => item.id;

export function App() {
    const [employees, setEmployees] = React.useState(() => generateEmployees(87));
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    const handleDelete = () => {
        const selected = new Set(selectedIds);
        setEmployees((prev) => prev.filter((item) => !selected.has(item.id)));
        setSelectedIds([]);
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Text as="h1" variant="header-1" style={{ marginBottom: 16 }}>
                Сотрудники
            </Text>
            <DataTable
                data={employees}
                columns={columns}
                getRowId={getEmployeeId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                defaultSortState={[{ column: 'name', order: 'asc' }]}
                selectionActions={
                    <Button view="outlined-danger" onClick={handleDelete}>
                        Удалить выбранные
                    </Button>
                }
            />
        </div>
    );
}
