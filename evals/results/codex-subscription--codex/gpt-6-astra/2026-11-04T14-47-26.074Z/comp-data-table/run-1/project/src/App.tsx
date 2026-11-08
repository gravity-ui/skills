import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "building"
  | "star"
  | "archive"
  | "chevron"
  | "plus"
  | "search"
  | "filter"
  | "columns"
  | "download"
  | "arrow"
  | "more"
  | "close"
  | "check"
  | "help"
  | "settings"
  | "logout"
  | "arrowUp"
  | "mail"
  | "external";
function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    building: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-5 6v-3h4v3" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <path d="M5 8v12h14V8m-10 5h6" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.7" cy="10.7" r="6.7" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="8" cy="7" r="2" fill="currentColor" />
        <circle cx="16" cy="17" r="2" fill="currentColor" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m6-16v16" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />
      </>
    ),
    arrow: <path d="M12 4v16m-5-5 5 5 5-5" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 4h.01" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 3h3l1-3 3-1 2-3-2-2 1-3-2-3-3 1-2-3H9Z" />
        <circle cx="11.5" cy="11.5" r="3" />
      </>
    ),
    logout: (
      <>
        <path d="M9 3H4v18h5m5-5 5-4-5-4m-6 4h11" />
      </>
    ),
    arrowUp: <path d="M6 17 17 6M6 6h11v11" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />
      </>
    ),
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
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
type Status = "Активный" | "Новый" | "Неактивный";
type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  companyColor: string;
  status: Status;
  amount: number;
  date: string;
  owner: string;
  favorite: boolean;
  archived: boolean;
};
const people = [
  ["Александр Иванов", "alex.ivanov@gmail.com", "Точка", "АИ"],
  ["Мария Петрова", "m.petrova@yandex.ru", "Яндекс", "МП"],
  ["Дмитрий Соколов", "d.sokolov@ozon.ru", "Ozon", "ДС"],
  ["Анна Смирнова", "anna.smirnova@mail.ru", "Самокат", "АС"],
  ["Михаил Кузнецов", "m.kuznetsov@avito.ru", "Авито", "МК"],
  ["Екатерина Волкова", "kate.volkova@gmail.com", "Сбер", "ЕВ"],
  ["Артём Новиков", "artem.novikov@tbank.ru", "Т-Банк", "АН"],
  ["Ольга Морозова", "o.morozova@yandex.ru", "VK", "ОМ"],
  ["Иван Лебедев", "ivan.lebedev@mail.ru", "МТС", "ИЛ"],
  ["София Козлова", "sofia.kozlova@gmail.com", "Точка", "СК"],
  ["Никита Орлов", "n.orlov@gmail.com", "Ozon", "НО"],
  ["Дарья Васильева", "d.vasileva@yandex.ru", "Авито", "ДВ"],
  ["Андрей Павлов", "a.pavlov@mail.ru", "Яндекс", "АП"],
  ["Полина Фёдорова", "p.fedorova@gmail.com", "Сбер", "ПФ"],
  ["Максим Егоров", "m.egorov@vk.ru", "VK", "МЕ"],
  ["Виктория Белова", "v.belova@gmail.com", "Самокат", "ВБ"],
  ["Роман Захаров", "r.zakharov@mail.ru", "Т-Банк", "РЗ"],
  ["Алиса Виноградова", "a.vinogradova@yandex.ru", "МТС", "АВ"],
  ["Павел Титов", "p.titov@gmail.com", "Точка", "ПТ"],
  ["Елена Макарова", "e.makarova@mail.ru", "Ozon", "ЕМ"],
  ["Сергей Андреев", "s.andreev@gmail.com", "Авито", "СА"],
  ["Валерия Николаева", "v.nikolaeva@mail.ru", "Сбер", "ВН"],
  ["Денис Михайлов", "d.mihailov@gmail.com", "VK", "ДМ"],
  ["Ксения Алексеева", "k.alekseeva@yandex.ru", "Яндекс", "КА"],
];
const colors = ["purple", "rose", "blue", "orange", "green", "teal"];
const initialClients: Client[] = people.map((p, i) => ({
  id: i + 1,
  name: p[0],
  email: p[1],
  company: p[2],
  companyColor: colors[i % 6],
  status: i % 7 === 3 ? "Неактивный" : i % 4 === 2 ? "Новый" : "Активный",
  amount: [
    128500, 256000, 84000, 0, 175900, 320000, 67500, 142000, 98500, 210000,
  ][i % 10],
  date: `2026-06-${String(18 - Math.floor(i / 2)).padStart(2, "0")}`,
  owner: ["ЕК", "АМ", "ЕК", "ДВ", "АМ"][i % 5],
  favorite: [0, 2, 4, 7, 10].includes(i),
  archived: false,
}));
const rub = (v: number) => new Intl.NumberFormat("ru-RU").format(v) + " ₽";
const dateFormat = (v: string) =>
  new Date(v + "T12:00:00")
    .toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "");
type SortKey = "name" | "company" | "status" | "amount" | "date" | "owner";
const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "Клиент" },
  { key: "company", label: "Компания" },
  { key: "status", label: "Статус" },
  { key: "amount", label: "Сумма сделок" },
  { key: "date", label: "Дата добавления" },
  { key: "owner", label: "Ответственный" },
];
function Check({
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
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = partial;
  }, [partial]);
  return (
    <input
      ref={ref}
      className="checkbox"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
    />
  );
}
export function App() {
  const [clients, setClients] = useState(initialClients),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("Все клиенты"),
    [section, setSection] = useState("Клиенты"),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10),
    [selected, setSelected] = useState<Set<number>>(new Set()),
    [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
      key: "date",
      dir: "desc",
    }),
    [visible, setVisible] = useState<Set<SortKey>>(
      new Set(columns.map((c) => c.key)),
    ),
    [popover, setPopover] = useState<string | null>(null),
    [statusFilter, setStatusFilter] = useState<Status[]>([]),
    [modal, setModal] = useState<"add" | "help" | "profile" | null>(null),
    [detail, setDetail] = useState<Client | null>(null),
    [toast, setToast] = useState("");
  useEffect(() => {
    setPage(1);
  }, [query, tab, statusFilter, section, pageSize]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModal(null);
        setDetail(null);
        setPopover(null);
      }
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const filtered = useMemo(
    () =>
      clients
        .filter(
          (c) =>
            c.archived === (section === "Архив") &&
            (section !== "Избранное" || c.favorite) &&
            (tab === "Все клиенты" ||
              c.status ===
                (tab === "Активные"
                  ? "Активный"
                  : tab === "Новые"
                    ? "Новый"
                    : "Неактивный")) &&
            (!statusFilter.length || statusFilter.includes(c.status)) &&
            `${c.name} ${c.email} ${c.company}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const x = a[sort.key],
            y = b[sort.key];
          return (
            (typeof x === "number" && typeof y === "number"
              ? x - y
              : String(x).localeCompare(String(y), "ru")) *
            (sort.dir === "asc" ? 1 : -1)
          );
        }),
    [clients, section, tab, statusFilter, query, sort],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize)),
    currentPage = Math.min(page, pageCount),
    rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    allChecked = rows.length > 0 && rows.every((c) => selected.has(c.id)),
    someChecked = rows.some((c) => selected.has(c.id));
  const active = clients.filter((c) => !c.archived),
    totalAmount = active.reduce((sum, c) => sum + c.amount, 0);
  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function selectPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((c) => (allChecked ? next.delete(c.id) : next.add(c.id)));
      return next;
    });
  }
  function exportCsv() {
    const data = selected.size
      ? clients.filter((c) => selected.has(c.id))
      : filtered;
    const csv =
      "\uFEFF" +
      [
        [
          "Клиент",
          "Email",
          "Компания",
          "Статус",
          "Сумма сделок",
          "Дата добавления",
        ],
        ...data.map((c) => [
          c.name,
          c.email,
          c.company,
          c.status,
          c.amount,
          c.date,
        ]),
      ]
        .map((row) =>
          row
            .map((value) => '"' + String(value).replaceAll('"', '""') + '"')
            .join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано записей: ${data.length}`);
  }
  function addClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setClients((prev) => [
      {
        id: Math.max(...prev.map((c) => c.id)) + 1,
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim(),
        company: String(data.get("company")).trim() || "Без компании",
        companyColor: "purple",
        status: "Новый",
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        owner: "ЕК",
        favorite: false,
        archived: false,
      },
      ...prev,
    ]);
    setModal(null);
    setQuery("");
    setTab("Все клиенты");
    setStatusFilter([]);
    setSection("Клиенты");
    setSort({ key: "date", dir: "desc" });
    setPage(1);
    setToast("Клиент успешно добавлен");
  }
  function navigate(label: string) {
    setSection(label);
    setTab("Все клиенты");
    setQuery("");
    setStatusFilter([]);
    setSelected(new Set());
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Клиенты");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          orbit<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => setModal("profile")}
        >
          <span className="workspace-logo">
            S<span>↗</span>
          </span>
          <span>
            <strong>Studio workspace</strong>
            <small>
              Тариф Pro <span className="tiny-dot" /> 5 участников
            </small>
          </span>
          <Icon name="chevron" size={14} className="rotate" />
        </button>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          {(
            [
              { label: "Обзор", icon: "grid" },
              { label: "Клиенты", icon: "users" },
              { label: "Компании", icon: "building" },
            ] as const
          ).map((item) => (
            <button
              key={item.label}
              className={`nav-item ${section === item.label ? "active" : ""}`}
              onClick={() => navigate(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.label === "Клиенты" && (
                <span className="nav-count">{active.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="nav-label">МОИ СПИСКИ</div>
        <nav>
          {(
            [
              { label: "Избранное", icon: "star" },
              { label: "Архив", icon: "archive" },
            ] as const
          ).map((item) => (
            <button
              key={item.label}
              className={`nav-item ${section === item.label ? "active" : ""}`}
              onClick={() => navigate(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.label === "Избранное" && (
                <span className="muted-count">
                  {active.filter((c) => c.favorite).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-icon">✧</span>
            <strong>Больше возможностей</strong>
            <p>
              Все инструменты для роста
              <br />
              вашей команды — в одном месте.
            </p>
            <button onClick={() => setModal("help")}>
              Узнать о тарифах <Icon name="arrowUp" size={15} />
            </button>
          </div>
          <button
            className="nav-item help-button"
            onClick={() => setModal("help")}
          >
            <Icon name="help" />
            <span>Помощь и поддержка</span>
            <Icon name="external" size={14} />
          </button>
          <button className="profile" onClick={() => setModal("profile")}>
            <span className="avatar user-avatar">ЕК</span>
            <span>
              <strong>Елена Крылова</strong>
              <small>Администратор</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <Icon name="grid" size={16} />
            <span>Рабочее пространство</span>
            <span className="slash">/</span>
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="saved-dot" />
            Все изменения сохранены
            <button
              className="icon-button"
              aria-label="Справка"
              onClick={() => setModal("help")}
            >
              <Icon name="help" size={19} />
            </button>
            <button
              className="avatar top-avatar"
              onClick={() => setModal("profile")}
              aria-label="Профиль"
            >
              ЕК
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="heading-line">
                <h1>{section}</h1>
                <span className="heading-count">
                  {section === "Архив"
                    ? clients.filter((c) => c.archived).length
                    : section === "Избранное"
                      ? active.filter((c) => c.favorite).length
                      : active.length}
                </span>
              </div>
              <p>
                {section === "Избранное"
                  ? "Важные контакты, которые всегда под рукой."
                  : section === "Архив"
                    ? "Клиенты, работа с которыми завершена."
                    : section === "Компании"
                      ? "Компании и люди, с которыми вы работаете."
                      : "Все ваши контакты и отношения с клиентами в одном месте."}
              </p>
            </div>
            <div className="heading-actions">
              <button className="button" onClick={exportCsv}>
                <Icon name="download" size={16} />
                Экспорт
              </button>
              <button
                className="button primary"
                onClick={() => setModal("add")}
              >
                <Icon name="plus" size={18} />
                Добавить клиента
              </button>
            </div>
          </div>
          <div className="stats-grid">
            <Stat
              title="Всего клиентов"
              value={String(active.length)}
              icon="users"
              change="+4"
              note="за этот месяц"
            />
            <Stat
              title="Активные клиенты"
              value={String(
                active.filter((c) => c.status === "Активный").length,
              )}
              icon="user"
              change="+3"
              note="за этот месяц"
            />
            <Stat
              title="Новые клиенты"
              value={String(active.filter((c) => c.status === "Новый").length)}
              icon="plus"
              change="+2"
              note="за этот месяц"
            />
            <Stat
              title="Сумма сделок"
              value={rub(totalAmount)}
              icon="sum"
              change="+12,8%"
              note="к прошлому месяцу"
            />
          </div>
          <section className="table-card" aria-label="Таблица клиентов">
            <div className="tabs-row">
              <div className="tabs">
                {["Все клиенты", "Активные", "Новые", "Неактивные"].map((t) => (
                  <button
                    key={t}
                    className={`tab ${tab === t ? "selected" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {t}
                    {t === "Все клиенты" && (
                      <span>
                        {section === "Архив"
                          ? clients.filter((c) => c.archived).length
                          : section === "Избранное"
                            ? active.filter((c) => c.favorite).length
                            : active.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <span className="table-more-label">
                <span className="live-dot" /> Обновлено только что
              </span>
            </div>
            <div className="table-toolbar">
              <label className="search-field">
                <Icon name="search" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по имени, email или компании..."
                  aria-label="Поиск клиентов"
                />
                {query ? (
                  <button
                    className="icon-button"
                    onClick={() => setQuery("")}
                    aria-label="Очистить поиск"
                  >
                    <Icon name="close" size={14} />
                  </button>
                ) : (
                  <span className="search-key">⌕</span>
                )}
              </label>
              <div className="toolbar-actions">
                <div className="popover-wrap">
                  <button
                    className={`button ${statusFilter.length ? "filter-active" : ""}`}
                    onClick={() =>
                      setPopover(popover === "filters" ? null : "filters")
                    }
                    aria-expanded={popover === "filters"}
                  >
                    <Icon name="filter" size={16} />
                    Фильтры
                    {statusFilter.length > 0 && (
                      <span className="button-count">
                        {statusFilter.length}
                      </span>
                    )}
                  </button>
                  {popover === "filters" && (
                    <div className="popover">
                      <strong>Статус клиента</strong>
                      {(["Активный", "Новый", "Неактивный"] as Status[]).map(
                        (s) => (
                          <label key={s}>
                            <Check
                              checked={statusFilter.includes(s)}
                              onChange={() =>
                                setStatusFilter((prev) =>
                                  prev.includes(s)
                                    ? prev.filter((x) => x !== s)
                                    : [...prev, s],
                                )
                              }
                              label={s}
                            />
                            {s}
                          </label>
                        ),
                      )}
                      <button
                        className="text-button"
                        onClick={() => {
                          setStatusFilter([]);
                          setPopover(null);
                        }}
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}
                </div>
                <div className="popover-wrap">
                  <button
                    className="button"
                    onClick={() =>
                      setPopover(popover === "columns" ? null : "columns")
                    }
                    aria-expanded={popover === "columns"}
                  >
                    <Icon name="columns" size={16} />
                    Колонки
                    <Icon name="chevron" size={12} className="rotate" />
                  </button>
                  {popover === "columns" && (
                    <div className="popover">
                      <strong>Видимые колонки</strong>
                      {columns
                        .filter((c) => c.key !== "name")
                        .map((c) => (
                          <label key={c.key}>
                            <Check
                              checked={visible.has(c.key)}
                              onChange={() =>
                                setVisible((prev) => {
                                  const next = new Set(prev);
                                  next.has(c.key)
                                    ? next.delete(c.key)
                                    : next.add(c.key);
                                  return next;
                                })
                              }
                              label={c.label}
                            />
                            {c.label}
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selected.size > 0 && (
              <div className="selection-bar">
                <span>
                  <Icon name="check" size={15} />
                  Выбрано: <strong>{selected.size}</strong>
                </span>
                <button onClick={exportCsv}>
                  <Icon name="download" size={15} />
                  Экспортировать
                </button>
                <button
                  onClick={() => {
                    setClients((prev) =>
                      prev.map((c) =>
                        selected.has(c.id)
                          ? { ...c, archived: section !== "Архив" }
                          : c,
                      ),
                    );
                    setSelected(new Set());
                    setToast(
                      section === "Архив"
                        ? "Клиенты восстановлены"
                        : "Клиенты перемещены в архив",
                    );
                  }}
                >
                  <Icon name="archive" size={15} />
                  {section === "Архив" ? "Восстановить" : "В архив"}
                </button>
                <button
                  className="clear-selection"
                  onClick={() => setSelected(new Set())}
                >
                  Снять выделение <Icon name="close" size={14} />
                </button>
              </div>
            )}
            {section === "Компании" && (
              <div className="company-summary">
                {new Set(filtered.map((c) => c.company)).size} компаний ·
                нажмите на название колонки «Компания», чтобы сгруппировать
                контакты по названию
              </div>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="check-cell">
                      <Check
                        checked={allChecked}
                        partial={someChecked && !allChecked}
                        onChange={selectPage}
                        label="Выбрать все строки на странице"
                      />
                    </th>
                    {columns
                      .filter((c) => visible.has(c.key))
                      .map((c) => (
                        <th
                          key={c.key}
                          className={c.key === "amount" ? "amount-column" : ""}
                          aria-sort={
                            sort.key === c.key
                              ? sort.dir === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            className={`sort-button ${sort.key === c.key ? "sorted" : ""}`}
                            onClick={() =>
                              setSort((prev) => ({
                                key: c.key,
                                dir:
                                  prev.key === c.key && prev.dir === "asc"
                                    ? "desc"
                                    : "asc",
                              }))
                            }
                          >
                            {c.label}
                            <Icon
                              name="arrow"
                              size={13}
                              className={
                                sort.key === c.key && sort.dir === "asc"
                                  ? "flip"
                                  : ""
                              }
                            />
                          </button>
                        </th>
                      ))}
                    <th className="row-action-cell">
                      <span className="sr-only">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className={selected.has(c.id) ? "row-selected" : ""}
                    >
                      <td className="check-cell">
                        <Check
                          checked={selected.has(c.id)}
                          onChange={() => toggle(c.id)}
                          label={`Выбрать: ${c.name}`}
                        />
                      </td>
                      {visible.has("name") && (
                        <td>
                          <button
                            className="client-cell"
                            onClick={() => setDetail(c)}
                          >
                            <span
                              className={`avatar avatar-${colors[(c.id - 1) % 6]}`}
                            >
                              {c.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <span>
                              <strong>{c.name}</strong>
                              <small>{c.email}</small>
                            </span>
                          </button>
                        </td>
                      )}
                      {visible.has("company") && (
                        <td>
                          <span className="company-cell">
                            <span
                              className={`company-logo logo-${c.company.toLowerCase().replace("ё", "е")}`}
                            >
                              {c.company === "Точка" ? (
                                "◉"
                              ) : c.company === "Ozon" ? (
                                "oz"
                              ) : c.company === "Авито" ? (
                                <span className="avito-dots">
                                  <i />
                                  <i />
                                  <i />
                                  <i />
                                </span>
                              ) : c.company === "Сбер" ? (
                                "✓"
                              ) : c.company === "VK" ? (
                                "VK"
                              ) : (
                                c.company[0]
                              )}
                            </span>
                            {c.company}
                          </span>
                        </td>
                      )}
                      {visible.has("status") && (
                        <td>
                          <span
                            className={`status status-${c.status === "Активный" ? "active" : c.status === "Новый" ? "new" : "inactive"}`}
                          >
                            <i />
                            {c.status}
                          </span>
                        </td>
                      )}
                      {visible.has("amount") && (
                        <td className="amount-cell">{rub(c.amount)}</td>
                      )}
                      {visible.has("date") && (
                        <td className="date-cell">{dateFormat(c.date)}</td>
                      )}
                      {visible.has("owner") && (
                        <td>
                          <span
                            className={`owner-avatar owner-${c.owner}`}
                            title={
                              c.owner === "ЕК"
                                ? "Елена Крылова"
                                : c.owner === "АМ"
                                  ? "Алексей Миронов"
                                  : "Дарья Волкова"
                            }
                          >
                            {c.owner}
                          </span>
                        </td>
                      )}
                      <td className="row-action-cell">
                        <button
                          className="icon-button row-menu"
                          onClick={() => setDetail(c)}
                          aria-label={`Открыть карточку: ${c.name}`}
                        >
                          <Icon name="more" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && (
                <div className="empty-state">
                  <Icon name="search" size={30} />
                  <h3>Клиенты не найдены</h3>
                  <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                  <button
                    className="button"
                    onClick={() => {
                      setQuery("");
                      setStatusFilter([]);
                      setTab("Все клиенты");
                    }}
                  >
                    Сбросить поиск
                  </button>
                </div>
              )}
            </div>
            <div className="pagination-footer">
              <span className="results-label">
                Показано{" "}
                <strong>
                  {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{" "}
                из <strong>{filtered.length}</strong> клиентов
              </span>
              <div className="pagination-right">
                <label className="page-size">
                  Строк на странице
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    aria-label="Строк на странице"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                  </select>
                </label>
                <div className="pagination">
                  <button
                    className="page-button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Предыдущая страница"
                  >
                    <Icon name="chevron" size={15} className="flip" />
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        className={`page-button ${p === currentPage ? "current" : ""}`}
                        aria-current={p === currentPage ? "page" : undefined}
                        key={p}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    className="page-button"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                    aria-label="Следующая страница"
                  >
                    <Icon name="chevron" size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <div className="bottom-note">
            <span>
              <Icon name="check" size={14} /> Ваши данные доступны только вашей
              команде
            </span>
            <span>
              Есть идеи, как сделать Orbit лучше?{" "}
              <button onClick={() => setModal("help")}>
                Расскажите нам <span>↗</span>
              </button>
            </span>
          </div>
        </main>
        <footer className="app-footer">
          Orbit — пространство для хороших отношений.
        </footer>
      </div>
      {(modal || detail) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModal(null);
            setDetail(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Закрыть"
              onClick={() => {
                setModal(null);
                setDetail(null);
              }}
            >
              <Icon name="close" />
            </button>
            {modal === "add" ? (
              <>
                <div className="modal-symbol">
                  <Icon name="users" size={25} />
                </div>
                <h2 id="modal-title">Новый клиент</h2>
                <p className="modal-description">
                  Начните хорошие отношения с первого знакомства.
                </p>
                <form onSubmit={addClient}>
                  <label>
                    Имя и фамилия
                    <input
                      name="name"
                      placeholder="Например, Алексей Иванов"
                      required
                      autoFocus
                      maxLength={80}
                      pattern=".*\S.*"
                    />
                  </label>
                  <label>
                    Электронная почта
                    <input
                      name="email"
                      type="email"
                      placeholder="alex@example.com"
                      required
                    />
                  </label>
                  <label>
                    Компания <span className="optional">необязательно</span>
                    <input
                      name="company"
                      placeholder="Название компании"
                      maxLength={60}
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={() => setModal(null)}
                    >
                      Отмена
                    </button>
                    <button className="button primary" type="submit">
                      <Icon name="plus" size={16} />
                      Добавить клиента
                    </button>
                  </div>
                </form>
              </>
            ) : detail ? (
              <>
                <span className="avatar avatar-purple detail-avatar">
                  {detail.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <h2 id="modal-title">{detail.name}</h2>
                <p className="modal-description">Карточка клиента</p>
                <dl className="detail-list">
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${detail.email}`}>{detail.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Компания</dt>
                    <dd>{detail.company}</dd>
                  </div>
                  <div>
                    <dt>Статус</dt>
                    <dd>
                      <select
                        aria-label="Статус клиента"
                        value={detail.status}
                        onChange={(e) => {
                          const status = e.target.value as Status;
                          setClients((prev) =>
                            prev.map((c) =>
                              c.id === detail.id ? { ...c, status } : c,
                            ),
                          );
                          setDetail({ ...detail, status });
                        }}
                      >
                        {["Активный", "Новый", "Неактивный"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt>Сумма сделок</dt>
                    <dd>{rub(detail.amount)}</dd>
                  </div>
                  <div>
                    <dt>Дата добавления</dt>
                    <dd>{dateFormat(detail.date)}</dd>
                  </div>
                </dl>
                <button
                  className="button full-width"
                  onClick={() => {
                    setClients((prev) =>
                      prev.map((c) =>
                        c.id === detail.id
                          ? { ...c, favorite: !c.favorite }
                          : c,
                      ),
                    );
                    setDetail({ ...detail, favorite: !detail.favorite });
                  }}
                >
                  <Icon name="star" />
                  {detail.favorite
                    ? "Убрать из избранного"
                    : "Добавить в избранное"}
                </button>
              </>
            ) : modal === "profile" ? (
              <>
                <span className="avatar avatar-purple detail-avatar">ЕК</span>
                <h2 id="modal-title">Елена Крылова</h2>
                <p className="modal-description">
                  Администратор · Studio workspace
                </p>
                <dl className="detail-list">
                  <div>
                    <dt>Рабочее пространство</dt>
                    <dd>Studio workspace</dd>
                  </div>
                  <div>
                    <dt>Участники</dt>
                    <dd>5 участников</dd>
                  </div>
                  <div>
                    <dt>Тариф</dt>
                    <dd>Pro</dd>
                  </div>
                </dl>
                <p className="help-copy">
                  Демонстрационное рабочее пространство. Изменения клиентов
                  хранятся в текущей сессии.
                </p>
              </>
            ) : (
              <>
                <div className="modal-symbol">
                  <Icon name="help" size={26} />
                </div>
                <h2 id="modal-title">Всё под рукой</h2>
                <p className="modal-description">
                  Небольшая памятка по работе с клиентами.
                </p>
                <div className="help-copy">
                  <p>
                    <strong>Сортировка.</strong> Нажмите на заголовок колонки.
                    Повторное нажатие меняет направление.
                  </p>
                  <p>
                    <strong>Выбор строк.</strong> Чекбокс в заголовке выделяет
                    текущую страницу. Выбор сохраняется между страницами.
                  </p>
                  <p>
                    <strong>Экспорт.</strong> Скачайте выбранных клиентов или
                    всю отфильтрованную таблицу в CSV.
                  </p>
                  <p>
                    <strong>Карточка клиента.</strong> Нажмите на имя, чтобы
                    изменить статус или добавить контакт в избранное.
                  </p>
                  <div className="help-note">
                    Вы в демоверсии Orbit Pro. Все возможности доступны
                    бесплатно; данные сохраняются до обновления страницы.
                  </div>
                </div>
              </>
            )}
          </section>
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
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function Stat({
  title,
  value,
  icon,
  change,
  note,
}: {
  title: string;
  value: string;
  icon: string;
  change: string;
  note: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon stat-icon-${icon}`}>
          {icon === "sum" ? (
            <span>₽</span>
          ) : (
            <Icon
              name={icon === "user" ? "users" : (icon as IconName)}
              size={17}
            />
          )}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">
        <span className="stat-change">
          <Icon name="arrowUp" size={12} />
          {change}
        </span>
        <span>{note}</span>
      </div>
    </article>
  );
}
