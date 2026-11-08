import { useEffect, useMemo, useState } from "react";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  Button,
  Checkbox,
  DropdownMenu,
  Icon,
  Modal,
  Select,
  Text,
  TextInput,
  configure,
} from "@gravity-ui/uikit";
import {
  Table,
  ColumnReorderingProvider,
  useTable,
  useRowSelectionFixedHandler,
} from "@gravity-ui/table";
import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
  SortingState,
} from "@gravity-ui/table/tanstack";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleQuestion,
  Clock,
  CreditCard,
  Ellipsis,
  Gear,
  House,
  Layers,
  LayoutColumns3,
  Magnifier,
  Persons,
  Plus,
  ShoppingBag,
  Sliders,
  Xmark,
} from "@gravity-ui/icons";
import {
  dateLabel,
  initialOrders,
  money,
  Order,
  Status,
  statuses,
} from "./orders";
import "./styles.css";

configure({ lang: "ru" });
const getSubRows = (order: Order) => order.children;
const getRowId = (order: Order) => order.id;
function stored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function BrandMark() {
  return (
    <span className="brand-mark">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge ${status}`}>
      <i />
      {statuses[status]}
    </span>
  );
}
function Payment({ value }: { value: Order["payment"] }) {
  return (
    <span className={`payment ${value}`}>
      <Icon
        data={
          value === "paid"
            ? CircleCheck
            : value === "pending"
              ? Clock
              : ArrowRight
        }
        size={14}
      />
      {value === "paid"
        ? "Оплачен"
        : value === "pending"
          ? "Ожидает оплаты"
          : "Возврат"}
    </span>
  );
}
function Customer({ order }: { order: Order }) {
  return (
    <div className="customer">
      <span className={`avatar ${order.color}`}>{order.initials}</span>
      <div>
        <span className="customer-name">{order.name}</span>
        <span className="customer-email">{order.email}</span>
      </div>
    </div>
  );
}

export function App() {
  const [compact, setCompact] = useState(() =>
    stored("orbit-compact", window.innerWidth < 800),
  );
  const [section, setSection] = useState("orders");
  const [orders, setOrders] = useState<Order[]>(() =>
    stored("orbit-orders", initialOrders),
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");
  const [grouped, setGrouped] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    stored("orbit-columns", [
      "select",
      "id",
      "name",
      "date",
      "amount",
      "status",
      "payment",
      "actions",
    ]),
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [modal, setModal] = useState<
    "new" | "filters" | "columns" | "help" | "notifications" | null
  >(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [draftPayment, setDraftPayment] = useState("all");
  const [draftAmount, setDraftAmount] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    amount: "",
    items: "1",
  });
  const [formError, setFormError] = useState("");
  const [shopName, setShopName] = useState(() =>
    stored("orbit-shop", "Мой магазин"),
  );
  useEffect(() => {
    localStorage.setItem("orbit-compact", JSON.stringify(compact));
  }, [compact]);
  useEffect(() => {
    localStorage.setItem("orbit-columns", JSON.stringify(columnOrder));
  }, [columnOrder]);
  useEffect(() => {
    localStorage.setItem("orbit-orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    setPage(1);
    setRowSelection({});
  }, [search, status, period, paymentFilter, minAmount, pageSize]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          `${o.id} ${o.name} ${o.email}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (period !== "today" || o.date === "2026-11-04") &&
          (paymentFilter === "all" || o.payment === paymentFilter) &&
          (!minAmount || o.amount >= Number(minAmount)),
      ),
    [orders, search, status, period, paymentFilter, minAmount],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const data = useMemo(() => {
    const source = filtered.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
    if (!grouped) return source;
    return (Object.keys(statuses) as Status[]).flatMap((s) => {
      const children = source.filter((o) => o.status === s);
      return children.length
        ? [{ ...children[0], id: `group-${s}`, children }]
        : [];
    });
  }, [filtered, currentPage, pageSize, grouped]);
  const changeStatus = (ids: string[], next: Status) => {
    setOrders((prev) =>
      prev.map((o) => (ids.includes(o.id) ? { ...o, status: next } : o)),
    );
    setRowSelection({});
    setDetail(null);
    setNotice(`Статус обновлён: ${statuses[next]}`);
  };
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "select",
        size: 44,
        enableSorting: false,
        enableColumnReordering: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Выбрать все заказы"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Выбрать заказ ${row.id}`}
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: "id",
        header: "Заказ",
        size: 122,
        cell: ({ row }) => (
          <Button
            className="order-link"
            view="flat"
            onClick={() => setDetail(row.original)}
          >
            #{row.original.id}
          </Button>
        ),
      },
      {
        accessorKey: "name",
        header: "Покупатель",
        size: 250,
        cell: ({ row }) => <Customer order={row.original} />,
      },
      {
        accessorKey: "date",
        header: "Дата",
        size: 140,
        cell: ({ row }) => (
          <div className="date-cell">
            <span>{dateLabel(row.original.date)}</span>
            <small>{row.original.time}</small>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Сумма",
        size: 130,
        cell: ({ row }) => (
          <div className="amount-cell">
            <strong>{money(row.original.amount)}</strong>
            <small>
              {row.original.items}{" "}
              {row.original.items === 1
                ? "товар"
                : row.original.items < 5
                  ? "товара"
                  : "товаров"}
            </small>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Статус",
        size: 152,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "payment",
        header: "Оплата",
        size: 154,
        cell: ({ row }) => <Payment value={row.original.payment} />,
      },
      {
        id: "actions",
        size: 44,
        enableSorting: false,
        enableColumnReordering: false,
        header: "",
        cell: ({ row }) => (
          <DropdownMenu
            defaultSwitcherProps={{
              view: "flat",
              "aria-label": `Действия с заказом ${row.id}`,
            }}
            items={[
              { text: "Открыть заказ", action: () => setDetail(row.original) },
              {
                text: "Отметить выполненным",
                action: () => changeStatus([row.id], "completed"),
              },
              {
                text: "Отменить заказ",
                action: () => changeStatus([row.id], "cancelled"),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const selectionHandler = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });
  const table = useTable({
    columns,
    data,
    getRowId,
    getSubRows,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    onExpandedChange: setExpanded,
    onRowSelectionChange: selectionHandler,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    state: { expanded, rowSelection, sorting, columnOrder, columnVisibility },
  });
  const selectedIds = orders.filter((o) => rowSelection[o.id]).map((o) => o.id);
  const exportCsv = () => {
    const source = selectedIds.length
      ? filtered.filter((o) => selectedIds.includes(o.id))
      : filtered;
    const rows = [
      ["Заказ", "Покупатель", "Email", "Дата", "Сумма", "Статус", "Оплата"],
      ...source.map((o) => [
        o.id,
        o.name,
        o.email,
        o.date,
        o.amount,
        statuses[o.status],
        o.payment,
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((r) =>
          r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Заказы.csv";
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Экспортировано заказов: ${source.length}`);
  };
  const addOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0 ||
      !Number.isInteger(Number(form.items)) ||
      Number(form.items) < 1
    ) {
      setFormError(
        "Укажите имя, корректный email, сумму и количество товаров.",
      );
      return;
    }
    const id = String(Math.max(...orders.map((o) => Number(o.id))) + 1);
    setOrders((prev) => [
      {
        id,
        name: form.name.trim(),
        email: form.email.trim(),
        amount: Number(form.amount),
        items: Number(form.items),
        initials: form.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        color: "violet",
        date: "2026-11-04",
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "new",
        payment: "pending",
        method: "Банковская карта",
      },
      ...prev,
    ]);
    setModal(null);
    setForm({ name: "", email: "", amount: "", items: "1" });
    setFormError("");
    setStatus("all");
    setSearch("");
    setPage(1);
    setNotice(`Заказ #${id} создан`);
  };
  const stats = [
    {
      label: "Всего заказов",
      value: orders.length.toLocaleString("ru-RU"),
      trend: "12,8%",
      caption: "по сравнению с октябрём",
      icon: ShoppingBag,
      tone: "violet",
    },
    {
      label: "Выручка",
      value: money(
        orders
          .filter((o) => o.payment === "paid")
          .reduce((s, o) => s + o.amount, 0),
      ),
      trend: "18,6%",
      caption: "по сравнению с октябрём",
      icon: CreditCard,
      tone: "green",
    },
    {
      label: "В обработке",
      value: String(orders.filter((o) => o.status === "processing").length),
      trend: "",
      caption: "Заказы ожидают отправки",
      icon: Clock,
      tone: "orange",
    },
    {
      label: "Выполнено",
      value: String(orders.filter((o) => o.status === "completed").length),
      trend: "8,2%",
      caption: "по сравнению с октябрём",
      icon: CircleCheck,
      tone: "blue",
    },
  ];
  const sectionNames: Record<string, string> = {
    home: "Главная",
    users: "Пользователи",
    orders: "Заказы",
    settings: "Настройки",
  };
  const renderContent = () => (
    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumbs">
          <span>Рабочее пространство</span>
          <ChevronRight width={13} />
          <strong>{sectionNames[section]}</strong>
        </div>
        <div className="topbar-right">
          <span className="live-dot" />
          <span className="live-label">Магазин работает</span>
          <span className="topbar-divider" />
          <Button
            view="flat"
            aria-label="Уведомления"
            className="notification-button"
            onClick={() => setModal("notifications")}
          >
            <Icon data={Bell} size={19} />
            <i />
          </Button>
          <span className="top-avatar">АК</span>
        </div>
      </header>
      <main className="main-content">
        <div className="page-heading">
          <div>
            <div className="heading-line">
              <Text variant="display-1">
                {section === "home" ? "Обзор магазина" : sectionNames[section]}
              </Text>
              {section === "orders" && (
                <span className="page-badge">Управление заказами</span>
              )}
            </div>
            <p>
              {section === "users"
                ? "Ваши покупатели и история взаимодействий с магазином."
                : section === "settings"
                  ? "Настройте магазин под свой бизнес."
                  : "Все заказы под контролем — от оформления до доставки."}
            </p>
          </div>
          <div className="heading-actions">
            <Button view="outlined" size="l" onClick={exportCsv}>
              <Icon data={ArrowDownToLine} size={16} />
              Экспорт
            </Button>
            <Button
              view="action"
              size="l"
              onClick={() => {
                setFormError("");
                setModal("new");
              }}
            >
              <Icon data={Plus} size={16} />
              Новый заказ
            </Button>
          </div>
        </div>
        {(section === "orders" || section === "home") && (
          <>
            <div className="overview-caption">
              <span>Обзор за ноябрь</span>
              <span>
                <span className="tiny-dot" />
                Обновлено только что
              </span>
            </div>
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div className="stat-card" key={stat.label}>
                  <div className="stat-card-top">
                    <span>{stat.label}</span>
                    <span className={`stat-icon ${stat.tone}`}>
                      <Icon data={stat.icon} size={19} />
                    </span>
                  </div>
                  <Text variant="display-1" className="stat-value">
                    {stat.value}
                  </Text>
                  <div className="stat-bottom">
                    {stat.trend && (
                      <span className="trend">
                        <Icon data={ArrowUpRight} size={13} />
                        {stat.trend}
                      </span>
                    )}
                    <span>
                      {i === 2 && <i className="orange-dot" />}
                      {stat.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <section className="orders-panel">
              <div className="panel-title">
                <div>
                  <Text variant="subheader-3">Все заказы</Text>
                  <span className="count-pill">{orders.length}</span>
                </div>
                <span className="panel-description">
                  Управляйте заказами вашего магазина
                </span>
              </div>
              <div
                className="status-tabs"
                role="tablist"
                aria-label="Статус заказов"
              >
                {[
                  ["all", "Все заказы"],
                  ...Object.entries(statuses).map(([k, v]) => [
                    k,
                    k === "new"
                      ? "Новые"
                      : k === "completed"
                        ? "Выполненные"
                        : k === "cancelled"
                          ? "Отменённые"
                          : v,
                  ]),
                ].map(([key, label]) => (
                  <Button
                    key={key}
                    role="tab"
                    aria-selected={status === key}
                    view="flat"
                    className={`status-tab ${status === key ? "active" : ""}`}
                    onClick={() => setStatus(key)}
                  >
                    {label}
                    <span>
                      {key === "all"
                        ? orders.length
                        : orders.filter((o) => o.status === key).length}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="table-toolbar">
                <TextInput
                  className="order-search"
                  size="l"
                  placeholder="Поиск по номеру, имени или email"
                  value={search}
                  onUpdate={setSearch}
                  hasClear
                  startContent={<Icon data={Magnifier} size={16} />}
                  controlProps={{ "aria-label": "Поиск заказов" }}
                />
                <div className="toolbar-actions">
                  <Select
                    size="l"
                    value={[period]}
                    onUpdate={(v) => setPeriod(v[0])}
                    options={[
                      { value: "all", content: "За всё время" },
                      { value: "today", content: "Сегодня, 4 ноября" },
                    ]}
                    renderControl={({ triggerProps, ref }) => (
                      <Button
                        {...triggerProps}
                        ref={ref as React.Ref<HTMLButtonElement>}
                        size="l"
                        view="outlined"
                      >
                        <Icon data={Calendar} size={15} />
                        {period === "all" ? "За всё время" : "Сегодня"}
                        <Icon data={ChevronDown} size={12} />
                      </Button>
                    )}
                  />
                  <Button
                    view="outlined"
                    size="l"
                    selected={paymentFilter !== "all" || !!minAmount}
                    onClick={() => {
                      setDraftPayment(paymentFilter);
                      setDraftAmount(minAmount);
                      setModal("filters");
                    }}
                  >
                    <Icon data={Sliders} size={15} />
                    Фильтры
                    {(paymentFilter !== "all" || !!minAmount) && (
                      <span className="filter-dot" />
                    )}
                  </Button>
                  <span className="toolbar-separator" />
                  <Button
                    view="outlined"
                    size="l"
                    selected={grouped}
                    className={grouped ? "group-button" : ""}
                    onClick={() => {
                      setGrouped(!grouped);
                      setExpanded(true);
                    }}
                  >
                    <Icon data={Layers} size={15} />
                    <span className="group-label">По статусу</span>
                  </Button>
                  <Button
                    size="l"
                    view="outlined"
                    aria-label="Настроить колонки"
                    onClick={() => setModal("columns")}
                  >
                    <Icon data={LayoutColumns3} size={16} />
                  </Button>
                </div>
              </div>
              {selectedIds.length > 0 && (
                <div className="selection-bar">
                  <Checkbox checked onUpdate={() => setRowSelection({})} />
                  <strong>Выбрано: {selectedIds.length}</strong>
                  <Button
                    view="flat"
                    onClick={() => changeStatus(selectedIds, "completed")}
                  >
                    Завершить заказы
                  </Button>
                  <Button view="flat" onClick={exportCsv}>
                    Экспортировать
                  </Button>
                  <Button
                    view="flat"
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
                  onReorder={({ columnOrder: next }) => setColumnOrder(next)}
                >
                  <Table
                    table={table}
                    className="orders-table"
                    size="m"
                    verticalAlign="middle"
                    headerCellClassName="order-th"
                    cellClassName="order-td"
                    cellAttributes={(cell) =>
                      !cell ? { style: { padding: 0 } } : {}
                    }
                    rowClassName={(row) =>
                      `order-row ${row?.getIsSelected() ? "is-selected" : ""} ${row?.subRows.length ? "group-row" : ""}`
                    }
                    groupHeaderClassName="order-group"
                    getIsGroupHeaderRow={(row) =>
                      Boolean(row.original.children?.length)
                    }
                    renderGroupHeader={({ row, getGroupTitle }) => (
                      <div className="group-controls">
                        <Checkbox
                          aria-label="Выбрать группу заказов"
                          checked={row.getIsSelected()}
                          indeterminate={row.getIsSomeSelected()}
                          onChange={row.getToggleSelectedHandler()}
                        />
                        <Button
                          view="flat"
                          className="group-toggle"
                          aria-expanded={row.getIsExpanded()}
                          onClick={row.getToggleExpandedHandler()}
                        >
                          <Icon
                            data={
                              row.getIsExpanded() ? ChevronDown : ChevronRight
                            }
                            size={13}
                          />
                          {getGroupTitle?.(row)}
                        </Button>
                      </div>
                    )}
                    getGroupTitle={(row) => (
                      <span className="group-title">
                        <span className={`group-dot ${row.original.status}`} />
                        {row.original.status === "new"
                          ? "Новые заказы"
                          : row.original.status === "processing"
                            ? "В обработке"
                            : row.original.status === "completed"
                              ? "Выполненные"
                              : "Отменённые"}
                        <span className="group-count">
                          {row.subRows.length}
                        </span>
                      </span>
                    )}
                    emptyContent={
                      <div className="empty-state">
                        <Icon data={Magnifier} size={30} />
                        <Text variant="subheader-2">Заказы не найдены</Text>
                        <p>Измените поисковый запрос или сбросьте фильтры</p>
                        <Button
                          view="outlined"
                          onClick={() => {
                            setSearch("");
                            setStatus("all");
                            setPaymentFilter("all");
                            setMinAmount("");
                            setPeriod("all");
                          }}
                        >
                          Сбросить фильтры
                        </Button>
                      </div>
                    }
                    stickyHeader
                  />
                </ColumnReorderingProvider>
              </div>
              <div className="table-footer">
                <div className="page-summary">
                  Показано{" "}
                  <strong>
                    {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                    {Math.min(currentPage * pageSize, filtered.length)}
                  </strong>{" "}
                  из <strong>{filtered.length}</strong> заказов
                </div>
                <div className="pagination">
                  <span className="per-page-label">На странице</span>
                  <Select
                    size="m"
                    value={[String(pageSize)]}
                    onUpdate={(v) => setPageSize(Number(v[0]))}
                    options={[12, 24, 48].map((n) => ({
                      value: String(n),
                      content: String(n),
                    }))}
                  />
                  <span className="pagination-divider" />
                  <Button
                    view="flat"
                    disabled={currentPage === 1}
                    aria-label="Предыдущая страница"
                    onClick={() => {
                      setPage((p) => p - 1);
                      setExpanded(true);
                    }}
                  >
                    <Icon data={ChevronLeft} size={16} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPages ||
                        Math.abs(n - currentPage) <= 1,
                    )
                    .map((n) => (
                      <Button
                        key={n}
                        view={n === currentPage ? "outlined" : "flat"}
                        selected={n === currentPage}
                        className={n === currentPage ? "current-page" : ""}
                        onClick={() => {
                          setPage(n);
                          setExpanded(true);
                        }}
                      >
                        {n}
                      </Button>
                    ))}
                  <Button
                    view="flat"
                    disabled={currentPage >= totalPages}
                    aria-label="Следующая страница"
                    onClick={() => {
                      setPage((p) => p + 1);
                      setExpanded(true);
                    }}
                  >
                    <Icon data={ChevronRight} size={16} />
                  </Button>
                </div>
              </div>
            </section>
            <div className="under-table">
              <span>
                <Icon data={LayoutColumns3} size={13} />
                Перетащите заголовок, чтобы изменить порядок колонок
              </span>
              <span>
                <span className="tiny-dot" />
                Все изменения сохраняются автоматически
              </span>
            </div>
          </>
        )}
        {section === "users" && (
          <section className="users-panel">
            <TextInput
              size="l"
              placeholder="Найти покупателя"
              value={search}
              onUpdate={setSearch}
              startContent={<Icon data={Magnifier} />}
              hasClear
            />
            <div className="user-list">
              {Array.from(new Map(orders.map((o) => [o.email, o])).values())
                .filter((o) =>
                  `${o.name} ${o.email}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((o) => (
                  <div className="user-list-row" key={o.email}>
                    <Customer order={o} />
                    <span>
                      {orders.filter((x) => x.email === o.email).length} заказа
                    </span>
                    <strong>
                      {money(
                        orders
                          .filter((x) => x.email === o.email)
                          .reduce((s, x) => s + x.amount, 0),
                      )}
                    </strong>
                    <Button
                      view="outlined"
                      onClick={() => {
                        setSection("orders");
                        setSearch(o.email);
                      }}
                    >
                      Заказы
                      <Icon data={ChevronRight} size={14} />
                    </Button>
                  </div>
                ))}
            </div>
          </section>
        )}
        {section === "settings" && (
          <section className="settings-panel">
            <Text variant="subheader-3">Основные настройки</Text>
            <p>Информация о вашем магазине</p>
            <label>
              Название магазина
              <TextInput size="l" value={shopName} onUpdate={setShopName} />
            </label>
            <label>
              Валюта
              <Select
                size="l"
                value={["rub"]}
                options={[{ value: "rub", content: "Российский рубль (₽)" }]}
              />
            </label>
            <Button
              view="action"
              size="l"
              onClick={() => {
                localStorage.setItem("orbit-shop", JSON.stringify(shopName));
                setNotice("Настройки магазина сохранены");
              }}
            >
              Сохранить изменения
            </Button>
          </section>
        )}
        <footer className="page-footer">
          <span>© 2026 Orbit. Пространство для вашего бизнеса.</span>
          <span>
            Есть идеи?{" "}
            <Button view="flat" onClick={() => setModal("help")}>
              Напишите нам
              <Icon data={ArrowUpRight} size={12} />
            </Button>
          </span>
        </footer>
      </main>
    </div>
  );

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
          text: "orbit",
          icon: BrandMark,
          iconSize: 31,
          textSize: 27,
          className: "app-logo",
          onClick: () => setSection("home"),
        }}
        aboveMenuContent={
          <div className={`sidebar-intro ${compact ? "compact" : ""}`}>
            {!compact && (
              <>
                <Button
                  className="workspace-switch"
                  view="outlined"
                  size="xl"
                  width="max"
                  onClick={() => setSection("settings")}
                >
                  <span className="shop-avatar">
                    <ShoppingBag width={18} />
                  </span>
                  <span className="shop-info">
                    <strong>{shopName}</strong>
                    <small>Рабочее пространство</small>
                  </span>
                  <Icon data={ChevronDown} size={13} />
                </Button>
                <span className="nav-caption">УПРАВЛЕНИЕ</span>
              </>
            )}
          </div>
        }
        menuItems={[
          { id: "home", title: "Главная", icon: House },
          { id: "users", title: "Пользователи", icon: Persons },
          {
            id: "orders",
            title: "Заказы",
            icon: ShoppingBag,
            rightAdornment: !compact ? (
              <span className="nav-count">{orders.length}</span>
            ) : undefined,
          },
          { id: "settings", title: "Настройки", icon: Gear },
        ].map((item) => ({
          ...item,
          current: section === item.id,
          className: "nav-item",
          onItemClick: () => {
            setSection(item.id);
            setSearch("");
          },
        }))}
        renderFooter={() => (
          <div className={`sidebar-footer ${compact ? "compact" : ""}`}>
            {!compact && (
              <div className="help-card">
                <span className="help-card-icon">
                  <CircleQuestion width={19} />
                </span>
                <strong>Всегда на связи</strong>
                <p>
                  Поможем разобраться
                  <br />с любым вопросом
                </p>
                <Button
                  view="outlined"
                  size="m"
                  width="max"
                  onClick={() => setModal("help")}
                >
                  Связаться с поддержкой
                  <Icon data={ArrowUpRight} size={13} />
                </Button>
              </div>
            )}
            <Button
              className="sidebar-help"
              view="flat"
              width="max"
              onClick={() => setModal("help")}
            >
              <Icon data={CircleQuestion} size={18} />
              {!compact && "Помощь и поддержка"}
            </Button>
            <div className="sidebar-account">
              <span className="account-avatar">АК</span>
              {!compact && (
                <div>
                  <strong>Алексей Кузнецов</strong>
                  <small>Администратор</small>
                </div>
              )}
            </div>
          </div>
        )}
        renderContent={renderContent}
      />
      <Modal
        open={modal !== null}
        onOpenChange={(open) => !open && setModal(null)}
        contentClassName="app-modal"
      >
        <div className="modal-header">
          <Text variant="header-2">
            {modal === "new"
              ? "Новый заказ"
              : modal === "filters"
                ? "Фильтры заказов"
                : modal === "columns"
                  ? "Колонки таблицы"
                  : modal === "notifications"
                    ? "Уведомления"
                    : "Помощь и поддержка"}
          </Text>
          <Button
            view="flat"
            aria-label="Закрыть"
            onClick={() => setModal(null)}
          >
            <Icon data={Xmark} size={18} />
          </Button>
        </div>
        {modal === "new" && (
          <form className="order-form" onSubmit={addOrder}>
            <p className="modal-description">
              Создайте заказ — он появится в списке новых.
            </p>
            <label>
              Покупатель
              <TextInput
                autoFocus
                size="l"
                placeholder="Имя и фамилия"
                value={form.name}
                onUpdate={(v) => setForm({ ...form, name: v })}
              />
            </label>
            <label>
              Email
              <TextInput
                size="l"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onUpdate={(v) => setForm({ ...form, email: v })}
              />
            </label>
            <div className="form-row">
              <label>
                Сумма, ₽
                <TextInput
                  size="l"
                  type="number"
                  value={form.amount}
                  onUpdate={(v) => setForm({ ...form, amount: v })}
                  controlProps={{ min: 1, step: "0.01" }}
                />
              </label>
              <label>
                Товаров
                <TextInput
                  size="l"
                  type="number"
                  value={form.items}
                  onUpdate={(v) => setForm({ ...form, items: v })}
                  controlProps={{ min: 1 }}
                />
              </label>
            </div>
            {formError && <p className="form-error">{formError}</p>}
            <div className="modal-actions">
              <Button size="l" view="outlined" onClick={() => setModal(null)}>
                Отмена
              </Button>
              <Button size="l" view="action" type="submit">
                Создать заказ
              </Button>
            </div>
          </form>
        )}
        {modal === "filters" && (
          <div className="order-form">
            <p className="modal-description">
              Показывайте только нужные вам заказы.
            </p>
            <label>
              Оплата
              <Select
                size="l"
                width="max"
                value={[draftPayment]}
                onUpdate={(v) => setDraftPayment(v[0])}
                options={[
                  { value: "all", content: "Любая оплата" },
                  { value: "paid", content: "Оплачен" },
                  { value: "pending", content: "Ожидает оплаты" },
                  { value: "refunded", content: "Возврат" },
                ]}
              />
            </label>
            <label>
              Минимальная сумма, ₽
              <TextInput
                size="l"
                type="number"
                value={draftAmount}
                onUpdate={setDraftAmount}
                placeholder="Например, 5000"
                controlProps={{ min: 0 }}
              />
            </label>
            <div className="modal-actions">
              <Button
                size="l"
                view="flat"
                onClick={() => {
                  setDraftPayment("all");
                  setDraftAmount("");
                }}
              >
                Сбросить
              </Button>
              <Button
                size="l"
                view="action"
                onClick={() => {
                  setPaymentFilter(draftPayment);
                  setMinAmount(draftAmount);
                  setModal(null);
                }}
              >
                Применить фильтры
              </Button>
            </div>
          </div>
        )}
        {modal === "columns" && (
          <div className="order-form">
            <p className="modal-description">
              Выберите видимые колонки. Для изменения порядка перетащите
              заголовок в таблице.
            </p>
            {table
              .getAllLeafColumns()
              .filter((c) => !["select", "actions"].includes(c.id))
              .map((c) => (
                <Checkbox
                  key={c.id}
                  checked={c.getIsVisible()}
                  onUpdate={(v) => c.toggleVisibility(v)}
                >
                  {String(c.columnDef.header)}
                </Checkbox>
              ))}
            <Button
              size="l"
              view="outlined"
              onClick={() => {
                setColumnVisibility({});
                setColumnOrder([
                  "select",
                  "id",
                  "name",
                  "date",
                  "amount",
                  "status",
                  "payment",
                  "actions",
                ]);
              }}
            >
              Восстановить по умолчанию
            </Button>
            <Button size="l" view="action" onClick={() => setModal(null)}>
              Готово
            </Button>
          </div>
        )}
        {modal === "help" && (
          <div className="support-content">
            <span className="support-icon">
              <Icon data={CircleQuestion} size={32} />
            </span>
            <Text variant="subheader-3">Давайте разберёмся вместе</Text>
            <p>
              Выделяйте заказы чекбоксами, перетаскивайте заголовки колонок и
              нажимайте «По статусу», чтобы включить группировку. Нажмите на
              номер заказа, чтобы посмотреть подробности.
            </p>
            <Button size="l" view="action" href="mailto:support@orbit.example">
              Написать в поддержку
            </Button>
            <small>support@orbit.example · Пн–Пт, 9:00–18:00</small>
          </div>
        )}
        {modal === "notifications" && (
          <div className="notifications-content">
            <div className="notification-entry">
              <span className="stat-icon violet">
                <ShoppingBag width={18} />
              </span>
              <div>
                <strong>Есть новые заказы</strong>
                <p>
                  {orders.filter((o) => o.status === "new").length} заказов
                  ожидают обработки
                </p>
                <Button
                  view="flat"
                  onClick={() => {
                    setSection("orders");
                    setStatus("new");
                    setModal(null);
                  }}
                >
                  Посмотреть заказы
                  <Icon data={ArrowRight} size={14} />
                </Button>
              </div>
            </div>
            <div className="notification-entry">
              <span className="stat-icon green">
                <Check width={18} />
              </span>
              <div>
                <strong>Всё под контролем</strong>
                <p>Данные магазина актуальны</p>
                <small>Только что</small>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        contentClassName="app-modal"
      >
        {detail && (
          <>
            <div className="modal-header">
              <Text variant="header-2">Заказ #{detail.id}</Text>
              <Button
                view="flat"
                aria-label="Закрыть заказ"
                onClick={() => setDetail(null)}
              >
                <Icon data={Xmark} size={18} />
              </Button>
            </div>
            <div className="order-detail">
              <StatusBadge status={detail.status} />
              <Customer order={detail} />
              <dl>
                <div>
                  <dt>Дата оформления</dt>
                  <dd>
                    {dateLabel(detail.date)}, {detail.time}
                  </dd>
                </div>
                <div>
                  <dt>Количество товаров</dt>
                  <dd>{detail.items}</dd>
                </div>
                <div>
                  <dt>Способ оплаты</dt>
                  <dd>{detail.method}</dd>
                </div>
                <div>
                  <dt>Оплата</dt>
                  <dd>
                    <Payment value={detail.payment} />
                  </dd>
                </div>
                <div className="detail-total">
                  <dt>Сумма заказа</dt>
                  <dd>{money(detail.amount)}</dd>
                </div>
              </dl>
              <Select
                size="l"
                width="max"
                label="Статус:"
                value={[detail.status]}
                onUpdate={(v) => changeStatus([detail.id], v[0] as Status)}
                options={Object.entries(statuses).map(([value, content]) => ({
                  value,
                  content,
                }))}
              />
              <Button view="action" size="l" onClick={() => setDetail(null)}>
                Готово
              </Button>
            </div>
          </>
        )}
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <span>
            <Icon data={CircleCheck} size={20} />
          </span>
          {notice}
          <Button
            view="flat"
            aria-label="Закрыть уведомление"
            onClick={() => setNotice("")}
          >
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
      )}
    </>
  );
}
