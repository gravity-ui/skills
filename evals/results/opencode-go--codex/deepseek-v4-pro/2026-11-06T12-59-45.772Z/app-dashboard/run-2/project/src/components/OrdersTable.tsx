import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Table, Label, Checkbox, Button, Icon } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';
import BarsAscendingAlignLeftIcon from '@gravity-ui/icons/BarsAscendingAlignLeft';
import { ORDERS, STATUS_THEME, type Order } from '../data';

type ColumnId = 'id' | 'customer' | 'email' | 'amount' | 'date' | 'status' | 'items';

const DEFAULT_COLUMNS: ColumnId[] = ['id', 'customer', 'email', 'amount', 'date', 'status', 'items'];

export function OrdersTable({ groupByStatus }: { groupByStatus: boolean }) {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(DEFAULT_COLUMNS);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [grouping, setGrouping] = useState(groupByStatus);
  const dragColumnRef = useRef<ColumnId | null>(null);

  const allIds = useMemo(() => new Set(ORDERS.map((o) => o.id)), []);
  const allSelected = selectedIds.size > 0 && selectedIds.size === ORDERS.length;

  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }, [allSelected, allIds]);

  const toggleRow = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ---- drag-and-drop column reordering ---- */
  const handleDragStart = useCallback((colId: ColumnId) => {
    dragColumnRef.current = colId;
  }, []);

  const handleDrop = useCallback((targetId: ColumnId) => {
    const from = dragColumnRef.current;
    dragColumnRef.current = null;
    if (!from || from === targetId) return;
    setColumnOrder((prev) => {
      const arr = [...prev];
      const fromIdx = arr.indexOf(from);
      const toIdx = arr.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, from);
      return arr;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragColumnRef.current = null;
  }, []);

  /* ---- Column definitions ---- */
  const makeHeader = useCallback(
    (colId: ColumnId, label: string) => () =>
      (
        <span
          draggable
          onDragStart={() => handleDragStart(colId)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(colId)}
          onDragEnd={handleDragEnd}
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          {label}
        </span>
      ),
    [handleDragStart, handleDrop, handleDragEnd],
  );

  const COLUMN_DEFS: Record<ColumnId, TableColumnConfig<Order>> = useMemo(
    () => ({
      id: {
        id: 'id',
        name: makeHeader('id', '№'),
        template: (item) => item.id,
        width: 80,
      },
      customer: {
        id: 'customer',
        name: makeHeader('customer', 'Клиент'),
        template: (item) => item.customer,
      },
      email: {
        id: 'email',
        name: makeHeader('email', 'Email'),
        template: (item) => item.email,
      },
      amount: {
        id: 'amount',
        name: makeHeader('amount', 'Сумма'),
        template: (item) => `${item.amount.toLocaleString('ru-RU')} ₽`,
        align: 'right',
        width: 120,
      },
      date: {
        id: 'date',
        name: makeHeader('date', 'Дата'),
        template: (item) => item.date,
        width: 120,
      },
      status: {
        id: 'status',
        name: makeHeader('status', 'Статус'),
        template: (item) => (
          <Label theme={STATUS_THEME[item.status] as any} size="s">
            {item.status}
          </Label>
        ),
        width: 140,
      },
      items: {
        id: 'items',
        name: makeHeader('items', 'Товаров'),
        template: (item) => item.items,
        align: 'center',
        width: 100,
      },
    }),
    [makeHeader],
  );

  const columns = useMemo(
    () => columnOrder.map((id) => COLUMN_DEFS[id]),
    [columnOrder, COLUMN_DEFS],
  );

  /* ---- Selection column (sticky left) ---- */
  const selectColumn: TableColumnConfig<Order> = useMemo(
    () => ({
      id: '__select__',
      name: () => (
        <Checkbox
          size="m"
          checked={allSelected}
          indeterminate={selectedIds.size > 0 && !allSelected}
          onUpdate={toggleAll}
        />
      ),
      template: (item) => (
        <Checkbox
          size="m"
          checked={selectedIds.has(item.id)}
          onUpdate={() => toggleRow(item.id)}
        />
      ),
      width: 48,
      sticky: 'left',
    }),
    [allSelected, selectedIds, toggleAll, toggleRow],
  );

  const allColumns = useMemo(
    () => [selectColumn, ...columns],
    [selectColumn, columns],
  );

  /* ---- Grouping ---- */
  const groupedData = useMemo(() => {
    if (!grouping) return ORDERS;
    return ORDERS.slice().sort((a, b) => {
      const statusOrder = ['Новый', 'В обработке', 'Отправлен', 'Доставлен', 'Отменён'];
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
  }, [grouping]);

  const getRowDescriptor = useCallback(
    (item: Order) => ({
      id: String(item.id),
      classNames: selectedIds.has(item.id) ? ['orders-table-row-selected'] : [],
      interactive: true,
    }),
    [selectedIds],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Заказы</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <span style={{ fontSize: 13, color: 'var(--g-color-text-secondary)' }}>
              Выбрано: {selectedIds.size}
            </span>
          )}
          <Button
            view={grouping ? 'action' : 'normal'}
            size="m"
            onClick={() => setGrouping(!grouping)}
          >
            <Icon data={BarsAscendingAlignLeftIcon} size={16} />
            {` Группировать`}
          </Button>
        </div>
      </div>

      {/* Table wrapper */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {grouping ? (
          ['Новый', 'В обработке', 'Отправлен', 'Доставлен', 'Отменён'].map((statusKey) => {
            const groupOrders = groupedData.filter((o) => o.status === statusKey);
            if (groupOrders.length === 0) return null;
            return (
              <div key={statusKey} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    padding: '8px 16px',
                    background: 'var(--g-color-base-generic)',
                    borderRadius: 'var(--g-border-radius-m) var(--g-border-radius-m) 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  <Label theme={STATUS_THEME[statusKey as Order['status']] as any} size="s">
                    {statusKey}
                  </Label>
                  <span style={{ color: 'var(--g-color-text-secondary)', fontSize: 12 }}>
                    {groupOrders.length}{' '}
                    {groupOrders.length === 1
                      ? 'заказ'
                      : groupOrders.length < 5
                        ? 'заказа'
                        : 'заказов'}
                  </span>
                </div>
                <Table
                  data={groupOrders}
                  columns={allColumns}
                  verticalAlign="middle"
                  edgePadding
                  getRowDescriptor={getRowDescriptor}
                  onRowClick={(item) => toggleRow(item.id)}
                />
              </div>
            );
          })
        ) : (
          <Table
            data={ORDERS}
            columns={allColumns}
            verticalAlign="middle"
            edgePadding
            getRowDescriptor={getRowDescriptor}
            onRowClick={(item) => toggleRow(item.id)}
          />
        )}
      </div>
    </div>
  );
}
