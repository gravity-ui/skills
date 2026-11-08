import React from 'react';
import {
  ColumnReorderingProvider,
  RangedSelectionCheckbox,
  Table,
  useTable,
} from '@gravity-ui/table';
import type { BaseTableProps, ColumnDef } from '@gravity-ui/table';
import type { ExpandedState, GroupingState, Row, RowSelectionState } from '@gravity-ui/table/tanstack';
import { ChevronDown } from '@gravity-ui/icons';
import { Button, Checkbox, Flex, Icon, Label, Switch, Text } from '@gravity-ui/uikit';

import { ORDERS, STATUS_META, STATUS_ORDER, formatDate, formatMoney } from './data';
import type { Order, OrderStatus } from './data';

import './OrdersTable.css';

const SELECTION_COLUMN_ID = '_select';

/** Stops row-click selection from firing when the user interacts with a control inside a row. */
const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

const preventShiftTextSelection = (event: React.MouseEvent) => {
  if (event.shiftKey) event.preventDefault();
};

const columns: ColumnDef<Order>[] = [
  {
    id: SELECTION_COLUMN_ID,
    size: 40,
    minSize: 40,
    // Selection column always stays first.
    enableColumnReordering: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Выбрать все заказы"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onUpdate={(checked) => table.toggleAllRowsSelected(checked)}
      />
    ),
    cell: (cellContext) => (
      <span onClick={stopPropagation}>
        <RangedSelectionCheckbox
          aria-label={`Выбрать заказ №${cellContext.row.original.id}`}
          checked={cellContext.row.getIsSelected()}
          disabled={!cellContext.row.getCanSelect()}
          cellContext={cellContext}
        />
      </span>
    ),
  },
  {
    accessorKey: 'id',
    header: '№ заказа',
    size: 110,
    cell: ({ getValue }) => <Text variant="code-1">#{getValue<string>()}</Text>,
  },
  {
    accessorKey: 'customer',
    header: 'Клиент',
    size: 240,
    cell: ({ row }) => (
      <Flex direction="column">
        <Text ellipsis>{row.original.customer}</Text>
        <Text color="secondary" variant="caption-2" ellipsis>
          {row.original.email}
        </Text>
      </Flex>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    size: 160,
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    size: 140,
    cell: ({ getValue }) => {
      const meta = STATUS_META[getValue<OrderStatus>()];
      return <Label theme={meta.theme}>{meta.title}</Label>;
    },
  },
  {
    accessorKey: 'items',
    header: 'Товаров',
    size: 100,
  },
  {
    accessorKey: 'total',
    header: 'Сумма',
    size: 130,
    cell: ({ getValue }) => <span className="orders-table__number">{formatMoney(getValue<number>())}</span>,
  },
  {
    accessorKey: 'payment',
    header: 'Оплата',
    size: 160,
  },
  {
    accessorKey: 'city',
    header: 'Город',
    size: 170,
  },
];

const DEFAULT_COLUMN_ORDER = columns.map((column) =>
  'accessorKey' in column ? String(column.accessorKey) : column.id!,
);

const statusRank = (status: OrderStatus) => STATUS_ORDER.indexOf(status);

/** Grouped row model keeps groups in first-occurrence order, so pre-sort by status lifecycle. */
const ORDERS_BY_STATUS = [...ORDERS].sort((a, b) => statusRank(a.status) - statusRank(b.status));

const sumTotal = (rows: Row<Order>[]) => rows.reduce((sum, row) => sum + row.original.total, 0);

export function OrdersTable() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>(DEFAULT_COLUMN_ORDER);
  const [isGrouped, setIsGrouped] = React.useState(true);
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const lastClickedRowId = React.useRef<string | null>(null);

  const grouping = React.useMemo<GroupingState>(() => (isGrouped ? ['status'] : []), [isGrouped]);

  const table = useTable<Order>({
    columns,
    data: isGrouped ? ORDERS_BY_STATUS : ORDERS,
    getRowId: (order) => order.id,

    enableRowSelection: (row) => !row.getIsGrouped(),
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,

    enableGrouping: true,
    // Keep the user's column order instead of moving the grouped column to the front.
    groupedColumnMode: false,
    enableExpanding: true,
    onExpandedChange: setExpanded,
    // Otherwise TanStack collapses every group whenever the grouped model is recomputed.
    autoResetExpanded: false,

    onColumnOrderChange: setColumnOrder,

    state: { rowSelection, columnOrder, grouping, expanded },
  });

  const selectedRows = table.getSelectedRowModel().flatRows.filter((row) => !row.getIsGrouped());
  const groupRows = isGrouped ? table.getGroupedRowModel().rows : [];
  const allGroupsExpanded = groupRows.every((row) => row.getIsExpanded());

  const setLeafRowsSelected = React.useCallback((rows: Row<Order>[], selected: boolean) => {
    setRowSelection((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        if (selected) next[row.id] = true;
        else delete next[row.id];
      }
      return next;
    });
  }, []);

  /** Click toggles a row, Shift+click selects the range from the previously clicked row. */
  const handleRowClick = React.useCallback<NonNullable<BaseTableProps<Order>['onRowClick']>>(
    (row, event) => {
      if (row.getIsGrouped()) {
        row.toggleExpanded();
        return;
      }

      const anchorId = lastClickedRowId.current;
      lastClickedRowId.current = row.id;

      if (event.shiftKey && anchorId && anchorId !== row.id) {
        const visibleLeafRows = table.getRowModel().rows.filter((r) => !r.getIsGrouped());
        const from = visibleLeafRows.findIndex((r) => r.id === anchorId);
        const to = visibleLeafRows.findIndex((r) => r.id === row.id);
        if (from !== -1 && to !== -1) {
          const range = visibleLeafRows.slice(Math.min(from, to), Math.max(from, to) + 1);
          setLeafRowsSelected(range, !row.getIsSelected());
          return;
        }
      }

      row.toggleSelected();
    },
    [table, setLeafRowsSelected],
  );

  const renderGroupHeaderRowContent = React.useCallback<
    NonNullable<BaseTableProps<Order>['renderGroupHeaderRowContent']>
  >(({ row, Cell, cellClassName }) => {
    const status = row.groupingValue as OrderStatus;
    const meta = STATUS_META[status];
    const leafRows = row.getLeafRows();
    const selectedCount = leafRows.filter((r) => r.getIsSelected()).length;
    const isExpanded = row.getIsExpanded();

    return (
      <Cell className={cellClassName} colSpan={row.getVisibleCells().length}>
        <Flex alignItems="center" gap={3} className="orders-table__group-header">
          <span onClick={stopPropagation}>
            <Checkbox
              aria-label={`Выбрать все заказы со статусом «${meta.title}»`}
              checked={selectedCount > 0 && selectedCount === leafRows.length}
              indeterminate={selectedCount > 0 && selectedCount < leafRows.length}
              onUpdate={(checked) => setLeafRowsSelected(leafRows, checked)}
            />
          </span>
          <button
            type="button"
            className="orders-table__group-toggle"
            aria-expanded={isExpanded}
            onClick={(event) => {
              event.stopPropagation();
              row.toggleExpanded();
            }}
          >
            <Icon
              data={ChevronDown}
              size={16}
              className={`orders-table__chevron${isExpanded ? '' : ' orders-table__chevron_collapsed'}`}
            />
            <Label theme={meta.theme} size="s">
              {meta.title}
            </Label>
            <Text color="secondary">
              {leafRows.length} · {formatMoney(sumTotal(leafRows))}
            </Text>
          </button>
          {selectedCount > 0 && <Text color="info">выбрано {selectedCount}</Text>}
        </Flex>
      </Cell>
    );
  }, [setLeafRowsSelected]);

  const isDefaultOrder = columnOrder.join() === DEFAULT_COLUMN_ORDER.join();

  return (
    <Flex direction="column" gap={3} className="orders-table">
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Flex alignItems="center" gap={4}>
          <Switch checked={isGrouped} onUpdate={setIsGrouped} content="Группировать по статусу" />
          {isGrouped && (
            <Button view="flat-secondary" size="s" onClick={() => table.toggleAllRowsExpanded(!allGroupsExpanded)}>
              {allGroupsExpanded ? 'Свернуть все группы' : 'Развернуть все группы'}
            </Button>
          )}
        </Flex>
        <Flex alignItems="center" gap={3}>
          <Text color="secondary" variant="caption-2">
            Перетащите заголовок колонки, чтобы поменять порядок
          </Text>
          <Button
            view="outlined"
            size="s"
            disabled={isDefaultOrder}
            onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}
          >
            Сбросить порядок колонок
          </Button>
        </Flex>
      </Flex>

      <div className="orders-table__selection-bar" data-visible={selectedRows.length > 0 || undefined}>
        {selectedRows.length > 0 ? (
          <>
            <Text variant="subheader-1">
              Выбрано заказов: {selectedRows.length}
            </Text>
            <Text color="secondary">на сумму {formatMoney(sumTotal(selectedRows))}</Text>
            <Button view="flat" size="s" onClick={() => setRowSelection({})}>
              Снять выделение
            </Button>
          </>
        ) : (
          <Text color="secondary">
            Всего заказов: {ORDERS.length}. Кликните по строке, чтобы выделить её; Shift+клик — диапазон.
          </Text>
        )}
      </div>

      <div className="orders-table__scroll">
        <ColumnReorderingProvider
          table={table}
          dragOverlayRowCount={10}
          onReorder={({ columnOrder }) => setColumnOrder(columnOrder)}
        >
          <Table
            table={table}
            size="m"
            stickyHeader
            onRowClick={handleRowClick}
            // Shift+mousedown would otherwise extend the text selection, and the table ignores
            // clicks while text is selected — so Shift+click range selection wouldn't fire.
            rowAttributes={{ onMouseDown: preventShiftTextSelection }}
            rowClassName={(row) =>
              [
                row?.getIsGrouped() ? 'orders-table__group-row' : '',
                row?.getIsSelected() ? 'orders-table__row_selected' : '',
              ].join(' ')
            }
            getIsGroupHeaderRow={(row) => row.getIsGrouped()}
            renderGroupHeaderRowContent={renderGroupHeaderRowContent}
            emptyContent="Заказов нет"
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
