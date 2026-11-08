import * as React from 'react';
import {Button, Label, Text, configure} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {DataTable} from './DataTable/DataTable';
import type {DataTableColumn} from './DataTable/DataTable';
import {generateEmployees} from './data';
import type {Employee, EmployeeStatus} from './data';

// Русская локализация встроенных текстов Gravity UI (пагинация, подписи чекбоксов).
configure({lang: 'ru'});

const STATUS: Record<EmployeeStatus, {title: string; theme: LabelProps['theme']; order: number}> = {
    active: {title: 'Работает', theme: 'success', order: 0},
    vacation: {title: 'В отпуске', theme: 'info', order: 1},
    sick: {title: 'На больничном', theme: 'warning', order: 2},
    fired: {title: 'Уволен', theme: 'danger', order: 3},
};

const salaryFormat = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {timeZone: 'UTC'});

const COLUMNS: DataTableColumn<Employee>[] = [
    {id: 'id', name: 'ID', sortable: true, width: 100},
    {id: 'name', name: 'Сотрудник', sortable: true, primary: true},
    {id: 'department', name: 'Отдел', sortable: true},
    {id: 'position', name: 'Должность'},
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        sortable: true,
        template: (item) => salaryFormat.format(item.salary),
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        sortable: true,
        meta: {defaultSortOrder: 'desc'},
        template: (item) => dateFormat.format(new Date(item.hiredAt)),
    },
    {
        id: 'status',
        name: 'Статус',
        sortable: (a, b) => STATUS[a.status].order - STATUS[b.status].order,
        template: (item) => (
            <Label theme={STATUS[item.status].theme} size="s">
                {STATUS[item.status].title}
            </Label>
        ),
    },
];

const getEmployeeId = (employee: Employee) => employee.id;

export function App() {
    const [employees, setEmployees] = React.useState(() => generateEmployees(137));
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    const handleDelete = () => {
        const selected = new Set(selectedIds);
        setEmployees((prev) => prev.filter((employee) => !selected.has(employee.id)));
        setSelectedIds([]);
    };

    return (
        <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
            <Text as="h1" variant="header-2" style={{margin: '0 0 16px'}}>
                Сотрудники
            </Text>
            <DataTable
                data={employees}
                columns={COLUMNS}
                getRowId={getEmployeeId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                pageSizeOptions={[10, 20, 50]}
                defaultSortState={[{column: 'name', order: 'asc'}]}
                selectionActions={
                    <Button view="outlined-danger" size="m" onClick={handleDelete}>
                        Удалить выбранные
                    </Button>
                }
            />
        </div>
    );
}
