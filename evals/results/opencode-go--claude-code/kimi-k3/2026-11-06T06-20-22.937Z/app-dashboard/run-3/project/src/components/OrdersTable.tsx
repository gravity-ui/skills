import {useMemo, useState} from 'react';
import {Button, Checkbox, Icon, Label, Switch, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronRight, Grip} from '@gravity-ui/icons';

import {
  ORDERS,
  STATUS_META,
  STATUS_ORDER,
  formatAmount,
  formatDate,
  type Order,
  type OrderStatus,
} from '../data/orders';

type ColumnId = 'id' | 'customer' | 'email' | 'date' | 'items' | 'amount' | 'status';

interface ColumnDef {
  id: ColumnId;
  title: string;
  align?: 'left' | 'right' | 'center';
  render: (order: Order) => React.ReactNode;
}

const ALL_COLUMNS: ColumnDef[] = [
  {id: 'id', title: 'Заказ', render: (o) => <Text variant="code-1">{o.id}</Text>},
  {id: 'customer', title: 'Клиент', render: (o) => o.customer},
  {
    id: 'email',
    title: 'Email',
    render: (o) => <Text color="secondary">{o.email}</Text>,
  },
  {id: 'date', title: 'Дата', render: (o) => formatDate(o.date)},
  {id: 'items', title: 'Позиции', align: 'right', render: (o) => o.items},
  {id: 'amount', title: 'Сумма', align: 'right', render: (o) => formatAmount(o.amount)},
  {
    id: 'status',
    title: 'Статус',
    render: (o) => (
      <Label theme={STATUS_META[o.status].theme}>{STATUS_META[o.status].label}</Label>
    ),
  },
];

export function OrdersTable() {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(
    ALL_COLUMNS.map((c) => c.id),
  );
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [grouped, setGrouped] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<OrderStatus>>(
    new Set(),
  );
  const [dragColumn, setDragColumn] = useState<ColumnId | null>(null);
  const [dropTarget, setDropTarget] = useState<ColumnId | null>(null);

  const columns = useMemo(
    () =>
      columnOrder
        .map((id) => ALL_COLUMNS.find((c) => c.id === id))
        .filter((c): c is ColumnDef => Boolean(c)),
    [columnOrder],
  );

  // --- selection ---
  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = selected.size === ORDERS.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(ORDERS.map((o) => o.id)));
  };

  // --- column drag & drop ---
  const handleDrop = (targetId: ColumnId) => {
    if (!dragColumn || dragColumn === targetId) return;
    setColumnOrder((prev) => {
      const next = prev.filter((id) => id !== dragColumn);
      next.splice(next.indexOf(targetId), 0, dragColumn);
      return next;
    });
  };

  // --- grouping ---
  const groups = useMemo(() => {
    const byStatus = new Map<OrderStatus, Order[]>();
    for (const status of STATUS_ORDER) byStatus.set(status, []);
    for (const order of ORDERS) byStatus.get(order.status)!.push(order);
    return STATUS_ORDER.map((status) => ({
      status,
      orders: byStatus.get(status)!,
      total: byStatus.get(status)!.reduce((sum, o) => sum + o.amount, 0),
    })).filter((g) => g.orders.length > 0);
  }, []);

  const toggleGroup = (status: OrderStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr
        key={order.id}
        className={`orders-table__row${isSelected ? ' orders-table__row_selected' : ''}`}
        onClick={() => toggleRow(order.id)}
      >
        <td
          className="orders-table__cell orders-table__cell_check"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onChange={() => toggleRow(order.id)}
            aria-label={`Выбрать заказ ${order.id}`}
          />
        </td>
        {columns.map((col) => (
          <td
            key={col.id}
            className="orders-table__cell"
            style={{textAlign: col.align ?? 'left'}}
          >
            {col.render(order)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="orders-table">
      <div className="orders-table__toolbar">
        <div className="orders-table__toolbar-info">
          <Text variant="subheader-2">Заказы</Text>
          <Text color="secondary">
            {selected.size > 0
              ? `Выбрано: ${selected.size} из ${ORDERS.length}`
              : `Всего: ${ORDERS.length}`}
          </Text>
        </div>
        <div className="orders-table__toolbar-controls">
          <Switch
            checked={grouped}
            onUpdate={setGrouped}
            content="Группировать по статусу"
          />
          {selected.size > 0 && (
            <Button view="flat" size="m" onClick={() => setSelected(new Set())}>
              Снять выделение
            </Button>
          )}
        </div>
      </div>

      <div className="orders-table__scroll">
        <table className="orders-table__table">
          <thead>
            <tr>
              <th className="orders-table__head-cell orders-table__cell_check">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  aria-label="Выбрать все заказы"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`orders-table__head-cell orders-table__head-cell_draggable${
                    dropTarget === col.id && dragColumn !== col.id
                      ? ' orders-table__head-cell_drop-target'
                      : ''
                  }${dragColumn === col.id ? ' orders-table__head-cell_dragging' : ''}`}
                  style={{textAlign: col.align ?? 'left'}}
                  draggable
                  onDragStart={(e) => {
                    setDragColumn(col.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', col.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDropTarget(col.id);
                  }}
                  onDragLeave={() => setDropTarget((t) => (t === col.id ? null : t))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(col.id);
                    setDragColumn(null);
                    setDropTarget(null);
                  }}
                  onDragEnd={() => {
                    setDragColumn(null);
                    setDropTarget(null);
                  }}
                  title="Перетащите, чтобы изменить порядок колонок"
                >
                  <span className="orders-table__head-content">
                    <Icon data={Grip} size={14} className="orders-table__grip" />
                    {col.title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped
              ? groups.map((group) => {
                  const collapsed = collapsedGroups.has(group.status);
                  const meta = STATUS_META[group.status];
                  return [
                    <tr
                      key={`group-${group.status}`}
                      className="orders-table__group-row"
                      onClick={() => toggleGroup(group.status)}
                    >
                      <td colSpan={columns.length + 1} className="orders-table__group-cell">
                        <Icon
                          data={collapsed ? ChevronRight : ChevronDown}
                          size={16}
                        />
                        <Label theme={meta.theme}>{meta.label}</Label>
                        <Text color="secondary">
                          {group.orders.length} заказ(ов) · {formatAmount(group.total)}
                        </Text>
                      </td>
                    </tr>,
                    ...(collapsed ? [] : group.orders.map(renderRow)),
                  ];
                })
              : ORDERS.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
