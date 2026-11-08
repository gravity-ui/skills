import React, { useMemo, useState, useCallback } from 'react';
import { Table, TableColumnConfig, Label, Icon } from '@gravity-ui/uikit';
import { CaretDown, CaretRight } from '@gravity-ui/icons';
import type { Order } from '../data/orders';
import { statusColors } from '../data/orders';

// All possible columns
const ALL_COLUMNS: TableColumnConfig<Order>[] = [
  {
    id: 'id',
    name: '№ Заказа',
    width: 140,
    template: (item) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.id}</span>
    ),
  },
  {
    id: 'customer',
    name: 'Клиент',
    width: 200,
    template: (item) => item.customer,
  },
  {
    id: 'email',
    name: 'Email',
    width: 220,
    template: (item) => item.email,
  },
  {
    id: 'product',
    name: 'Товар',
    width: 220,
    template: (item) => item.product,
  },
  {
    id: 'amount',
    name: 'Сумма',
    width: 120,
    align: 'right',
    template: (item) =>
      new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(item.amount),
  },
  {
    id: 'date',
    name: 'Дата',
    width: 130,
    template: (item) =>
      new Date(item.date).toLocaleDateString('ru-RU'),
  },
  {
    id: 'status',
    name: 'Статус',
    width: 150,
    template: (item) => (
      <Label
        theme={
          item.status === 'Доставлен'
            ? 'success'
            : item.status === 'Отправлен'
            ? 'info'
            : item.status === 'В обработке'
            ? 'warning'
            : 'danger'
        }
        size="s"
      >
        {item.status}
      </Label>
    ),
  },
];

const STATUS_ORDER: Order['status'][] = [
  'В обработке',
  'Отправлен',
  'Доставлен',
  'Отменён',
];

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  // Column order state (draggable)
  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.id),
  );

  // Selected rows
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Grouped by status option
  const [groupByStatus, setGroupByStatus] = useState(true);

  // Drag state
  const [dragSrc, setDragSrc] = useState<string | null>(null);

  // Current columns in order
  const columns = useMemo(() => {
    const map = new Map(ALL_COLUMNS.map((c) => [c.id, c]));
    return columnOrder.map((id) => map.get(id)!).filter(Boolean);
  }, [columnOrder]);

  // Build table data: either grouped or flat
  const tableData = useMemo(() => {
    if (!groupByStatus) return orders;

    const result: (Order | { __group: string })[] = [];
    for (const status of STATUS_ORDER) {
      const groupOrders = orders.filter((o) => o.status === status);
      if (groupOrders.length === 0) continue;
      result.push({ __group: status } as any);
      if (!collapsedGroups.has(status)) {
        result.push(...groupOrders);
      }
    }
    return result;
  }, [orders, groupByStatus, collapsedGroups]);

  // Toggle group collapse
  const toggleGroup = useCallback((status: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  // Toggle row selection
  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select all visible
  const selectAll = useCallback(() => {
    const visible = tableData.filter(
      (r) => !('__group' in r),
    ) as Order[];
    setSelectedIds(new Set(visible.map((r) => r.id)));
  }, [tableData]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Column drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, colId: string) => {
      setDragSrc(colId);
      e.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!dragSrc || dragSrc === targetId) {
        setDragSrc(null);
        return;
      }
      setColumnOrder((prev) => {
        const next = [...prev];
        const srcIdx = next.indexOf(dragSrc);
        const tgtIdx = next.indexOf(targetId);
        if (srcIdx === -1 || tgtIdx === -1) return prev;
        next.splice(srcIdx, 1);
        next.splice(tgtIdx, 0, dragSrc);
        return next;
      });
      setDragSrc(null);
    },
    [dragSrc],
  );

  const handleDragEnd = useCallback(() => {
    setDragSrc(null);
  }, []);

  // Group header renderer
  const renderGroupRow = (status: string) => {
    const color = statusColors[status as Order['status']] || '#999';
    const collapsed = collapsedGroups.has(status);
    const count = orders.filter((o) => o.status === status).length;

    return (
      <tr key={`group-${status}`} style={{ cursor: 'pointer' }}>
        <td
          colSpan={columns.length}
          onClick={() => toggleGroup(status)}
          style={{
            background: 'var(--g-color-base-generic)',
            borderBottom: '2px solid var(--g-color-line-generic)',
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon data={collapsed ? CaretRight : CaretDown} size={14} />
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }}
            />
            <span>{status}</span>
            <span
              style={{
                fontWeight: 400,
                color: 'var(--g-color-text-secondary)',
                fontSize: 13,
              }}
            >
              ({count})
            </span>
          </span>
        </td>
      </tr>
    );
  };

  // Custom table rendering
  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 14,
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={groupByStatus}
              onChange={(e) => setGroupByStatus(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Группировать по статусу
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              color: 'var(--g-color-text-secondary)',
            }}
          >
            {selectedIds.size > 0
              ? `Выбрано: ${selectedIds.size}`
              : 'Нет выбранных строк'}
          </span>
          <button
            onClick={selectAll}
            style={{
              background: 'var(--g-color-base-generic)',
              border: '1px solid var(--g-color-line-generic)',
              borderRadius: 6,
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Выбрать все
          </button>
          <button
            onClick={clearSelection}
            style={{
              background: 'var(--g-color-base-generic)',
              border: '1px solid var(--g-color-line-generic)',
              borderRadius: 6,
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: 44,
                  padding: '10px 8px',
                  borderBottom: '2px solid var(--g-color-line-generic)',
                  textAlign: 'left',
                  background: 'var(--g-color-base-background)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size > 0 &&
                    selectedIds.size ===
                      tableData.filter((r) => !('__group' in r)).length
                  }
                  onChange={(e) =>
                    e.target.checked ? selectAll() : clearSelection()
                  }
                  style={{ cursor: 'pointer' }}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '2px solid var(--g-color-line-generic)',
                    textAlign: col.align === 'right' ? 'right' : 'left',
                    whiteSpace: 'nowrap',
                    cursor: 'grab',
                    background: 'var(--g-color-base-background)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    opacity: dragSrc === col.id ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                    userSelect: 'none',
                  }}
                >
                  {(typeof col.name === "function" ? col.name() : col.name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => {
              // Group header row
              if ('__group' in row) {
                return renderGroupRow(row.__group);
              }

              const order = row as Order;
              const isSelected = selectedIds.has(order.id);

              return (
                <tr
                  key={order.id}
                  onClick={() => toggleRow(order.id)}
                  style={{
                    background: isSelected
                      ? 'var(--g-color-base-selection)'
                      : idx % 2 === 0
                      ? 'var(--g-color-base-background)'
                      : 'var(--g-color-base-generic)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        'var(--g-color-base-simple-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        idx % 2 === 0
                          ? 'var(--g-color-base-background)'
                          : 'var(--g-color-base-generic)';
                  }}
                >
                  <td
                    style={{
                      padding: '10px 8px',
                      borderBottom: '1px solid var(--g-color-line-generic)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(order.id)}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columns.map((col) => {
                    const content = col.template
                      ? typeof col.template === 'function'
                        ? col.template(order, idx)
                        : null
                      : (order as any)[col.id];
                    return (
                      <td
                        key={col.id}
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--g-color-line-generic)',
                          textAlign:
                            col.align === 'right' ? 'right' : 'left',
                        }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {tableData.filter((r) => !('__group' in r)).length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    color: 'var(--g-color-text-secondary)',
                  }}
                >
                  Нет данных для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
