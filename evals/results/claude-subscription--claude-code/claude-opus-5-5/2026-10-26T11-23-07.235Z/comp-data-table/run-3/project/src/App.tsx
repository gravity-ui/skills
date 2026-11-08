import { useState } from 'react';
import { Label, Text } from '@gravity-ui/uikit';
import type { LabelProps } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';

type Status = 'active' | 'vacation' | 'fired';

interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    salary: number;
    hiredAt: string; // ISO-дата
    status: Status;
}

const STATUS: Record<Status, { title: string; theme: LabelProps['theme'] }> = {
    active: { title: 'Работает', theme: 'success' },
    vacation: { title: 'В отпуске', theme: 'warning' },
    fired: { title: 'Уволен', theme: 'danger' },
};

const FIRST_NAMES = ['Анна', 'Борис', 'Виктория', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Илья', 'Ксения', 'Лев'];
const LAST_NAMES = ['Иванов', 'Петров', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов'];
const DEPARTMENTS = ['Разработка', 'Маркетинг', 'Продажи', 'Поддержка', 'HR', 'Финансы'];
const STATUSES: Status[] = ['active', 'active', 'active', 'vacation', 'fired'];

// Детерминированный генератор, чтобы данные не менялись между перезагрузками.
function createEmployees(count: number): Employee[] {
    let seed = 42;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

    return Array.from({ length: count }, (_, i) => {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        const female = first.endsWith('а') || first.endsWith('я');
        const hired = new Date(Date.UTC(2015, 0, 1 + Math.floor(rand() * 3650)));
        return {
            id: String(i + 1),
            name: `${female ? `${last}а` : last} ${first}`,
            email: `user${i + 1}@example.com`,
            department: pick(DEPARTMENTS),
            salary: Math.round((80 + rand() * 320) * 1000),
            hiredAt: hired.toISOString().slice(0, 10),
            status: pick(STATUSES),
        };
    });
}

const employees = createEmployees(87);

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC' }); // даты хранятся как UTC

const columns: DataTableColumn<Employee>[] = [
    { id: 'id', name: '№', align: 'end', width: 60, sortable: (a, b) => Number(a.id) - Number(b.id) },
    { id: 'name', name: 'Сотрудник', primary: true, sortable: true },
    { id: 'email', name: 'Email' },
    { id: 'department', name: 'Отдел', sortable: true },
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        sortable: true,
        meta: { defaultSortOrder: 'desc' },
        template: (item) => money.format(item.salary),
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        sortable: true, // ISO-строки корректно сравниваются лексикографически
        template: (item) => date.format(new Date(item.hiredAt)),
    },
    {
        id: 'status',
        name: 'Статус',
        sortable: (a, b) => STATUS[a.status].title.localeCompare(STATUS[b.status].title, 'ru'),
        template: (item) => <Label theme={STATUS[item.status].theme}>{STATUS[item.status].title}</Label>,
    },
];

const getRowId = (item: Employee) => item.id;

export function App() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    return (
        <div style={{ padding: 24, maxWidth: 1200 }}>
            <Text variant="header-1" as="h1" style={{ marginTop: 0 }}>
                Сотрудники
            </Text>
            <DataTable
                data={employees}
                columns={columns}
                getRowId={getRowId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                defaultSortState={[{ column: 'name', order: 'asc' }]}
            />
        </div>
    );
}
