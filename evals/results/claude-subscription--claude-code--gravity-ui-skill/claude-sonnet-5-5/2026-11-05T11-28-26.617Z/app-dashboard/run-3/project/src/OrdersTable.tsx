import React from 'react';
import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {
  ColumnDef,
  ExpandedState,
  Row,
  RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {Flex, Label, Switch, Text} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {ORDERS, groupByStatus, isGroup} from './data/orders';
import type {Order, OrderRow, OrderStatus} from './data/orders';

const STATUS_META: Record<OrderStatus, {title: string; theme: LabelProps['theme']}> = {
  new: {title: 'Новый', theme: 'info'},
  processing: {title: 'В обработке', theme: 'warning'},
  shipped: {title: 'Отправлен', theme: 'utility'},
  delivered: {title: 'Доставлен', theme: 'success'},
  cancelled: {title: 'Отменён', theme: 'danger'},
};

const currency = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const dateFormat = new Intl.DateTimeFormat('ru-RU');

// Строки-группы не рендерят ячейки, поэтому в ячейках всегда лежит заказ.
const asOrder = (row: Row<OrderRow>) => row.original as Order;

const columns: ColumnDef<OrderRow>[] = [
  // Колонка выбора всегда первая — запрещаем её перетаскивание.
  Object.assign({}, selectionColumn, {enableColumnReordering: false}) as ColumnDef<OrderRow>,
  {
    id: 'number',
    header: 'Номер',
    size: 120,
    cell: ({row}) => asOrder(row).number,
  },
  {
    id: 'customer',
    header: 'Клиент',
    size: 220,
    cell: ({row}) => asOrder(row).customer,
  },
  {
    id: 'city',
    header: 'Город',
    size: 180,
    cell: ({row}) => asOrder(row).city,
  },
  {
    id: 'status',
    header: 'Статус',
    size: 160,
    cell: ({row}) => {
      const meta = STATUS_META[asOrder(row).status];
      return <Label theme={meta.theme}>{meta.title}</Label>;
    },
  },
  {
    id: 'amount',
    header: 'Сумма',
    size: 140,
    cell: ({row}) => currency.format(asOrder(row).amount),
  },
  {
    id: 'createdAt',
    header: 'Дата',
    size: 130,
    cell: ({row}) => dateFormat.format(new Date(asOrder(row).createdAt)),
  },
];

const getRowId = (item: OrderRow) => item.id;
const getSubRows = (item: OrderRow) => (isGroup(item) ? item.items : undefined);
const getIsGroupHeaderRow = (row: Row<OrderRow>) => isGroup(row.original);
const getGroupTitle = (row: Row<OrderRow>) => {
  const group = row.original;
  return isGroup(group) ? STATUS_META[group.status].title : row.id;
};

export function OrdersTable() {
  const [grouped, setGrouped] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  const data = React.useMemo<OrderRow[]>(() => (grouped ? groupByStatus(ORDERS) : ORDERS), [grouped]);

  const handleRowSelectionChange = useRowSelectionFixedHandler<OrderRow>({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable({
    columns,
    data,
    getRowId,
    getSubRows,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableExpanding: grouped,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    state: {rowSelection, expanded, columnOrder},
  });

  // Выделенными считаем только заказы, без строк-групп.
  const selectedCount = ORDERS.filter((order) => rowSelection[order.id]).length;

  return (
    <Flex direction="column" gap={4} style={{height: '100%', minHeight: 0}}>
      <Flex alignItems="center" gap={4} style={{flexShrink: 0}}>
        <Text variant="header-1" style={{flex: 1, minWidth: 0}}>
          Заказы
        </Text>
        <Text variant="body-2" color="secondary" style={{flexShrink: 0}}>
          {selectedCount > 0 ? `Выбрано: ${selectedCount}` : `Всего: ${ORDERS.length}`}
        </Text>
        <Switch
          checked={grouped}
          onUpdate={setGrouped}
          content="Группировать по статусу"
          style={{flexShrink: 0}}
        />
      </Flex>

      <div style={{flex: 1, minHeight: 0, overflow: 'auto'}}>
        <ColumnReorderingProvider table={table} onReorder={({columnOrder: next}) => setColumnOrder(next)}>
          <Table
            table={table}
            stickyHeader
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            getGroupTitle={getGroupTitle}
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
