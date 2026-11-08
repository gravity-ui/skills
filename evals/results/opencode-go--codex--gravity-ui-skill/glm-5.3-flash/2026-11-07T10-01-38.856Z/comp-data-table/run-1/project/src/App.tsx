import React, { useMemo, useState } from 'react';
import { Pagination, Table, withTableSelection, withTableSorting } from '@gravity-ui/uikit';
import type { TableSortState } from '@gravity-ui/uikit';

const EnhancedTable = withTableSorting(withTableSelection(Table));

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  owner: string;
  startDate: string;
  budget: number;
}

const tableData: ProjectRow[] = [
  { id: 'PRJ-001', name: 'Atlas Migration', status: 'In progress', owner: 'Anna Novikova', startDate: '2026-04-12', budget: 184000 },
  { id: 'PRJ-002', name: 'Checkout Redesign', status: 'Planned', owner: 'Dmitry Sokolov', startDate: '2026-06-01', budget: 92000 },
  { id: 'PRJ-003', name: 'Search Relevance', status: 'Done', owner: 'Elena Petrova', startDate: '2025-11-18', budget: 156000 },
  { id: 'PRJ-004', name: 'Mobile Onboarding', status: 'In progress', owner: 'Ivan Kuznetsov', startDate: '2026-02-27', budget: 63000 },
  { id: 'PRJ-005', name: 'Billing Automation', status: 'Blocked', owner: 'Maria Orlova', startDate: '2026-01-15', budget: 121500 },
  { id: 'PRJ-006', name: 'Security Audit', status: 'Done', owner: 'Nikita Volkov', startDate: '2026-03-09', budget: 48000 },
  { id: 'PRJ-007', name: 'Analytics Warehouse', status: 'Planned', owner: 'Olga Morozova', startDate: '2026-07-20', budget: 210000 },
  { id: 'PRJ-008', name: 'Customer Portal', status: 'In progress', owner: 'Pavel Fedorov', startDate: '2025-12-04', budget: 175000 },
  { id: 'PRJ-009', name: 'Data Cleanup', status: 'Blocked', owner: 'Sofia Ivanova', startDate: '2026-05-30', budget: 35000 },
  { id: 'PRJ-010', name: 'API Gateway v2', status: 'In progress', owner: 'Timur Akhmedov', startDate: '2026-04-02', budget: 139500 },
  { id: 'PRJ-011', name: 'Localization Rollout', status: 'Planned', owner: 'Vera Chernova', startDate: '2026-08-11', budget: 78000 },
  { id: 'PRJ-012', name: 'Performance Review', status: 'Done', owner: 'Yuri Smirnov', startDate: '2026-06-25', budget: 41000 },
  { id: 'PRJ-013', name: 'Notification Service', status: 'In progress', owner: 'Alexey Romanov', startDate: '2026-03-21', budget: 104000 },
  { id: 'PRJ-014', name: 'Partner Integration', status: 'Planned', owner: 'Anna Novikova', startDate: '2026-09-01', budget: 186000 },
  { id: 'PRJ-015', name: 'Content Governance', status: 'Blocked', owner: 'Elena Petrova', startDate: '2026-02-14', budget: 59000 },
  { id: 'PRJ-016', name: 'Audit Trail', status: 'Done', owner: 'Dmitry Sokolov', startDate: '2025-10-07', budget: 97500 },
];

const columns = [
  { id: 'name', name: 'Project', primary: true, width: 240, meta: { sort: true } },
  { id: 'status', name: 'Status', width: 150, meta: { sort: true } },
  { id: 'owner', name: 'Owner', width: 180, meta: { sort: true } },
  { id: 'startDate', name: 'Start date', width: 130, meta: { sort: true } },
  {
    id: 'budget',
    name: 'Budget, ₽',
    align: 'end' as const,
    width: 120,
    meta: { sort: (itemA: ProjectRow, itemB: ProjectRow) => itemA.budget - itemB.budget },
  },
];

const pageSizeOptions = [5, 10, 20];

export function App() {
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedData = useMemo(() => {
    const activeSort = sortState.find((sort) => Boolean(sort.order));
    if (!activeSort) {
      return tableData;
    }

    const direction = activeSort.order === 'asc' ? 1 : -1;
    return [...tableData].sort((first, second) => {
      const firstValue = first[activeSort.column as keyof ProjectRow];
      const secondValue = second[activeSort.column as keyof ProjectRow];

      if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return (firstValue - secondValue) * direction;
      }
      return String(firstValue).localeCompare(String(secondValue), 'ru') * direction;
    });
  }, [sortState]);

  const startIndex = (page - 1) * pageSize;
  const pageData = sortedData.slice(startIndex, startIndex + pageSize);

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const handleSortStateChange = (nextSortState: TableSortState) => {
    setSortState(nextSortState);
    setPage(1);
  };

  const handleSelectionChange = (nextSelectedIds: string[]) => {
    setSelectedIds(nextSelectedIds);
  };

  return (
    <main className="data-table-page">
      <section className="data-table-card">
        <div className="data-table-heading">
          <div>
            <h1>Projects</h1>
            <p>Sorted and paged data with row selection.</p>
          </div>
          <span>{selectedIds.length ? `${selectedIds.length} selected` : 'No rows selected'}</span>
        </div>
        <div className="data-table-scroll">
          <EnhancedTable
            data={pageData}
            columns={columns}
            getRowId={(item) => item.id}
            sortState={sortState}
            onSortStateChange={handleSortStateChange}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        <div className="data-table-footer">
          <Pagination
            page={page}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            total={sortedData.length}
            onUpdate={handlePaginationUpdate}
          />
        </div>
      </section>
    </main>
  );
}
