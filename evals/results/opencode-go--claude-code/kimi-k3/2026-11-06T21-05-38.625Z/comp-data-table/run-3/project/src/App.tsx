import {useMemo, useState} from 'react';
import {
    Label,
    Pagination,
    Table,
    Text,
    withTableSelection,
    withTableSorting,
    type TableColumnConfig,
    type TableSortState,
    type WithTableSelectionProps,
} from '@gravity-ui/uikit';

// Selection inside, sorting outside — so the checkbox column doesn't get a sort handler.
const EnhancedTable = withTableSorting<Employee, WithTableSelectionProps<Employee>>(
    withTableSelection<Employee>(Table),
);

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    age: number;
    salary: number;
    city: string;
    status: 'active' | 'vacation' | 'fired';
}

const FIRST_NAMES = [
    'Ivan', 'Anna', 'Petr', 'Maria', 'Sergey', 'Olga', 'Dmitry', 'Elena',
    'Alexey', 'Natalia', 'Andrey', 'Irina', 'Nikolay', 'Svetlana', 'Pavel',
];
const LAST_NAMES = [
    'Ivanov', 'Petrova', 'Sidorov', 'Smirnova', 'Kuznetsov', 'Popova',
    'Volkov', 'Sokolova', 'Lebedev', 'Morozova', 'Novikov', 'Fedorova',
];
const ROLES = ['Developer', 'Designer', 'Manager', 'Analyst', 'QA Engineer', 'DevOps'];
const CITIES = ['Moscow', 'Saint Petersburg', 'Kazan', 'Novosibirsk', 'Yekaterinburg'];
const STATUSES: Employee['status'][] = ['active', 'vacation', 'fired'];

// Deterministic pseudo-random dataset (63 rows).
const DATA: Employee[] = Array.from({length: 63}, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    return {
        id: `emp-${i + 1}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@example.com`,
        role: ROLES[(i * 5 + 1) % ROLES.length],
        age: 22 + ((i * 13) % 38),
        salary: 80000 + ((i * 37000) % 220000),
        city: CITIES[(i * 3) % CITIES.length],
        status: STATUSES[i % STATUSES.length],
    };
});

const STATUS_THEME: Record<Employee['status'], 'success' | 'warning' | 'danger'> = {
    active: 'success',
    vacation: 'warning',
    fired: 'danger',
};

const salaryFormatter = new Intl.NumberFormat('ru-RU');

function compareValues(a: unknown, b: unknown): number {
    if (a === b) return 0;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), 'ru');
}

const columns: TableColumnConfig<Employee>[] = [
    {id: 'name', name: 'Имя', meta: {sort: true}},
    {id: 'email', name: 'Email', meta: {sort: true}},
    {id: 'role', name: 'Должность', meta: {sort: true}},
    {id: 'age', name: 'Возраст', align: 'end', meta: {sort: true}},
    {
        id: 'salary',
        name: 'Зарплата, ₽',
        align: 'end',
        meta: {sort: true},
        template: (item) => salaryFormatter.format(item.salary),
    },
    {id: 'city', name: 'Город', meta: {sort: true}},
    {
        id: 'status',
        name: 'Статус',
        meta: {sort: true},
        template: (item) => <Label theme={STATUS_THEME[item.status]}>{item.status}</Label>,
    },
];

export function App() {
    // Controlled sorting: we sort the full dataset ourselves, then paginate,
    // so sorting applies across pages, not just within the visible slice.
    const [sortState, setSortState] = useState<TableSortState>([
        {column: 'name', order: 'asc'},
    ]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const sortedData = useMemo(() => {
        if (sortState.length === 0) return DATA;
        return [...DATA].sort((a, b) => {
            for (const {column, order} of sortState) {
                const cmp = compareValues(
                    a[column as keyof Employee],
                    b[column as keyof Employee],
                );
                if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
            }
            return 0;
        });
    }, [sortState]);

    const maxPage = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, maxPage);
    const pageData = sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const handlePageUpdate = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    };

    return (
        <div style={{padding: 24, maxWidth: 1100, margin: '0 auto'}}>
            <Text variant="header-1" as="h1">
                Сотрудники
            </Text>
            <div style={{margin: '12px 0'}}>
                <Text variant="body-1" color="secondary">
                    Выбрано строк: {selectedIds.length} из {DATA.length}
                </Text>
            </div>
            <EnhancedTable
                data={pageData}
                columns={columns}
                sortState={sortState}
                onSortStateChange={(state) => {
                    setSortState(state);
                    setPage(1);
                }}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                getRowId="id"
                emptyMessage="Нет данных"
            />
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    onUpdate={handlePageUpdate}
                    pageSizeOptions={[5, 10, 20, 50]}
                    showInput
                    showPages
                />
            </div>
        </div>
    );
}
