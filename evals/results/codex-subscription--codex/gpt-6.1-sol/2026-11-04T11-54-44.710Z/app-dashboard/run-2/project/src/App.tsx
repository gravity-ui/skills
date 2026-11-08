import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';
import './styles.css';

type IconName =
  | 'home'
  | 'users'
  | 'orders'
  | 'settings'
  | 'chevron'
  | 'search'
  | 'plus'
  | 'bell'
  | 'download'
  | 'filter'
  | 'columns'
  | 'group'
  | 'arrow'
  | 'close'
  | 'check'
  | 'more'
  | 'help'
  | 'external'
  | 'calendar'
  | 'sun'
  | 'logout'
  | 'grip'
  | 'mail'
  | 'box'
  | 'clock'
  | 'wallet'
  | 'menu';
function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87" />
        <circle cx="9" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    orders: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2m-8 5h8m-8 4h5" />
      </>
    ),
    settings: (
      <>
        <path
          d="m9 3-1 3-3 .5-2 3 2 2v3l-2 2 2 3 3 .5 1 3h5l1-3 3-.5 2-3-2-2v-3l2-2-2-3-3-.5-1-3Z"
          transform="translate(1 -1) scale(.95)"
        />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4 4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-11 12a2 2 0 0 0 4 0" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m6-16v16" />
      </>
    ),
    group: (
      <>
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <path d="M7 12h14M7 17h14M3 12h.01M3 17h.01" />
      </>
    ),
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 3h.01" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m-1-6-9 9M10 3H4v17h17v-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H3v16h6m5-12 4 4-4 4m-6-4h13" />
      </>
    ),
    grip: (
      <>
        <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" strokeWidth="3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v10l-9 5-9-5V8Zm-9 5 9 5 9-5m-9 5v10m-5-18 10 5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 8V5l15-3v3m3 6h-6v5h6m-3-2.5h.01" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
type Status = 'Новый' | 'В обработке' | 'Выполнен' | 'Отменён';
type Order = {
  id: number;
  name: string;
  email: string;
  initials: string;
  color: string;
  date: string;
  status: Status;
  amount: number;
  items: number;
  payment: 'Оплачен' | 'Ожидает оплаты' | 'Возврат';
  method: string;
};
const customers = [
  ['Александр Петров', 'alex.petrov@gmail.com', 'АП', 'lavender'],
  ['Мария Иванова', 'm.ivanova@mail.ru', 'МИ', 'pink'],
  ['Дмитрий Смирнов', 'd.smirnov@gmail.com', 'ДС', 'blue'],
  ['Анна Козлова', 'anna.kozlova@yandex.ru', 'АК', 'peach'],
  ['Михаил Соколов', 'm.sokolov@mail.ru', 'МС', 'sage'],
  ['Елена Волкова', 'elena.volkova@gmail.com', 'ЕВ', 'lavender'],
  ['Артём Морозов', 'artem.morozov@mail.ru', 'АМ', 'blue'],
  ['София Новикова', 's.novikova@yandex.ru', 'СН', 'pink'],
  ['Иван Лебедев', 'ivan.lebedev@gmail.com', 'ИЛ', 'sage'],
  ['Анастасия Орлова', 'a.orlova@mail.ru', 'АО', 'peach'],
  ['Максим Павлов', 'max.pavlov@gmail.com', 'МП', 'lavender'],
  ['Дарья Васильева', 'd.vasileva@yandex.ru', 'ДВ', 'pink'],
];
const initialOrders: Order[] = Array.from({ length: 48 }, (_, i) => {
  const c = customers[i % 12];
  const status: Status =
    i < 4
      ? 'Новый'
      : i < 8
        ? 'В обработке'
        : i < 12
          ? 'Выполнен'
          : i % 9 === 0
            ? 'Отменён'
            : (['Новый', 'В обработке', 'Выполнен'] as Status[])[i % 3];
  return {
    id: 1048 - i,
    name: c[0],
    email: c[1],
    initials: c[2],
    color: c[3],
    date: `${String(24 - Math.floor(i / 6)).padStart(2, '0')}.10.2024`,
    status,
    amount: [12450, 5890, 24900, 3600, 8750, 15300, 4290, 18700, 6400, 11250, 2790, 9800][i % 12],
    items: [3, 1, 5, 2, 2, 4, 1, 3, 2, 3, 1, 2][i % 12],
    payment:
      i === 1 || i === 3 || i === 6
        ? 'Ожидает оплаты'
        : status === 'Отменён'
          ? 'Возврат'
          : 'Оплачен',
    method: i % 3 === 0 ? 'СБП' : 'Банковская карта',
  };
});
const statusClass: Record<Status, string> = {
  Новый: 'new',
  'В обработке': 'processing',
  Выполнен: 'complete',
  Отменён: 'cancelled',
};
const money = (n: number) => n.toLocaleString('ru-RU') + ' ₽';
const allColumns = [
  { key: 'id', label: 'Заказ' },
  { key: 'customer', label: 'Клиент' },
  { key: 'date', label: 'Дата создания' },
  { key: 'status', label: 'Статус' },
  { key: 'amount', label: 'Сумма' },
  { key: 'items', label: 'Товары' },
  { key: 'payment', label: 'Оплата' },
];
function Sparkline({ variant = 0 }: { variant?: number }) {
  const lines = [
    '0,36 8,32 16,34 24,20 32,25 40,20 48,27 56,16 64,20 72,9 80,13 88,5 96,8 106,0',
    '0,33 8,28 16,31 24,28 32,15 40,20 48,17 56,21 64,12 72,16 80,6 88,10 96,5 106,1',
    '0,32 8,35 16,27 24,30 32,20 40,24 48,16 56,20 64,11 72,15 80,7 88,11 96,4 106,1',
    '0,5 8,11 16,8 24,20 32,16 40,22 48,19 56,29 64,22 72,29 80,25 88,32 96,30 106,36',
  ];
  return (
    <svg className={`sparkline spark-${variant}`} viewBox="0 0 108 46">
      <defs>
        <linearGradient id={`fade${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".13" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,46 ${lines[variant]} 106,46`} fill={`url(#fade${variant})`} />
      <polyline
        points={lines[variant]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CheckBox({
  checked,
  partial = false,
  onChange,
  label,
}: {
  checked: boolean;
  partial?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="checkbox" title={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        ref={(el) => {
          if (el) el.indeterminate = partial;
        }}
      />
      <span>
        {checked ? <Icon name="check" size={12} /> : partial ? <span className="minus" /> : null}
      </span>
    </label>
  );
}
function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
export function App() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 980),
    [nav, setNav] = useState('Заказы'),
    [orders, setOrders] = useState<Order[]>(() => readStorage('kontur-orders', initialOrders)),
    [query, setQuery] = useState(''),
    [tab, setTab] = useState('Все заказы'),
    [grouped, setGrouped] = useState(true),
    [closedGroups, setClosedGroups] = useState<Set<string>>(new Set()),
    [selected, setSelected] = useState<Set<number>>(new Set()),
    [columns, setColumns] = useState(allColumns),
    [hidden, setHidden] = useState<Set<string>>(new Set()),
    [dragColumn, setDragColumn] = useState<string | null>(null),
    [overColumn, setOverColumn] = useState<string | null>(null),
    [popover, setPopover] = useState<string | null>(null),
    [filterStatus, setFilterStatus] = useState('Все статусы'),
    [paymentFilter, setPaymentFilter] = useState('Любая оплата'),
    [dateFilter, setDateFilter] = useState('Все даты'),
    [page, setPage] = useState(1),
    [perPage, setPerPage] = useState(12),
    [sort, setSort] = useState<{ key: string; asc: boolean } | null>(null),
    [detail, setDetail] = useState<Order | null>(null),
    [create, setCreate] = useState(false),
    [toast, setToast] = useState(''),
    [notifications, setNotifications] = useState(true),
    [settingsSaved, setSettingsSaved] = useState(false),
    [storeSettings, setStoreSettings] = useState(() =>
      readStorage('kontur-settings', {
        store: 'Studio Store',
        admin: 'Алексей Соколов',
        email: 'alexey@studiostore.ru',
        notify: true,
      }),
    );
  useEffect(() => {
    try {
      localStorage.setItem('kontur-orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);
  useEffect(() => {
    try {
      localStorage.setItem('kontur-settings', JSON.stringify(storeSettings));
    } catch {}
  }, [storeSettings]);
  const popRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopover(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    setPage(1);
  }, [query, tab, filterStatus, paymentFilter, dateFilter, perPage]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetail(null);
        setCreate(false);
        setPopover(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('order-search')?.focus();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  const filtered = useMemo(() => {
    let result = orders.filter(
      (o) =>
        (!query || `${o.id} ${o.name} ${o.email}`.toLowerCase().includes(query.toLowerCase())) &&
        (tab === 'Все заказы' || o.status === tab) &&
        (filterStatus === 'Все статусы' || o.status === filterStatus) &&
        (paymentFilter === 'Любая оплата' || o.payment === paymentFilter) &&
        (dateFilter === 'Все даты' ||
          (dateFilter === '24 октября'
            ? o.date === '24.10.2024'
            : Number(o.date.slice(0, 2)) >= 22)),
    );
    if (sort)
      result.sort((a, b) => {
        const get = (o: Order) =>
          sort.key === 'customer'
            ? o.name
            : sort.key === 'date'
              ? o.date.split('.').reverse().join('')
              : (o as any)[sort.key];
        return (
          (typeof get(a) === 'number'
            ? get(a) - get(b)
            : String(get(a)).localeCompare(String(get(b)), 'ru')) * (sort.asc ? 1 : -1)
        );
      });
    return result;
  }, [orders, query, tab, filterStatus, paymentFilter, dateFilter, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage)),
    currentPage = Math.min(page, pages),
    visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage),
    shownColumns = columns.filter((c) => !hidden.has(c.key));
  const groups = grouped
    ? (['Новый', 'В обработке', 'Выполнен', 'Отменён'] as Status[])
        .map((s) => ({ status: s, rows: visible.filter((o) => o.status === s) }))
        .filter((g) => g.rows.length)
    : [{ status: null, rows: visible }];
  const allSelected = visible.length > 0 && visible.every((o) => selected.has(o.id));
  function toggleRow(id: number) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function selectAll() {
    setSelected((s) => {
      const n = new Set(s);
      visible.forEach((o) => (allSelected ? n.delete(o.id) : n.add(o.id)));
      return n;
    });
  }
  function togglePopover(name: string) {
    setPopover((p) => (p === name ? null : name));
  }
  function exportOrders() {
    const rows = selected.size ? orders.filter((o) => selected.has(o.id)) : filtered;
    const csv =
      '\uFEFFЗаказ;Клиент;Email;Дата;Статус;Сумма;Товары;Оплата\n' +
      rows
        .map((o) =>
          [o.id, o.name, o.email, o.date, o.status, o.amount, o.items, o.payment].join(';'),
        )
        .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    setToast(`Экспортировано заказов: ${rows.length}`);
  }
  function bulkStatus(status: Status) {
    setOrders((os) => os.map((o) => (selected.has(o.id) ? { ...o, status } : o)));
    setSelected(new Set());
    setPopover(null);
    setToast('Статусы выбранных заказов обновлены');
  }
  function cell(o: Order, key: string) {
    switch (key) {
      case 'id':
        return (
          <button className="order-link" onClick={() => setDetail(o)}>
            #{o.id}
          </button>
        );
      case 'customer':
        return (
          <div className="customer">
            <span className={`avatar ${o.color}`}>{o.initials}</span>
            <div>
              <button className="customer-name" onClick={() => setDetail(o)}>
                {o.name}
              </button>
              <span className="customer-email">{o.email}</span>
            </div>
          </div>
        );
      case 'date':
        return (
          <span className="date-cell">
            {o.date}
            <span>
              {' '}
              {o.id % 2 === 0 ? '12:' : '11:'}
              {String(o.id % 60).padStart(2, '0')}
            </span>
          </span>
        );
      case 'status':
        return (
          <span className={`status ${statusClass[o.status]}`}>
            <i />
            {o.status}
          </span>
        );
      case 'amount':
        return <span className="amount">{money(o.amount)}</span>;
      case 'items':
        return <span className="items-cell">{o.items} шт.</span>;
      case 'payment':
        return (
          <span
            className={`payment ${o.payment === 'Оплачен' ? 'paid' : o.payment === 'Возврат' ? 'refund' : 'waiting'}`}
          >
            {o.payment === 'Оплачен' ? (
              <Icon name="check" size={13} />
            ) : (
              <span className="payment-dot" />
            )}
            {o.payment}
          </span>
        );
    }
  }
  return (
    <div className={`app ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setNav('Главная');
          }}
          aria-label="Контур — главная"
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          {!collapsed && (
            <span>
              контур<span className="brand-period">.</span>
            </span>
          )}
        </a>
        <div className="workspace">
          <span className="workspace-symbol">
            S<span />
          </span>
          {!collapsed && (
            <>
              <div>
                <strong>{storeSettings.store}</strong>
                <span>Рабочее пространство</span>
              </div>
              <Icon name="chevron" size={15} className="rotate-down" />
            </>
          )}
        </div>
        <div className="nav-label">{collapsed ? '···' : 'РАБОЧЕЕ ПРОСТРАНСТВО'}</div>
        <nav>
          {(
            [
              { name: 'Главная', icon: 'home' },
              { name: 'Пользователи', icon: 'users' },
              { name: 'Заказы', icon: 'orders' },
              { name: 'Настройки', icon: 'settings' },
            ] as { name: string; icon: IconName }[]
          ).map((item) => (
            <button
              key={item.name}
              className={`nav-item ${nav === item.name ? 'active' : ''}`}
              onClick={() => {
                setNav(item.name);
                setQuery('');
              }}
              title={collapsed ? item.name : undefined}
            >
              <Icon name={item.icon} />
              {!collapsed && (
                <>
                  <span>{item.name}</span>
                  {item.name === 'Заказы' && <span className="nav-count">{orders.length}</span>}
                </>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="help-card">
              <span className="help-card-icon">
                <Icon name="help" size={19} />
              </span>
              <strong>Всё под контролем</strong>
              <p>
                Поможем разобраться
                <br />с вашим пространством.
              </p>
              <button
                onClick={() => {
                  setPopover('help');
                }}
              >
                Центр поддержки <Icon name="external" size={13} />
              </button>
            </div>
          )}
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <Icon name="columns" size={18} />
            {!collapsed && <span>Свернуть меню</span>}
            <Icon name="chevron" size={14} className={collapsed ? '' : 'rotate-back'} />
          </button>
          <div className="profile">
            <span className="profile-avatar">
              АС
              <span />
            </span>
            {!collapsed && (
              <>
                <div>
                  <strong>{storeSettings.admin}</strong>
                  <span>Администратор</span>
                </div>
                <button
                  className="icon-button"
                  onClick={() => {
                    setNav('Настройки');
                  }}
                  aria-label="Настройки профиля"
                >
                  <Icon name="more" size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{nav}</strong>
          </div>
          <div className="topbar-right">
            <span className="today">
              <Icon name="calendar" size={15} />
              Четверг, 24 октября
            </span>
            <span className="topbar-divider" />
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Уведомления"
                onClick={() => {
                  togglePopover('notifications');
                  setNotifications(false);
                }}
              >
                <Icon name="bell" size={20} />
                {notifications && <i />}
              </button>
              {popover === 'notifications' && (
                <div className="popover notification-popover">
                  <strong>Уведомления</strong>
                  <p>
                    <span className="notification-dot" />4 новых заказа ждут обработки
                  </p>
                  <small>Сегодня, 12:30</small>
                  <p>
                    <Icon name="check" size={15} /> Все платежи синхронизированы
                  </p>
                  <small>Сегодня, 11:45</small>
                  <button className="text-button" onClick={() => setPopover(null)}>
                    Всё прочитано
                  </button>
                </div>
              )}
            </div>
            <button className="top-avatar" onClick={() => setNav('Настройки')} title="Мой профиль">
              АС
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div>
              <h1>{nav === 'Главная' ? 'Обзор пространства' : nav}</h1>
              <p>
                {nav === 'Заказы'
                  ? 'Управляйте заказами и держите каждый этап под контролем.'
                  : nav === 'Главная'
                    ? 'Всё, что важно для вашего магазина, в одном месте.'
                    : nav === 'Пользователи'
                      ? 'Ваши клиенты, их заказы и история покупок.'
                      : 'Настройте пространство под свой рабочий процесс.'}
              </p>
            </div>
            {(nav === 'Заказы' || nav === 'Главная') && (
              <div className="heading-actions">
                <button className="button" onClick={exportOrders}>
                  <Icon name="download" size={17} />
                  <span>Экспорт</span>
                </button>
                <button className="button primary" onClick={() => setCreate(true)}>
                  <Icon name="plus" size={19} />
                  Новый заказ
                </button>
              </div>
            )}
          </div>
          {(nav === 'Заказы' || nav === 'Главная') && (
            <>
              <section className="stats-grid">
                {[
                  {
                    label: 'Всего заказов',
                    value: '1 284',
                    change: '+12,8%',
                    note: 'за этот месяц',
                    icon: 'orders',
                    variant: 0,
                  },
                  {
                    label: 'Выручка',
                    value: '2 456 800',
                    suffix: '₽',
                    change: '+18,6%',
                    note: 'за этот месяц',
                    icon: 'wallet',
                    variant: 1,
                  },
                  {
                    label: 'Средний чек',
                    value: '1 913',
                    suffix: '₽',
                    change: '+5,2%',
                    note: 'за этот месяц',
                    icon: 'box',
                    variant: 2,
                  },
                  {
                    label: 'В обработке',
                    value: String(orders.filter((o) => o.status === 'В обработке').length),
                    change: '−8,3%',
                    note: 'к прошлому месяцу',
                    icon: 'clock',
                    variant: 3,
                  },
                ].map((s, i) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-top">
                      <span>{s.label}</span>
                      <span className={`stat-icon stat-icon-${i}`}>
                        <Icon name={s.icon as IconName} size={17} />
                      </span>
                    </div>
                    <div className="stat-value">
                      {s.value}
                      {s.suffix && <span>{s.suffix}</span>}
                    </div>
                    <div className="stat-bottom">
                      <span className="stat-change">
                        <Icon name="arrow" size={12} className={i === 3 ? 'trend-down' : ''} />
                        {s.change}
                      </span>
                      <span>{s.note}</span>
                    </div>
                    <Sparkline variant={s.variant} />
                  </div>
                ))}
              </section>
              <section className="orders-panel">
                <div className="panel-title">
                  <div>
                    <h2>{nav === 'Главная' ? 'Последние заказы' : 'Все заказы'}</h2>
                    <span className="total-badge">{orders.length}</span>
                  </div>
                  <span className="live-label">
                    <i />
                    Обновлено только что
                  </span>
                </div>
                <div className="tabs">
                  {['Все заказы', 'Новый', 'В обработке', 'Выполнен', 'Отменён'].map((t) => (
                    <button
                      key={t}
                      className={tab === t ? 'selected' : ''}
                      onClick={() => {
                        setTab(t);
                        setSelected(new Set());
                      }}
                    >
                      {t === 'Новый'
                        ? 'Новые'
                        : t === 'Выполнен'
                          ? 'Выполненные'
                          : t === 'Отменён'
                            ? 'Отменённые'
                            : t}
                      {(t === 'Все заказы' || t === 'Новый') && (
                        <span>
                          {t === 'Все заказы'
                            ? orders.length
                            : orders.filter((o) => o.status === t).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="table-tools" ref={popRef}>
                  <div className="search-box">
                    <Icon name="search" size={17} />
                    <input
                      id="order-search"
                      placeholder="Поиск по заказам..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query ? (
                      <button
                        className="icon-button"
                        onClick={() => setQuery('')}
                        aria-label="Очистить поиск"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    ) : (
                      <kbd>⌘ K</kbd>
                    )}
                  </div>
                  <div className="tools-right">
                    <div className="popover-anchor">
                      <button
                        className={`button tool-button ${popover === 'filters' || filterStatus !== 'Все статусы' || paymentFilter !== 'Любая оплата' ? 'is-on' : ''}`}
                        onClick={() => togglePopover('filters')}
                      >
                        <Icon name="filter" size={16} />
                        Фильтры
                        {(filterStatus !== 'Все статусы' || paymentFilter !== 'Любая оплата') && (
                          <i className="filter-active" />
                        )}
                      </button>
                      {popover === 'filters' && (
                        <div className="popover filters-popover">
                          <strong>Фильтры заказов</strong>
                          <label>
                            Статус
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                            >
                              {['Все статусы', 'Новый', 'В обработке', 'Выполнен', 'Отменён'].map(
                                (x) => (
                                  <option key={x}>{x}</option>
                                ),
                              )}
                            </select>
                          </label>
                          <label>
                            Оплата
                            <select
                              value={paymentFilter}
                              onChange={(e) => setPaymentFilter(e.target.value)}
                            >
                              {['Любая оплата', 'Оплачен', 'Ожидает оплаты', 'Возврат'].map((x) => (
                                <option key={x}>{x}</option>
                              ))}
                            </select>
                          </label>
                          <button
                            className="text-button"
                            onClick={() => {
                              setFilterStatus('Все статусы');
                              setPaymentFilter('Любая оплата');
                            }}
                          >
                            Сбросить фильтры
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="popover-anchor">
                      <button
                        className={`button tool-button group-button ${grouped ? 'is-on' : ''}`}
                        onClick={() => togglePopover('group')}
                      >
                        <Icon name="group" size={16} />
                        <span>Группировка</span>
                        <span className="group-value">{grouped ? 'Статус' : 'Нет'}</span>
                        <Icon name="chevron" size={12} className="rotate-down" />
                      </button>
                      {popover === 'group' && (
                        <div className="popover menu-popover">
                          <strong>Группировать строки</strong>
                          {[true, false].map((v) => (
                            <button
                              key={String(v)}
                              onClick={() => {
                                setGrouped(v);
                                setPopover(null);
                              }}
                            >
                              <span>{v ? 'По статусу заказа' : 'Без группировки'}</span>
                              {v === grouped && <Icon name="check" size={15} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="popover-anchor">
                      <button
                        className="button tool-button"
                        onClick={() => togglePopover('columns')}
                      >
                        <Icon name="columns" size={16} />
                        <span>Колонки</span>
                      </button>
                      {popover === 'columns' && (
                        <div className="popover columns-popover">
                          <strong>Колонки таблицы</strong>
                          <p>Перетащите заголовок, чтобы изменить порядок.</p>
                          {columns.map((c) => (
                            <div className="column-option" key={c.key}>
                              <CheckBox
                                checked={!hidden.has(c.key)}
                                onChange={() =>
                                  setHidden((prev) => {
                                    const n = new Set(prev);
                                    if (n.has(c.key)) n.delete(c.key);
                                    else if (columns.length - n.size > 1) n.add(c.key);
                                    return n;
                                  })
                                }
                                label={c.label}
                              />
                              {c.label}
                            </div>
                          ))}
                          <button
                            className="text-button"
                            onClick={() => {
                              setColumns(allColumns);
                              setHidden(new Set());
                            }}
                          >
                            Сбросить настройки
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="tools-divider" />
                    <div className="popover-anchor">
                      <button
                        className={`button icon-only ${dateFilter !== 'Все даты' ? 'is-on' : ''}`}
                        title="Период"
                        onClick={() => togglePopover('dates')}
                      >
                        <Icon name="calendar" size={17} />
                      </button>
                      {popover === 'dates' && (
                        <div className="popover menu-popover">
                          <strong>Период заказов</strong>
                          {['Все даты', '24 октября', 'Последние 3 дня'].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                setDateFilter(d);
                                setPopover(null);
                              }}
                            >
                              {d}
                              {dateFilter === d && <Icon name="check" size={15} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selected.size > 0 && (
                  <div className="selection-bar">
                    <span>
                      Выбрано заказов: <strong>{selected.size}</strong>
                    </span>
                    <select
                      aria-label="Изменить статус выбранных заказов"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) bulkStatus(e.target.value as Status);
                        e.target.value = '';
                      }}
                    >
                      <option value="" disabled>
                        Изменить статус
                      </option>
                      {Object.keys(statusClass).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={exportOrders}>
                      <Icon name="download" size={15} />
                      Экспортировать
                    </button>
                    <button className="selection-clear" onClick={() => setSelected(new Set())}>
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                )}
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th className="check-cell">
                          <CheckBox
                            checked={allSelected}
                            partial={!allSelected && visible.some((o) => selected.has(o.id))}
                            onChange={selectAll}
                            label="Выбрать все заказы на странице"
                          />
                        </th>
                        {shownColumns.map((c) => (
                          <th
                            key={c.key}
                            draggable
                            onDragStart={(e) => {
                              setDragColumn(c.key);
                              e.dataTransfer.setData('text/plain', c.key);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (dragColumn !== c.key) setOverColumn(c.key);
                            }}
                            onDragLeave={() => setOverColumn(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              const from = e.dataTransfer.getData('text/plain');
                              setColumns((cs) => {
                                const copy = [...cs],
                                  start = copy.findIndex((x) => x.key === from),
                                  end = copy.findIndex((x) => x.key === c.key);
                                if (start < 0 || end < 0) return cs;
                                copy.splice(end, 0, copy.splice(start, 1)[0]);
                                return copy;
                              });
                              setDragColumn(null);
                              setOverColumn(null);
                            }}
                            onDragEnd={() => {
                              setDragColumn(null);
                              setOverColumn(null);
                            }}
                            className={`${c.key}-column ${overColumn === c.key ? 'drag-over' : ''} ${dragColumn === c.key ? 'dragging' : ''}`}
                            title="Перетащите для перемещения колонки"
                          >
                            <button
                              className="column-heading"
                              onClick={() =>
                                setSort((s) => ({
                                  key: c.key,
                                  asc: s?.key === c.key ? !s.asc : true,
                                }))
                              }
                            >
                              {c.label}
                              <span
                                className={`sort-indicator ${sort?.key === c.key ? 'sort-active' : ''}`}
                              >
                                {sort?.key === c.key ? (sort.asc ? '↑' : '↓') : '↕'}
                              </span>
                              <Icon name="grip" size={12} className="drag-handle" />
                            </button>
                          </th>
                        ))}
                        <th className="row-actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <Rows key={g.status || 'all'}>
                          {g.status && (
                            <tr className={`group-row group-${statusClass[g.status]}`}>
                              <td colSpan={shownColumns.length + 2}>
                                <button
                                  onClick={() =>
                                    setClosedGroups((prev) => {
                                      const n = new Set(prev);
                                      n.has(g.status!) ? n.delete(g.status!) : n.add(g.status!);
                                      return n;
                                    })
                                  }
                                  aria-expanded={!closedGroups.has(g.status)}
                                >
                                  <Icon
                                    name="chevron"
                                    size={12}
                                    className={closedGroups.has(g.status) ? '' : 'rotate-down'}
                                  />
                                  <span className={`group-dot ${statusClass[g.status]}`} />
                                  <strong>
                                    {g.status === 'Новый'
                                      ? 'Новые заказы'
                                      : g.status === 'Выполнен'
                                        ? 'Выполненные'
                                        : g.status === 'Отменён'
                                          ? 'Отменённые'
                                          : g.status}
                                  </strong>
                                  <span className="group-count">{g.rows.length}</span>
                                  <span className="group-total">
                                    {money(g.rows.reduce((s, o) => s + o.amount, 0))}
                                  </span>
                                </button>
                              </td>
                            </tr>
                          )}
                          {(!g.status || !closedGroups.has(g.status)) &&
                            g.rows.map((o) => (
                              <tr
                                key={o.id}
                                className={`order-row ${selected.has(o.id) ? 'row-selected' : ''}`}
                              >
                                <td className="check-cell">
                                  <CheckBox
                                    checked={selected.has(o.id)}
                                    onChange={() => toggleRow(o.id)}
                                    label={`Выбрать заказ ${o.id}`}
                                  />
                                </td>
                                {shownColumns.map((c) => (
                                  <td key={c.key} className={`${c.key}-cell`}>
                                    {cell(o, c.key)}
                                  </td>
                                ))}
                                <td className="row-actions">
                                  <button
                                    className="icon-button"
                                    aria-label={`Открыть заказ ${o.id}`}
                                    onClick={() => setDetail(o)}
                                  >
                                    <Icon name="more" size={17} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </Rows>
                      ))}
                    </tbody>
                  </table>
                  {visible.length === 0 && (
                    <div className="empty-state">
                      <Icon name="search" size={30} />
                      <h3>Заказы не найдены</h3>
                      <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                      <button
                        className="button"
                        onClick={() => {
                          setQuery('');
                          setTab('Все заказы');
                          setFilterStatus('Все статусы');
                          setPaymentFilter('Любая оплата');
                          setDateFilter('Все даты');
                        }}
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}
                </div>
                <footer className="table-footer">
                  <div className="pagination-info">
                    Показано{' '}
                    <strong>
                      {filtered.length ? (currentPage - 1) * perPage + 1 : 0}–
                      {Math.min(currentPage * perPage, filtered.length)}
                    </strong>{' '}
                    из <strong>{filtered.length}</strong> заказов
                  </div>
                  <div className="pagination-right">
                    <label>
                      Строк на странице
                      <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                        {[12, 24, 48].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <div className="pagination">
                      <button
                        aria-label="Предыдущая страница"
                        disabled={currentPage === 1}
                        onClick={() => setPage(currentPage - 1)}
                      >
                        <Icon name="chevron" size={14} className="rotate-back" />
                      </button>
                      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={p === currentPage ? 'current' : ''}
                          onClick={() => {
                            setPage(p);
                            setSelected(new Set());
                          }}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        aria-label="Следующая страница"
                        disabled={currentPage === pages}
                        onClick={() => setPage(currentPage + 1)}
                      >
                        <Icon name="chevron" size={14} />
                      </button>
                    </div>
                  </div>
                </footer>
              </section>
              <div className="table-hint">
                <Icon name="grip" size={13} />
                <span>Перетаскивайте заголовки, чтобы менять порядок колонок</span>
                <button className="hint-right" onClick={() => setPopover('help')}>
                  <Icon name="help" size={12} />
                  Как работать с таблицей
                </button>
              </div>
            </>
          )}
          {nav === 'Пользователи' && (
            <section className="users-panel">
              <div className="search-box">
                <Icon name="search" size={17} />
                <input
                  placeholder="Найти клиента..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="user-list">
                {customers
                  .filter((c) => `${c[0]} ${c[1]}`.toLowerCase().includes(query.toLowerCase()))
                  .map((c) => (
                    <div className="user-card" key={c[1]}>
                      <span className={`avatar ${c[3]}`}>{c[2]}</span>
                      <div>
                        <h3>{c[0]}</h3>
                        <p>{c[1]}</p>
                      </div>
                      <span className="user-order-count">
                        {orders.filter((o) => o.email === c[1]).length} заказа
                      </span>
                      <strong>
                        {money(
                          orders.filter((o) => o.email === c[1]).reduce((a, o) => a + o.amount, 0),
                        )}
                      </strong>
                      <button
                        className="button"
                        onClick={() => {
                          setNav('Заказы');
                          setQuery(c[1]);
                          setTab('Все заказы');
                        }}
                      >
                        Заказы <Icon name="chevron" size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}
          {nav === 'Настройки' && (
            <form
              className="settings-panel"
              onSubmit={(e) => {
                e.preventDefault();
                setSettingsSaved(true);
                setToast('Настройки сохранены');
                const data = new FormData(e.currentTarget);
                setStoreSettings({
                  store: String(data.get('store')),
                  admin: String(data.get('admin')),
                  email: String(data.get('email')),
                  notify: data.get('notify') === 'on',
                });
              }}
            >
              <div className="settings-heading">
                <h2>Настройки пространства</h2>
                <p>Основная информация о вашем магазине и профиле.</p>
              </div>
              <div className="settings-fields">
                <label>
                  Название магазина
                  <input
                    name="store"
                    defaultValue={storeSettings.store}
                    required
                    onChange={() => setSettingsSaved(false)}
                  />
                </label>
                <label>
                  Имя администратора
                  <input
                    name="admin"
                    defaultValue={storeSettings.admin}
                    required
                    onChange={() => setSettingsSaved(false)}
                  />
                </label>
                <label>
                  Email для уведомлений
                  <input
                    type="email"
                    name="email"
                    defaultValue={storeSettings.email}
                    required
                    onChange={() => setSettingsSaved(false)}
                  />
                </label>
                <label>
                  Валюта
                  <select>
                    <option>Российский рубль (₽)</option>
                  </select>
                </label>
                <label className="settings-toggle">
                  <input type="checkbox" name="notify" defaultChecked={storeSettings.notify} />
                  Получать уведомления о новых заказах
                </label>
                <button type="submit" className="button primary">
                  {settingsSaved ? (
                    <>
                      <Icon name="check" size={16} />
                      Сохранено
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </button>
              </div>
            </form>
          )}
          <footer className="page-footer">
            <span>© 2024 Контур. Ваш бизнес, в порядке.</span>
            <div>
              <span className="system-dot" />
              Все системы работают <span className="footer-separator">·</span>
              <button onClick={() => setPopover('help')}>
                Помощь и поддержка <Icon name="external" size={11} />
              </button>
            </div>
          </footer>
        </main>
      </div>
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <aside
            className="detail-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Заказ ${detail.id}`}
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">ДЕТАЛИ ЗАКАЗА</span>
                <h2>Заказ #{detail.id}</h2>
              </div>
              <button className="icon-button" onClick={() => setDetail(null)} aria-label="Закрыть">
                <Icon name="close" />
              </button>
            </div>
            <span className={`status ${statusClass[detail.status]}`}>
              <i />
              {detail.status}
            </span>
            <div className="detail-section">
              <h3>Клиент</h3>
              <div className="customer">
                <span className={`avatar ${detail.color}`}>{detail.initials}</span>
                <div>
                  <strong>{detail.name}</strong>
                  <span className="customer-email">{detail.email}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h3>Информация о заказе</h3>
              <dl>
                <div>
                  <dt>Дата создания</dt>
                  <dd>{detail.date}</dd>
                </div>
                <div>
                  <dt>Количество товаров</dt>
                  <dd>{detail.items} шт.</dd>
                </div>
                <div>
                  <dt>Способ оплаты</dt>
                  <dd>{detail.method}</dd>
                </div>
                <div>
                  <dt>Оплата</dt>
                  <dd>{detail.payment}</dd>
                </div>
                <div className="detail-total">
                  <dt>Итого</dt>
                  <dd>{money(detail.amount)}</dd>
                </div>
              </dl>
            </div>
            <label className="detail-status">
              Статус заказа
              <select
                value={detail.status}
                onChange={(e) => {
                  const status = e.target.value as Status;
                  setDetail({ ...detail, status });
                  setOrders((os) => os.map((o) => (o.id === detail.id ? { ...o, status } : o)));
                  setToast('Статус заказа обновлён');
                }}
              >
                {Object.keys(statusClass).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="detail-note">
              <Icon name="help" size={17} />
              <p>Изменения сохраняются автоматически. Все данные заказа доступны вашей команде.</p>
            </div>
            <button className="button" onClick={() => setDetail(null)}>
              Вернуться к заказам
            </button>
          </aside>
        </div>
      )}
      {create && (
        <div className="modal-backdrop" onClick={() => setCreate(false)}>
          <div
            className="create-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Новый заказ"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">УПРАВЛЕНИЕ ЗАКАЗАМИ</span>
                <h2>Новый заказ</h2>
              </div>
              <button className="icon-button" aria-label="Закрыть" onClick={() => setCreate(false)}>
                <Icon name="close" />
              </button>
            </div>
            <p>Заполните данные клиента и заказа.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget),
                  name = String(data.get('name'));
                const o: Order = {
                  id: Math.max(...orders.map((o) => o.id)) + 1,
                  name,
                  email: String(data.get('email')),
                  initials: name
                    .split(' ')
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase(),
                  color: 'lavender',
                  date: '24.10.2024',
                  status: 'Новый',
                  amount: Number(data.get('amount')),
                  items: Number(data.get('items')),
                  payment: 'Ожидает оплаты',
                  method: 'Банковская карта',
                };
                setOrders((os) => [o, ...os]);
                setCreate(false);
                setTab('Все заказы');
                setQuery('');
                setFilterStatus('Все статусы');
                setPaymentFilter('Любая оплата');
                setDateFilter('Все даты');
                setPage(1);
                setToast(`Заказ #${o.id} создан`);
              }}
            >
              <label>
                Имя клиента
                <input name="name" placeholder="Например, Анна Иванова" required autoFocus />
              </label>
              <label>
                Email
                <input name="email" type="email" placeholder="client@example.com" required />
              </label>
              <div className="form-row">
                <label>
                  Сумма заказа, ₽
                  <input name="amount" type="number" min="1" placeholder="0" required />
                </label>
                <label>
                  Количество товаров
                  <input name="items" type="number" min="1" defaultValue="1" required />
                </label>
              </div>
              <div className="modal-actions">
                <button className="button" type="button" onClick={() => setCreate(false)}>
                  Отмена
                </button>
                <button className="button primary" type="submit">
                  <Icon name="plus" size={17} />
                  Создать заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {popover === 'help' && (
        <div className="modal-backdrop" onClick={() => setPopover(null)}>
          <div
            className="create-modal help-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Центр поддержки"
          >
            <div className="drawer-heading">
              <h2>Как всё устроено</h2>
              <button className="icon-button" aria-label="Закрыть" onClick={() => setPopover(null)}>
                <Icon name="close" />
              </button>
            </div>
            <div>
              <h3>Работайте с заказами</h3>
              <p>
                Нажмите на номер заказа, чтобы открыть детали и изменить статус. Для массового
                изменения отметьте несколько строк.
              </p>
              <h3>Настройте таблицу</h3>
              <p>
                Перетаскивайте заголовки колонок, скрывайте ненужные через «Колонки» и группируйте
                заказы по статусу. Нажмите на заголовок, чтобы отсортировать строки.
              </p>
              <h3>Находите нужное</h3>
              <p>
                Используйте поиск по имени, email или номеру заказа. Фильтры помогут выбрать статус
                и состояние оплаты.
              </p>
            </div>
            <button className="button primary" onClick={() => setPopover(null)}>
              Всё понятно
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast('')}
            aria-label="Закрыть уведомление"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function Rows({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
