import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "./components/icons";
import {
  VisualizationWidget,
  type ChartMode,
  type ChartPoint,
} from "./components/VisualizationWidget";
import "./styles.css";
const salesValues = [
  40, 46, 44, 41, 59, 57, 48, 60, 64, 56, 47, 52, 72, 87, 75, 78, 67, 63, 76,
  70, 59, 76, 88, 80, 92, 85, 97, 89, 103, 99,
];
const comparisonValues = [
  31, 36, 35, 39, 43, 39, 34, 43, 46, 39, 36, 43, 49, 60, 53, 57, 50, 46, 53,
  49, 43, 51, 63, 57, 65, 59, 69, 63, 74, 69,
];
const initialEvents = [
  {
    type: "sale",
    title: "Новый рекорд продаж",
    description: "Дневная выручка превысила 100 000 ₽",
    time: "12 мин назад",
    icon: "chart" as IconName,
    color: "purple",
  },
  {
    type: "sync",
    title: "Данные синхронизированы",
    description: "Все источники успешно обновлены",
    time: "28 мин назад",
    icon: "refresh" as IconName,
    color: "green",
  },
  {
    type: "source",
    title: "Подключён новый источник",
    description: "Интернет-магазин · Shopify",
    time: "1 час назад",
    icon: "layers" as IconName,
    color: "blue",
  },
];
const channelData = [
  {
    name: "Интернет-магазин",
    color: "#9060e8",
    value: "1 248 320 ₽",
    percent: 50.2,
    delta: "+18,6%",
    icon: "cart" as IconName,
  },
  {
    name: "Маркетплейсы",
    color: "#baa0ed",
    value: "742 680 ₽",
    percent: 29.9,
    delta: "+12,3%",
    icon: "layers" as IconName,
  },
  {
    name: "Прямые продажи",
    color: "#d8c9f3",
    value: "495 500 ₽",
    percent: 19.9,
    delta: "+8,1%",
    icon: "users" as IconName,
  },
];
const periods = [
  "Этот месяц",
  "Последние 7 дней",
  "Последние 14 дней",
  "Последние 30 дней",
];
function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <i />
        <i />
        <i />
      </div>
      <span>
        pulse<span className="brand-period">.</span>
      </span>
    </div>
  );
}
function AppModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function App() {
  const [mode, setMode] = useState<ChartMode>("sales");
  const [page, setPage] = useState("Обзор");
  const [tab, setTab] = useState("Обзор");
  const [period, setPeriod] = useState("Этот месяц");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<
    "docs" | "source" | "notifications" | "profile" | "channels" | null
  >(null);
  const [sourceName, setSourceName] = useState("");
  const [sourceKind, setSourceKind] = useState("Shopify");
  const [sources, setSources] = useState([
    {
      name: "Интернет-магазин",
      kind: "Shopify",
      detail: "1 284 записи за сегодня",
    },
    {
      name: "Маркетплейсы",
      kind: "Wildberries",
      detail: "842 записи за сегодня",
    },
    { name: "Прямые продажи", kind: "CRM", detail: "360 записей за сегодня" },
  ]);
  const [eventFilter, setEventFilter] = useState("Все события");
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("Мой проект");
  const [savedName, setSavedName] = useState("Мой проект");
  const [notify, setNotify] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (mode !== "monitoring" || !live) return;
    const timer = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(timer);
  }, [mode, live]);
  useEffect(() => () => clearTimeout(refreshTimer.current), []);
  const data = useMemo<ChartPoint[]>(() => {
    if (mode === "sales") {
      const days =
        period === "Последние 7 дней"
          ? 7
          : period === "Последние 14 дней"
            ? 14
            : 30;
      return salesValues
        .slice(30 - days)
        .map((v, i) => ({
          time: Date.UTC(2026, 5, 31 - days + i),
          value: v * 1000 + Math.sin(i * 3) * 700,
          comparison: comparisonValues[30 - days + i] * 1000,
        }));
    }
    const now = Date.now();
    return Array.from({ length: 3600 }, (_, i) => ({
      time: now - (3599 - i) * 1000,
      value: Math.max(
        35,
        91 +
          23 * Math.sin((i + tick * 4) * 0.063) +
          17 * Math.sin((i + tick * 4) * 0.27) +
          13 * Math.sin((i + tick * 4) * 1.67) +
          ((i + tick * 4) % 239 < 8 ? 150 : 0) +
          ((i + tick * 4) % 547 < 4 ? 80 : 0),
      ),
      comparison: Math.max(
        20,
        65 +
          15 * Math.sin((i + tick * 4) * 0.044) +
          10 * Math.sin((i + tick * 4) * 0.39) +
          ((i + tick * 4) % 411 < 5 ? 87 : 0),
      ),
    }));
  }, [mode, period, tick]);
  const refresh = () => {
    setRefreshing(true);
    refreshTimer.current = setTimeout(() => {
      setRefreshing(false);
      setTick((t) => t + 1);
      setToast("Данные успешно обновлены");
    }, 850);
  };
  const exportCsv = () => {
    const csv =
      "\uFEFFВремя;" +
      (mode === "sales"
        ? "Выручка;Предыдущий период"
        : "Основной API;Резервный API") +
      "\n" +
      data
        .map(
          (p) =>
            `${new Date(p.time).toISOString()};${p.value.toFixed(2)};${p.comparison.toFixed(2)}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-${mode}-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Отчёт выгружен в CSV");
  };
  const nav = [
    { name: "Обзор", icon: "grid" as IconName },
    { name: "Отчёты", icon: "chart" as IconName },
    { name: "Источники данных", icon: "layers" as IconName },
    { name: "События", icon: "activity" as IconName },
  ];
  const isOverview = page === "Обзор" || page === "Отчёты";
  const monitoring = mode === "monitoring";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <button
          className="workspace-button"
          onClick={() => setModal("profile")}
        >
          <span className="workspace-avatar">М</span>
          <span>
            <strong>{savedName}</strong>
            <small>Рабочее пространство</small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        <div className="nav-label">АНАЛИТИКА</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              className={`nav-item ${page === n.name ? "active" : ""}`}
              onClick={() => {
                setPage(n.name);
                if (n.name === "Отчёты") setTab("Отчёты");
                else setTab("Обзор");
              }}
            >
              <Icon name={n.icon} size={19} />
              <span>{n.name}</span>
              {n.name === "События" && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>
        <div className="nav-divider" />
        <button
          className={`nav-item ${page === "Настройки" ? "active" : ""}`}
          onClick={() => setPage("Настройки")}
        >
          <Icon name="settings" size={19} />
          <span>Настройки</span>
        </button>
        <div className="sidebar-spacer" />
        <div className="help-card">
          <div className="help-art">
            <svg viewBox="0 0 190 64" fill="none">
              <path
                d="m18 47 31-15 29 8 28-26 30 10 32-17"
                stroke="#d9caf7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <rect
                x="55"
                y="14"
                width="71"
                height="46"
                rx="7"
                fill="#fff"
                stroke="#ddcdf8"
                transform="rotate(-8 55 14)"
              />
              <path
                d="m69 45 10-11 10 4 10-13 10 4"
                stroke="#9b75df"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <rect
                x="122"
                y="4"
                width="22"
                height="22"
                rx="7"
                fill="#9864e3"
                transform="rotate(9 122 4)"
              />
              <path d="m128 15 3 3 6-6" stroke="white" strokeWidth="1.5" />
              <circle cx="39" cy="20" r="3" fill="#d7c2f5" />
              <path
                d="m152 42 4 4m-4 0 4-4"
                stroke="#bda1e7"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <h3>Больше пользы из данных</h3>
          <p>
            Всё о графиках, метриках
            <br />и ваших возможностях.
          </p>
          <button onClick={() => setModal("docs")}>
            Открыть руководство
            <Icon name="arrow" size={15} />
          </button>
        </div>
        <button className="support-button" onClick={() => setModal("docs")}>
          <Icon name="help" size={18} />
          Помощь и поддержка
          <Icon name="external" size={14} />
        </button>
        <button className="profile" onClick={() => setModal("profile")}>
          <span className="avatar">АК</span>
          <span>
            <strong>Александр К.</strong>
            <small>Личный аккаунт</small>
          </span>
          <Icon name="more" size={19} />
        </button>
      </aside>
      <div className="main-wrapper">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="grid" size={16} />
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={12} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="documentation-button"
              onClick={() => setModal("docs")}
            >
              <Icon name="book" size={17} />
              <span>Документация</span>
              <Icon name="external" size={12} />
            </button>
            <span className="topbar-divider" />
            <button
              className="notification-button icon-button"
              aria-label="Уведомления"
              onClick={() => setModal("notifications")}
            >
              <Icon name="bell" size={20} />
              <span />
            </button>
            <button
              className="avatar small-avatar"
              onClick={() => setModal("profile")}
              aria-label="Мой профиль"
            >
              АК
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div>
              <h1>
                {page === "Обзор"
                  ? "Обзор аналитики"
                  : page === "Отчёты"
                    ? "Отчёты и аналитика"
                    : page}
              </h1>
              <p>
                {isOverview
                  ? "Вся картина в одном месте. Отслеживайте главное, замечайте детали."
                  : page === "Источники данных"
                    ? "Подключайте сервисы и собирайте данные в одном пространстве."
                    : page === "События"
                      ? "Важные изменения и обновления вашего проекта."
                      : "Управляйте рабочим пространством и уведомлениями."}
              </p>
            </div>
            <span className="system-status">
              <span className="live-dot" />
              Все системы работают
            </span>
          </div>
          {isOverview ? (
            <>
              <div className="page-toolbar">
                <div className="page-tabs">
                  {["Обзор", "Отчёты", "Источники"].map((t) => (
                    <button
                      className={tab === t ? "active" : ""}
                      key={t}
                      onClick={() => {
                        if (t === "Источники") setPage("Источники данных");
                        else setTab(t);
                      }}
                    >
                      {t}
                      {t === "Источники" && <span>{sources.length}</span>}
                    </button>
                  ))}
                </div>
                <div className="date-tools">
                  <div className="popover-anchor">
                    <button
                      className={`button date-button ${periodOpen ? "opened" : ""}`}
                      onClick={() => setPeriodOpen(!periodOpen)}
                    >
                      <Icon name="calendar" size={17} />
                      <span>
                        {period === "Этот месяц"
                          ? "1 — 30 июня 2026"
                          : period === "Последние 7 дней"
                            ? "24 — 30 июня 2026"
                            : period === "Последние 14 дней"
                              ? "17 — 30 июня 2026"
                              : "1 — 30 июня 2026"}
                      </span>
                      <Icon name="chevron" size={13} />
                    </button>
                    {periodOpen && (
                      <>
                        <div
                          className="click-away"
                          onClick={() => setPeriodOpen(false)}
                        />
                        <div className="dropdown period-dropdown">
                          <span className="dropdown-label">ПЕРИОД ОТЧЁТА</span>
                          {periods.map((p) => (
                            <button
                              key={p}
                              onClick={() => {
                                setPeriod(p);
                                setPeriodOpen(false);
                              }}
                            >
                              {p}
                              {p === period && <Icon name="check" size={15} />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    className={`button refresh-button ${refreshing ? "spinning" : ""}`}
                    onClick={refresh}
                    aria-label="Обновить данные"
                  >
                    <Icon name="refresh" size={17} />
                  </button>
                </div>
              </div>
              {tab === "Отчёты" && (
                <div className="report-banner">
                  <span>
                    <Icon name="book" size={18} />
                    Ваш отчёт за {period.toLowerCase()} готов к выгрузке
                  </span>
                  <button onClick={exportCsv}>
                    Скачать CSV
                    <Icon name="download" size={15} />
                  </button>
                </div>
              )}
              <div className="metrics">
                {(monitoring
                  ? [
                      {
                        title: "Среднее время ответа",
                        value: "94",
                        unit: "мс",
                        change: "−12,8%",
                        icon: "clock" as IconName,
                        spark: [23, 17, 24, 19, 14, 18, 12, 16, 10, 15, 8, 11],
                      },
                      {
                        title: "Запросов за час",
                        value: "128 492",
                        unit: "",
                        change: "+16,2%",
                        icon: "activity" as IconName,
                        spark: [8, 13, 10, 20, 15, 22, 16, 25, 21, 29, 24, 32],
                      },
                      {
                        title: "Доступность",
                        value: "99,98",
                        unit: "%",
                        change: "+0,02%",
                        icon: "target" as IconName,
                        spark: [22, 24, 23, 24, 25, 25, 26, 26, 26, 27, 27, 28],
                      },
                      {
                        title: "Ошибки",
                        value: "0,02",
                        unit: "%",
                        change: "−0,08%",
                        icon: "layers" as IconName,
                        spark: [30, 26, 29, 21, 23, 19, 22, 15, 18, 12, 14, 9],
                      },
                    ]
                  : [
                      {
                        title: "Общая выручка",
                        value:
                          period === "Последние 7 дней"
                            ? "642 800"
                            : period === "Последние 14 дней"
                              ? "1 204 200"
                              : "2 486 500",
                        unit: "₽",
                        change: "+14,2%",
                        icon: "wallet" as IconName,
                        spark: [9, 14, 11, 15, 12, 22, 19, 23, 19, 27, 24, 32],
                      },
                      {
                        title: "Заказы",
                        value: period === "Последние 7 дней" ? "642" : "2 486",
                        unit: "",
                        change: "+8,6%",
                        icon: "cart" as IconName,
                        spark: [11, 15, 13, 19, 16, 22, 18, 25, 23, 28, 25, 31],
                      },
                      {
                        title: "Средний чек",
                        value: "1 000",
                        unit: "₽",
                        change: "+5,2%",
                        icon: "users" as IconName,
                        spark: [15, 18, 16, 21, 18, 23, 20, 25, 22, 26, 24, 30],
                      },
                      {
                        title: "Конверсия",
                        value: "3,24",
                        unit: "%",
                        change: "+0,4%",
                        icon: "target" as IconName,
                        spark: [10, 13, 12, 18, 15, 22, 19, 24, 21, 27, 25, 32],
                      },
                    ]
                ).map((m, i) => (
                  <article className="metric-card" key={m.title}>
                    <div className="metric-label">
                      {m.title}
                      <span className="metric-icon">
                        <Icon name={m.icon} size={17} />
                      </span>
                    </div>
                    <div className="metric-value">
                      {m.value}
                      <span>{m.unit}</span>
                    </div>
                    <div className="metric-bottom">
                      <span className="metric-change">
                        <svg
                          viewBox="0 0 12 12"
                          width="11"
                          height="11"
                          fill="none"
                        >
                          <path
                            d="m2 8 7-5M4 3h5v5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                        {m.change}
                      </span>
                      <span>к прошлому периоду</span>
                      <svg className="sparkline" viewBox="0 0 88 35">
                        <defs>
                          <linearGradient
                            id={`spark-${i}`}
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop stopColor="#a989e5" stopOpacity=".14" />
                            <stop
                              offset="1"
                              stopColor="#a989e5"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M0 35 ${m.spark.map((v, j) => `L${j * 8} ${36 - v}`).join(" ")} L88 35Z`}
                          fill={`url(#spark-${i})`}
                        />
                        <polyline
                          points={m.spark
                            .map((v, j) => `${j * 8},${36 - v}`)
                            .join(" ")}
                          fill="none"
                          stroke="#a988de"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </article>
                ))}
              </div>
              <VisualizationWidget
                mode={mode}
                onModeChange={setMode}
                data={data}
                periodLabel={period}
                onExport={exportCsv}
                onRefresh={refresh}
                refreshing={refreshing}
              />
              {monitoring && (
                <div className="live-controls">
                  <span>
                    <Icon name="activity" size={15} />
                    Поток данных обновляется каждые 4 секунды
                  </span>
                  <button onClick={() => setLive(!live)}>
                    <Icon name={live ? "pause" : "refresh"} size={14} />
                    {live ? "Приостановить" : "Продолжить"}
                  </button>
                </div>
              )}
              <div className="bottom-grid">
                <section className="panel channels-panel">
                  <div className="panel-heading">
                    <h2>Продажи по каналам</h2>
                    <button
                      className="subtle-link"
                      onClick={() => setModal("channels")}
                    >
                      Подробнее
                      <Icon name="chevron" size={13} />
                    </button>
                  </div>
                  <p className="panel-subtitle">
                    Вклад каждого канала в общую выручку
                  </p>
                  <div className="channel-share">
                    {channelData.map((c) => (
                      <span
                        key={c.name}
                        style={{ width: `${c.percent}%`, background: c.color }}
                        title={`${c.name}: ${c.percent}%`}
                      />
                    ))}
                  </div>
                  <div className="channel-table">
                    {channelData.map((c) => (
                      <div className="channel-row" key={c.name}>
                        <span className="channel-name">
                          <i style={{ background: c.color }} />
                          {c.name}
                        </span>
                        <strong>{c.value}</strong>
                        <span className="channel-percent">
                          {c.percent.toString().replace(".", ",")}%
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="panel events-panel">
                  <div className="panel-heading">
                    <h2>
                      Последние события<span className="events-count">3</span>
                    </h2>
                    <button
                      className="subtle-link"
                      onClick={() => setPage("События")}
                    >
                      Все события
                      <Icon name="chevron" size={13} />
                    </button>
                  </div>
                  <div className="events-list">
                    {initialEvents.map((e) => (
                      <div className="event" key={e.title}>
                        <span className={`event-icon ${e.color}`}>
                          <Icon name={e.icon} size={17} />
                        </span>
                        <div>
                          <strong>{e.title}</strong>
                          <p>{e.description}</p>
                        </div>
                        <time>{e.time}</time>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : page === "Источники данных" ? (
            <section className="panel sources-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    Подключённые источники{" "}
                    <span className="events-count">{sources.length}</span>
                  </h2>
                  <p className="panel-subtitle">
                    Все ваши данные автоматически синхронизируются каждые 5
                    минут
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setModal("source")}
                >
                  <Icon name="plus" size={17} />
                  Добавить источник
                </button>
              </div>
              {sources.map((s, i) => (
                <div className="source-row" key={s.name}>
                  <span className={`source-icon source-${i % 3}`}>
                    <Icon
                      name={i === 0 ? "cart" : i === 1 ? "layers" : "users"}
                      size={24}
                    />
                  </span>
                  <div>
                    <strong>{s.name}</strong>
                    <p>
                      {s.kind} · {s.detail}
                    </p>
                  </div>
                  <span className="source-status">
                    <span className="live-dot" />
                    Подключён
                  </span>
                  <button className="button small" onClick={refresh}>
                    <Icon name="refresh" size={15} />
                    Синхронизировать
                  </button>
                </div>
              ))}
            </section>
          ) : page === "События" ? (
            <section className="panel all-events">
              <div className="panel-heading">
                <h2>Лента активности</h2>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                >
                  <option>Все события</option>
                  <option>Продажи</option>
                  <option>Синхронизация</option>
                  <option>Источники</option>
                </select>
              </div>
              {initialEvents
                .filter(
                  (e) =>
                    eventFilter === "Все события" ||
                    (eventFilter === "Продажи" && e.type === "sale") ||
                    (eventFilter === "Синхронизация" && e.type === "sync") ||
                    (eventFilter === "Источники" && e.type === "source"),
                )
                .map((e) => (
                  <div className="event" key={e.title}>
                    <span className={`event-icon ${e.color}`}>
                      <Icon name={e.icon} size={20} />
                    </span>
                    <div>
                      <strong>{e.title}</strong>
                      <p>{e.description}</p>
                    </div>
                    <time>{e.time}</time>
                  </div>
                ))}
            </section>
          ) : (
            <section className="panel settings-panel">
              <h2>Рабочее пространство</h2>
              <label>
                Название проекта
                <input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Название проекта"
                />
              </label>
              <div className="setting-row">
                <div>
                  <strong>Уведомления о событиях</strong>
                  <p>Получайте уведомления о важных изменениях в данных</p>
                </div>
                <button
                  className={`toggle ${notify ? "on" : ""}`}
                  role="switch"
                  aria-checked={notify}
                  aria-label="Уведомления о событиях"
                  onClick={() => setNotify(!notify)}
                >
                  <i />
                </button>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  if (!workspaceName.trim()) return;
                  setSavedName(workspaceName);
                  setToast("Настройки сохранены");
                }}
              >
                Сохранить изменения
              </button>
            </section>
          )}
          <footer className="page-footer">
            <span>© 2026 Pulse. Данные, которые имеют значение.</span>
            <span>
              <span className="footer-status-dot" />
              Работаем, пока вы растёте
              <Icon name="external" size={12} />
            </span>
          </footer>
        </main>
      </div>
      {modal === "docs" && (
        <AppModal title="Руководство по Pulse" onClose={() => setModal(null)}>
          <div className="docs-intro">
            <span className="docs-icon">
              <Icon name="book" size={27} />
            </span>
            <p>Превращайте данные в решения с единым виджетом визуализации.</p>
          </div>
          <div className="docs-section">
            <h3>01 · Аналитика продаж</h3>
            <p>
              Выберите период, сравните выручку с предыдущим месяцем и наведите
              курсор на график, чтобы увидеть точные значения. Нажмите на
              название ряда, чтобы скрыть или показать его.
            </p>
            <h3>02 · Плотный мониторинг</h3>
            <p>
              Переключитесь на «Мониторинг» для просмотра 3 600 точек за
              последний час. Выделите участок графика мышью для приближения.
              Двойной щелчок сбрасывает масштаб.
            </p>
            <h3>03 · Ваши данные всегда рядом</h3>
            <p>
              Скачайте CSV кнопкой «Экспорт», подключайте источники данных и
              следите за событиями проекта.
            </p>
          </div>
          <button
            className="primary-button full-width"
            onClick={() => setModal(null)}
          >
            Всё понятно
            <Icon name="check" size={17} />
          </button>
        </AppModal>
      )}
      {modal === "source" && (
        <AppModal title="Добавить источник" onClose={() => setModal(null)}>
          <p className="modal-description">
            Подключите новый источник к рабочему пространству.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!sourceName.trim()) return;
              setSources((s) => [
                ...s,
                {
                  name: sourceName,
                  kind: sourceKind,
                  detail: "Готов к синхронизации",
                },
              ]);
              setModal(null);
              setSourceName("");
              setToast("Источник подключён к проекту");
            }}
          >
            <label>
              Название источника
              <input
                autoFocus
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Например, мой интернет-магазин"
              />
            </label>
            <label>
              Сервис
              <select
                value={sourceKind}
                onChange={(e) => setSourceKind(e.target.value)}
              >
                <option>Shopify</option>
                <option>Wildberries</option>
                <option>CRM</option>
                <option>Демо API</option>
              </select>
            </label>
            <p className="form-hint">
              Демо-источник будет добавлен локально. Для интеграции с вашим
              сервисом потребуется подключение API.
            </p>
            <button type="submit" className="primary-button full-width">
              <Icon name="plus" size={17} />
              Подключить источник
            </button>
          </form>
        </AppModal>
      )}
      {modal === "notifications" && (
        <AppModal title="Уведомления" onClose={() => setModal(null)}>
          <p className="modal-description">Вы в курсе всех важных событий.</p>
          {initialEvents.map((e) => (
            <div className="event" key={e.title}>
              <span className={`event-icon ${e.color}`}>
                <Icon name={e.icon} size={18} />
              </span>
              <div>
                <strong>{e.title}</strong>
                <p>{e.description}</p>
              </div>
            </div>
          ))}
          <button
            className="primary-button full-width"
            onClick={() => {
              setModal(null);
              setPage("События");
            }}
          >
            Посмотреть все события
            <Icon name="arrow" size={17} />
          </button>
        </AppModal>
      )}
      {modal === "profile" && (
        <AppModal title="Ваше пространство" onClose={() => setModal(null)}>
          <div className="profile-detail">
            <span className="avatar">АК</span>
            <div>
              <h3>Александр К.</h3>
              <p>Личный аккаунт · {savedName}</p>
            </div>
          </div>
          <div className="profile-plan">
            <div>
              <strong>Тариф Starter</strong>
              <p>Всё для знакомства с вашими данными</p>
            </div>
            <span className="tag">Активен</span>
          </div>
          <button
            className="primary-button full-width"
            onClick={() => {
              setPage("Настройки");
              setModal(null);
            }}
          >
            <Icon name="settings" size={17} />
            Настройки пространства
          </button>
        </AppModal>
      )}
      {modal === "channels" && (
        <AppModal title="Продажи по каналам" onClose={() => setModal(null)}>
          <p className="modal-description">Выручка и рост за июнь 2026</p>
          {channelData.map((c) => (
            <div className="channel-detail" key={c.name}>
              <span className="event-icon purple">
                <Icon name={c.icon} />
              </span>
              <div>
                <strong>{c.name}</strong>
                <p>{c.percent}% общей выручки</p>
              </div>
              <div>
                <strong>{c.value}</strong>
                <p className="green-text">{c.delta}</p>
              </div>
            </div>
          ))}
          <button className="primary-button full-width" onClick={exportCsv}>
            <Icon name="download" size={17} />
            Скачать отчёт
          </button>
        </AppModal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button aria-label="Скрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
