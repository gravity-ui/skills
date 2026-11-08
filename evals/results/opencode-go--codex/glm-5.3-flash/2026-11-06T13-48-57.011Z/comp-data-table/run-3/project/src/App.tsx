import React, { useMemo, useState } from 'react';
import { ArrowToggle, Checkbox, Label, Pagination } from '@gravity-ui/uikit';
import './App.css';

type SortDirection = 'asc' | 'desc';

interface Employee {
  id: number;
  name: string;
  team: string;
  role: string;
  active: boolean;
}

interface Column<K extends keyof Employee> {
  key: K;
  title: string;
  sortable?: boolean;
}

const columns: Column<keyof Employee>[] = [
  { key: 'name', title: 'Имя', sortable: true },
  { key: 'team', title: 'Команда', sortable: true },
  { key: 'role', title: 'Роль', sortable: true },
  { key: 'active', title: 'Статус', sortable: true },
];

const employees: Employee[] = [
  { id: 1, name: 'Анна Ковалева', team: 'Design', role: 'Product Designer', active: true },
  { id: 2, name: 'Борис Лебедев', team: 'Frontend', role: 'Frontend Developer', active: true },
  { id: 3, name: 'Вера Гурьева', team: 'Backend', role: 'Backend Developer', active: false },
  { id: 4, name: 'Глеб Морозов', team: 'Mobile', role: 'iOS Developer', active: true },
  { id: 5, name: 'Дина Ахметова', team: 'Frontend', role: 'UI Developer', active: false },
  { id: 6, name: 'Егор Стрелков', team: 'QA', role: 'QA Engineer', active: true },
  { id: 7, name: 'Жанна Рудакова', team: 'Design', role: 'UX Researcher', active: false },
  { id: 8, name: 'Захар Ильин', team: 'Backend', role: 'Go Developer', active: true },
  { id: 9, name: 'Ирина Ким', team: 'Analytics', role: 'Data Analyst', active: true },
  { id: 10, name: 'Кирилл Ясенев', team: 'Mobile', role: 'Android Developer', active: false },
  { id: 11, name: 'Лида Ветрова', team: 'Frontend', role: 'Frontend Developer', active: true },
  { id: 12, name: 'Марк Дорохов', team: 'QA', role: 'Automation QA', active: true },
];

const pageSizeOptions = [5, 10, 20];

export function App() {
  const [sort, setSort] = useState<{ key: keyof Employee; direction: SortDirection } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const sortedEmployees = useMemo(() => {
    if (!sort) {
      return employees;
    }

    const sorted = [...employees].sort((left, right) => {
      const leftValue = left[sort.key];
      const rightValue = right[sort.key];

      if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
        return Number(leftValue) - Number(rightValue);
      }

      return String(leftValue).localeCompare(String(rightValue), 'ru', { sensitivity: 'base' });
    });

    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [sort]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, sortedEmployees]);
  const currentPageIds = pageEmployees.map(({ id }) => id);
  const selectedOnPage = currentPageIds.filter((id) => selectedIds.has(id)).length;
  const allOnPageSelected = selectedOnPage === currentPageIds.length && currentPageIds.length > 0;
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected;

  const handleSort = (key: keyof Employee) => {
    setSort((currentSort) => {
      if (!currentSort || currentSort.key !== key) {
        return { key, direction: 'asc' };
      }

      if (currentSort.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null;
    });
    setPage(1);
  };

  const toggleRow = (id: number) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      return nextIds;
    });
  };

  const togglePage = () => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (allOnPageSelected) {
        currentPageIds.forEach((id) => nextIds.delete(id));
      } else {
        currentPageIds.forEach((id) => nextIds.add(id));
      }

      return nextIds;
    });
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <div className="data-table-page">
      <h1 className="data-table-title">Команда</h1>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="data-table__cell data-table__cell_selection">
                <Checkbox
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected}
                  onUpdate={togglePage}
                  onChange={togglePage}
                  title="Выбрать строки на странице"
                />
              </th>
              {columns.map((column) => {
                const isActive = sort?.key === column.key;
                const direction = isActive && sort.direction === 'desc' ? 'top' : 'bottom';

                return (
                  <th
                    key={column.key}
                    className={`data-table__cell${column.sortable ? ' data-table__cell_sortable' : ''}`}
                  >
                    <button
                      type="button"
                      className="data-table__sort-button"
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      disabled={!column.sortable}
                    >
                      {column.title}
                      {column.sortable ? (
                        <ArrowToggle
                          direction={direction}
                          className={`data-table__arrow${isActive ? ' data-table__arrow_active' : ''}`}
                        />
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageEmployees.map((employee) => {
              const isSelected = selectedIds.has(employee.id);

              return (
                <tr key={employee.id} className={isSelected ? 'data-table__row_selected' : undefined}>
                  <td className="data-table__cell data-table__cell_selection">
                    <Checkbox
                      checked={isSelected}
                      onUpdate={() => toggleRow(employee.id)}
                      onChange={() => toggleRow(employee.id)}
                      title={`Выбрать ${employee.name}`}
                    />
                  </td>
                  <td className="data-table__cell">{employee.name}</td>
                  <td className="data-table__cell">{employee.team}</td>
                  <td className="data-table__cell">{employee.role}</td>
                  <td className="data-table__cell">
                    <Label theme={employee.active ? 'success' : 'warning'}>
                      {employee.active ? 'Активен' : 'Не активен'}
                    </Label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="data-table-footer">
        <div className="data-table-footer__selection">
          Выбрано строк: <strong>{selectedIds.size}</strong>
        </div>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={sortedEmployees.length}
          pageSizeOptions={pageSizeOptions}
          onUpdate={handlePaginationUpdate}
        />
      </div>
    </div>
  );
}
