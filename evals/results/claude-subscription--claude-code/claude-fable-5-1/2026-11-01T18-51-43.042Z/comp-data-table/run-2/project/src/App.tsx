import * as React from 'react';
import { Button, Flex, Label, Text } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { generateEmployees } from './data';
import type { Employee, EmployeeStatus } from './data';

const STATUS_VIEW: Record<EmployeeStatus, { text: string; theme: 'success' | 'warning' | 'danger'; rank: number }> = {
  active: { text: 'Работает', theme: 'success', rank: 0 },
  vacation: { text: 'В отпуске', theme: 'warning', rank: 1 },
  fired: { text: 'Уволен', theme: 'danger', rank: 2 },
};

const currencyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

const COLUMNS: DataTableColumn<Employee>[] = [
  { id: 'name', name: 'Имя', primary: true, meta: { sort: true } },
  {
    id: 'email',
    name: 'Email',
    template: (item) => <Text color="secondary">{item.email}</Text>,
  },
  { id: 'department', name: 'Отдел', meta: { sort: true } },
  { id: 'position', name: 'Должность' },
  {
    id: 'salary',
    name: 'Оклад',
    align: 'end',
    template: (item) => currencyFormat.format(item.salary),
    meta: { sort: true, defaultSortOrder: 'desc' },
  },
  {
    id: 'status',
    name: 'Статус',
    template: (item) => <Label theme={STATUS_VIEW[item.status].theme}>{STATUS_VIEW[item.status].text}</Label>,
    meta: { sort: (a, b) => STATUS_VIEW[a.status].rank - STATUS_VIEW[b.status].rank },
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    template: (item) => dateFormat.format(new Date(item.hiredAt)),
    // ISO-даты корректно сортируются как строки.
    meta: { sort: true, defaultSortOrder: 'desc' },
  },
];

const EMPLOYEES = generateEmployees(57);
const getRowId = (item: Employee) => String(item.id);

export function App() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const allSelected = selectedIds.length === EMPLOYEES.length;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap style={{ marginBottom: 16 }}>
        <Text variant="header-1">Сотрудники</Text>
        <Flex alignItems="center" gap={2} wrap>
          <Text color={selectedIds.length ? 'primary' : 'secondary'}>
            Выбрано: {selectedIds.length} из {EMPLOYEES.length}
          </Text>
          <Button view="outlined" disabled={allSelected} onClick={() => setSelectedIds(EMPLOYEES.map(getRowId))}>
            Выбрать все
          </Button>
          <Button view="flat" disabled={selectedIds.length === 0} onClick={() => setSelectedIds([])}>
            Снять выделение
          </Button>
        </Flex>
      </Flex>

      <Text as="p" color="secondary" style={{ margin: '0 0 12px' }}>
        Клик по заголовку сортирует колонку, Shift + клик добавляет вторичную сортировку.
        Выделение сохраняется при переходе между страницами.
      </Text>

      <DataTable<Employee>
        data={EMPLOYEES}
        columns={COLUMNS}
        getRowId={getRowId}
        defaultSortState={[{ column: 'name', order: 'asc' }]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
}
