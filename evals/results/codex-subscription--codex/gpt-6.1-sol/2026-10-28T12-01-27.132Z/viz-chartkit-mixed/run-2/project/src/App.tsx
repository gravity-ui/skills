import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Database,
  ExternalLink,
  FileChartColumnIncreasing,
  FolderClosed,
  LayoutDashboard,
  Menu,
  Plus,
  Settings2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  VisualizationWidget,
  exportPoints,
} from "./components/VisualizationWidget";
import {
  createPoints,
  money,
  type ChartMode,
  type Period,
} from "./charts/types";
import "./styles.css";

type Dialog =
  "sources" | "settings" | "help" | "notifications" | "report" | null;
const initialEnd = Date.UTC(2026, 5, 30, 23, 59);
function Sparkline({
  color,
  variant = 0,
}: {
  color: string;
  variant?: number;
}) {
  const paths = [
    "M1 37L9 33L16 35L24 24L32 28L39 21L47 25L55 13L64 18L72 12L80 15L91 3",
    "M1 36L10 39L18 28L27 31L35 21L44 25L52 12L61 16L68 9L77 14L84 5L92 8",
    "M1 36L10 33L19 34L27 26L35 28L43 18L51 21L59 18L67 10L75 16L84 7L92 3",
    "M1 38L10 31L18 34L27 23L35 27L44 19L52 23L61 11L69 14L77 5L85 10L92 3",
  ];
  return (
    <svg
      className="sparkline"
      width="94"
      height="48"
      viewBox="0 0 94 48"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${paths[variant]}L92 48L1 48Z`}
        fill={`url(#spark${variant})`}
      />
      <path
        d={paths[variant]}
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function App() {
  const [mode, setMode] = useState<ChartMode>("sales");
  const [period, setPeriod] = useState<Period>("month");
  const [endDate, setEndDate] = useState(initialEnd);
  const [dateOpen, setDateOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [project, setProject] = useState("Основной проект");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [sourceConnected, setSourceConnected] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [reportName, setReportName] = useState("Отчёт по продажам");
  const [read, setRead] = useState(false);
  const [chartPoints, setChartPoints] = useState(() =>
    createPoints("sales", "month", initialEnd),
  );
  const multiplier = project === "Интернет-магазин" ? 0.68 : 1;
  const points = useMemo(
    () => createPoints("sales", period, endDate, multiplier),
    [period, endDate, multiplier],
  );
  const revenue = points.reduce((s, p) => s + p.value, 0);
  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }
  function switchMode(next: ChartMode) {
    setMode(next);
    setSidebarOpen(false);
  }
  const stats = [
    {
      label: "Общая выручка",
      value: money(revenue),
      change: "18,6%",
      icon: Wallet,
      color: "#269c78",
      bg: "#edf8f3",
    },
    {
      label: "Заказы",
      value: Math.round(revenue / 1950).toLocaleString("ru-RU"),
      change: "12,8%",
      icon: ShoppingBag,
      color: "#7e74cf",
      bg: "#f2effc",
    },
    {
      label: "Средний чек",
      value: "1 950 ₽",
      change: "5,2%",
      icon: CreditCard,
      color: "#ce9b50",
      bg: "#fdf6e9",
    },
    {
      label: "Конверсия",
      value: "3,24%",
      change: "2,4%",
      icon: TrendingUp,
      color: "#608ecc",
      bg: "#eff4fd",
    },
  ];
  const fromDate = new Date(
    endDate -
      ({ day: 1, week: 7, month: 30, year: 365 }[period] - 1) * 86400000,
  );
  const dateFormat = (date: Date) =>
    date
      .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
      .replace(".", "");
  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-shade" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          aria-label="Pulse — главная"
          onClick={() => switchMode("sales")}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          pulse<span className="brand-dot">.</span>
        </a>
        <div className="project-wrap">
          <button
            className="project-button"
            onClick={() => setProjectOpen(!projectOpen)}
          >
            <span className="project-avatar">P</span>
            <span>
              <strong>{project}</strong>
              <small>Рабочее пространство</small>
            </span>
            <ChevronDown size={14} />
          </button>
          {projectOpen && (
            <div className="project-menu">
              {["Основной проект", "Интернет-магазин"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setProject(p);
                    setProjectOpen(false);
                  }}
                >
                  {p}
                  {project === p && <Check size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="nav-section-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="main-nav">
          <button
            className="nav-item active"
            onClick={() => switchMode("sales")}
          >
            <LayoutDashboard size={18} />
            <span>Обзор</span>
            <span className="active-dot" />
          </button>
          <button className="nav-item" onClick={() => setDialog("report")}>
            <FileChartColumnIncreasing size={18} />
            <span>Отчёты</span>
            <span className="nav-count">4</span>
          </button>
          <button className="nav-item" onClick={() => setDialog("sources")}>
            <Database size={18} />
            <span>Источники данных</span>
          </button>
        </nav>
        <div className="nav-section-label favorites-label">
          ИЗБРАННОЕ{" "}
          <button
            className="icon-button"
            aria-label="Создать отчёт"
            onClick={() => setDialog("report")}
          >
            <Plus size={15} />
          </button>
        </div>
        <nav className="main-nav favorites">
          <button
            className={`nav-item ${mode === "sales" ? "favorite-selected" : ""}`}
            onClick={() => switchMode("sales")}
          >
            <span className="favorite-dot green" />
            <span>Продажи</span>
          </button>
          <button
            className={`nav-item ${mode === "monitoring" ? "favorite-selected" : ""}`}
            onClick={() => switchMode("monitoring")}
          >
            <span className="favorite-dot purple" />
            <span>Мониторинг</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tips-card">
            <span className="tips-icon">
              <Zap size={17} />
            </span>
            <strong>Больше данных. Больше роста.</strong>
            <p>
              Все метрики вашего бизнеса
              <br />в одном пространстве.
            </p>
            <button onClick={() => setDialog("sources")}>
              Подключить источник <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setDialog("settings")}>
            <Settings2 size={18} />
            <span>Настройки</span>
          </button>
          <button className="nav-item" onClick={() => setDialog("help")}>
            <CircleHelp size={18} />
            <span>Помощь и поддержка</span>
            <ExternalLink size={13} />
          </button>
          <div className="sidebar-user">
            <span className="avatar">АК</span>
            <span>
              <strong>Александр Ким</strong>
              <small>Личный аккаунт</small>
            </span>
            <button
              className="icon-button"
              aria-label="Настройки аккаунта"
              onClick={() => setDialog("settings")}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Открыть меню"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <FolderClosed size={16} />
            <span>Рабочее пространство</span>
            <ChevronRight size={13} />
            <strong>Обзор</strong>
          </div>
          <div className="topbar-actions">
            <span className="system-status">
              <i />
              Все системы работают
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button notification-button"
              aria-label="Уведомления"
              onClick={() => setDialog("notifications")}
            >
              <Bell size={19} />
              {!read && <i />}
            </button>
            <button
              className="top-avatar"
              aria-label="Аккаунт Александра Кима"
              onClick={() => setDialog("settings")}
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
                Обзор аналитики <span className="page-title-dot" />
              </h1>
              <p>Всё, что важно для ваших решений, — на одном экране.</p>
            </div>
            <div className="page-actions">
              <div className="dropdown-anchor">
                <button
                  className="button date-button"
                  onClick={() => setDateOpen(!dateOpen)}
                >
                  <CalendarDays size={16} />
                  {dateFormat(fromDate)} — {dateFormat(new Date(endDate))}{" "}
                  {new Date(endDate).getUTCFullYear()}
                  <ChevronDown size={13} />
                </button>
                {dateOpen && (
                  <div className="popover date-popover">
                    <strong>Период отчёта</strong>
                    <label>
                      Последний день
                      <input
                        aria-label="Последний день периода"
                        type="date"
                        value={new Date(endDate).toISOString().slice(0, 10)}
                        onChange={(e) => {
                          if (e.target.value)
                            setEndDate(
                              new Date(e.target.value + "T23:59:00Z").getTime(),
                            );
                        }}
                      />
                    </label>
                    <div className="date-presets">
                      {(["week", "month", "year"] as Period[]).map((p, i) => (
                        <button
                          key={p}
                          onClick={() => {
                            setPeriod(p);
                            setDateOpen(false);
                          }}
                        >
                          {["7 дней", "30 дней", "Год"][i]}
                        </button>
                      ))}
                    </div>
                    <button
                      className="button primary-button"
                      onClick={() => setDateOpen(false)}
                    >
                      Применить
                    </button>
                  </div>
                )}
              </div>
              <button
                className="button export-button"
                onClick={() => {
                  exportPoints(chartPoints, mode);
                  showToast("Отчёт экспортирован в CSV");
                }}
              >
                <ArrowDownToLine size={16} />
                Экспорт
              </button>
            </div>
          </div>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <article className="stat-card panel" key={stat.label}>
                <div className="stat-heading">
                  <span>{stat.label}</span>
                  <span
                    className="stat-icon"
                    style={{ background: stat.bg, color: stat.color }}
                  >
                    <stat.icon size={16} />
                  </span>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-bottom">
                  <span className="stat-change">
                    <ArrowUpRight size={13} />
                    {stat.change}
                  </span>
                  <span>к прошлому периоду</span>
                </div>
                <Sparkline color={stat.color} variant={i} />
              </article>
            ))}
          </div>
          <VisualizationWidget
            onDataChange={setChartPoints}
            mode={mode}
            onModeChange={setMode}
            period={period}
            onPeriodChange={setPeriod}
            endDate={endDate}
            multiplier={multiplier}
          />
          <div className="bottom-grid">
            <section className="channels-card panel">
              <div className="section-header">
                <h2>Каналы продаж</h2>
                <button
                  className="text-button"
                  onClick={() => setDialog("report")}
                >
                  Подробнее <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="table-heading">
                <span>Канал</span>
                <span>Выручка</span>
                <span>Доля</span>
                <span>Изменение</span>
              </div>
              {[
                {
                  name: "Интернет-магазин",
                  icon: ShoppingBag,
                  share: 64,
                  change: "21,4",
                  color: "#269c78",
                  bg: "#edf8f3",
                },
                {
                  name: "Маркетплейсы",
                  icon: LayoutDashboard,
                  share: 26,
                  change: "15,2",
                  color: "#8b7ecb",
                  bg: "#f3effa",
                },
                {
                  name: "Прямые продажи",
                  icon: Users,
                  share: 10,
                  change: "8,7",
                  color: "#c39b5c",
                  bg: "#fbf5e9",
                },
              ].map((c) => (
                <div className="channel-row" key={c.name}>
                  <div className="channel-name">
                    <span style={{ background: c.bg, color: c.color }}>
                      <c.icon size={15} />
                    </span>
                    {c.name}
                  </div>
                  <strong>{money((revenue * c.share) / 100)}</strong>
                  <div className="share-cell">
                    <div className="share-track">
                      <i
                        style={{ width: `${c.share}%`, background: c.color }}
                      />
                    </div>
                    <span>{c.share}%</span>
                  </div>
                  <span className="channel-change">
                    <ArrowUpRight size={13} />
                    {c.change}%
                  </span>
                </div>
              ))}
            </section>
            <section className="insight-card">
              <div className="insight-label">
                <Sparkles size={15} />
                PULSE ИНСАЙТЫ<span>НОВОЕ</span>
              </div>
              <div className="insight-illustration">
                <div className="illustration-circle" />
                <svg viewBox="0 0 120 80" aria-hidden="true">
                  <path
                    d="M16 65V48M39 65V36M62 65V24M85 65V11"
                    stroke="#9bd2bb"
                    strokeWidth="13"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 35L38 20L59 24L91 3M76 3H91V18"
                    fill="none"
                    stroke="#27906c"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2>
                Хороший месяц.
                <br />
                Отличная динамика.
              </h2>
              <p>
                Выручка выросла на <strong>18,6%</strong>.<br />
                Интернет-магазин приносит больше
                <br />
                всего продаж — продолжайте в том же духе.
              </p>
              <button onClick={() => setDialog("report")}>
                Посмотреть отчёт <ArrowRight size={15} />
              </button>
            </section>
          </div>
          <footer className="page-footer">
            <span>
              <span className="footer-status" />
              Последнее обновление: сегодня, 12:45{" "}
              <span className="footer-dot">·</span> Демонстрационные данные
            </span>
            <span>
              Сделано для ясных решений <span className="footer-spark">✳</span>
            </span>
          </footer>
        </main>
      </div>
      {dialog && (
        <div className="modal-backdrop" onClick={() => setDialog(null)}>
          <section
            className="modal panel"
            role="dialog"
            aria-modal="true"
            aria-label={
              {
                sources: "Источники данных",
                settings: "Настройки",
                help: "Помощь",
                notifications: "Уведомления",
                report: "Отчёт",
              }[dialog]
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Закрыть"
              onClick={() => setDialog(null)}
            >
              <X size={20} />
            </button>
            {dialog === "sources" && (
              <>
                <span className="modal-icon">
                  <Database size={24} />
                </span>
                <h2>Источники данных</h2>
                <p>Подключите данные вашего бизнеса к Pulse.</p>
                <div className="source-item">
                  <span className="source-logo">
                    <ShoppingBag size={21} />
                  </span>
                  <div>
                    <strong>Демонстрационный магазин</strong>
                    <small>Продажи, заказы и конверсия</small>
                  </div>
                  <span className="connected">
                    <Check size={14} />
                    Подключён
                  </span>
                </div>
                <div className="source-item">
                  <span className="source-logo purple-bg">
                    <Activity size={21} />
                  </span>
                  <div>
                    <strong>Мониторинг API</strong>
                    <small>Время ответа и доступность</small>
                  </div>
                  <span className="connected">
                    <Check size={14} />
                    Подключён
                  </span>
                </div>
                <div className="source-item">
                  <span className="source-logo">
                    <Database size={21} />
                  </span>
                  <div>
                    <strong>CSV-файл</strong>
                    <small>
                      {sourceConnected
                        ? "Источник добавлен в проект"
                        : "Добавить собственный источник"}
                    </small>
                  </div>
                  <button
                    className="button"
                    onClick={() => {
                      setSourceConnected(true);
                      showToast("Источник добавлен");
                    }}
                    disabled={sourceConnected}
                  >
                    {sourceConnected ? <Check size={15} /> : <Plus size={15} />}
                  </button>
                </div>
                <p className="modal-note">
                  Это демопроект: подключённые источники используют тестовые
                  данные.
                </p>
              </>
            )}
            {dialog === "settings" && (
              <>
                <span className="modal-icon">
                  <Settings2 size={24} />
                </span>
                <h2>Настройки пространства</h2>
                <p>Ваш проект и личные предпочтения.</p>
                <label className="field-label">
                  Название проекта
                  <input
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                  />
                </label>
                <label className="settings-row">
                  <span>
                    <strong>Уведомления</strong>
                    <small>Изменения показателей и состояние систем</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={notifyEnabled}
                    onChange={(e) => setNotifyEnabled(e.target.checked)}
                  />
                </label>
                <button
                  className="button primary-button full-button"
                  onClick={() => {
                    setDialog(null);
                    showToast("Настройки сохранены");
                  }}
                >
                  Сохранить изменения
                </button>
              </>
            )}
            {dialog === "help" && (
              <>
                <span className="modal-icon">
                  <BookOpen size={24} />
                </span>
                <h2>Знакомство с Pulse</h2>
                <p>От данных к решениям — за пару кликов.</p>
                {[
                  [
                    "Выберите режим",
                    "Продажи показывают динамику выручки. Мониторинг — плотный временной ряд состояния API.",
                  ],
                  [
                    "Исследуйте график",
                    "Меняйте период, сравнивайте показатели и наводите курсор на точки. В мониторинге можно выделить область для увеличения.",
                  ],
                  [
                    "Сохраните результат",
                    "Кнопка «Экспорт» скачает данные активного режима в CSV.",
                  ],
                ].map(([title, text], i) => (
                  <div className="help-step" key={title}>
                    <span>{i + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
            {dialog === "notifications" && (
              <>
                <span className="modal-icon">
                  <Bell size={24} />
                </span>
                <h2>Уведомления</h2>
                <p>
                  {read
                    ? "Все уведомления прочитаны."
                    : "Что нового в вашем пространстве."}
                </p>
                <div className="notification-item">
                  <TrendingUp size={19} />
                  <div>
                    <strong>Выручка выросла на 18,6%</strong>
                    <p>
                      Ваш интернет-магазин показывает отличную динамику за июнь.
                    </p>
                    <small>Сегодня, 12:45</small>
                  </div>
                </div>
                <div className="notification-item">
                  <CheckCheck size={19} />
                  <div>
                    <strong>Все системы работают</strong>
                    <p>Доступность API за выбранный период — 99,98%.</p>
                    <small>Сегодня, 12:40</small>
                  </div>
                </div>
                <button
                  className="button full-button"
                  onClick={() => {
                    setRead(true);
                    showToast("Все уведомления прочитаны");
                  }}
                >
                  Отметить все как прочитанные
                </button>
              </>
            )}
            {dialog === "report" && (
              <>
                <span className="modal-icon">
                  <FileChartColumnIncreasing size={24} />
                </span>
                <h2>Отчёт по продажам</h2>
                <p>
                  {dateFormat(fromDate)} — {dateFormat(new Date(endDate))}{" "}
                  {new Date(endDate).getFullYear()}
                </p>
                <label className="field-label">
                  Название отчёта
                  <input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </label>
                <div className="report-total">
                  <span>Общая выручка</span>
                  <strong>{money(revenue)}</strong>
                </div>
                <div className="report-detail">
                  <span>Количество заказов</span>
                  <strong>
                    {Math.round(revenue / 1950).toLocaleString("ru-RU")}
                  </strong>
                </div>
                <div className="report-detail">
                  <span>Рост к прошлому периоду</span>
                  <strong className="green-text">+18,6%</strong>
                </div>
                <button
                  className="button primary-button full-button"
                  onClick={() => {
                    exportPoints(points, "sales");
                    showToast(`«${reportName || "Отчёт"}» экспортирован`);
                  }}
                >
                  <ArrowDownToLine size={16} />
                  Скачать отчёт CSV
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={15} />
          </span>
          {toast}
          <button
            className="icon-button"
            aria-label="Скрыть уведомление"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
