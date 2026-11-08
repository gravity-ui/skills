import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "star"
  | "archive"
  | "chevron"
  | "search"
  | "plus"
  | "download"
  | "filter"
  | "columns"
  | "arrow"
  | "more"
  | "bell"
  | "help"
  | "settings"
  | "logout"
  | "close"
  | "check"
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M17 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="4" rx="1" />
        <path d="M5 7v13h14V7M10 11h4" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2" fill="currentColor" />
        <circle cx="15" cy="17" r="2" fill="currentColor" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16M15 4v16" />
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
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5.7-1.5 1-1.5 3M12 17h.01" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6M10 12h11m-4-4 4 4-4 4" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4 4L19 6" />,
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
type Contact = {
  id: number;
  name: string;
  role: string;
  company: string;
  domain: string;
  email: string;
  status: Status;
  date: string;
  favorite: boolean;
  archived: boolean;
};
const names = [
  "Анна Смирнова",
  "Михаил Иванов",
  "Екатерина Волкова",
  "Александр Петров",
  "Мария Козлова",
  "Дмитрий Соколов",
  "Анастасия Морозова",
  "Артём Новиков",
  "Елена Васильева",
  "Илья Попов",
  "София Лебедева",
  "Максим Семёнов",
  "Дарья Павлова",
  "Никита Егоров",
  "Полина Орлова",
  "Андрей Фёдоров",
  "Виктория Белова",
  "Роман Алексеев",
  "Алиса Николаева",
  "Сергей Зайцев",
  "Ксения Соловьёва",
  "Павел Кузнецов",
  "Валерия Громова",
  "Денис Макаров",
];
const companies = [
  ["Яндекс", "yandex.ru"],
  ["Тинькофф", "tbank.ru"],
  ["Ozon", "ozon.ru"],
  ["Авито", "avito.ru"],
  ["VK", "vk.com"],
  ["Сбер", "sber.ru"],
  ["Самокат", "samokat.ru"],
  ["Точка", "tochka.com"],
];
const roles = [
  "Продуктовый дизайнер",
  "Руководитель проектов",
  "Маркетинг-менеджер",
  "Frontend-разработчик",
  "HR-менеджер",
  "Арт-директор",
  "Продуктовый менеджер",
  "UX/UI-дизайнер",
];
const emails = [
  "anna.smirnova",
  "m.ivanov",
  "ekaterina.v",
  "a.petrov",
  "maria.kozlova",
  "d.sokolov",
  "a.morozova",
  "artem.novikov",
];
const initialContacts: Contact[] = names.map((name, i) => ({
  id: i + 1,
  name,
  role: roles[i % 8],
  company: companies[i % 8][0],
  domain: companies[i % 8][1],
  email: `${emails[i % 8]}${i > 7 ? i : ""}@${companies[i % 8][1]}`,
  status: i % 6 === 2 ? "Новый" : i % 6 === 4 ? "Неактивный" : "Активный",
  date: `2026-06-${String(24 - Math.floor(i / 2)).padStart(2, "0")}`,
  favorite: [0, 2, 6, 10, 15].includes(i),
  archived: false,
}));
const statusClass = (s: Status) =>
  s === "Активный" ? "active" : s === "Новый" ? "new" : "inactive";
const dateLabel = (date: string) =>
  new Date(date + "T12:00:00")
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "")
    .replace(".", "");
const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
const columns = [
  { key: "name", label: "Имя" },
  { key: "company", label: "Компания" },
  { key: "status", label: "Статус" },
  { key: "email", label: "Email" },
  { key: "date", label: "Дата добавления" },
] as const;
type SortKey = (typeof columns)[number]["key"];
export function App() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("folio-contacts") || "null") ||
        initialContacts
      );
    } catch {
      return initialContacts;
    }
  });
  const [section, setSection] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Все контакты");
  const [status, setStatus] = useState("Все статусы");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>(
    { key: "date", direction: "desc" },
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [popover, setPopover] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"contact" | "help" | "settings" | null>(
    null,
  );
  const [editing, setEditing] = useState<Contact | null>(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    localStorage.setItem("folio-contacts", JSON.stringify(contacts));
  }, [contacts]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node))
        setPopover(null);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);
  const base = contacts.filter((c) =>
    section === "archive"
      ? c.archived
      : !c.archived && (section !== "favorites" || c.favorite),
  );
  const filtered = useMemo(
    () =>
      base
        .filter(
          (c) =>
            (tab === "Все контакты" || c.status === tab) &&
            (status === "Все статусы" || c.status === status) &&
            `${c.name} ${c.company} ${c.email} ${c.role}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort(
          (a, b) =>
            a[sort.key].localeCompare(b[sort.key], "ru") *
            (sort.direction === "asc" ? 1 : -1),
        ),
    [contacts, section, tab, status, query, sort],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allSelected = rows.length > 0 && rows.every((c) => selected.has(c.id));
  const someSelected = rows.some((c) => selected.has(c.id));
  const changeSection = (s: string) => {
    setSection(s);
    setSelected(new Set());
    setTab("Все контакты");
    setStatus("Все статусы");
    setQuery("");
    setPage(1);
    setMobileNav(false);
  };
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((c) => (allSelected ? next.delete(c.id) : next.add(c.id)));
      return next;
    });
  const updateContact = (id: number, patch: Partial<Contact>) =>
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  const exportCsv = (all = false) => {
    const data = all
      ? contacts
      : selected.size
        ? contacts.filter((c) => selected.has(c.id))
        : filtered;
    const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv =
      "\uFEFF" +
      [
        ["Имя", "Должность", "Компания", "Статус", "Email", "Дата добавления"],
        ...data.map((c) => [
          c.name,
          c.role,
          c.company,
          c.status,
          c.email,
          c.date,
        ]),
      ]
        .map((row) => row.map(cell).join(";"))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Контакты.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано контактов: ${data.length}`);
  };
  const saveContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email")).trim();
    const entry = {
      name: String(data.get("name")).trim(),
      role: String(data.get("role")).trim(),
      company: String(data.get("company")).trim(),
      domain: email.split("@")[1],
      email,
      status: String(data.get("status")) as Status,
    };
    if (!entry.name || !entry.company) return;
    if (editing) updateContact(editing.id, entry);
    else
      setContacts((prev) => [
        {
          ...entry,
          id: Date.now(),
          date: new Date().toISOString().slice(0, 10),
          favorite: false,
          archived: false,
        },
        ...prev,
      ]);
    if (!editing) {
      changeSection("all");
      setSort({ key: "date", direction: "desc" });
    }
    setModal(null);
    setToast(editing ? "Контакт обновлён" : "Контакт добавлен");
    setPage(1);
  };
  const heading =
    section === "favorites"
      ? "Избранные"
      : section === "archive"
        ? "Архив"
        : "Контакты";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            changeSection("all");
          }}
        >
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
          folio<span className="brand-dot">.</span>
        </a>
        <button className="workspace" onClick={() => setModal("settings")}>
          <span className="workspace-icon">
            S<span>✦</span>
          </span>
          <span>
            <strong>Studio workspace</strong>
            <small>
              Тариф Pro <span className="pro-dot" />
            </small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          <button
            className={section === "all" ? "nav-item selected" : "nav-item"}
            onClick={() => changeSection("all")}
          >
            <Icon name="users" />
            Контакты
            <span className="nav-count">
              {contacts.filter((c) => !c.archived).length}
            </span>
          </button>
          <button
            className={
              section === "favorites" ? "nav-item selected" : "nav-item"
            }
            onClick={() => changeSection("favorites")}
          >
            <Icon name="star" />
            Избранные
          </button>
          <button
            className={section === "archive" ? "nav-item selected" : "nav-item"}
            onClick={() => changeSection("archive")}
          >
            <Icon name="archive" />
            Архив
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip">
            <span className="tip-icon">✧</span>
            <strong>Всё начинается с контакта</strong>
            <p>
              Соберите нужных людей
              <br />в одном пространстве.
            </p>
            <button
              onClick={() => {
                setEditing(null);
                setModal("contact");
              }}
            >
              Добавить контакт <Icon name="plus" size={14} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon name="settings" />
            Настройки
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <Icon name="help" />
            Помощь и поддержка
            <Icon name="external" size={14} />
          </button>
          <div className="profile">
            <span className="avatar profile-avatar">АС</span>
            <span>
              <strong>Алексей Смирнов</strong>
              <small>Личное пространство</small>
            </span>
            <button
              className="icon-button"
              aria-label="Настройки профиля"
              onClick={() => setModal("settings")}
            >
              <Icon name="chevron" size={15} />
            </button>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <div className="sidebar-scrim" onClick={() => setMobileNav(false)} />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Открыть меню"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Icon name="grid" />
            </button>
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{heading}</strong>
          </div>
          <div className="topbar-actions">
            <span className="saved">
              <span />
              Все изменения сохранены
            </span>
            <button
              className="icon-button"
              aria-label="Справка"
              onClick={() => setModal("help")}
            >
              <Icon name="help" size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Уведомления"
              onClick={() =>
                setToast("Новых уведомлений нет. Вы ничего не пропустили.")
              }
            >
              <Icon name="bell" size={19} />
              <i />
            </button>
            <span className="topbar-divider" />
            <button
              className="avatar top-avatar"
              aria-label="Профиль"
              onClick={() => setModal("settings")}
            >
              АС
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ КРУГ ВОЗМОЖНОСТЕЙ</div>
              <h1>
                {heading}
                <span className="heading-dot" />
              </h1>
              <p>
                {section === "archive"
                  ? "Контакты, которые вы отложили. Восстановите их в любой момент."
                  : "Люди, компании и связи — всё в одном месте."}
              </p>
            </div>
            <div className="heading-actions">
              <button className="button" onClick={() => exportCsv()}>
                <Icon name="download" size={16} />
                Экспорт
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setEditing(null);
                  setModal("contact");
                }}
              >
                <Icon name="plus" size={18} />
                Добавить контакт
              </button>
            </div>
          </div>
          <section className="stats" aria-label="Статистика контактов">
            {[
              {
                label: "Всего контактов",
                count: base.length,
                icon: "users" as IconName,
                color: "purple",
                note: "В вашей базе",
                value: "Все контакты",
              },
              {
                label: "Активные",
                count: base.filter((c) => c.status === "Активный").length,
                icon: "check" as IconName,
                color: "green",
                note: "На связи с вами",
                value: "Активный",
              },
              {
                label: "Новые",
                count: base.filter((c) => c.status === "Новый").length,
                icon: "plus" as IconName,
                color: "blue",
                note: "Время познакомиться",
                value: "Новый",
              },
              {
                label: "Неактивные",
                count: base.filter((c) => c.status === "Неактивный").length,
                icon: "archive" as IconName,
                color: "gray",
                note: "Ждут вашего внимания",
                value: "Неактивный",
              },
            ].map((s) => (
              <button
                key={s.label}
                className="stat-card"
                onClick={() => {
                  setTab(s.value);
                  setPage(1);
                  setStatus("Все статусы");
                }}
              >
                <div className="stat-top">
                  <span>{s.label}</span>
                  <span className={`stat-icon ${s.color}`}>
                    <Icon name={s.icon} size={17} />
                  </span>
                </div>
                <strong>
                  {s.count}
                  <span className="stat-mini-line">
                    {s.color === "purple" ? (
                      <span className="growth">
                        ↗ {base.filter((c) => c.status === "Новый").length}{" "}
                        новых
                      </span>
                    ) : null}
                  </span>
                </strong>
                <div className="stat-bottom">
                  {s.note}
                  {s.color === "purple" && <span>готовы к знакомству</span>}
                </div>
              </button>
            ))}
          </section>
          <section className="table-card" ref={popRef}>
            <div
              className="table-tabs"
              role="tablist"
              aria-label="Статусы контактов"
            >
              {["Все контакты", "Активный", "Новый", "Неактивный"].map(
                (t, i) => (
                  <button
                    role="tab"
                    aria-selected={tab === t}
                    key={t}
                    className={`tab ${tab === t ? "current" : ""}`}
                    onClick={() => {
                      setTab(t);
                      setPage(1);
                    }}
                  >
                    {["Все контакты", "Активные", "Новые", "Неактивные"][i]}
                    <span>
                      {t === "Все контакты"
                        ? base.length
                        : base.filter((c) => c.status === t).length}
                    </span>
                  </button>
                ),
              )}
              <span className="table-view-label">
                <Icon name="grid" size={14} />
                Таблица
              </span>
            </div>
            <div className="table-toolbar">
              <div className="search-box">
                <Icon name="search" size={17} />
                <input
                  aria-label="Поиск контактов"
                  placeholder="Поиск по имени, компании или email..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
                {query ? (
                  <button
                    className="icon-button"
                    aria-label="Очистить поиск"
                    onClick={() => setQuery("")}
                  >
                    <Icon name="close" size={14} />
                  </button>
                ) : (
                  <span className="search-key">⌕</span>
                )}
              </div>
              <div className="toolbar-actions">
                <div className="popover-anchor">
                  <button
                    className={`button small ${status !== "Все статусы" ? "filter-on" : ""}`}
                    onClick={() =>
                      setPopover(popover === "filter" ? null : "filter")
                    }
                  >
                    <Icon name="filter" size={16} />
                    Фильтры
                    {status !== "Все статусы" && (
                      <span className="filter-count">1</span>
                    )}
                  </button>
                  {popover === "filter" && (
                    <div className="popover filter-pop">
                      <strong>Статус контакта</strong>
                      {["Все статусы", "Активный", "Новый", "Неактивный"].map(
                        (s) => (
                          <button
                            className="menu-item"
                            key={s}
                            onClick={() => {
                              setStatus(s);
                              setPage(1);
                              setPopover(null);
                            }}
                          >
                            {s}
                            {status === s && <Icon name="check" size={15} />}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
                <div className="popover-anchor">
                  <button
                    className="button small"
                    onClick={() =>
                      setPopover(popover === "columns" ? null : "columns")
                    }
                  >
                    <Icon name="columns" size={16} />
                    Колонки
                  </button>
                  {popover === "columns" && (
                    <div className="popover columns-pop">
                      <strong>Видимые колонки</strong>
                      {columns.map((c) => (
                        <div key={c.key}>
                          <Checkbox
                            content={c.label}
                            checked={!hidden.has(c.key)}
                            disabled={c.key === "name"}
                            onUpdate={() =>
                              setHidden((prev) => {
                                const next = new Set(prev);
                                next.has(c.key)
                                  ? next.delete(c.key)
                                  : next.add(c.key);
                                return next;
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selected.size > 0 && (
              <div className="selection-bar">
                <span>
                  Выбрано: <strong>{selected.size}</strong>
                </span>
                <button onClick={() => exportCsv()}>
                  <Icon name="download" size={14} />
                  Экспортировать
                </button>
                <button
                  onClick={() => {
                    setContacts((prev) =>
                      prev.map((c) =>
                        selected.has(c.id)
                          ? { ...c, archived: section !== "archive" }
                          : c,
                      ),
                    );
                    setSelected(new Set());
                    setToast(
                      section === "archive"
                        ? "Контакты восстановлены"
                        : "Контакты перемещены в архив",
                    );
                  }}
                >
                  <Icon name="archive" size={14} />
                  {section === "archive" ? "Восстановить" : "В архив"}
                </button>
                <button
                  className="deselect"
                  onClick={() => setSelected(new Set())}
                >
                  Снять выделение
                </button>
              </div>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={!allSelected && someSelected}
                        onUpdate={toggleAll}
                        controlProps={{
                          "aria-label": "Выбрать все строки на странице",
                        }}
                      />
                    </th>
                    {columns
                      .filter((c) => !hidden.has(c.key))
                      .map((c) => (
                        <th
                          key={c.key}
                          aria-sort={
                            sort.key === c.key
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            className={`sort-button ${sort.key === c.key ? "sorted" : ""}`}
                            onClick={() => {
                              setSort({
                                key: c.key,
                                direction:
                                  sort.key === c.key && sort.direction === "asc"
                                    ? "desc"
                                    : "asc",
                              });
                              setPage(1);
                            }}
                          >
                            {c.label}
                            <Icon
                              name="arrow"
                              size={13}
                              className={
                                sort.key === c.key && sort.direction === "asc"
                                  ? "arrow-up"
                                  : ""
                              }
                            />
                          </button>
                        </th>
                      ))}
                    <th className="row-actions">
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
                      <td className="checkbox-cell">
                        <Checkbox
                          checked={selected.has(c.id)}
                          onUpdate={() => toggle(c.id)}
                          controlProps={{ "aria-label": `Выбрать ${c.name}` }}
                        />
                      </td>
                      <td className="name-cell">
                        <button
                          className="contact-name"
                          onClick={() => {
                            setEditing(c);
                            setModal("contact");
                          }}
                        >
                          <span className={`avatar avatar-${c.id % 8}`}>
                            {initials(c.name)}
                          </span>
                          <span>
                            <strong>{c.name}</strong>
                            <small>{c.role}</small>
                          </span>
                        </button>
                      </td>
                      {!hidden.has("company") && (
                        <td className="company-cell">
                          <strong>{c.company}</strong>
                          <small>{c.domain}</small>
                        </td>
                      )}
                      {!hidden.has("status") && (
                        <td>
                          <span className={`status ${statusClass(c.status)}`}>
                            <i />
                            {c.status}
                          </span>
                        </td>
                      )}
                      {!hidden.has("email") && (
                        <td className="email-cell">
                          <a href={`mailto:${c.email}`}>{c.email}</a>
                        </td>
                      )}
                      {!hidden.has("date") && (
                        <td className="date-cell">{dateLabel(c.date)}</td>
                      )}
                      <td className="row-actions">
                        <div className="popover-anchor">
                          <button
                            className="icon-button"
                            aria-label={`Действия: ${c.name}`}
                            onClick={() =>
                              setPopover(
                                popover === `row-${c.id}`
                                  ? null
                                  : `row-${c.id}`,
                              )
                            }
                          >
                            <Icon name="more" size={19} />
                          </button>
                          {popover === `row-${c.id}` && (
                            <div className="popover row-pop">
                              <button
                                className="menu-item"
                                onClick={() => {
                                  setEditing(c);
                                  setModal("contact");
                                  setPopover(null);
                                }}
                              >
                                Редактировать
                              </button>
                              <button
                                className="menu-item"
                                onClick={() => {
                                  updateContact(c.id, {
                                    favorite: !c.favorite,
                                  });
                                  setPopover(null);
                                  setToast(
                                    c.favorite
                                      ? "Контакт убран из избранного"
                                      : "Контакт добавлен в избранное",
                                  );
                                }}
                              >
                                <Icon name="star" size={14} />
                                {c.favorite
                                  ? "Убрать из избранного"
                                  : "В избранное"}
                              </button>
                              <button
                                className="menu-item"
                                onClick={() => {
                                  updateContact(c.id, {
                                    archived: !c.archived,
                                  });
                                  setPopover(null);
                                  setSelected((prev) => {
                                    const next = new Set(prev);
                                    next.delete(c.id);
                                    return next;
                                  });
                                }}
                              >
                                <Icon name="archive" size={14} />
                                {c.archived ? "Восстановить" : "В архив"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div className="empty-state">
                  <Icon name="search" size={30} />
                  <h3>Контакты не найдены</h3>
                  <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                  <button
                    className="button"
                    onClick={() => {
                      setQuery("");
                      setTab("Все контакты");
                      setStatus("Все статусы");
                    }}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
            <div className="table-footer">
              <span className="results-count">
                Показано{" "}
                <strong>
                  {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–
                  {Math.min(safePage * pageSize, filtered.length)}
                </strong>{" "}
                из <strong>{filtered.length}</strong> контактов
              </span>
              <div className="pagination">
                <label>
                  Строк на странице{" "}
                  <select
                    aria-label="Строк на странице"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                </label>
                <div className="page-buttons">
                  <button
                    className="page-button prev"
                    disabled={safePage === 1}
                    aria-label="Предыдущая страница"
                    onClick={() => setPage(safePage - 1)}
                  >
                    <Icon name="chevron" size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPages ||
                        Math.abs(n - safePage) <= 1,
                    )
                    .map((n, i, arr) => (
                      <span className="page-number-wrap" key={n}>
                        {i > 0 && n - arr[i - 1] > 1 && <span>…</span>}
                        <button
                          className={`page-button ${n === safePage ? "current" : ""}`}
                          aria-label={`Страница ${n}`}
                          aria-current={n === safePage ? "page" : undefined}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      </span>
                    ))}
                  <button
                    className="page-button"
                    disabled={safePage === totalPages}
                    aria-label="Следующая страница"
                    onClick={() => setPage(safePage + 1)}
                  >
                    <Icon name="chevron" size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <div className="below-table">
            <span>
              <Icon name="check" size={14} />
              Ваши контакты доступны только вам
            </span>
            <span>Меньше рутины. Больше связей.</span>
          </div>
        </main>
        <footer className="app-footer">
          <span>© 2026 Folio</span>
          <span>
            Создано для хороших связей <span className="footer-spark">✧</span>
          </span>
          <button onClick={() => setModal("help")}>
            Обратная связь <Icon name="external" size={12} />
          </button>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
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
      <dialog
        ref={dialogRef}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">ВАШЕ ПРОСТРАНСТВО FOLIO</span>
            <h2>
              {modal === "contact"
                ? editing
                  ? "Редактировать контакт"
                  : "Новый контакт"
                : modal === "help"
                  ? "Всегда на связи"
                  : "Настройки пространства"}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Закрыть окно"
            onClick={() => setModal(null)}
          >
            <Icon name="close" />
          </button>
        </div>
        {modal === "contact" ? (
          <form onSubmit={saveContact} key={editing?.id || "new"}>
            <label>
              Имя и фамилия
              <input
                name="name"
                required
                maxLength={80}
                defaultValue={editing?.name}
                placeholder="Например, Анна Смирнова"
                autoFocus
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                defaultValue={editing?.email}
                placeholder="anna@company.ru"
              />
            </label>
            <div className="form-grid">
              <label>
                Компания
                <input
                  name="company"
                  required
                  maxLength={60}
                  defaultValue={editing?.company}
                  placeholder="Название компании"
                />
              </label>
              <label>
                Должность
                <input
                  name="role"
                  maxLength={80}
                  defaultValue={editing?.role}
                  placeholder="Продуктовый дизайнер"
                />
              </label>
            </div>
            <label>
              Статус
              <select name="status" defaultValue={editing?.status || "Новый"}>
                <option>Новый</option>
                <option>Активный</option>
                <option>Неактивный</option>
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="button"
                onClick={() => setModal(null)}
              >
                Отмена
              </button>
              <button className="button primary" type="submit">
                {editing ? "Сохранить изменения" : "Добавить контакт"}
              </button>
            </div>
          </form>
        ) : modal === "help" ? (
          <div className="help-content">
            <p>Folio помогает держать важные контакты под рукой.</p>
            <ul>
              <li>
                Нажмите на заголовок колонки, чтобы изменить порядок сортировки.
              </li>
              <li>
                Выбирайте контакты чекбоксами. Выделение сохраняется при
                переключении страниц.
              </li>
              <li>
                Используйте поиск и фильтры, чтобы найти нужного человека.
              </li>
              <li>
                Кнопка «Экспорт» скачивает выбранные контакты или текущую
                выборку в CSV.
              </li>
              <li>
                Нажмите на имя, чтобы изменить контакт. В меню «···» можно
                добавить его в избранное или архив.
              </li>
            </ul>
            <p className="help-note">
              Это ваше локальное пространство: данные сохраняются в этом
              браузере.
            </p>
            <button className="button primary" onClick={() => setModal(null)}>
              Всё понятно
            </button>
          </div>
        ) : (
          <div className="settings-content">
            <div className="settings-profile">
              <span className="avatar profile-avatar">АС</span>
              <div>
                <strong>Алексей Смирнов</strong>
                <p>Studio workspace · Личное пространство</p>
              </div>
            </div>
            <div className="settings-row">
              <span>Тариф пространства</span>
              <span className="status new">Pro</span>
            </div>
            <div className="settings-row">
              <span>Язык интерфейса</span>
              <strong>Русский</strong>
            </div>
            <div className="settings-row">
              <span>Хранение контактов</span>
              <strong>В этом браузере</strong>
            </div>
            <button className="button" onClick={() => exportCsv(true)}>
              <Icon name="download" size={16} />
              Скачать резервную копию контактов
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
