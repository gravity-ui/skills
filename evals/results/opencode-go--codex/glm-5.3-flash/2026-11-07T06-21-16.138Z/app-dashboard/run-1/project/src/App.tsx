import { useCallback, useMemo, useState } from 'react';

import { ArrowChevronDown, GripHorizontal, Gear, House, Person, ShoppingCart } from '@gravity-ui/icons';
import {
  Button,
  Checkbox,
  Flex,
  Icon,
  Label,
  Select,
  Text,
  Tooltip,
} from '@gravity-ui/uikit';

import { AppIcon } from './AppIcon';
import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';
type OrderStatus = 'new' | 'processing' | 'done' | 'canceled';

interface Order {
  id: string;
  number: string;
  customer: string;
  status: OrderStatus;
  total: number;
  date: string;
}

interface Column {
  id: keyof Order;
  name: string;
  width?: number | string;
}

const navigation: Array<{ id: SectionId; label: string; icon: typeof House }> = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'users', label: 'Пользователи', icon: Person },
  { id: 'orders', label: 'Заказы', icon: ShoppingCart },
  { id: 'settings', label: 'Настройки', icon: Gear },
];

const columns: Column[] = [
  { id: 'number', name: 'Номер', width: 120 },
  { id: 'customer', name: 'Клиент', width: 190 },
  { id: 'status', name: 'Статус', width: 150 },
  { id: 'total', name: 'Сумма', width: 130 },
  { id: 'date', name: 'Дата', width: 120 },
];

const orders: Order[] = [
  { id: '1', number: 'ORD-1024', customer: 'Анна Соколова', status: 'new', total: 18_400, date: '05.11' },
  { id: '2', number: 'ORD-1023', customer: 'Игорь Мороз', status: 'processing', total: 43_250, date: '04.11' },
  { id: '3', number: 'ORD-1022', customer: 'Мария Ким', status: 'done', total: 7_900, date: '03.11' },
  { id: '4', number: 'ORD-1021', customer: 'Дмитрий Волков', status: 'canceled', total: 12_120, date: '02.11' },
  { id: '5', number: 'ORD-1020', customer: 'Елена Романова', status: 'new', total: 30_000, date: '01.11' },
  { id: '6', number: 'ORD-1019', customer: 'Павел Дроздов', status: 'processing', total: 5_670, date: '31.10' },
  { id: '7', number: 'ORD-1018', customer: 'Ольга Никитина', status: 'done', total: 21_700, date: '30.10' },
  { id: '8', number: 'ORD-1017', customer: 'Сергей Богданов', status: 'done', total: 14_440, date: '29.10' },
];

const statusLabels: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  done: 'Выполнен',
  canceled: 'Отменён',
};

const statusThemes: Record<OrderStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  new: 'info',
  processing: 'warning',
  done: 'success',
  canceled: 'danger',
};

const statusOrder: OrderStatus[] = ['new', 'processing', 'done', 'canceled'];

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('orders');
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<Column[]>(columns);
  const [grouping, setGrouping] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<OrderStatus[]>([]);

  const moveColumn = useCallback((from: number, to: number) => {
    setColumnOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const groupHeader = useCallback((status: OrderStatus, count: number) => {
    const collapsed = collapsedGroups.includes(status);
    return (
      <button
        className="dashboard-group-toggle"
        type="button"
        aria-expanded={!collapsed}
        onClick={() =>
          setCollapsedGroups((current) =>
            current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
          )
        }
      >
        <Icon data={ArrowChevronDown} size={14} className={collapsed ? undefined : 'rotated'} />
        <Text variant="subheader-2">{statusLabels[status]}</Text>
        <Label size="xs" theme={statusThemes[status]}>
          {count}
        </Label>
      </button>
    );
  }, [collapsedGroups]);

  const rows = useMemo(() => {
    if (!grouping) {
      return orders;
    }
    return statusOrder.flatMap((status) => {
      const groupItems = orders.filter((order) => order.status === status);
      const isCollapsed = collapsedGroups.includes(status);
      const headerRow = { id: `group-${status}`, status, __groupHeader: true, __count: groupItems.length };
      return isCollapsed ? [headerRow] : [headerRow, ...groupItems];
    });
  }, [collapsedGroups, grouping]);

  return (
    <div className="dashboard">
      <aside className={navigationCollapsed ? 'dashboard-sidebar collapsed' : 'dashboard-sidebar'}>
        <div className="dashboard-sidebar-top">
          <div className="dashboard-logo">A</div>
          {!navigationCollapsed && <Text variant="subheader-3">Админ</Text>}
        </div>
        <nav aria-label="Основная навигация" className="dashboard-nav">
          {navigation.map(({ id, label, icon: SectionIcon }) => (
            <Tooltip
              key={id}
              placement="right"
              disabled={!navigationCollapsed}
              content={label}
            >
              <button
                className={activeSection === id ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
                type="button"
                aria-current={activeSection === id ? 'page' : undefined}
                onClick={() => setActiveSection(id)}
              >
                <AppIcon icon={<SectionIcon />} />
                {!navigationCollapsed && label}
              </button>
            </Tooltip>
          ))}
        </nav>
        <Button
          className="dashboard-collapse"
          view="flat"
          size="s"
          onClick={() => setNavigationCollapsed((value) => !value)}
          aria-label={navigationCollapsed ? 'Развернуть навигацию' : 'Свернуть навигацию'}
        >
          <Icon data={GripHorizontal} size={16} className={navigationCollapsed ? undefined : 'rotated'} />
        </Button>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <Text variant="header-1">Заказы</Text>
            <Text color="secondary">Выбрано строк: {selectedIds.length}</Text>
          </div>
          <Flex gap={2} wrap>
            <Select
              value={[grouping ? 'on' : 'off']}
              onUpdate={([value]) => setGrouping(value === 'on')}
              width={190}
              aria-label="Группировка по статусу"
            >
              <Select.Option value="on" text="Группировать по статусу" />
              <Select.Option value="off" text="Без группировки" />
            </Select>
          </Flex>
        </header>

        <section className="dashboard-card">
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-table-select" />
                  {columnOrder.map((column, index) => (
                    <th
                      key={column.id}
                      className="dashboard-table-column"
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/column-index', String(index))}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const from = Number(event.dataTransfer.getData('text/column-index'));
                        if (!Number.isNaN(from) && from !== index) {
                          moveColumn(from, index);
                        }
                      }}
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  if ('__groupHeader' in row) {
                    const status = row.status;
                    return (
                      <tr key={row.id} className="dashboard-group-row">
                        <td />
                        <td colSpan={columnOrder.length}>{groupHeader(status, row.__count)}</td>
                      </tr>
                    );
                  }
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={isSelected ? 'selected' : undefined}
                      onClick={() =>
                        setSelectedIds((current) =>
                          current.includes(row.id) ? current.filter((item) => item !== row.id) : [...current, row.id],
                        )
                      }
                    >
                      <td className="dashboard-table-select" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          size="l"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.includes(row.id) ? current.filter((item) => item !== row.id) : [...current, row.id],
                            )
                          }
                        />
                      </td>
                      {columnOrder.map((column) => (
                        <td key={column.id}>{renderCell(row, column.id)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function renderCell(order: Order, id: keyof Order) {
  if (id === 'status') {
    return (
      <Label size="s" theme={statusThemes[order.status]}>
        {statusLabels[order.status]}
      </Label>
    );
  }
  if (id === 'total') {
    return `${order.total.toLocaleString('ru-RU')} ₽`;
  }
  return String(order[id]);
}
