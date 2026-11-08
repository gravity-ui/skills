import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Boxes3, Gear, House, Magnifier, Persons, Plus, Sliders, ArrowDownToLine} from '@gravity-ui/icons';
import {
  Button,
  Icon,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import {
  ColumnReorderingProvider,
  selectionColumn,
  Table,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef, GroupingState, RowSelectionState} from '@gravity-ui/table/tanstack';
import './App.css';

type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: 'Выполнен' | 'В обработке' | 'Отправлен' | 'Отменён';
  method: string;
};

const orders: Order[] = [
  {id: 'ORD-1048', customer: 'Анна Смирнова', email: 'anna.smirnova@mail.ru', date: '24 окт, 14:32', total: 12840, status: 'Выполнен', method: 'Карта ···· 4821'},
  {id: 'ORD-1047', customer: 'Михаил Волков', email: 'm.volkov@gmail.com', date: '24 окт, 13:18', total: 7350, status: 'В обработке', method: 'СБП'},
  {id: 'ORD-1046', customer: 'Екатерина Иванова', email: 'katya.i@mail.ru', date: '24 окт, 12:54', total: 21990, status: 'Отправлен', method: 'Карта ···· 1039'},
  {id: 'ORD-1045', customer: 'Дмитрий Козлов', email: 'd.kozlov@yandex.ru', date: '24 окт, 11:07', total: 4590, status: 'Выполнен', method: 'Карта ···· 7712'},
  {id: 'ORD-1044', customer: 'Мария Петрова', email: 'maria.petrova@mail.ru', date: '23 окт, 18:41', total: 16200, status: 'В обработке', method: 'СБП'},
  {id: 'ORD-1043', customer: 'Алексей Морозов', email: 'alex.morozov@gmail.com', date: '23 окт, 16:20', total: 8900, status: 'Отправлен', method: 'Карта ···· 9004'},
  {id: 'ORD-1042', customer: 'Ольга Новикова', email: 'olga.n@mail.ru', date: '23 окт, 15:03', total: 3270, status: 'Выполнен', method: 'Карта ···· 2278'},
  {id: 'ORD-1041', customer: 'Иван Фёдоров', email: 'ifedorov@mail.ru', date: '23 окт, 12:46', total: 11450, status: 'Отменён', method: 'Карта ···· 3190'},
  {id: 'ORD-1040', customer: 'Полина Соколова', email: 'polina.s@gmail.com', date: '22 окт, 17:12', total: 6850, status: 'Выполнен', method: 'СБП'},
  {id: 'ORD-1039', customer: 'Сергей Андреев', email: 's.andreev@yandex.ru', date: '22 окт, 14:39', total: 24300, status: 'Отправлен', method: 'Карта ···· 8842'},
  {id: 'ORD-1038', customer: 'Виктория Белова', email: 'v.belova@mail.ru', date: '22 окт, 10:08', total: 5190, status: 'В обработке', method: 'Карта ···· 5106'},
  {id: 'ORD-1037', customer: 'Артём Павлов', email: 'art.pavlov@gmail.com', date: '21 окт, 19:25', total: 9370, status: 'Выполнен', method: 'СБП'},
];

const money = (value: number) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const statusClass: Record<Order['status'], string> = {
  'Выполнен': 'status status--done',
  'В обработке': 'status status--pending',
  'Отправлен': 'status status--sent',
  'Отменён': 'status status--cancelled',
};

const columns: ColumnDef<Order>[] = [
  selectionColumn as ColumnDef<Order>,
  {
    accessorKey: 'id', header: 'Заказ', size: 130,
    cell: ({getValue}) => <span className="order-id">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'customer', header: 'Покупатель', size: 230,
    cell: ({row, getValue}) => row.getIsGrouped() ? <span className="group-value">{getValue<string>()}</span> : (
      <div className="customer-cell"><span className="customer-avatar">{getValue<string>().split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span className="customer-copy"><span>{getValue<string>()}</span><small>{row.original.email}</small></span></div>
    ),
  },
  {accessorKey: 'date', header: 'Дата', size: 150},
  {
    accessorKey: 'total', header: 'Сумма', size: 130,
    cell: ({getValue}) => <span className="total-cell">{money(getValue<number>())}</span>,
  },
  {
    accessorKey: 'status', header: 'Статус', size: 155, enableGrouping: true,
    cell: ({row, getValue}) => row.getIsGrouped() ? <span className={statusClass[getValue<Order['status']>()]}>{getValue<string>()}</span> : <span className={statusClass[getValue<Order['status']>()]}><i />{getValue<string>()}</span>,
  },
  {accessorKey: 'method', header: 'Оплата', size: 180},
];

function OrdersContent() {
  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const filteredOrders = React.useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.email} ${order.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = activeTab === 'all'
      || (activeTab === 'pending' && order.status === 'В обработке')
      || (activeTab === 'sent' && order.status === 'Отправлен')
      || (activeTab === 'done' && order.status === 'Выполнен');
    return matchesQuery && matchesTab;
  }), [activeTab, query]);
  const onRowSelectionChange = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: filteredOrders,
    getRowId: (order: Order) => order.id,
    getSubRows: () => undefined,
  });
  const table = useTable({
    columns,
    data: filteredOrders,
    getRowId: (order) => order.id,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableGrouping: true,
    state: {grouping, rowSelection},
    onGroupingChange: setGrouping,
    onRowSelectionChange,
  });
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <main className="dashboard-page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs"><span>Главная</span><b>/</b><strong>Заказы</strong></div>
          <div className="title-row"><Text variant="header-1">Заказы</Text><span className="count-pill">248</span></div>
          <Text className="page-subtitle" variant="body-2">Управляйте заказами и отслеживайте их статус</Text>
        </div>
        <div className="header-actions">
          <Button view="normal" size="m"><Button.Icon><Icon data={ArrowDownToLine} size={16} /></Button.Icon>Экспорт</Button>
          <Button view="action" size="m"><Button.Icon><Icon data={Plus} size={16} /></Button.Icon>Новый заказ</Button>
        </div>
      </header>

      <section className="metrics" aria-label="Сводка по заказам">
        <div className="metric-card"><span className="metric-label">Всего заказов</span><strong>248</strong><small className="metric-positive">↗ 12,8% <span>к прошлому месяцу</span></small><span className="metric-icon metric-icon--blue"><Icon data={Boxes3} size={18} /></span></div>
        <div className="metric-card"><span className="metric-label">Выручка за месяц</span><strong>₽ 1 284 600</strong><small className="metric-positive">↗ 8,2% <span>к прошлому месяцу</span></small><span className="metric-icon metric-icon--green">₽</span></div>
        <div className="metric-card"><span className="metric-label">В обработке</span><strong>18</strong><small className="metric-muted">Требуют внимания</small><span className="metric-icon metric-icon--amber">◷</span></div>
        <div className="metric-card"><span className="metric-label">Средний чек</span><strong>₽ 5 180</strong><small className="metric-negative">↘ 2,4% <span>к прошлому месяцу</span></small><span className="metric-icon metric-icon--violet">⌁</span></div>
      </section>

      <section className="orders-panel">
        <div className="panel-heading">
          <div><Text variant="subheader-1">Все заказы</Text><span className="panel-count">248 записей</span></div>
          <div className="panel-actions">
            <Button view={grouping.length ? 'outlined' : 'normal'} size="s" selected={Boolean(grouping.length)} onClick={() => setGrouping(grouping.length ? [] : ['status'])}>
              <Button.Icon><Icon data={Sliders} size={15} /></Button.Icon>{grouping.length ? 'Группировка включена' : 'Группировать'}
            </Button>
            <Button view="normal" size="s"><Button.Icon><Icon data={Sliders} size={15} /></Button.Icon>Фильтры <span className="filter-number">2</span></Button>
          </div>
        </div>
        <div className="table-toolbar">
          <div className="tabs" role="tablist" aria-label="Фильтр заказов">
            <Button className={`tab${activeTab === 'all' ? ' tab--active' : ''}`} view="flat" size="s" selected={activeTab === 'all'} onClick={() => setActiveTab('all')}>Все <span>248</span></Button>
            <Button className={`tab${activeTab === 'pending' ? ' tab--active' : ''}`} view="flat" size="s" selected={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>В обработке <span>18</span></Button>
            <Button className={`tab${activeTab === 'sent' ? ' tab--active' : ''}`} view="flat" size="s" selected={activeTab === 'sent'} onClick={() => setActiveTab('sent')}>Отправлены <span>32</span></Button>
            <Button className={`tab${activeTab === 'done' ? ' tab--active' : ''}`} view="flat" size="s" selected={activeTab === 'done'} onClick={() => setActiveTab('done')}>Завершены <span>190</span></Button>
          </div>
          <div className="search-wrap"><TextInput value={query} onUpdate={setQuery} placeholder="Поиск заказа или покупателя" size="s" startContent={<Icon data={Magnifier} size={16} />} hasClear /></div>
        </div>
        {selectedCount > 0 && <div className="selection-banner">Выбрано заказов: <strong>{selectedCount}</strong><Button view="flat" size="s" onClick={() => setRowSelection({})}>Снять выделение</Button><Button view="flat" size="s">Изменить статус</Button></div>}
        <div className="table-scroll">
          <ColumnReorderingProvider table={table}>
            <Table table={table} getGroupTitle={(row) => `${row.getValue<string>('status')} · ${row.subRows.length} заказа`} />
          </ColumnReorderingProvider>
        </div>
        <footer className="table-footer">
          <span>Показано <strong>{filteredOrders.length ? `1–${filteredOrders.length}` : '0'}</strong> из <strong>248</strong> заказов</span>
          <div className="pagination"><Button view="normal" size="s" disabled>Назад</Button><Button view="action" size="s">1</Button><Button view="normal" size="s">2</Button><Button view="normal" size="s">3</Button><span>…</span><Button view="normal" size="s">25</Button><Button view="normal" size="s">Вперёд</Button></div>
        </footer>
      </section>
      <div className="page-note">Перетаскивайте заголовки, чтобы изменить порядок колонок</div>
    </main>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [active, setActive] = React.useState('orders');
  const menuItems = [
    {id: 'home', title: 'Главная', icon: House, current: active === 'home', onItemClick: () => setActive('home')},
    {id: 'users', title: 'Пользователи', icon: Persons, current: active === 'users', onItemClick: () => setActive('users')},
    {id: 'orders', title: 'Заказы', icon: Boxes3, current: active === 'orders', onItemClick: () => setActive('orders')},
    {id: 'settings', title: 'Настройки', icon: Gear, current: active === 'settings', onItemClick: () => setActive('settings')},
  ];

  return <AsideHeader logo={{text: 'Магазин', href: '#'}} compact={compact} onChangeCompact={setCompact} menuItems={menuItems} renderContent={() => <OrdersContent />} />;
}
