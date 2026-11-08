import React from 'react';
import {
    Button,
    Flex,
    Pagination,
    Table,
    Text,
    configure,
    sp,
    withTableSelection,
    withTableSorting,
} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState, WithTableSortingProps} from '@gravity-ui/uikit';

configure({lang: 'ru'});

type Employee = {
    id: string;
    name: string;
    department: string;
    role: string;
    salary: number;
    hiredAt: string;
};

const DEPARTMENTS = ['Разработка', 'Аналитика', 'Дизайн', 'Поддержка', 'Маркетинг'];
const ROLES = [
    'Инженер',
    'Старший инженер',
    'Аналитик',
    'Дизайнер',
    'Менеджер',
    'Специалист',
];
const FIRST_NAMES = [
    'Анна',
    'Иван',
    'Мария',
    'Пётр',
    'Елена',
    'Сергей',
    'Ольга',
    'Дмитрий',
    'Наталья',
    'Алексей',
];
const LAST_NAMES = [
    'Иванова',
    'Петров',
    'Сидорова',
    'Кузнецов',
    'Смирнова',
    'Васильев',
    'Попова',
    'Новиков',
    'Морозова',
    'Волков',
];

function buildEmployees(count: number): Employee[] {
    const result: Employee[] = [];
    for (let i = 0; i < count; i++) {
        result.push({
            id: `emp-${i + 1}`,
            name: `${LAST_NAMES[i % LAST_NAMES.length]} ${FIRST_NAMES[(i * 3 + 1) % FIRST_NAMES.length]}`,
            department: DEPARTMENTS[(i * 2 + 1) % DEPARTMENTS.length],
            role: ROLES[(i * 5 + 2) % ROLES.length],
            salary: 90000 + ((i * 13700) % 210000),
            hiredAt: new Date(2018 + (i % 7), (i * 5) % 12, (i % 27) + 1)
                .toISOString()
                .slice(0, 10),
        });
    }
    return result;
}

const employees = buildEmployees(47);

const columns: TableColumnConfig<Employee>[] = [
    {
        id: 'name',
        name: 'Сотрудник',
        primary: true,
        meta: {sort: true},
    },
    {
        id: 'department',
        name: 'Отдел',
        meta: {sort: true},
    },
    {
        id: 'role',
        name: 'Должность',
    },
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        meta: {sort: true},
        template: (item) => `${item.salary.toLocaleString('ru-RU')} ₽`,
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        meta: {sort: true},
        template: (item) => new Date(item.hiredAt).toLocaleDateString('ru-RU'),
    },
];

const DataTable = withTableSelection<Employee, WithTableSortingProps>(
    withTableSorting<Employee>(Table),
);

function compareField(valueA: string | number, valueB: string | number): number {
    if (valueA === valueB) {
        return 0;
    }
    if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA > valueB ? 1 : -1;
    }
    return String(valueA) > String(valueB) ? 1 : -1;
}

export function App() {
    const [sortState, setSortState] = React.useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    // Sorting is applied to the whole dataset, pagination slices the result —
    // so sorting a column reorders all rows, not only the visible page.
    const sortedData = React.useMemo(() => {
        if (sortState.length === 0) {
            return employees;
        }
        return [...employees].sort((itemA, itemB) => {
            for (const {column, order} of sortState) {
                const columnConfig = columns.find((c) => c.id === column);
                if (!columnConfig?.meta?.sort) {
                    continue;
                }
                const result = compareField(
                    itemA[column as keyof Employee] as string | number,
                    itemB[column as keyof Employee] as string | number,
                );
                if (result !== 0) {
                    return order === 'asc' ? result : -result;
                }
            }
            return 0;
        });
    }, [sortState]);

    const pagedData = React.useMemo(
        () => sortedData.slice((page - 1) * pageSize, page * pageSize),
        [sortedData, page, pageSize],
    );

    const handleSortStateChange = (newSortState: TableSortState) => {
        setSortState(newSortState);
        setPage(1);
    };

    const handlePaginationUpdate = (newPage: number, newPageSize: number) => {
        setPage(newPageSize === pageSize ? newPage : 1);
        setPageSize(newPageSize);
    };

    const handleRowClick = (item: Employee) => {
        setSelectedIds((prev) =>
            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
        );
    };

    return (
        <div className={sp({p: 5})} style={{maxWidth: 1100, margin: '0 auto'}}>
            <Flex direction="column" gap={4}>
                <Flex justifyContent="space-between" alignItems="center">
                    <Text variant="header-1">Сотрудники</Text>
                    {selectedIds.length > 0 ? (
                        <Flex alignItems="center" gap={3}>
                            <Text variant="body-2" color="secondary">
                                Выбрано: {selectedIds.length}
                            </Text>
                            <Button view="flat" onClick={() => setSelectedIds([])}>
                                Сбросить выбор
                            </Button>
                        </Flex>
                    ) : null}
                </Flex>

                <DataTable
                    data={pagedData}
                    columns={columns}
                    width="max"
                    emptyMessage="Нет данных"
                    getRowDescriptor={(item) => ({id: item.id})}
                    sortState={sortState}
                    onSortStateChange={handleSortStateChange}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onRowClick={handleRowClick}
                />

                <Flex justifyContent="flex-end">
                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={sortedData.length}
                        onUpdate={handlePaginationUpdate}
                        pageSizeOptions={[10, 20, 50]}
                    />
                </Flex>
            </Flex>
        </div>
    );
}
