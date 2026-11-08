import {useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Gear, House, Person, ShoppingCart} from '@gravity-ui/icons';
import {Button, Label, Text} from '@gravity-ui/uikit';
import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState, RowSelectionState} from '@gravity-ui/table/tanstack';
import './app.css';

type OrderStatus = 'Выполнен' | 'В обработке' | 'Отменён';
type Order = {
  id: string;
  customer: string;
  initials: string;
  email: string;
  date: string;
  amount: string;
  status: OrderStatus;
  method: string;
};
type OrderGroup = {id: string; status: OrderStatus; items: Order[]};
type TableItem = OrderGroup | Order;

const orders: Order[] = [
  {id: 'ORD-2847', customer: 'Анна Смирнова', initials: 'АС', email: 'anna.smirnova@mail.ru', date: 'Сегодня, 14:32', amount: '12 490 ₽', status: 'В обработке', method: 'Карта ···· 4242'},
  {id: 'ORD-2846', customer: 'Михаил Петров', initials: 'МП', email: 'm.petrov@gmail.com', date: 'Сегодня, 13:18', amount: '8 200 ₽', status: 'Выполнен', method: 'СБП'},
  {id: 'ORD-2845', customer: 'Елена Волкова', initials: 'ЕВ', email: 'elena.v@inbox.ru', date: 'Сегодня, 12:46', amount: '24 990 ₽', status: 'В обработке', method: 'Карта ···· 1088'},
  {id: 'ORD-2844', customer: 'Дмитрий Соколов', initials: 'ДС', email: 'd.sokolov@mail.ru', date: 'Сегодня, 11:05', amount: '3 750 ₽', status: 'Выполнен', method: 'Карта ···· 6610'},
  {id: 'ORD-2843', customer: 'Ольга Кузнецова', initials: 'ОК', email: 'olga.kuz@gmail.com', date: 'Вчера, 18:24', amount: '16 300 ₽', status: 'Отменён', method: 'Карта ···· 9102'},
  {id: 'ORD-2842', customer: 'Артём Морозов', initials: 'АМ', email: 'artyom.m@inbox.ru', date: 'Вчера, 16:52', amount: '6 890 ₽', status: 'Выполнен', method: 'СБП'},
  {id: 'ORD-2841', customer: 'София Лебедева', initials: 'СЛ', email: 'sofie.leb@mail.ru', date: 'Вчера, 15:11', amount: '42 100 ₽', status: 'В обработке', method: 'Карта ···· 2314'},
  {id: 'ORD-2840', customer: 'Иван Новиков', initials: 'ИН', email: 'i.novikov@gmail.com', date: 'Вчера, 12:38', amount: '9 600 ₽', status: 'Выполнен', method: 'Карта ···· 4242'},
  {id: 'ORD-2839', customer: 'Мария Фёдорова', initials: 'МФ', email: 'm.fedorova@mail.ru', date: 'Вчера, 10:20', amount: '5 490 ₽', status: 'Отменён', method: 'Карта ···· 1088'},
  {id: 'ORD-2838', customer: 'Кирилл Андреев', initials: 'КА', email: 'k.andreev@inbox.ru', date: '12 мая, 17:44', amount: '18 750 ₽', status: 'Выполнен', method: 'СБП'},
];

const statusView: Record<OrderStatus, 'success' | 'warning' | 'danger'> = {
  'Выполнен': 'success', 'В обработке': 'warning', 'Отменён': 'danger',
};

function Status({status}: {status: OrderStatus}) {
  return <Label theme={statusView[status]} size="s">{status}</Label>;
}

function OrdersPage() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const data = useMemo<OrderGroup[]>(() => {
    const groups: OrderStatus[] = ['В обработке', 'Выполнен', 'Отменён'];
    return groups.map((status) => ({id: status, status, items: orders.filter((order) => order.status === status)}));
  }, []);
  const getSubRows = (item: TableItem) => ('items' in item ? item.items : undefined);
  const getRowId = (item: TableItem) => item.id;
  const onRowSelectionChange = useRowSelectionFixedHandler({rowSelection, setRowSelection, tableData: data, getSubRows, getRowId});

  const columns = useMemo<ColumnDef<TableItem>[]>(() => [
    selectionColumn as ColumnDef<TableItem>,
    {id: 'order', header: 'Заказ', size: 130, accessorFn: (row) => 'items' in row ? row.status : row.id,
      cell: ({row, getValue}) => 'items' in row.original ? <span className="group-title">{String(getValue())}</span> : <span className="order-number">{String(getValue())}</span>},
    {id: 'customer', header: 'Покупатель', size: 250, accessorFn: (row) => 'items' in row ? '' : row.customer,
      cell: ({row}) => 'items' in row.original ? null : <div className="customer-cell"><span className="avatar">{row.original.initials}</span><span className="customer-copy"><span>{row.original.customer}</span><small>{row.original.email}</small></span></div>},
    {id: 'date', header: 'Дата', size: 155, accessorFn: (row) => 'items' in row ? '' : row.date, cell: ({row}) => 'items' in row.original ? null : <span className="muted-cell">{row.original.date}</span>},
    {id: 'status', header: 'Статус', size: 145, accessorFn: (row) => 'items' in row ? '' : row.status, cell: ({row}) => 'items' in row.original ? null : <Status status={row.original.status} />},
    {id: 'payment', header: 'Оплата', size: 165, accessorFn: (row) => 'items' in row ? '' : row.method, cell: ({row}) => 'items' in row.original ? null : <span className="muted-cell">{row.original.method}</span>},
    {id: 'amount', header: 'Сумма', size: 125, accessorFn: (row) => 'items' in row ? '' : row.amount, cell: ({row}) => 'items' in row.original ? null : <strong className="amount-cell">{row.original.amount}</strong>},
  ], []);

  const table = useTable({
    columns,
    data,
    getRowId,
    getSubRows,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange,
    onExpandedChange: setExpanded,
    state: {rowSelection, expanded},
  });

  return <div className="page-wrap">
    <header className="topbar"><div className="breadcrumbs"><span>Главная</span><span className="crumb-sep">/</span><b>Заказы</b></div><div className="top-actions"><span className="today-pill"><span className="live-dot"/> Данные обновлены</span><span className="top-avatar">АК</span></div></header>
    <main className="page-content">
      <div className="page-heading"><div><Text variant="header-1">Заказы</Text><p>Управляйте заказами и отслеживайте их статус</p></div><Button view="action" size="l" onClick={() => {}}>＋ Новый заказ</Button></div>
      <section className="stats-grid" aria-label="Сводка заказов">
        <article className="stat-card"><div className="stat-label">Всего заказов <span className="stat-icon lavender">▤</span></div><div className="stat-value">1 284</div><div className="stat-foot"><span className="trend">↗ 12,8%</span><span>к прошлому месяцу</span></div></article>
        <article className="stat-card"><div className="stat-label">Выручка <span className="stat-icon mint">₽</span></div><div className="stat-value">₽ 2,84 млн</div><div className="stat-foot"><span className="trend">↗ 8,2%</span><span>к прошлому месяцу</span></div></article>
        <article className="stat-card"><div className="stat-label">В обработке <span className="stat-icon amber">◷</span></div><div className="stat-value">18</div><div className="stat-foot"><span className="neutral-trend">6 требуют внимания</span></div></article>
        <article className="stat-card"><div className="stat-label">Средний чек <span className="stat-icon blue">⌁</span></div><div className="stat-value">₽ 2 212</div><div className="stat-foot"><span className="trend">↗ 3,4%</span><span>к прошлому месяцу</span></div></article>
      </section>
      <section className="table-card">
        <div className="table-heading"><div><Text variant="subheader-1">Все заказы</Text><span className="count-chip">1 284</span></div><div className="table-tools"><Button view="outlined" size="m">⌕ <span>Поиск</span></Button><Button view="outlined" size="m">☷ <span>Фильтры</span><i className="filter-count">2</i></Button><Button view="outlined" size="m">⇅ <span>Настроить</span></Button></div></div>
        {Object.keys(rowSelection).length > 0 && <div className="selection-note">Выбрано заказов: {Object.keys(rowSelection).length}</div>}
        <div className="orders-table-scroll"><ColumnReorderingProvider table={table}><Table table={table} getGroupTitle={(row) => String(row.getValue('order'))} /></ColumnReorderingProvider></div>
        <footer className="table-footer"><span>Показано <b>10</b> из <b>1 284</b> заказов</span><div className="pagination"><Button view="outlined" size="s" disabled>←</Button><Button view="action" size="s">1</Button><Button view="outlined" size="s">2</Button><Button view="outlined" size="s">3</Button><span>…</span><Button view="outlined" size="s">129</Button><Button view="outlined" size="s">→</Button></div><span className="per-page">10 на странице⌄</span></footer>
      </section>
      <div className="page-footnote">Последняя синхронизация сегодня в 14:35 <span>·</span> Часовой пояс: Москва (UTC+3)</div>
    </main>
  </div>;
}

export function App() {
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState('orders');
  const menuItems = [
    {id: 'home', title: 'Главная', icon: House, current: active === 'home', onItemClick: () => setActive('home')},
    {id: 'users', title: 'Пользователи', icon: Person, current: active === 'users', onItemClick: () => setActive('users')},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart, current: active === 'orders', onItemClick: () => setActive('orders')},
    {id: 'settings', title: 'Настройки', icon: Gear, current: active === 'settings', onItemClick: () => setActive('settings')},
  ];
  return <AsideHeader logo={{text: 'Меридиан', href: '#'}} compact={compact} onChangeCompact={setCompact} menuItems={menuItems} renderContent={() => <OrdersPage />} />;
}
