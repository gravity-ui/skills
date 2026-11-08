import { Text } from '@gravity-ui/uikit';
import { DataTable, type DataColumn } from './DataTable';
import { employees, type Employee } from './employees';

const formatSalary = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { timeZone: 'UTC' });

const columns: DataColumn<Employee>[] = [
    { id: 'name', name: 'Сотрудник', getValue: (e) => e.name, sortable: true },
    { id: 'department', name: 'Отдел', getValue: (e) => e.department, sortable: true },
    { id: 'position', name: 'Должность', getValue: (e) => e.position, sortable: true },
    {
        id: 'salary',
        name: 'Зарплата',
        getValue: (e) => e.salary,
        render: (e) => formatSalary(e.salary),
        sortable: true,
        align: 'end',
    },
    {
        id: 'hireDate',
        name: 'Дата найма',
        getValue: (e) => e.hireDate,
        render: (e) => formatDate(e.hireDate),
        sortable: true,
    },
];

const getRowId = (row: Employee) => row.id;

export function App() {
    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="header-1">Сотрудники</Text>
            <DataTable data={employees} columns={columns} getRowId={getRowId} />
        </div>
    );
}
