import {useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {
  Calendar,
  ChartLine,
  Gear,
  House,
  Magnifier,
  Person,
  Plus,
  Receipt,
  ShoppingCart,
  Sliders,
} from '@gravity-ui/icons';
import {
  Button,
  Icon,
  Label,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import './App.css';

type Status = 'В обработке' | 'В пути' | 'Доставлен' | 'Отменён';
type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  items: number;
  payment: string;
  status: Status;
};
type OrderGroup = {id: string; status: Status; items: Order[]};
type GridRow = OrderGroup | Order;

const orders: Order[] = [
  {id: 'ORD-2847', customer: 'Анна Смирнова', email: 'anna.smirnova@gmail.com', date: 'Сегодня, 10:42', amount: 12890, items: 3, payment: 'Карта ···· 4242', status: 'В обработке'},
  {id: 'ORD-2846', customer: 'Михаил Волков', email: 'm.volkov@mail.ru', date: 'Сегодня, 09:18', amount: 6450, items: 1, payment: 'СБП', status: 'В обработке'},
  {id: 'ORD-2845', customer: 'Елена Козлова', email: 'e.kozlova@yandex.ru', date: 'Вчера, 18:36', amount: 23100, items: 4, payment: 'Карта ···· 8810', status: 'В обработке'},
  {id: 'ORD-2844', customer: 'Дмитрий Орлов', email: 'd.orlov@mail.ru', date: 'Вчера, 16:05', amount: 3890, items: 2, payment: 'Карта ···· 1062', status: 'В пути'},
  {id: 'ORD-2843', customer: 'Мария Белова', email: 'm.belova@gmail.com', date: 'Вчера, 14:22', amount: 15400, items: 3, payment: 'СБП', status: 'В пути'},
  {id: 'ORD-2842', customer: 'Алексей Морозов', email: 'a.morozov@inbox.ru', date: '12 мая, 11:54', amount: 7200, items: 1, payment: 'Карта ···· 5028', status: 'В пути'},
  {id: 'ORD-2841', customer: 'Ольга Новикова', email: 'o.novikova@mail.ru', date: '12 мая, 10:17', amount: 27600, items: 5, payment: 'Карта ···· 4242', status: 'Доставлен'},
  {id: 'ORD-2840', customer: 'Иван Фёдоров', email: 'i.fedorov@gmail.com', date: '11 мая, 16:48', amount: 8900, items: 2, payment: 'СБП', status: 'Доставлен'},
  {id: 'ORD-2839', customer: 'София Павлова', email: 's.pavlova@yandex.ru', date: '11 мая, 13:09', amount: 4150, items: 1, payment: 'Карта ···· 8810', status: 'Доставлен'},
  {id: 'ORD-2838', customer: 'Павел Соколов', email: 'p.sokolov@mail.ru', date: '10 мая, 09:31', amount: 11200, items: 2, payment: 'Карта ···· 1062', status: 'Отменён'},
];

const groupOrders = (items: Order[]): OrderGroup[] => {
  const statuses: Status[] = ['В обработке', 'В пути', 'Доставлен', 'Отменён'];
  return statuses.flatMap((status) => {
    const matching = items.filter((order) => order.status === status);
    return matching.length ? [{id: `group-${status}`, status, items: matching}] : [];
  });
};

const money = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
const statusTone: Record<Status, 'warning' | 'info' | 'success' | 'danger'> = {
  'В обработке': 'warning', 'В пути': 'info', 'Доставлен': 'success', 'Отменён': 'danger',
};

export function App() {
  const [compact, setCompact] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesFilter = activeFilter === 'Все' || order.status === activeFilter;
    const term = query.trim().toLocaleLowerCase('ru');
    const matchesQuery = !term || `${order.id} ${order.customer} ${order.email}`.toLocaleLowerCase('ru').includes(term);
    return matchesFilter && matchesQuery;
  }), [query, activeFilter]);
  const groupedOrders = useMemo(() => groupOrders(filteredOrders), [filteredOrders]);
  const getSubRows = (item: GridRow): GridRow[] | undefined => Array.isArray(item.items) ? item.items : undefined;
  const getRowId = (item: GridRow) => item.id;
  const handleSelectionChange = useRowSelectionFixedHandler({rowSelection, setRowSelection, tableData: groupedOrders, getSubRows, getRowId});

  const columns = useMemo<ColumnDef<GridRow>[]>(() => [
    selectionColumn as ColumnDef<GridRow>,
    {
      accessorKey: 'id', header: 'Заказ', size: 118,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <span className="order-id">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'customer', header: 'Покупатель', size: 245,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <div className="customer-cell"><span className="customer-avatar">{getValue<string>().split(' ').map((part) => part[0]).join('')}</span><span><strong>{getValue<string>()}</strong><small>{(row.original as Order).email}</small></span></div>,
    },
    {
      accessorKey: 'date', header: 'Дата', size: 148,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <span className="muted-text">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'items', header: 'Позиции', size: 100,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <span className="muted-text">{getValue<number>()} товара</span>,
    },
    {
      accessorKey: 'payment', header: 'Оплата', size: 165,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <span className="muted-text">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'amount', header: 'Сумма', size: 130,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <strong className="amount-cell">{money(getValue<number>())}</strong>,
    },
    {
      accessorKey: 'status', header: 'Статус', size: 152,
      cell: ({row, getValue}) => Array.isArray(row.original.items) ? null : <Label theme={statusTone[getValue<Status>()]}>{getValue<Status>()}</Label>,
    },
  ], []);

  const table = useTable({
    columns,
    data: groupedOrders,
    getRowId,
    getSubRows,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableExpanding: true,
    onRowSelectionChange: handleSelectionChange,
    onExpandedChange: setExpanded,
    state: {rowSelection, expanded},
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const navigation = [
    {id: 'home', title: 'Главная', icon: House, current: false},
    {id: 'users', title: 'Пользователи', icon: Person, current: false},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart, current: true},
    {id: 'settings', title: 'Настройки', icon: Gear, current: false},
  ];

  return <AsideHeader
    className="admin-shell"
    logo={{text: 'northstar', href: '#'}}
    compact={compact}
    onChangeCompact={setCompact}
    menuItems={navigation}
    renderContent={() => <main className="dashboard-page">
      <header className="topbar">
        <div className="breadcrumbs"><span>Магазин</span><span className="crumb-separator">/</span><strong>Заказы</strong></div>
        <div className="topbar-actions"><Button view="flat" className="icon-button" aria-label="Уведомления"><span className="notification-dot" />◌</Button><div className="user-profile"><span className="profile-avatar">АК</span><span className="profile-copy"><strong>Александр К.</strong><small>Администратор</small></span><span className="profile-caret">⌄</span></div></div>
      </header>

      <div className="page-content">
        <section className="page-heading">
          <div><div className="eyebrow">УПРАВЛЕНИЕ МАГАЗИНОМ</div><Text variant="display-2" className="page-title">Заказы</Text><p className="page-description">Отслеживайте и управляйте заказами вашего магазина</p></div>
          <div className="heading-actions"><Button view="outlined" size="l"><Icon data={Calendar} size={16} /> Последние 30 дней</Button><Button view="action" size="l"><Icon data={Plus} size={16} /> Создать заказ</Button></div>
        </section>

        <section className="summary-grid" aria-label="Сводка по заказам">
          <article className="summary-card"><div className="summary-top"><span className="summary-label">Всего заказов</span><span className="summary-icon icon-violet"><Icon data={Receipt} size={18} /></span></div><div className="summary-value">1 284</div><div className="summary-foot"><span className="trend-positive">↗ 12,8%</span><span>к прошлому месяцу</span></div><div className="sparkline spark-purple"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
          <article className="summary-card"><div className="summary-top"><span className="summary-label">В обработке</span><span className="summary-icon icon-amber"><Icon data={ShoppingCart} size={18} /></span></div><div className="summary-value">24</div><div className="summary-foot"><span>Требуют вашего внимания</span></div><div className="summary-progress"><span style={{width: '38%'}} /></div></article>
          <article className="summary-card"><div className="summary-top"><span className="summary-label">Выручка</span><span className="summary-icon icon-green"><Icon data={ChartLine} size={18} /></span></div><div className="summary-value">₽ 2,4 млн</div><div className="summary-foot"><span className="trend-positive">↗ 8,2%</span><span>к прошлому месяцу</span></div><div className="sparkline spark-green"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
          <article className="summary-card"><div className="summary-top"><span className="summary-label">Средний чек</span><span className="summary-icon icon-blue"><Icon data={Receipt} size={18} /></span></div><div className="summary-value">₽ 4 820</div><div className="summary-foot"><span className="trend-positive">↗ 3,1%</span><span>к прошлому месяцу</span></div><div className="sparkline spark-blue"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
        </section>

        <section className="orders-panel">
          <div className="panel-heading"><div><Text variant="subheader-2">Все заказы</Text><span className="orders-count">1 284</span><p>Полный список заказов вашего магазина</p></div><Button view="flat" className="more-button" aria-label="Другие действия">•••</Button></div>
          <div className="table-toolbar"><div className="toolbar-left"><div className="filter-tabs">{['Все', 'В обработке', 'В пути', 'Доставлен', 'Отменён'].map((filter) => <Button key={filter} view="flat" className={`filter-tab ${activeFilter === filter ? 'active' : ''}`} onClick={() => setActiveFilter(filter)}>{filter}{filter === 'В обработке' && <span className="tab-count">24</span>}</Button>)}</div></div><div className="toolbar-right"><TextInput className="search-input" placeholder="Поиск заказов..." value={query} onUpdate={setQuery} startContent={<Icon data={Magnifier} size={16} />} /><Button view="outlined" className="filter-button"><Icon data={Sliders} size={16} /> Фильтры</Button><Button view="outlined" className="columns-button">Колонки <span>⌄</span></Button></div></div>
          {selectedCount > 0 && <div className="selection-banner">Выбрано заказов: <strong>{selectedCount}</strong><Button view="flat" size="s" onClick={() => setRowSelection({})}>Снять выделение</Button></div>}
          <div className="table-wrap">
            <ColumnReorderingProvider table={table}>
              <Table table={table} size="m" getIsGroupHeaderRow={(row: Row<GridRow>) => Array.isArray(row.original.items)} getGroupTitle={(row: Row<GridRow>) => <span className="group-heading"><strong>{(row.original as OrderGroup).status}</strong><span className="group-count">{row.subRows.length}</span></span>} />
            </ColumnReorderingProvider>
            {filteredOrders.length === 0 && <div className="empty-state"><span>Ничего не найдено</span><small>Измените запрос или выберите другой статус</small></div>}
          </div>
          <footer className="table-footer"><span>Показано <strong>{filteredOrders.length}</strong> из <strong>1 284</strong> заказов</span><div className="pagination"><Button view="outlined" size="s" disabled>← Предыдущая</Button><Button view="outlined" size="s" className="current-page">1</Button><Button view="flat" size="s">2</Button><Button view="flat" size="s">3</Button><span className="page-ellipsis">…</span><Button view="flat" size="s">43</Button><Button view="outlined" size="s">Следующая →</Button></div></footer>
        </section>
        <footer className="app-footer"><span>© 2025 Northstar Commerce</span><span>Документация&nbsp;&nbsp; · &nbsp;&nbsp;Поддержка</span></footer>
      </div>
    </main>}
  />;
}
