import React from 'react';

import {
  Flex,
  Label,
  Lang,
  Pagination,
  Table,
  Text,
  configure,
  sp,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';

import {STATUS_META, people} from './data';
import type {Person} from './data';

configure({lang: Lang.Ru});

const columns: TableColumnConfig<Person>[] = [
  {
    id: 'name',
    name: 'Имя',
    meta: {sort: (a: Person, b: Person) => a.name.localeCompare(b.name, 'ru')},
  },
  {
    id: 'role',
    name: 'Должность',
    meta: {sort: (a: Person, b: Person) => a.role.localeCompare(b.role, 'ru')},
  },
  {
    id: 'city',
    name: 'Город',
    meta: {sort: (a: Person, b: Person) => a.city.localeCompare(b.city, 'ru')},
  },
  {
    id: 'age',
    name: 'Возраст',
    align: 'end',
    meta: {sort: (a: Person, b: Person) => a.age - b.age},
  },
  {
    id: 'salary',
    name: 'Зарплата, ₽',
    align: 'end',
    template: (item: Person) => item.salary.toLocaleString('ru-RU'),
    meta: {sort: (a: Person, b: Person) => a.salary - b.salary},
  },
  {
    id: 'status',
    name: 'Статус',
    template: (item: Person) => {
      const {title, theme} = STATUS_META[item.status];
      return <Label theme={theme}>{title}</Label>;
    },
  },
];

// Sorting is controlled: the HOC renders the sort indicators, while the data
// itself is sorted here over the WHOLE dataset, before the page is sliced —
// otherwise ordering would apply only within the current page.
function sortPeople(data: Person[], sortState: TableSortState): Person[] {
  if (sortState.length === 0) {
    return data;
  }
  return data.slice().sort((itemA, itemB) => {
    for (const {column, order} of sortState) {
      const compare = columns.find((c) => c.id === column)?.meta?.sort;
      if (typeof compare !== 'function') {
        continue;
      }
      const result = compare(itemA, itemB);
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

const DataTable = withTableSelection(withTableSorting<Person>(Table));

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function App() {
  const [sortState, setSortState] = React.useState<TableSortState>([
    {column: 'name', order: 'asc'},
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);

  const sortedData = React.useMemo(() => sortPeople(people, sortState), [sortState]);
  const pageData = React.useMemo(
    () => sortedData.slice((page - 1) * pageSize, page * pageSize),
    [sortedData, page, pageSize],
  );

  const handleSortStateChange = (nextSortState: TableSortState) => {
    setSortState(nextSortState);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPageSize === pageSize ? nextPage : 1);
    setPageSize(nextPageSize);
  };

  return (
    <div className={sp({p: 5})} style={{maxWidth: 960, margin: '0 auto'}}>
      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={1}>
          <Text variant="header-1">Сотрудники</Text>
          <Text variant="body-2" color="secondary">
            Выбрано строк: {selectedIds.length} из {people.length}
          </Text>
        </Flex>

        <DataTable
          data={pageData}
          columns={columns}
          width="max"
          emptyMessage="Нет данных"
          sortState={sortState}
          onSortStateChange={handleSortStateChange}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isRowSelectionDisabled={(item) => item.status === 'fired'}
          getRowDescriptor={(item) => ({id: item.id})}
        />

        <Flex justifyContent="flex-end">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={people.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onUpdate={handlePaginationUpdate}
            showInput
          />
        </Flex>
      </Flex>
    </div>
  );
}
