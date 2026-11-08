import {useMemo, useState} from 'react';

import {Pagination, Table, Text, withTableSelection, withTableSorting} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState, WithTableSelectionProps} from '@gravity-ui/uikit';

// Type alias (not interface) so Employee satisfies the TableDataItem index-signature constraint.
type Employee = {
    id: string;
    name: string;
    position: string;
    department: string;
    city: string;
    salary: number;
};

const employees: Employee[] = [
    {id: '1', name: 'Анна Смирнова', position: 'Frontend-разработчик', department: 'Разработка', city: 'Москва', salary: 210000},
    {id: '2', name: 'Иван Петров', position: 'Backend-разработчик', department: 'Разработка', city: 'Санкт-Петербург', salary: 230000},
    {id: '3', name: 'Мария Козлова', position: 'Дизайнер', department: 'Дизайн', city: 'Москва', salary: 180000},
    {id: '4', name: 'Алексей Соколов', position: 'Тестировщик', department: 'QA', city: 'Казань', salary: 150000},
    {id: '5', name: 'Ольга Новикова', position: 'Аналитик', department: 'Аналитика', city: 'Новосибирск', salary: 170000},
    {id: '6', name: 'Дмитрий Волков', position: 'DevOps-инженер', department: 'Инфраструктура', city: 'Москва', salary: 250000},
    {id: '7', name: 'Екатерина Морозова', position: 'Менеджер проектов', department: 'Управление', city: 'Санкт-Петербург', salary: 200000},
    {id: '8', name: 'Сергей Лебедев', position: 'Frontend-разработчик', department: 'Разработка', city: 'Екатеринбург', salary: 195000},
    {id: '9', name: 'Наталья Павлова', position: 'HR-специалист', department: 'HR', city: 'Москва', salary: 130000},
    {id: '10', name: 'Андрей Семёнов', position: 'Backend-разработчик', department: 'Разработка', city: 'Нижний Новгород', salary: 220000},
    {id: '11', name: 'Юлия Голубева', position: 'Дизайнер', department: 'Дизайн', city: 'Казань', salary: 165000},
    {id: '12', name: 'Павел Виноградов', position: 'Тестировщик', department: 'QA', city: 'Москва', salary: 145000},
    {id: '13', name: 'Татьяна Богданова', position: 'Аналитик', department: 'Аналитика', city: 'Санкт-Петербург', salary: 175000},
    {id: '14', name: 'Михаил Воробьёв', position: 'Архитектор', department: 'Разработка', city: 'Москва', salary: 300000},
    {id: '15', name: 'Светлана Фёдорова', position: 'Технический писатель', department: 'Документация', city: 'Самара', salary: 120000},
    {id: '16', name: 'Роман Михайлов', position: 'DevOps-инженер', department: 'Инфраструктура', city: 'Екатеринбург', salary: 240000},
    {id: '17', name: 'Елена Тарасова', position: 'Менеджер продукта', department: 'Управление', city: 'Москва', salary: 260000},
    {id: '18', name: 'Виктор Белов', position: 'Frontend-разработчик', department: 'Разработка', city: 'Ростов-на-Дону', salary: 185000},
    {id: '19', name: 'Ксения Комарова', position: 'Маркетолог', department: 'Маркетинг', city: 'Санкт-Петербург', salary: 155000},
    {id: '20', name: 'Григорий Орлов', position: 'Data Scientist', department: 'Аналитика', city: 'Москва', salary: 280000},
    {id: '21', name: 'Алиса Киселёва', position: 'Дизайнер', department: 'Дизайн', city: 'Новосибирск', salary: 160000},
    {id: '22', name: 'Никита Макаров', position: 'Backend-разработчик', department: 'Разработка', city: 'Казань', salary: 215000},
    {id: '23', name: 'Вера Андреева', position: 'Тестировщик', department: 'QA', city: 'Самара', salary: 140000},
];

const columns: TableColumnConfig<Employee>[] = [
    {id: 'name', name: 'Сотрудник', meta: {sort: true}},
    {id: 'position', name: 'Должность', meta: {sort: true}},
    {id: 'department', name: 'Отдел', meta: {sort: true}},
    {id: 'city', name: 'Город', meta: {sort: true}},
    {
        id: 'salary',
        name: 'Зарплата, ₽',
        align: 'end',
        meta: {sort: true},
        template: (item) => item.salary.toLocaleString('ru-RU'),
    },
];

// Canonical Gravity UI composition: sorting + checkbox row selection over the base Table.
// Generics are pinned to Employee so data/columns/getRowId stay strictly typed.
const DataTable = withTableSorting<Employee, WithTableSelectionProps<Employee>>(
    withTableSelection<Employee>(Table),
);

function compareEmployees(a: Employee, b: Employee, sortState: TableSortState): number {
    for (const {column, order} of sortState) {
        const aValue = a[column as keyof Employee];
        const bValue = b[column as keyof Employee];
        let diff: number;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            diff = aValue - bValue;
        } else {
            diff = String(aValue).localeCompare(String(bValue), 'ru');
        }
        if (diff !== 0) {
            return order === 'asc' ? diff : -diff;
        }
    }
    return 0;
}

export function App() {
    const [sortState, setSortState] = useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Controlled sorting: sort the FULL dataset, then slice the current page,
    // so ordering is global rather than per-page.
    const sortedData = useMemo(() => {
        if (sortState.length === 0) {
            return employees;
        }
        return [...employees].sort((a, b) => compareEmployees(a, b, sortState));
    }, [sortState]);

    const total = sortedData.length;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, lastPage);
    const pageData = useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize],
    );

    const handlePaginationUpdate = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    return (
        <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960}}>
            <Text variant="header-1">Сотрудники</Text>
            <DataTable
                data={pageData}
                columns={columns}
                getRowId={(item) => item.id}
                sortState={sortState}
                onSortStateChange={setSortState}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                emptyMessage="Нет данных"
            />
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
                <Text color="secondary">Выбрано строк: {selectedIds.length}</Text>
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={total}
                    pageSizeOptions={[5, 10, 20]}
                    onUpdate={handlePaginationUpdate}
                />
            </div>
        </div>
    );
}
