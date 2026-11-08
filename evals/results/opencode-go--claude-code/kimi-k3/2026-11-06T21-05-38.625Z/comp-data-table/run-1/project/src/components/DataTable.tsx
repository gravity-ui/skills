import React from 'react';

import {
    Button,
    Checkbox,
    Icon,
    Pagination,
    Table,
    Text,
} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';
import {ArrowUpArrowDown, TriangleDownFill, TriangleUpFill} from '@gravity-ui/icons';

import {EMPLOYEES} from '../data';
import type {Employee} from '../data';

import './DataTable.css';

type SortOrder = 'asc' | 'desc';

interface SortState {
    columnId: string;
    order: SortOrder;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const salaryFormatter = new Intl.NumberFormat('ru-RU');
const dateFormatter = new Intl.DateTimeFormat('ru-RU');

function compareValues(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    return String(a).localeCompare(String(b), 'ru');
}

interface SortableHeaderProps {
    title: string;
    columnId: string;
    sort: SortState | null;
    onSort: (columnId: string) => void;
}

function SortableHeader({title, columnId, sort, onSort}: SortableHeaderProps) {
    const active = sort?.columnId === columnId;
    const icon = active
        ? sort.order === 'asc'
            ? TriangleUpFill
            : TriangleDownFill
        : ArrowUpArrowDown;

    return (
        <button
            type="button"
            className={
                active
                    ? 'data-table__sortable-header data-table__sortable-header_active'
                    : 'data-table__sortable-header'
            }
            onClick={() => onSort(columnId)}
            title={active ? undefined : 'Сортировать'}
        >
            <span>{title}</span>
            <Icon data={icon} size={14} className="data-table__sort-icon" />
        </button>
    );
}

export function DataTable() {
    const [sort, setSort] = React.useState<SortState | null>(null);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set());

    const handleSort = React.useCallback((columnId: string) => {
        setSort((prev) => {
            if (prev?.columnId !== columnId) {
                return {columnId, order: 'asc'};
            }
            if (prev.order === 'asc') {
                return {columnId, order: 'desc'};
            }
            return null; // третий клик сбрасывает сортировку
        });
        setPage(1);
    }, []);

    const sortedData = React.useMemo(() => {
        if (!sort) {
            return EMPLOYEES;
        }
        const {columnId, order} = sort;
        const dir = order === 'asc' ? 1 : -1;
        return [...EMPLOYEES].sort(
            (a, b) => dir * compareValues(a[columnId as keyof Employee], b[columnId as keyof Employee]),
        );
    }, [sort]);

    const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageData = React.useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize],
    );

    const toggleRow = React.useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    const pageIds = pageData.map((item) => item.id);
    const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
    const allPageSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
    const somePageSelected = selectedOnPage > 0 && !allPageSelected;

    const togglePage = React.useCallback(
        (checked: boolean) => {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                for (const id of pageIds) {
                    if (checked) {
                        next.add(id);
                    } else {
                        next.delete(id);
                    }
                }
                return next;
            });
        },
        // pageIds пересоздаётся при смене страницы/сортировки
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pageIds.join(',')],
    );

    const headerProps = {sort, onSort: handleSort};

    const columns: TableColumnConfig<Employee>[] = React.useMemo(
        () => [
            {
                id: '_selection',
                name: () => (
                    <Checkbox
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onUpdate={togglePage}
                        aria-label="Выбрать все строки на странице"
                    />
                ),
                template: (item: Employee) => (
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onUpdate={(checked) => toggleRow(item.id, checked)}
                        aria-label={`Выбрать строку: ${item.name}`}
                    />
                ),
                width: 48,
            },
            {
                id: 'name',
                name: () => <SortableHeader title="Сотрудник" columnId="name" {...headerProps} />,
                primary: true,
            },
            {
                id: 'role',
                name: () => <SortableHeader title="Должность" columnId="role" {...headerProps} />,
            },
            {
                id: 'department',
                name: () => (
                    <SortableHeader title="Отдел" columnId="department" {...headerProps} />
                ),
            },
            {
                id: 'salary',
                name: () => <SortableHeader title="Зарплата, ₽" columnId="salary" {...headerProps} />,
                template: (item: Employee) => salaryFormatter.format(item.salary),
                align: 'right',
            },
            {
                id: 'hiredAt',
                name: () => (
                    <SortableHeader title="Дата найма" columnId="hiredAt" {...headerProps} />
                ),
                template: (item: Employee) => dateFormatter.format(new Date(item.hiredAt)),
            },
        ],
        // headerProps стабилен (handleSort — useCallback, sort — state)
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sort, selectedIds, allPageSelected, somePageSelected, togglePage, toggleRow],
    );

    return (
        <div className="data-table">
            <Text variant="header-1" className="data-table__title">
                Сотрудники
            </Text>

            <Table
                data={pageData}
                columns={columns}
                getRowDescriptor={(item) => ({
                    id: item.id,
                    classNames: selectedIds.has(item.id) ? ['data-table__row_selected'] : [],
                })}
                emptyMessage="Нет данных"
            />

            <div className="data-table__footer">
                <div className="data-table__selection-info">
                    <Text variant="body-2" color="secondary">
                        Выбрано: {selectedIds.size} из {sortedData.length}
                    </Text>
                    {selectedIds.size > 0 && (
                        <Button view="flat" size="s" onClick={() => setSelectedIds(new Set())}>
                            Снять выделение
                        </Button>
                    )}
                </div>

                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    onUpdate={(nextPage, nextPageSize) => {
                        setPage(nextPageSize !== pageSize ? 1 : nextPage);
                        setPageSize(nextPageSize);
                    }}
                />
            </div>
        </div>
    );
}
