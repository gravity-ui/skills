import * as React from 'react';
import { ActionsPanel, Button, Icon, Label, Switch, Text, TextInput } from '@gravity-ui/uikit';
import type { ActionsPanelProps } from '@gravity-ui/uikit';

type ActionsPanelItem = ActionsPanelProps['actions'][number];
import { ArrowsRotateLeft, ChevronDown, ChevronRight, FileArrowDown, Magnifier, TrashBin, Xmark } from '@gravity-ui/icons';

import type { Order, OrderStatus } from '../data/orders';
import { STATUS_META } from '../data/orders';
import { OrdersTable, useColumnOrder } from './OrdersTable';
import { filterOrders, formatMoney, groupByStatus } from './tableUtils';

interface OrdersPageProps {
  orders: Order[];
  title: string;
  description?: string;
}

export function OrdersPage({ orders, title, description }: OrdersPageProps) {
  const [query, setQuery] = React.useState('');
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<OrderStatus>>(() => new Set());
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const { columns, dragState, reset: resetColumns, isDefault: columnsDefault } = useColumnOrder();

  const visible = React.useMemo(() => filterOrders(orders, query), [orders, query]);
  const groups = React.useMemo(() => (grouped ? groupByStatus(visible) : null), [grouped, visible]);

  // Drop selection of rows that are no longer displayed (e.g. after a search).
  React.useEffect(() => {
    const visibleIds = new Set(visible.map((o) => o.id));
    setSelectedIds((prev) => (prev.every((id) => visibleIds.has(id)) ? prev : prev.filter((id) => visibleIds.has(id))));
  }, [visible]);

  const toggleGroup = (status: OrderStatus) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const clearSelection = () => setSelectedIds([]);

  const selectedTotal = React.useMemo(
    () => orders.filter((o) => selectedIds.includes(o.id)).reduce((sum, o) => sum + o.amount, 0),
    [orders, selectedIds],
  );

  const actions: ActionsPanelItem[] = [
    {
      id: 'export',
      button: {
        props: { children: [<Icon key="i" data={FileArrowDown} size={16} />, 'Экспорт'], onClick: () => {} },
      },
      dropdown: { item: { action: () => {}, text: 'Экспорт' } },
    },
    {
      id: 'cancel',
      button: {
        props: { children: [<Icon key="i" data={Xmark} size={16} />, 'Отменить заказы'], onClick: () => {} },
      },
      dropdown: { item: { action: () => {}, text: 'Отменить заказы' } },
    },
    {
      id: 'delete',
      collapsed: true,
      button: { props: { children: [<Icon key="i" data={TrashBin} size={16} />, 'Удалить'], onClick: () => {} } },
      dropdown: { item: { action: () => {}, text: 'Удалить', theme: 'danger' } },
    },
  ];

  return (
    <div className="orders">
      <header className="orders__head">
        <div>
          <Text as="h1" variant="header-2" className="orders__title">
            {title}
          </Text>
          {description && (
            <Text as="p" variant="body-1" color="secondary" className="orders__description">
              {description}
            </Text>
          )}
        </div>
        <Text variant="body-1" color="secondary">
          Всего заказов: {orders.length}
        </Text>
      </header>

      <div className="orders__toolbar" role="toolbar" aria-label="Фильтры таблицы">
        <TextInput
          className="orders__search"
          size="l"
          placeholder="Поиск по номеру, клиенту, городу"
          value={query}
          onUpdate={setQuery}
          hasClear
          startContent={<Icon data={Magnifier} size={16} className="orders__search-icon" />}
        />
        <div className="orders__toolbar-right">
          <Switch size="l" checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
          {!columnsDefault && (
            <Button view="outlined" size="l" onClick={resetColumns} title="Вернуть порядок колонок по умолчанию">
              <Icon data={ArrowsRotateLeft} size={16} />
              Сбросить колонки
            </Button>
          )}
        </div>
      </div>

      <Text variant="caption-2" color="hint" className="orders__hint">
        Перетаскивайте заголовки колонок, чтобы менять их порядок. Клик по строке выделяет её; Shift + клик по чекбоксу
        выделяет диапазон.
      </Text>

      {groups ? (
        <div className="orders__groups">
          {groups.length === 0 && (
            <div className="orders__empty">
              <Text color="secondary">Заказы не найдены</Text>
            </div>
          )}
          {groups.map((group) => {
            const meta = STATUS_META[group.status];
            const isCollapsed = collapsedGroups.has(group.status);
            const selectedInGroup = group.orders.filter((o) => selectedIds.includes(o.id)).length;
            const panelId = `orders-group-${group.status}`;
            return (
              <section key={group.status} className="orders__group" aria-labelledby={`${panelId}-title`}>
                <button
                  type="button"
                  className="orders__group-head"
                  onClick={() => toggleGroup(group.status)}
                  aria-expanded={!isCollapsed}
                  aria-controls={panelId}
                >
                  <Icon data={isCollapsed ? ChevronRight : ChevronDown} size={16} />
                  <Label theme={meta.theme} size="m">
                    {meta.title}
                  </Label>
                  <Text id={`${panelId}-title`} variant="subheader-1">
                    {group.orders.length} {pluralOrders(group.orders.length)}
                  </Text>
                  <Text variant="body-1" color="secondary">
                    на сумму {formatMoney(group.total)}
                  </Text>
                  {selectedInGroup > 0 && (
                    <Text variant="body-1" color="brand" className="orders__group-selected">
                      выбрано {selectedInGroup}
                    </Text>
                  )}
                </button>
                {!isCollapsed && (
                  <div id={panelId} className="orders__group-body">
                    <OrdersTable
                      orders={group.orders}
                      columns={columns}
                      dragState={dragState}
                      selectedIds={selectedIds}
                      onSelectionChange={setSelectedIds}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="orders__single">
          <OrdersTable
            orders={visible}
            columns={columns}
            dragState={dragState}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="orders__actions">
          <ActionsPanel
            actions={actions}
            onClose={clearSelection}
            renderNote={() => (
              <span>
                Выбрано {selectedIds.length} {pluralOrders(selectedIds.length)} на {formatMoney(selectedTotal)}
              </span>
            )}
          />
        </div>
      )}
    </div>
  );
}

function pluralOrders(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'заказ';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'заказа';
  return 'заказов';
}
