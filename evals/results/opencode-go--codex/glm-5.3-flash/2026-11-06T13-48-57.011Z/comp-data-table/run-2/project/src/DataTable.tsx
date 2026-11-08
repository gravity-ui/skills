import { useMemo, useState } from "react";
import { Pagination, Table } from "@gravity-ui/uikit";
import { withTableSelection, withTableSorting } from "@gravity-ui/uikit";
import type { TableSortState } from "@gravity-ui/uikit";
import { employees } from "./data";
import type { Employee } from "./data";
import "./DataTable.css";

const SORTED_TABLE = withTableSorting(Table);
const SELECTABLE_TABLE = withTableSelection(SORTED_TABLE);
const PAGE_SIZE_OPTIONS = [10, 20, 40];

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format;

export function DataTable() {
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const sortedEmployees = useMemo(() => {
    const activeSort = sortState[0];
    if (!activeSort) {
      return employees;
    }

    const sorted = [...employees].sort((left, right) => {
      const leftValue = left[activeSort.column as keyof Employee];
      const rightValue = right[activeSort.column as keyof Employee];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return leftValue - rightValue;
      }      return String(leftValue).localeCompare(String(rightValue), "en", { numeric: true });
    });

    return activeSort.order === "desc" ? sorted.reverse() : sorted;
  }, [sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedEmployees.length / pagination.pageSize));
  const currentPage = Math.min(pagination.page, pageCount);
  const pageEmployees = sortedEmployees.slice(
    (currentPage - 1) * pagination.pageSize,
    currentPage * pagination.pageSize,
  );

  const handlePaginationUpdate = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  const handleSortStateChange = (nextSortState: TableSortState) => {
    setSortState(nextSortState);
    handlePaginationUpdate(1, pagination.pageSize);
  };

  return (
    <section className="data-table">
      <header className="data-table__header">
        <div>
          <h1 className="data-table__title">Employees</h1>
          <p className="data-table__subtitle">
            Select rows, sort columns and navigate through {employees.length} records.
          </p>
        </div>
        <span className="data-table__counter">{selectedIds.length} selected</span>
      </header>

      <SELECTABLE_TABLE
        data={pageEmployees}
        columns={[
          {
            id: "name",
            name: "Name",
            primary: true,
            width: 220,
            meta: { sort: (left: Employee, right: Employee) => left.name.localeCompare(right.name) },
          },
          {
            id: "role",
            name: "Role",
            width: 220,
            meta: { sort: (left: Employee, right: Employee) => left.role.localeCompare(right.role) },
          },
          {
            id: "team",
            name: "Team",
            width: 160,
            meta: { sort: (left: Employee, right: Employee) => left.team.localeCompare(right.team) },
          },
          {
            id: "projects",
            name: "Projects",
            align: "right",
            width: 130,
            meta: { sort: (left: Employee, right: Employee) => left.projects - right.projects },
          },
          {
            id: "salary",
            name: "Salary",
            align: "right",
            width: 150,
            template: (employee) => formatCurrency(employee.salary),
            meta: { sort: (left: Employee, right: Employee) => left.salary - right.salary },
          },
          {
            id: "employedAt",
            name: "Employed at",
            width: 160,
            meta: { sort: (left: Employee, right: Employee) => left.employedAt.localeCompare(right.employedAt) },
          },
        ]}
        getRowDescriptor={(employee) =>
          selectedIds.includes(employee.id)
            ? { id: employee.id, classNames: ["data-table__row_selected"], interactive: true }
            : { id: employee.id, interactive: true }
        }
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
      />

      <footer className="data-table__footer">
        <span className="data-table__range">
          {pageEmployees.length > 0
            ? `${(currentPage - 1) * pagination.pageSize + 1}–${(currentPage - 1) * pagination.pageSize + pageEmployees.length} of ${sortedEmployees.length}`
            : "No records"}
        </span>
        <Pagination
          page={currentPage}
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          total={sortedEmployees.length}
          onUpdate={handlePaginationUpdate}
        />
      </footer>
    </section>
  );
}
