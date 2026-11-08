import { ArrowDownToLine, TrashBin } from '@gravity-ui/icons';
import { ActionsPanel, ArrowToggle, Button, Icon, Label, Switch, Table, Text, withTableSelection } from '@gravity-ui/uikit';
import type { ActionsPanelProps, TableColumnConfig } from '@gravity-ui/uikit';
import * as React from 'react';

import { ColumnDndContext, ColumnHeader, type ColumnDndApi } from './columnDnd';
import { COLUMN_DEFS, DEFAULT_COLUMN_ORDER, type ColumnId } from './columns';
import { generateOrders } from './mockOrders';
import { STATUS_META, type Order, type OrderStatus } from './types';
import {
  formatMoney,
  groupOrdersByStatus,
  moveColumn,
  ordersToCsv,
  pluralize,
  shiftColumn,
  type DropSide,
} from './utils';

import './OrdersTable.css';

const SelectableTable = withTableSelection<Order>(Table);

const ORDER_FORMS: [string, string, string] = ['заказ', 'заказа', 'заказов'];
const getRowDescriptor = (order: Order) => ({ id: order.id });

function downloadCsv(orders: Order[]) {
  const blob = new Blob(['﻿' + ordersToCsv(orders)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersTable() {
  const [orders, setOrders] = React.useState<Order[]>(() => generateOrders());
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<OrderStatus>>(() => new Set());

  // ---- column drag & drop -------------------------------------------------
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ id: string; side: DropSide } | null>(null);

  const dndApi = React.useMemo<ColumnDndApi>(
    () => ({
      dragId,
      over,
      startDrag: (id) => setDragId(id),
      endDrag: () => {
        setDragId(null);
        setOver(null);
      },
      shift: (id, direction) =>
        setColumnOrder((current) => shiftColumn(current, id, direction) as ColumnId[]),
    }),
    [dragId, over],
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragId) return;
    const th = (event.target as Element).closest('th');
    const targetId = th?.querySelector<HTMLElement>('[data-column-id]')?.dataset.columnId;
    if (!th || !targetId) {
      setOver(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = th.getBoundingClientRect();
    const side: DropSide = event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
    // Don't show an indicator for drops that would not change anything.
    if (moveColumn(columnOrder, dragId, targetId, side) === columnOrder) {
      setOver(null);
      return;
    }
    setOver((prev) => (prev && prev.id === targetId && prev.side === side ? prev : { id: targetId, side }));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (dragId && over) {
      setColumnOrder((current) => moveColumn(current, dragId, over.id, over.side) as ColumnId[]);
    }
    setDragId(null);
    setOver(null);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOver(null);
    }
  };

  const columns = React.useMemo<TableColumnConfig<Order>[]>(
    () =>
      columnOrder.map((id) => {
        const def = COLUMN_DEFS[id];
        const align = def.config.align === 'end' || def.config.align === 'right' ? 'end' : 'start';
        return {
          ...def.config,
          id,
          meta: { ...def.config.meta, displayName: def.title },
          name: () => <ColumnHeader id={id} title={def.title} align={align} />,
        };
      }),
    [columnOrder],
  );

  const isDefaultOrder = columnOrder.every((id, index) => id === DEFAULT_COLUMN_ORDER[index]);

  // ---- selection ------------------------------------------------------------
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const toggleRow = React.useCallback((order: Order) => {
    setSelectedIds((current) =>
      current.includes(order.id) ? current.filter((id) => id !== order.id) : [...current, order.id],
    );
  }, []);
  const clearSelection = () => setSelectedIds([]);

  const selectedOrders = React.useMemo(
    () => orders.filter((order) => selectedSet.has(order.id)),
    [orders, selectedSet],
  );

  const deleteSelected = () => {
    setOrders((current) => current.filter((order) => !selectedSet.has(order.id)));
    setSelectedIds([]);
  };

  const panelActions: ActionsPanelProps['actions'] = [
    {
      id: 'export',
      button: {
        props: {
          view: 'flat-contrast',
          children: [<Icon key="icon" data={ArrowDownToLine} size={16} />, 'Экспорт CSV'],
          onClick: () => downloadCsv(selectedOrders),
        },
      },
      dropdown: { item: { text: 'Экспорт CSV', action: () => downloadCsv(selectedOrders) } },
    },
    {
      id: 'delete',
      button: {
        props: {
          view: 'flat-contrast',
          children: [<Icon key="icon" data={TrashBin} size={16} />, 'Удалить'],
          onClick: deleteSelected,
        },
      },
      dropdown: { item: { text: 'Удалить', theme: 'danger', action: deleteSelected } },
    },
  ];

  // ---- grouping -------------------------------------------------------------
  const groups = React.useMemo(() => groupOrdersByStatus(orders), [orders]);
  const allCollapsed = groups.length > 0 && groups.every((group) => collapsedGroups.has(group.status));

  const toggleGroup = (status: OrderStatus) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };
  const toggleAllGroups = () => {
    setCollapsedGroups(allCollapsed ? new Set() : new Set(groups.map((group) => group.status)));
  };

  const renderTable = (data: Order[], ariaLabel: string) => (
    <SelectableTable
      data={data}
      columns={columns}
      width="max"
      getRowDescriptor={getRowDescriptor}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      onRowClick={toggleRow}
      emptyMessage="Нет заказов"
      aria-label={ariaLabel}
      className="orders-table__table"
    />
  );

  return (
    <ColumnDndContext.Provider value={dndApi}>
      <section className="orders-table" aria-labelledby="orders-title">
        <header className="orders-table__toolbar">
          <div className="orders-table__heading">
            <Text as="h1" variant="header-2" id="orders-title" className="orders-table__title">
              Заказы
            </Text>
            <Text color="secondary">
              {orders.length} {pluralize(orders.length, ORDER_FORMS)}
            </Text>
          </div>
          <div className="orders-table__controls">
            <Switch size="m" checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
            {grouped && groups.length > 0 && (
              <Button view="flat" size="m" onClick={toggleAllGroups}>
                {allCollapsed ? 'Развернуть все' : 'Свернуть все'}
              </Button>
            )}
            <Button view="flat" size="m" disabled={isDefaultOrder} onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}>
              Сбросить порядок колонок
            </Button>
          </div>
        </header>
        <Text color="hint" className="orders-table__hint">
          Перетащите заголовок колонки, чтобы изменить порядок. Клик по строке выделяет её, Shift + чекбокс выделяет
          диапазон.
        </Text>

        <div
          className={`orders-table__body${dragId ? ' orders-table__body_dragging' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          {grouped ? (
            groups.length === 0 ? (
              renderTable([], 'Заказы')
            ) : (
              groups.map((group) => {
                const meta = STATUS_META[group.status];
                const collapsed = collapsedGroups.has(group.status);
                const selectedInGroup = group.orders.filter((order) => selectedSet.has(order.id)).length;
                const panelId = `orders-group-${group.status}`;
                return (
                  <section key={group.status} className="orders-group" aria-label={`Статус: ${meta.title}`}>
                    <button
                      type="button"
                      className="orders-group__header"
                      aria-expanded={!collapsed}
                      aria-controls={panelId}
                      onClick={() => toggleGroup(group.status)}
                    >
                      <ArrowToggle direction={collapsed ? 'right' : 'bottom'} size={16} />
                      <Label theme={meta.theme} size="m">
                        {meta.title}
                      </Label>
                      <Text variant="body-1" className="orders-group__count">
                        {group.orders.length} {pluralize(group.orders.length, ORDER_FORMS)}
                      </Text>
                      <Text color="secondary" className="orders-group__total">
                        {formatMoney(group.total)}
                      </Text>
                      {selectedInGroup > 0 && (
                        <Text color="info" className="orders-group__selected">
                          выбрано: {selectedInGroup}
                        </Text>
                      )}
                    </button>
                    <div id={panelId} hidden={collapsed}>
                      {!collapsed && renderTable(group.orders, `Заказы со статусом «${meta.title}»`)}
                    </div>
                  </section>
                );
              })
            )
          ) : (
            renderTable(orders, 'Заказы')
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="orders-table__actions">
            <ActionsPanel
              actions={panelActions}
              onClose={clearSelection}
              renderNote={() => `Выбрано: ${selectedIds.length} ${pluralize(selectedIds.length, ORDER_FORMS)}`}
            />
          </div>
        )}
      </section>
    </ColumnDndContext.Provider>
  );
}
