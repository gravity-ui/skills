import { useState, useMemo, useEffect, useCallback } from "react";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  Button,
  Icon,
  Text,
  TextInput,
  Select,
  Checkbox,
  Modal,
  DropdownMenu,
  Switch,
  configure,
} from "@gravity-ui/uikit";
import {
  Table,
  useTable,
  ColumnReorderingProvider,
  useRowSelectionFixedHandler,
} from "@gravity-ui/table";
import type {
  ColumnDef,
  RowSelectionState,
  ExpandedState,
  SortingState,
} from "@gravity-ui/table/tanstack";
import {
  House,
  Persons,
  ShoppingBag,
  Gear,
  Magnifier,
  Bell,
  Plus,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowChevronDown,
  ArrowChevronRight,
  ArrowChevronLeft,
  LayoutColumns,
  Sliders,
  CircleQuestion,
  CircleCheck,
  Clock,
  Xmark,
  Calendar,
  Layers,
  ArrowRight,
  CircleDollar,
  Receipt,
} from "@gravity-ui/icons";
import {
  initialOrders,
  statusInfo,
  money,
  initials,
  readSaved,
  type Order,
  type OrderStatus,
} from "./data";
import "./styles.css";

configure({ lang: "ru" });
const statusKeys = Object.keys(statusInfo) as OrderStatus[];
const navItems = [
  { id: "home", title: "Главная", icon: House },
  { id: "users", title: "Пользователи", icon: Persons },
  { id: "orders", title: "Заказы", icon: ShoppingBag },
  { id: "settings", title: "Настройки", icon: Gear },
];
const getSubRows = (order: Order) => order.items;
const getRowId = (order: Order) => order.id;
function BrandIcon() {
  return (
    <span className="brand-symbol">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
function Status({ status }: { status: OrderStatus }) {
  return (
    <span className={`status status-${status}`}>
      <i />
      {statusInfo[status].label}
    </span>
  );
}
function Avatar({ name, color = 0 }: { name: string; color?: number }) {
  return <span className={`avatar avatar-${color}`}>{initials(name)}</span>;
}

export function App() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 800
      ? true
      : readSaved("kontur-compact", false),
  );
  const [activePage, setActivePage] = useState("orders");
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = readSaved<unknown>("kontur-orders", null);
    return Array.isArray(saved) &&
      saved.every(
        (o) => typeof o.id === "string" && statusKeys.includes(o.status),
      )
      ? saved
      : initialOrders;
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [grouped, setGrouped] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    readSaved("kontur-columns", []),
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [dialog, setDialog] = useState<
    "new" | "columns" | "help" | "notifications" | null
  >(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [toast, setToast] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [amountFilter, setAmountFilter] = useState("all");
  const [form, setForm] = useState({
    customer: "",
    email: "",
    product: "",
    amount: "",
  });
  const [formError, setFormError] = useState("");
  const [shopName, setShopName] = useState(() =>
    readSaved("kontur-shop", "Мой магазин"),
  );
  const [shopDraft, setShopDraft] = useState(shopName);
  const [notifications, setNotifications] = useState(() =>
    readSaved("kontur-notifications", true),
  );
  const notify = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    localStorage.setItem("kontur-compact", JSON.stringify(compact));
  }, [compact]);
  useEffect(() => {
    localStorage.setItem("kontur-orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem("kontur-columns", JSON.stringify(columnOrder));
  }, [columnOrder]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setPage(1);
    setRowSelection({});
    setExpanded(true);
  }, [query, statusFilter, dateRange, amountFilter, pageSize]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>('[data-search="orders"]')
          ?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        statusKeys.map((s) => [s, orders.filter((o) => o.status === s).length]),
      ) as Record<OrderStatus, number>,
    [orders],
  );
  const filtered = useMemo(() => {
    const result = orders.filter((o) => {
      const match = `${o.id} ${o.customer} ${o.email} ${o.product}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const dateMatch =
        dateRange === "all" ||
        (dateRange === "today"
          ? o.date.slice(0, 10) === "2026-11-04"
          : new Date(o.date) >= new Date("2026-10-29"));
      return (
        match &&
        (statusFilter === "all" || o.status === statusFilter) &&
        dateMatch &&
        (amountFilter === "all" ||
          (amountFilter === "high" ? o.amount >= 20000 : o.amount < 20000))
      );
    });
    const sort = sorting[0];
    if (sort)
      result.sort((a, b) => {
        const av = a[sort.id as keyof Order];
        const bv = b[sort.id as keyof Order];
        return (
          (typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), "ru")) * (sort.desc ? -1 : 1)
        );
      });
    return result;
  }, [orders, query, statusFilter, dateRange, amountFilter, sorting]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageOrders = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );
  const tableData = useMemo<Order[]>(
    () =>
      grouped
        ? statusKeys.flatMap((status) => {
            const items = pageOrders.filter((o) => o.status === status);
            return items.length
              ? [
                  {
                    ...items[0],
                    id: `group-${status}`,
                    group: true,
                    status,
                    items,
                  },
                ]
              : [];
          })
        : pageOrders,
    [pageOrders, grouped],
  );
  const selectionHandler = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData,
    getSubRows,
    getRowId,
  });
  const selectedOrders = pageOrders.filter((o) => rowSelection[o.id]);
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "select",
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableSorting: false,
        enableColumnReordering: false,
        header: ({ table }) => (
          <Checkbox
            controlProps={{ "aria-label": "Выбрать все заказы на странице" }}
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            controlProps={{ "aria-label": `Выбрать заказ ${row.original.id}` }}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: "id",
        header: "№ заказа",
        size: 112,
        cell: ({ row }) => (
          <Button
            view="flat"
            className="order-link"
            onClick={() => setDetail(row.original)}
          >
            #{row.original.id}
          </Button>
        ),
      },
      {
        accessorKey: "customer",
        header: "Клиент",
        size: 224,
        cell: ({ row: { original: o } }) => (
          <div className="customer-cell">
            <Avatar name={o.customer} color={o.color} />
            <div className="cell-stack">
              <span className="customer-name">{o.customer}</span>
              <span className="secondary small">{o.email}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Дата",
        size: 108,
        cell: ({ row: { original: o } }) => (
          <div className="cell-stack">
            <span>
              {new Date(o.date)
                .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
                .replace(" г.", "")}
            </span>
            <span className="secondary small">
              {new Date(o.date).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "product",
        header: "Товары",
        size: 210,
        cell: ({ row: { original: o } }) => (
          <div className="cell-stack product-cell">
            <span>{o.product}</span>
            <span className="secondary small">
              {o.quantity} {o.quantity === 1 ? "товар" : "товара"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Сумма",
        size: 116,
        cell: ({ row }) => (
          <span className="order-amount">{money(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Статус",
        size: 145,
        cell: ({ row }) => <Status status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        size: 40,
        enableSorting: false,
        enableColumnReordering: false,
        cell: ({ row }) => (
          <DropdownMenu
            defaultSwitcherProps={{
              "aria-label": `Действия с заказом ${row.original.id}`,
              view: "flat",
            }}
            items={[
              { text: "Открыть заказ", action: () => setDetail(row.original) },
              {
                text: "Завершить заказ",
                action: () => updateStatus([row.original.id], "completed"),
              },
              {
                text: "Отменить заказ",
                theme: "danger",
                action: () => updateStatus([row.original.id], "cancelled"),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({
    columns,
    data: tableData,
    getRowId,
    getSubRows,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    manualSorting: true,
    onRowSelectionChange: selectionHandler,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    state: { rowSelection, expanded, sorting, columnOrder, columnVisibility },
  });
  function updateStatus(ids: string[], status: OrderStatus) {
    setOrders((previous) =>
      previous.map((o) => (ids.includes(o.id) ? { ...o, status } : o)),
    );
    setDetail((previous) =>
      previous && ids.includes(previous.id)
        ? { ...previous, status }
        : previous,
    );
    setRowSelection({});
    notify("Статус заказа обновлён");
  }
  function exportOrders() {
    const data = selectedOrders.length ? selectedOrders : filtered;
    const csv =
      "\uFEFF" +
      [
        ["№ заказа", "Клиент", "Email", "Товар", "Сумма", "Статус", "Дата"],
        ...data.map((o) => [
          o.id,
          o.customer,
          o.email,
          o.product,
          o.amount,
          statusInfo[o.status].label,
          new Date(o.date).toLocaleDateString("ru-RU"),
        ]),
      ]
        .map((row) =>
          row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(";"),
        )
        .join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    link.download = "Заказы.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    notify(`Экспортировано заказов: ${data.length}`);
  }
  function createOrder(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.customer.trim() ||
      !form.product.trim() ||
      !form.email.includes("@") ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setFormError(
        "Заполните имя, товар, корректный email и сумму больше нуля.",
      );
      return;
    }
    const order: Order = {
      id: String(Math.max(10248, ...orders.map((o) => Number(o.id))) + 1),
      ...form,
      customer: form.customer.trim(),
      product: form.product.trim(),
      email: form.email.trim(),
      quantity: 1,
      amount: Number(form.amount),
      date: new Date().toISOString(),
      status: "processing",
      color: orders.length % 6,
    };
    setOrders((previous) => [order, ...previous]);
    setForm({ customer: "", email: "", product: "", amount: "" });
    setFormError("");
    setDialog(null);
    setStatusFilter("all");
    setQuery("");
    setPage(1);
    setDateRange("all");
    setAmountFilter("all");
    setSorting([]);
    setExpanded(true);
    notify(`Заказ #${order.id} создан`);
  }
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.amount, 0);
  const metrics = [
    {
      label: "Всего заказов",
      value: orders.length.toLocaleString("ru-RU"),
      icon: ShoppingBag,
      change: "+12,8%",
      note: "за последний месяц",
      tone: "green",
      bars: [25, 42, 35, 52, 46, 65, 58, 80, 67, 90, 83, 100],
    },
    {
      label: "В обработке",
      value: counts.processing,
      icon: Clock,
      change: `${counts.shipping} в доставке`,
      note: "требуют внимания",
      tone: "orange",
      bars: [55, 70, 47, 65, 40, 58, 66, 45, 60, 50, 40, 54],
    },
    {
      label: "Выручка",
      value: money(revenue),
      icon: CircleDollar,
      change: "+18,4%",
      note: "за последний месяц",
      tone: "green",
      bars: [20, 35, 30, 48, 40, 60, 52, 65, 78, 70, 88, 100],
    },
    {
      label: "Средний чек",
      value: money(
        Math.round(revenue / (orders.length - counts.cancelled || 1)),
      ),
      icon: Receipt,
      change: "+4,9%",
      note: "за последний месяц",
      tone: "green",
      bars: [45, 30, 55, 45, 60, 52, 74, 64, 80, 70, 90, 85],
    },
  ];
  const pageTitle =
    navItems.find((i) => i.id === activePage)?.title || "Заказы";
  return (
    <>
      <AsideHeader
        className="app-shell"
        compact={compact}
        onChangeCompact={setCompact}
        collapseTitle="Свернуть меню"
        expandTitle="Развернуть меню"
        hideSectionDividers
        logo={{
          text: () => (
            <span className="brand-name">
              контур<span className="brand-admin">admin</span>
            </span>
          ),
          icon: BrandIcon,
          iconSize: 33,
          onClick: () => setActivePage("home"),
          "aria-label": "Контур — главная",
        }}
        aboveMenuContent={
          <div
            className={`workspace-block ${compact ? "workspace-compact" : ""}`}
          >
            {compact ? (
              <span className="shop-icon">
                <Icon data={ShoppingBag} size={17} />
              </span>
            ) : (
              <>
                <Button
                  view="outlined"
                  size="xl"
                  width="max"
                  className="workspace-switch"
                  onClick={() => setActivePage("settings")}
                >
                  <span className="shop-icon">
                    <Icon data={ShoppingBag} size={17} />
                  </span>
                  <span className="workspace-text">
                    {shopName}
                    <span>Рабочее пространство</span>
                  </span>
                  <Icon data={ArrowChevronDown} size={12} />
                </Button>
                <span className="nav-label">УПРАВЛЕНИЕ</span>
              </>
            )}
          </div>
        }
        menuItems={navItems.map((i) => ({
          ...i,
          iconSize: 19,
          current: activePage === i.id,
          onItemClick: () => setActivePage(i.id),
          rightAdornment:
            i.id === "orders" && !compact ? (
              <span className="nav-count">{orders.length}</span>
            ) : undefined,
          className: "navigation-item",
        }))}
        renderFooter={() => (
          <div className="sidebar-footer">
            {!compact && (
              <div className="help-card">
                <span className="help-mark">
                  <Icon data={Layers} size={21} />
                </span>
                <Text variant="subheader-1">Всё под контролем</Text>
                <p>
                  Меньше рутины.
                  <br />
                  Больше времени для бизнеса.
                </p>
                <Button
                  view="outlined"
                  size="m"
                  width="max"
                  onClick={() => setDialog("help")}
                >
                  Центр помощи <Icon data={ArrowUpRight} size={14} />
                </Button>
              </div>
            )}
            <Button
              view="flat"
              className="support-link"
              onClick={() => setDialog("help")}
            >
              <Icon data={CircleQuestion} size={18} />
              {!compact && "Помощь и поддержка"}
            </Button>
            <div className="sidebar-profile">
              <Avatar name="Алексей Ковалёв" color={4} />
              {!compact && (
                <>
                  <div className="cell-stack">
                    <strong>Алексей К.</strong>
                    <span className="secondary small">Администратор</span>
                  </div>
                  <DropdownMenu
                    defaultSwitcherProps={{
                      "aria-label": "Меню профиля",
                      view: "flat",
                    }}
                    items={[
                      {
                        text: "Настройки профиля",
                        action: () => setActivePage("settings"),
                      },
                      { text: "Помощь", action: () => setDialog("help") },
                    ]}
                  />
                </>
              )}
            </div>
          </div>
        )}
        renderContent={() => (
          <div className="main-layout">
            <header className="topbar">
              <div className="breadcrumbs">
                <span>Рабочее пространство</span>
                <Icon data={ArrowChevronRight} size={11} />
                <strong>{pageTitle}</strong>
              </div>
              <div className="topbar-actions">
                <Button
                  view="flat"
                  className="global-search"
                  onClick={() => {
                    setActivePage("orders");
                    setTimeout(
                      () =>
                        document
                          .querySelector<HTMLInputElement>(
                            '[data-search="orders"]',
                          )
                          ?.focus(),
                      50,
                    );
                  }}
                >
                  <Icon data={Magnifier} size={17} />
                  <span>Поиск</span>
                  <kbd>⌘ K</kbd>
                </Button>
                <span className="topbar-divider" />
                <Button
                  view="flat"
                  className="notification-button"
                  aria-label="Уведомления"
                  onClick={() => setDialog("notifications")}
                >
                  <Icon data={Bell} size={19} />
                  {notifications && <i />}
                </Button>
                <span className="header-avatar">
                  <Avatar name="Алексей Ковалёв" color={4} />
                </span>
              </div>
            </header>
            <main className="page-content">
              <div className="page-heading">
                <div>
                  <div className="heading-eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div>
                  <Text variant="display-1" as="h1">
                    {pageTitle}
                  </Text>
                  <p>
                    {activePage === "orders"
                      ? "Управляйте заказами и следите за каждым этапом."
                      : activePage === "home"
                        ? "Всё, что нужно знать о вашем магазине сегодня."
                        : activePage === "users"
                          ? "Ваши клиенты и история их покупок."
                          : "Настройте рабочее пространство под себя."}
                  </p>
                </div>
                <div className="heading-actions">
                  {activePage === "orders" && (
                    <>
                      <Button view="outlined" size="l" onClick={exportOrders}>
                        <Icon data={ArrowDownToLine} size={16} />
                        Экспорт
                      </Button>
                      <Button
                        view="action"
                        size="l"
                        onClick={() => {
                          setDialog("new");
                          setFormError("");
                        }}
                      >
                        <Icon data={Plus} size={17} />
                        Новый заказ
                      </Button>
                    </>
                  )}
                  {activePage === "home" && (
                    <Button
                      view="action"
                      size="l"
                      onClick={() => setActivePage("orders")}
                    >
                      Перейти к заказам <Icon data={ArrowRight} size={16} />
                    </Button>
                  )}
                </div>
              </div>
              {(activePage === "orders" || activePage === "home") && (
                <div className="metrics-grid">
                  {metrics.map((metric, index) => (
                    <section className="metric-card" key={metric.label}>
                      <div className="metric-top">
                        <span>{metric.label}</span>
                        <span className={`metric-icon metric-icon-${index}`}>
                          <Icon data={metric.icon} size={18} />
                        </span>
                      </div>
                      <div className="metric-value">
                        <Text variant="header-1">{metric.value}</Text>
                        <span
                          className={`mini-bars mini-bars-${index}`}
                          aria-hidden="true"
                        >
                          {metric.bars.map((h, i) => (
                            <i key={i} style={{ height: `${h}%` }} />
                          ))}
                        </span>
                      </div>
                      <div className="metric-bottom">
                        <span className={`metric-change ${metric.tone}`}>
                          {index !== 1 && (
                            <Icon data={ArrowUpRight} size={12} />
                          )}{" "}
                          {metric.change}
                        </span>
                        <span className="secondary">{metric.note}</span>
                      </div>
                    </section>
                  ))}
                </div>
              )}
              {activePage === "home" && (
                <section className="overview-panel">
                  <div className="section-heading">
                    <Text variant="header-2">Сегодня в магазине</Text>
                    <span className="live-indicator">
                      <i />
                      Данные обновлены
                    </span>
                  </div>
                  <div className="overview-stats">
                    {statusKeys.map((status) => (
                      <div key={status}>
                        <Status status={status} />
                        <Text variant="display-1">{counts[status]}</Text>
                        <Button
                          view="flat"
                          onClick={() => {
                            setStatusFilter(status);
                            setActivePage("orders");
                          }}
                        >
                          Посмотреть заказы <Icon data={ArrowRight} size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {activePage === "orders" && (
                <section className="orders-panel">
                  <div className="orders-title">
                    <div className="section-title">
                      <Text variant="header-2">Все заказы</Text>
                      <span className="neutral-count">{orders.length}</span>
                    </div>
                    <div className="live-indicator">
                      <i />
                      Обновлено только что
                    </div>
                  </div>
                  <div
                    className="status-tabs"
                    role="tablist"
                    aria-label="Статус заказа"
                  >
                    {["all", ...statusKeys].map((status) => (
                      <Button
                        key={status}
                        role="tab"
                        aria-selected={statusFilter === status}
                        view="flat"
                        className={`status-tab ${statusFilter === status ? "active" : ""}`}
                        onClick={() => setStatusFilter(status)}
                      >
                        {status === "all"
                          ? "Все заказы"
                          : statusInfo[status as OrderStatus].short}
                        <span className="tab-count">
                          {status === "all"
                            ? orders.length
                            : counts[status as OrderStatus]}
                        </span>
                      </Button>
                    ))}
                  </div>
                  <div className="table-toolbar">
                    <TextInput
                      className="order-search"
                      size="l"
                      placeholder="Найти заказ, клиента или товар"
                      value={query}
                      onUpdate={setQuery}
                      hasClear
                      startContent={<Icon data={Magnifier} size={16} />}
                      controlProps={
                        {
                          "aria-label": "Поиск заказов",
                          "data-search": "orders",
                        } as React.InputHTMLAttributes<HTMLInputElement>
                      }
                    />
                    <div className="table-tools">
                      <Button
                        view="outlined"
                        size="l"
                        selected={showFilters}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Icon data={Sliders} size={16} />
                        Фильтры
                        {amountFilter !== "all" && (
                          <span className="filter-dot" />
                        )}
                      </Button>
                      <Select
                        size="l"
                        className="date-select"
                        aria-label="Период заказов"
                        value={[dateRange]}
                        onUpdate={([v]) => setDateRange(v)}
                        options={[
                          {
                            value: "all",
                            content: (
                              <span className="select-option">
                                <Icon data={Calendar} size={15} />
                                Все даты
                              </span>
                            ),
                          },
                          { value: "today", content: "Сегодня, 4 ноября" },
                          { value: "week", content: "Последние 7 дней" },
                        ]}
                      />
                      <Button
                        view="outlined"
                        size="l"
                        aria-label="Настройка столбцов"
                        title="Настройка столбцов"
                        onClick={() => setDialog("columns")}
                      >
                        <Icon data={LayoutColumns} size={17} />
                      </Button>
                    </div>
                  </div>
                  {showFilters && (
                    <div className="filter-panel">
                      <span>Сумма заказа</span>
                      <Select
                        aria-label="Фильтр по сумме"
                        value={[amountFilter]}
                        onUpdate={([v]) => setAmountFilter(v)}
                        options={[
                          { value: "all", content: "Любая сумма" },
                          { value: "low", content: "До 20 000 ₽" },
                          { value: "high", content: "От 20 000 ₽" },
                        ]}
                      />
                      <Button
                        view="flat"
                        onClick={() => {
                          setAmountFilter("all");
                          setDateRange("all");
                          setStatusFilter("all");
                          setQuery("");
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                    </div>
                  )}
                  <div className="grouping-toolbar">
                    <div className="grouping-control">
                      <Icon data={Layers} size={15} />
                      <span>Группировка:</span>
                      <Select
                        view="clear"
                        size="s"
                        value={[grouped ? "status" : "none"]}
                        onUpdate={([v]) => {
                          setGrouped(v === "status");
                          setExpanded(true);
                          setRowSelection({});
                        }}
                        aria-label="Группировка заказов"
                        options={[
                          { value: "status", content: "Статус заказа" },
                          { value: "none", content: "Без группировки" },
                        ]}
                      />
                      {grouped && (
                        <Button
                          view="flat"
                          size="xs"
                          aria-label="Снять группировку"
                          onClick={() => setGrouped(false)}
                        >
                          <Icon data={Xmark} size={11} />
                        </Button>
                      )}
                    </div>
                    <span className="table-hint">
                      <Icon data={LayoutColumns} size={13} />
                      Перетаскивайте колонки, чтобы изменить порядок
                    </span>
                  </div>
                  {selectedOrders.length > 0 && (
                    <div className="selection-toolbar">
                      <strong>Выбрано: {selectedOrders.length}</strong>
                      <Select
                        placeholder="Изменить статус"
                        aria-label="Изменить статус выбранных заказов"
                        value={[]}
                        options={statusKeys.map((s) => ({
                          value: s,
                          content: statusInfo[s].label,
                        }))}
                        onUpdate={([v]) =>
                          updateStatus(
                            selectedOrders.map((o) => o.id),
                            v as OrderStatus,
                          )
                        }
                      />
                      <Button view="flat" onClick={exportOrders}>
                        <Icon data={ArrowDownToLine} size={15} />
                        Экспорт
                      </Button>
                      <Button
                        view="flat"
                        size="s"
                        aria-label="Снять выделение"
                        onClick={() => setRowSelection({})}
                      >
                        <Icon data={Xmark} size={15} />
                      </Button>
                    </div>
                  )}
                  <div className="table-scroll">
                    <ColumnReorderingProvider
                      table={table}
                      onReorder={({ columnOrder: next }) =>
                        setColumnOrder(next)
                      }
                    >
                      <Table
                        table={table}
                        className="orders-table"
                        size="m"
                        headerCellClassName="order-th"
                        cellClassName="order-td"
                        headerRowClassName="order-header-row"
                        rowClassName={(row) =>
                          `order-row ${row?.original.group ? "group-row" : ""} ${row?.getIsSelected() ? "is-selected" : ""}`
                        }
                        groupHeaderClassName="order-group-header"
                        getIsGroupHeaderRow={(row) =>
                          Boolean(row.original.group)
                        }
                        getGroupTitle={(row) => (
                          <span className="group-title">
                            <i
                              className={`group-dot dot-${row.original.status}`}
                            />
                            {statusInfo[row.original.status].short}
                          </span>
                        )}
                        renderGroupHeader={({ row }) => (
                          <div className="group-header-content">
                            <Button
                              view="flat"
                              size="s"
                              aria-expanded={row.getIsExpanded()}
                              onClick={row.getToggleExpandedHandler()}
                            >
                              <Icon
                                data={
                                  row.getIsExpanded()
                                    ? ArrowChevronDown
                                    : ArrowChevronRight
                                }
                                size={12}
                              />
                              <span className="group-title">
                                <i
                                  className={`group-dot dot-${row.original.status}`}
                                />
                                {statusInfo[row.original.status].short}
                              </span>
                              <span className="group-count">
                                {row.subRows.length}
                              </span>
                            </Button>
                            <span className="group-total">
                              {money(
                                (row.original.items || []).reduce(
                                  (sum, o) => sum + o.amount,
                                  0,
                                ),
                              )}
                            </span>
                          </div>
                        )}
                        emptyContent={
                          <div className="empty-state">
                            <Icon data={Magnifier} size={30} />
                            <Text variant="header-2">Заказы не найдены</Text>
                            <p>
                              Попробуйте другой запрос или измените фильтры.
                            </p>
                            <Button
                              view="outlined"
                              onClick={() => {
                                setQuery("");
                                setStatusFilter("all");
                                setDateRange("all");
                                setAmountFilter("all");
                              }}
                            >
                              Сбросить фильтры
                            </Button>
                          </div>
                        }
                      />
                    </ColumnReorderingProvider>
                  </div>
                  <div className="table-pagination">
                    <div className="pagination-summary">
                      {filtered.length
                        ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)}`
                        : "0"}{" "}
                      <span className="secondary">
                        из {filtered.length} заказов
                      </span>
                    </div>
                    <div className="pagination-controls">
                      <span className="secondary rows-label">
                        Строк на странице
                      </span>
                      <Select
                        aria-label="Строк на странице"
                        size="s"
                        width={62}
                        value={[String(pageSize)]}
                        onUpdate={([v]) => setPageSize(Number(v))}
                        options={[10, 20, 50].map((v) => ({
                          value: String(v),
                          content: String(v),
                        }))}
                      />
                      <div className="page-buttons">
                        <Button
                          view="flat"
                          size="s"
                          aria-label="Предыдущая страница"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setPage(currentPage - 1);
                            setRowSelection({});
                            setExpanded(true);
                          }}
                        >
                          <Icon data={ArrowChevronLeft} size={13} />
                        </Button>
                        {Array.from(
                          new Set([
                            1,
                            ...[
                              currentPage - 1,
                              currentPage,
                              currentPage + 1,
                            ].filter((v) => v > 1 && v < pageCount),
                            pageCount,
                          ]),
                        )
                          .sort((a, b) => a - b)
                          .map((v, i, pages) => (
                            <span key={v}>
                              {i > 0 && v - pages[i - 1] > 1 && (
                                <span className="pagination-ellipsis">…</span>
                              )}
                              <Button
                                view={currentPage === v ? "outlined" : "flat"}
                                size="s"
                                className={
                                  currentPage === v ? "current-page" : ""
                                }
                                onClick={() => {
                                  setPage(v);
                                  setRowSelection({});
                                  setExpanded(true);
                                }}
                                aria-label={`Страница ${v}`}
                                aria-current={
                                  currentPage === v ? "page" : undefined
                                }
                              >
                                {v}
                              </Button>
                            </span>
                          ))}
                        <Button
                          view="flat"
                          size="s"
                          aria-label="Следующая страница"
                          disabled={currentPage === pageCount}
                          onClick={() => {
                            setPage(currentPage + 1);
                            setRowSelection({});
                            setExpanded(true);
                          }}
                        >
                          <Icon data={ArrowChevronRight} size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {activePage === "users" && (
                <section className="users-panel">
                  <div className="section-heading">
                    <Text variant="header-2">Клиенты магазина</Text>
                    <span className="neutral-count">
                      {new Set(orders.map((o) => o.email)).size}
                    </span>
                  </div>
                  <TextInput
                    size="l"
                    value={query}
                    onUpdate={setQuery}
                    placeholder="Поиск по имени или email"
                    hasClear
                    startContent={<Icon data={Magnifier} size={17} />}
                    controlProps={{ "aria-label": "Поиск клиентов" }}
                  />
                  <div className="users-grid">
                    {Array.from(
                      new Map(orders.map((o) => [o.email, o])).values(),
                    )
                      .filter((o) =>
                        `${o.customer} ${o.email}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((o) => (
                        <div className="user-card" key={o.email}>
                          <Avatar name={o.customer} color={o.color} />
                          <Text variant="subheader-2">{o.customer}</Text>
                          <span className="secondary">{o.email}</span>
                          <div className="user-card-stats">
                            <span>
                              {orders.filter((x) => x.email === o.email).length}{" "}
                              заказов
                            </span>
                            <strong>
                              {money(
                                orders
                                  .filter((x) => x.email === o.email)
                                  .reduce((sum, x) => sum + x.amount, 0),
                              )}
                            </strong>
                          </div>
                          <Button
                            view="outlined"
                            onClick={() => {
                              setQuery(o.email);
                              setStatusFilter("all");
                              setDateRange("all");
                              setAmountFilter("all");
                              setActivePage("orders");
                            }}
                          >
                            История заказов <Icon data={ArrowRight} size={14} />
                          </Button>
                        </div>
                      ))}
                  </div>
                  {!orders.some((o) =>
                    `${o.customer} ${o.email}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  ) && <div className="empty-state">Клиенты не найдены</div>}
                </section>
              )}
              {activePage === "settings" && (
                <section className="settings-panel">
                  <Text variant="header-2">Рабочее пространство</Text>
                  <p className="secondary">
                    Основные настройки вашего магазина.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!shopDraft.trim()) return;
                      setShopName(shopDraft.trim());
                      localStorage.setItem(
                        "kontur-shop",
                        JSON.stringify(shopDraft.trim()),
                      );
                      localStorage.setItem(
                        "kontur-notifications",
                        JSON.stringify(notifications),
                      );
                      notify("Настройки сохранены");
                    }}
                  >
                    <label className="form-label">
                      Название магазина
                      <TextInput
                        size="l"
                        value={shopDraft}
                        onUpdate={setShopDraft}
                        controlProps={{
                          required: true,
                          "aria-label": "Название магазина",
                        }}
                      />
                    </label>
                    <div className="settings-row">
                      <div>
                        <Text variant="subheader-2">Уведомления о заказах</Text>
                        <p className="secondary">
                          Показывать индикатор новых событий.
                        </p>
                      </div>
                      <Switch
                        checked={notifications}
                        onUpdate={setNotifications}
                        controlProps={{ "aria-label": "Уведомления о заказах" }}
                      />
                    </div>
                    <div className="settings-row">
                      <div>
                        <Text variant="subheader-2">Компактная навигация</Text>
                        <p className="secondary">
                          Отображать только иконки разделов.
                        </p>
                      </div>
                      <Switch
                        checked={compact}
                        onUpdate={setCompact}
                        controlProps={{ "aria-label": "Компактная навигация" }}
                      />
                    </div>
                    <Button type="submit" view="action" size="l">
                      Сохранить изменения
                    </Button>
                  </form>
                </section>
              )}
              <footer className="page-footer">
                <span>© 2026 Контур. Пространство для вашего бизнеса.</span>
                <span>
                  <i />
                  Все системы работают
                </span>
              </footer>
            </main>
          </div>
        )}
      />
      {dialog && (
        <Modal
          open
          onOpenChange={(open) => !open && setDialog(null)}
          aria-label={
            dialog === "new"
              ? "Новый заказ"
              : dialog === "columns"
                ? "Настройка столбцов"
                : dialog === "help"
                  ? "Центр помощи"
                  : "Уведомления"
          }
        >
          <div className="modal-content">
            <div className="modal-heading">
              <Text variant="header-1">
                {dialog === "new"
                  ? "Новый заказ"
                  : dialog === "columns"
                    ? "Настройка столбцов"
                    : dialog === "help"
                      ? "Всегда на связи"
                      : "Уведомления"}
              </Text>
              <Button
                view="flat"
                aria-label="Закрыть окно"
                onClick={() => setDialog(null)}
              >
                <Icon data={Xmark} size={18} />
              </Button>
            </div>
            {dialog === "new" && (
              <form onSubmit={createOrder}>
                <p className="secondary">
                  Добавьте заказ — мы поможем следить за его статусом.
                </p>
                {(
                  [
                    {
                      key: "customer",
                      label: "Имя клиента",
                      placeholder: "Анна Смирнова",
                    },
                    {
                      key: "email",
                      label: "Email",
                      placeholder: "anna@example.ru",
                    },
                    {
                      key: "product",
                      label: "Название товара",
                      placeholder: "Например, наушники Sony",
                    },
                    { key: "amount", label: "Сумма, ₽", placeholder: "0" },
                  ] as const
                ).map((field) => (
                  <label className="form-label" key={field.key}>
                    {field.label}
                    <TextInput
                      size="l"
                      value={form[field.key]}
                      placeholder={field.placeholder}
                      type={
                        field.key === "email"
                          ? "email"
                          : field.key === "amount"
                            ? "number"
                            : "text"
                      }
                      onUpdate={(v) =>
                        setForm((prev) => ({ ...prev, [field.key]: v }))
                      }
                      controlProps={{
                        required: true,
                        min: field.key === "amount" ? "0.01" : undefined,
                        step: field.key === "amount" ? "0.01" : undefined,
                      }}
                    />
                  </label>
                ))}
                {formError && (
                  <p className="form-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="modal-actions">
                  <Button
                    size="l"
                    view="outlined"
                    onClick={() => setDialog(null)}
                  >
                    Отмена
                  </Button>
                  <Button size="l" view="action" type="submit">
                    Создать заказ
                  </Button>
                </div>
              </form>
            )}
            {dialog === "columns" && (
              <>
                <p className="secondary">
                  Выберите видимые столбцы. Чтобы изменить порядок, перетащите
                  заголовок в таблице.
                </p>
                <div className="column-options">
                  {table
                    .getAllLeafColumns()
                    .filter((c) => c.id !== "select" && c.id !== "actions")
                    .map((c) => (
                      <Checkbox
                        key={c.id}
                        checked={c.getIsVisible()}
                        onUpdate={(value) => c.toggleVisibility(value)}
                      >
                        {String(c.columnDef.header)}
                      </Checkbox>
                    ))}
                </div>
                <div className="modal-actions">
                  <Button
                    view="outlined"
                    onClick={() => {
                      setColumnOrder([]);
                      setColumnVisibility({});
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button view="action" onClick={() => setDialog(null)}>
                    Готово
                  </Button>
                </div>
              </>
            )}
            {dialog === "help" && (
              <>
                <div className="help-modal-icon">
                  <Icon data={CircleQuestion} size={35} />
                </div>
                <p>Контур помогает управлять заказами в одном месте.</p>
                <div className="help-instructions">
                  <p>
                    <strong>Выделение.</strong> Используйте чекбоксы, чтобы
                    менять статусы или экспортировать несколько заказов.
                  </p>
                  <p>
                    <strong>Колонки.</strong> Зажмите заголовок и перетащите
                    его. Кнопка столбцов позволяет скрыть лишнее.
                  </p>
                  <p>
                    <strong>Группировка.</strong> Выберите «Статус заказа» и
                    сворачивайте группы нажатием на заголовок.
                  </p>
                  <p>
                    <strong>Быстрый поиск.</strong> Нажмите Ctrl/⌘ + K, чтобы
                    найти заказ, клиента или товар.
                  </p>
                </div>
                <Button
                  view="action"
                  width="max"
                  size="l"
                  onClick={() => setDialog(null)}
                >
                  Всё понятно
                </Button>
              </>
            )}
            {dialog === "notifications" && (
              <>
                <p className="secondary">Последние события вашего магазина.</p>
                <div className="notification-entry">
                  <span className="notification-entry-icon">
                    <Icon data={ShoppingBag} size={20} />
                  </span>
                  <div>
                    <strong>Новые заказы ждут обработки</strong>
                    <p className="secondary">
                      В обработке: {counts.processing}. Самое время начать.
                    </p>
                    <Button
                      view="flat"
                      onClick={() => {
                        setActivePage("orders");
                        setStatusFilter("processing");
                        setQuery("");
                        setDialog(null);
                      }}
                    >
                      Посмотреть заказы <Icon data={ArrowRight} size={13} />
                    </Button>
                  </div>
                </div>
                <div className="notification-entry">
                  <span className="notification-entry-icon">
                    <Icon data={CircleCheck} size={20} />
                  </span>
                  <div>
                    <strong>Все системы работают стабильно</strong>
                    <p className="secondary">
                      Данные заказов сохранены в этом браузере.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {detail && (
        <Modal
          open
          onOpenChange={(open) => !open && setDetail(null)}
          aria-label={`Заказ ${detail.id}`}
        >
          <div className="modal-content">
            <div className="modal-heading">
              <Text variant="header-1">Заказ #{detail.id}</Text>
              <Button
                view="flat"
                aria-label="Закрыть заказ"
                onClick={() => setDetail(null)}
              >
                <Icon data={Xmark} size={18} />
              </Button>
            </div>
            <Status status={detail.status} />
            <div className="detail-customer">
              <Avatar name={detail.customer} color={detail.color} />
              <div className="cell-stack">
                <strong>{detail.customer}</strong>
                <span className="secondary">{detail.email}</span>
              </div>
            </div>
            <div className="detail-row">
              <span className="secondary">Товар</span>
              <strong>{detail.product}</strong>
            </div>
            <div className="detail-row">
              <span className="secondary">Количество товаров</span>
              <strong>{detail.quantity}</strong>
            </div>
            <div className="detail-row">
              <span className="secondary">Дата заказа</span>
              <span>{new Date(detail.date).toLocaleString("ru-RU")}</span>
            </div>
            <div className="detail-row total-row">
              <Text variant="subheader-2">Итого</Text>
              <Text variant="header-1">{money(detail.amount)}</Text>
            </div>
            <label className="form-label">
              Статус заказа
              <Select
                size="l"
                value={[detail.status]}
                options={statusKeys.map((s) => ({
                  value: s,
                  content: statusInfo[s].label,
                }))}
                onUpdate={([v]) => updateStatus([detail.id], v as OrderStatus)}
              />
            </label>
            <Button
              view="action"
              size="l"
              width="max"
              onClick={() => setDetail(null)}
            >
              Готово
            </Button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon data={CircleCheck} size={19} />
          {toast}
          <Button
            view="flat"
            size="s"
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
      )}
    </>
  );
}
