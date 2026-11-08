import React, { useState, useCallback, useMemo } from 'react';
import { Checkbox } from '@gravity-ui/uikit';
import ArrowUpArrowDown from '@gravity-ui/icons/ArrowUpArrowDown';

import type { Order, OrderStatus } from './data';
import { statusOrder } from './data';

// ════════════════════════════════════════════════════════════════
// Column config
// ════════════════════════════════════════════════════════════════
interface ColumnMeta {
  id: string;
  name: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

const ALL_COLUMNS: ColumnMeta[] = [
  { id: 'id', name: 'ID', width: '80px' },
  { id: 'customer', name: 'Клиент', width: '180px' },
  { id: 'product', name: 'Товар', width: '220px' },
  { id: 'amount', name: 'Сумма (₽)', width: '120px', align: 'right' },
  { id: 'date', name: 'Дата', width: '110px' },
  { id: 'status', name: 'Статус', width: '140px' },
];

// ════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════
const STATUS_COLORS: Record<OrderStatus, string> = {
  'Новый': 'var(--g-color-base-info-light)',
  'В обработке': 'var(--g-color-base-warning-light)',
  'Отправлен': 'var(--g-color-base-brand)',
  'Доставлен': 'var(--g-color-base-positive-light)',
  'Отменён': 'var(--g-color-base-danger-light)',
};

function formatCell(col: ColumnMeta, item: Order): string {
  if (col.id === 'amount') return item.amount.toLocaleString();
  return String((item as any)[col.id] ?? '');
}

function SvgIcon({
  cmp: Cmp,
  size = 16,
}: {
  cmp: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: number;
}) {
  return <Cmp width={size} height={size} />;
}

// ════════════════════════════════════════════════════════════════
// OrdersTable
// ════════════════════════════════════════════════════════════════
export function OrdersTable({ orders }: { orders: Order[] }) {
  // ── selection ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── column order ──
  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.id),
  );

  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((id) => ALL_COLUMNS.find((c) => c.id === id))
        .filter(Boolean) as ColumnMeta[],
    [columnOrder],
  );

  // ── grouped data ──
  const groups = useMemo(() => {
    return statusOrder
      .map((st) => ({
        status: st,
        items: orders.filter((o) => o.status === st),
      }))
      .filter((g) => g.items.length > 0);
  }, [orders]);

  const allOrderIds = useMemo(() => orders.map((o) => o.id), [orders]);

  const allSelected = allOrderIds.length > 0 && allOrderIds.every((id) => selectedIds.has(id));
  const someSelected = allOrderIds.some((id) => selectedIds.has(id)) && !allSelected;

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (allOrderIds.every((id) => prev.has(id))) {
        return new Set<string>();
      }
      return new Set(allOrderIds);
    });
  }, [allOrderIds]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── column drag & drop ──
  const [dragSrcId, setDragSrcId] = useState<string | null>(null);

  const onDragStart = useCallback((e: React.DragEvent, colId: string) => {
    setDragSrcId(colId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragSrcId(null);
      if (!dragSrcId || dragSrcId === targetId) return;
      setColumnOrder((prev) => {
        const next = [...prev];
        const srcIdx = next.indexOf(dragSrcId);
        const tgtIdx = next.indexOf(targetId);
        next.splice(srcIdx, 1);
        next.splice(tgtIdx, 0, dragSrcId);
        return next;
      });
    },
    [dragSrcId],
  );

  const tableBorder = '1px solid var(--g-color-line-generic)';
  const cellStyle: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: 13,
    borderBottom: tableBorder,
  };

  return (
    <div>
      {/* Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
          fontSize: 12,
          color: 'var(--g-color-text-hint)',
        }}
      >
        <SvgIcon cmp={ArrowUpArrowDown} size={14} />
        Перетащите заголовки колонок, чтобы изменить порядок
      </div>

      {/* Selection summary */}
      {selectedIds.size > 0 && (
        <div
          style={{
            marginBottom: 8,
            fontSize: 13,
            color: 'var(--g-color-text-secondary)',
          }}
        >
          Выбрано строк: <strong>{selectedIds.size}</strong>
        </div>
      )}

      {/* Table */}
      <div
        style={{
          overflowX: 'auto',
          border: tableBorder,
          borderRadius: 8,
          background: 'var(--g-color-base-background)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
          }}
        >
          {/* ── header ── */}
          <thead>
            <tr
              style={{
                background: 'var(--g-color-base-generic)',
              }}
            >
              {/* Select-all checkbox */}
              <th
                style={{
                  ...cellStyle,
                  width: 44,
                  textAlign: 'center',
                }}
              >
                <Checkbox
                  size="m"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </th>
              {/* Draggable column headers */}
              {orderedColumns.map((col) => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, col.id)}
                  onDragEnd={() => setDragSrcId(null)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, col.id)}
                  title="Перетащите, чтобы изменить порядок"
                  style={{
                    ...cellStyle,
                    width: col.width,
                    textAlign: col.align ?? 'left',
                    cursor: 'grab',
                    userSelect: 'none',
                    fontWeight: 600,
                    color: 'var(--g-color-text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.name}
                    <SvgIcon cmp={ArrowUpArrowDown} size={10} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── body with groups ── */}
          <tbody>
            {groups.map((group) => (
              <>
                {/* Group header */}
                <tr key={`group-${group.status}`}>
                  <td
                    colSpan={orderedColumns.length + 1}
                    style={{
                      padding: '8px 16px',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--g-color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'var(--g-color-base-generic)',
                      borderBottom: tableBorder,
                    }}
                  >
                    {group.status} ({group.items.length})
                  </td>
                </tr>
                {/* Data rows */}
                {group.items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => toggleRow(item.id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected
                          ? 'var(--g-color-base-selection)'
                          : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.background =
                            'var(--g-color-base-simple-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.background =
                            'transparent';
                        }
                      }}
                    >
                      <td
                        style={{
                          ...cellStyle,
                          width: 44,
                          textAlign: 'center',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          size="m"
                          checked={isSelected}
                          onChange={() => toggleRow(item.id)}
                        />
                      </td>
                      {orderedColumns.map((col) => (
                        <td
                          key={col.id}
                          style={{
                            ...cellStyle,
                            textAlign: col.align ?? 'left',
                          }}
                        >
                          {col.id === 'status' ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 600,
                                background: STATUS_COLORS[item.status],
                                color: 'var(--g-color-text-primary)',
                              }}
                            >
                              {item.status}
                            </span>
                          ) : (
                            formatCell(col, item)
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {orders.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--g-color-text-hint)',
            }}
          >
            Нет данных
          </div>
        )}
      </div>
    </div>
  );
}
