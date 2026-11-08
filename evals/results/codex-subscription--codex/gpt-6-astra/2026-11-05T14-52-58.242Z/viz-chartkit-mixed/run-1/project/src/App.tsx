import { useEffect, useMemo, useState } from "react";
import { Icon } from "./components/icons";
import { Visualization, type ChartMode } from "./components/Visualization";
import { salesData, monitoringData } from "./data";
import "./styles.css";

const money = (n: number) => Math.round(n).toLocaleString("ru-RU");
function Sparkline({ variant = 0 }: { variant?: number }) {
  const paths = [
    "M0 28L8 22L16 25L24 15L32 20L40 12L48 17L56 8L64 12L72 3",
    "M0 26L8 27L16 20L24 23L32 15L40 18L48 9L56 14L64 5L72 7",
    "M0 27L8 22L16 25L24 17L32 19L40 10L48 13L56 8L64 12L72 3",
    "M0 27L8 24L16 25L24 19L32 22L40 13L48 17L56 10L64 11L72 4",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 74 36">
      <path
        d={paths[variant]}
        fill="none"
        stroke="#a88bdc"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d={`${paths[variant]}L72 36L0 36Z`} fill="#a88bdc" opacity=".07" />
    </svg>
  );
}
export function App() {
  const [mode, setMode] = useState<ChartMode>("sales");
  const [days, setDays] = useState(30);
  const [minutes, setMinutes] = useState(60);
  const [comparison, setComparison] = useState(true);
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [menu, setMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [activeNav, setActiveNav] = useState("overview");
  const [project, setProject] = useState("Основной проект");
  const [projectName, setProjectName] = useState("");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [sidebar, setSidebar] = useState(false);
  useEffect(() => {
    if (mode !== "monitoring" || !live) return;
    const timer = setInterval(() => setTick((t) => t + 2), 2000);
    return () => clearInterval(timer);
  }, [mode, live]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setMenu(null);
        setSidebar(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const data = useMemo(
    () => (mode === "sales" ? salesData(days) : monitoringData(minutes, tick)),
    [mode, days, minutes, tick],
  );
  const total = data.reduce((s, p) => s + p.value, 0);
  const prev = data.reduce((s, p) => s + (p.previous || 0), 0);
  const growth = ((total / prev - 1) * 100).toFixed(1).replace(".", ",");
  const sales = mode === "sales";
  const bestPoint = data.reduce(
    (best, p) => (p.value > best.value ? p : best),
    data[0],
  );
  const bestDay = new Date(bestPoint.time).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
  const bestGain = Math.round(
    (bestPoint.value / (total / data.length) - 1) * 100,
  );
  const exportData = () => {
    const csv =
      "\uFEFFДата;" +
      (sales
        ? "Выручка;Предыдущий период"
        : "Время отклика (мс);Предыдущий период") +
      "\n" +
      data
        .map(
          (p) => `${new Date(p.time).toISOString()};${p.value};${p.previous}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `forma-${mode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Данные экспортированы в CSV");
    setMenu(null);
  };
  const navigate = (id: string) => {
    setActiveNav(id);
    setSidebar(false);
    if (id === "monitoring") setMode("monitoring");
    if (id === "overview") setMode("sales");
    if (id === "reports") setModal("reports");
    if (id === "sources")
      document
        .getElementById("sources")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const stats = sales
    ? [
        {
          label: "Общая выручка",
          value: money(total),
          unit: "₽",
          change: `+${growth}%`,
          icon: "chart",
        },
        {
          label: "Заказы",
          value: money(Math.round(total / 3240)),
          unit: "",
          change: "+12,8%",
          icon: "bag",
        },
        {
          label: "Средний чек",
          value: "3 240",
          unit: "₽",
          change: "+5,2%",
          icon: "users",
        },
        {
          label: "Конверсия",
          value: "3,62",
          unit: "%",
          change: "+0,8 п.п.",
          icon: "target",
        },
      ]
    : [
        {
          label: "Средний отклик",
          value: money(total / data.length),
          unit: "мс",
          change: "−18,4%",
          icon: "pulse",
        },
        {
          label: "Доступность",
          value: "99,98",
          unit: "%",
          change: "+0,02 п.п.",
          icon: "globe",
        },
        {
          label: "Запросов в минуту",
          value: "2 486",
          unit: "",
          change: "+12,8%",
          icon: "layers",
        },
        {
          label: "Доля ошибок",
          value: "0,02",
          unit: "%",
          change: "−0,01 п.п.",
          icon: "target",
        },
      ];
  return (
    <div className="app-shell">
      {sidebar && (
        <div className="mobile-scrim" onClick={() => setSidebar(false)} />
      )}
      <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          forma<span className="brand-period">.</span>
        </a>
        <div className="workspace-switch">
          <div className="workspace-avatar">F</div>
          <div>
            <strong>Forma workspace</strong>
            <span>Рабочее пространство</span>
          </div>
          <Icon name="down" size={15} />
        </div>
        <div className="nav-label">ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Основная навигация">
          {[
            ["overview", "grid", "Обзор"],
            ["reports", "chart", "Отчёты"],
            ["monitoring", "pulse", "Мониторинг"],
            ["sources", "layers", "Источники данных"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={`nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon name={icon} size={19} />
              <span>{label}</span>
              {id === "monitoring" && <span className="nav-live" />}
            </button>
          ))}
        </nav>
        <div className="nav-label projects-label">
          ПРОЕКТЫ
          <button
            aria-label="Создать проект"
            onClick={() => setModal("project")}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
        <button
          className="project-item"
          onClick={() => setMenu(menu === "projects" ? null : "projects")}
        >
          <span className="project-dot" />
          {project}
          <Icon name="down" size={14} />
        </button>
        {menu === "projects" && (
          <div className="project-dropdown">
            {["Основной проект", "Интернет-магазин"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setProject(p);
                  setMenu(null);
                  setToast(`Выбран проект «${p}»`);
                }}
              >
                {p}
                {p === project && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        )}
        <button className="add-project" onClick={() => setModal("project")}>
          <Icon name="plus" size={16} />
          Добавить проект
        </button>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-card-icon">✦</div>
            <strong>Больше возможностей</strong>
            <p>
              Все ваши данные.
              <br />
              Ещё больше полезных открытий.
            </p>
            <button onClick={() => setModal("pro")}>
              Открыть Forma Pro <Icon name="arrowRight" size={16} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon name="settings" size={19} />
            Настройки
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <Icon name="help" size={19} />
            Помощь и поддержка
            <Icon name="arrow" size={14} />
          </button>
          <div className="profile">
            <div className="avatar">АК</div>
            <div>
              <strong>Александр К.</strong>
              <span>Личный аккаунт</span>
            </div>
            <button aria-label="Профиль" onClick={() => setModal("profile")}>
              <Icon name="dots" size={19} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu"
              aria-label="Открыть меню"
              onClick={() => setSidebar(true)}
            >
              <Icon name="grid" />
            </button>
            <Icon name="globe" size={17} />
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{project}</strong>
          </div>
          <div className="top-actions">
            <button
              className="search-btn"
              onClick={() => setModal("search")}
              aria-label="Поиск"
            >
              <Icon name="search" size={18} />
              <span>Поиск</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="top-divider" />
            <button
              className="notification-btn"
              aria-label="Уведомления"
              onClick={() => {
                setModal("notifications");
                setNotifications(false);
              }}
            >
              <Icon name="bell" size={19} />
              {notifications && <i />}
            </button>
            <button
              className="avatar small"
              aria-label="Открыть профиль"
              onClick={() => setModal("profile")}
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
                Обзор аналитики
                <span className="heading-dot" />
              </h1>
              <p>Всё, что важно. В одном пространстве.</p>
            </div>
            <div className="page-actions">
              <span className="data-status">
                <i />
                Данные обновлены
              </span>
              <button className="button export-button" onClick={exportData}>
                <Icon name="download" size={16} />
                Экспорт
              </button>
            </div>
          </div>
          <div className="view-toolbar">
            <div
              className="mode-tabs"
              role="tablist"
              aria-label="Режим визуализации"
            >
              <button
                role="tab"
                aria-selected={sales}
                className={sales ? "selected" : ""}
                onClick={() => {
                  setMode("sales");
                  setActiveNav("overview");
                  setMenu(null);
                }}
              >
                <Icon name="chart" size={17} />
                Продажи
              </button>
              <button
                role="tab"
                aria-selected={!sales}
                className={!sales ? "selected" : ""}
                onClick={() => {
                  setMode("monitoring");
                  setActiveNav("monitoring");
                  setMenu(null);
                }}
              >
                <Icon name="pulse" size={18} />
                Мониторинг
                <span className="tab-dot" />
              </button>
            </div>
            <div className="period-controls">
              <span className="period-label">Период</span>
              <div className="dropdown-wrap">
                <button
                  className="button date-button"
                  aria-expanded={menu === "date"}
                  onClick={() => setMenu(menu === "date" ? null : "date")}
                >
                  <Icon name="calendar" size={16} />
                  {sales
                    ? `${31 - days} — 30 июня 2026`
                    : `Последние ${minutes} мин`}
                  <Icon name="down" size={13} />
                </button>
                {menu === "date" && (
                  <div className="dropdown date-menu">
                    {(sales ? [7, 14, 30] : [5, 15, 60]).map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          sales ? setDays(n) : setMinutes(n);
                          setMenu(null);
                        }}
                      >
                        {sales ? `Последние ${n} дней` : `Последние ${n} минут`}
                        {n === (sales ? days : minutes) && (
                          <Icon name="check" size={15} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <section className="stats-grid" aria-label="Основные показатели">
            {stats.map((s, i) => (
              <article className="stat-card" key={s.label}>
                <div className="stat-label">
                  {s.label}
                  <Icon name={s.icon} size={17} />
                </div>
                <div className="stat-value">
                  {s.value}
                  <span>{s.unit}</span>
                </div>
                <div className="stat-bottom">
                  <span className="positive">
                    <Icon name="arrow" size={11} />
                    {s.change}
                  </span>
                  <span className="stat-comparison">к прошлому периоду</span>
                  <Sparkline variant={i} />
                </div>
              </article>
            ))}
          </section>
          <section className="chart-card" aria-label="Виджет визуализации">
            <div className="chart-heading">
              <div>
                <h2>
                  {sales ? "Динамика продаж" : "Мониторинг системы"}
                  <span
                    className="info-dot"
                    title={
                      sales
                        ? "Сумма выручки по дням"
                        : "Время отклика сервера каждую секунду"
                    }
                  >
                    i
                  </span>
                </h2>
                <p>
                  {sales
                    ? "Следите за выручкой и находите точки роста."
                    : "Каждая секунда под контролем. Все сигналы на одном графике."}
                </p>
              </div>
              <div className="chart-tools">
                <label className="compare-label">
                  <input
                    type="checkbox"
                    checked={comparison}
                    onChange={(e) => setComparison(e.target.checked)}
                  />
                  <span className="toggle" />
                  Сравнить периоды
                </label>
                <span className="chart-tool-divider" />
                {!sales && (
                  <button
                    className="icon-button"
                    onClick={() => setLive(!live)}
                    aria-label={
                      live
                        ? "Приостановить обновление"
                        : "Возобновить обновление"
                    }
                  >
                    <Icon name={live ? "pause" : "play"} size={16} />
                  </button>
                )}
                <div className="dropdown-wrap">
                  <button
                    className="icon-button"
                    aria-label="Действия с графиком"
                    onClick={() => setMenu(menu === "chart" ? null : "chart")}
                  >
                    <Icon name="dots" size={20} />
                  </button>
                  {menu === "chart" && (
                    <div className="dropdown chart-menu">
                      <button onClick={exportData}>
                        <Icon name="download" size={15} />
                        Скачать CSV
                      </button>
                      <button
                        onClick={() => {
                          setModal("api");
                          setMenu(null);
                        }}
                      >
                        <Icon name="code" size={15} />
                        API виджета
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="chart-summary">
              <div className="chart-main-value">
                {sales ? money(total) : money(total / data.length)}
                <span>{sales ? "₽" : "мс"}</span>
                <span className="growth-badge">
                  <Icon name="arrow" size={12} />
                  {sales ? `+${growth}%` : "−18,4%"}
                </span>
              </div>
              <div className="chart-legend">
                <span>
                  <i className="legend-dot" />
                  {sales ? "Текущий период" : "Время отклика"}
                </span>
                {comparison && (
                  <span>
                    <i className="legend-line" />
                    {"Предыдущий период"}
                  </span>
                )}
              </div>
            </div>
            <Visualization mode={mode} data={data} comparison={comparison} />
            <div className="chart-footer">
              <span>
                <span className="engine-dot" />
                {sales ? "Линейный график" : "Временной ряд"}
                <span className="footer-dot">·</span>
                {data.length.toLocaleString("ru-RU")}{" "}
                {sales ? "точек данных" : "измерений"}
                <span className="footer-dot">·</span>
                {sales
                  ? "По дням"
                  : live
                    ? "Обновление каждые 2 сек"
                    : "Обновление приостановлено"}
              </span>
              <span className="timezone">
                <Icon name="clock" size={13} />
                UTC +0
              </span>
            </div>
          </section>
          <div className="bottom-grid">
            <section className="sources-card" id="sources">
              <div className="section-heading">
                <div>
                  <h2>
                    {sales ? "Откуда приходят продажи" : "Состояние сервисов"}
                  </h2>
                  <p>
                    {sales
                      ? "Источники, которые работают на вас."
                      : "Стабильность вашей инфраструктуры."}
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setModal("sources")}
                >
                  Подробнее
                  <Icon name="arrowRight" size={15} />
                </button>
              </div>
              {sales ? (
                <>
                  <div className="stacked-bar">
                    <div style={{ width: "42%" }} />
                    <div style={{ width: "28%" }} />
                    <div style={{ width: "18%" }} />
                    <div style={{ width: "12%" }} />
                  </div>
                  <div className="source-table">
                    <div className="table-head">
                      <span>ИСТОЧНИК</span>
                      <span>ВЫРУЧКА</span>
                      <span>ДОЛЯ</span>
                    </div>
                    {[
                      ["Органический поиск", 42],
                      ["Прямые переходы", 28],
                      ["Социальные сети", 18],
                      ["Другие источники", 12],
                    ].map(([label, percent], i) => (
                      <div className="source-row" key={label}>
                        <span>
                          <i className={`source-dot source-${i}`} />
                          {label}
                        </span>
                        <strong>
                          {money((total * Number(percent)) / 100)} ₽
                        </strong>
                        <span>{percent}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="services">
                  {[
                    ["API Gateway", "78 мс"],
                    ["База данных", "12 мс"],
                    ["Платёжный сервис", "134 мс"],
                    ["CDN / статика", "24 мс"],
                  ].map(([name, value]) => (
                    <div className="service-row" key={name}>
                      <span>
                        <i />
                        {name}
                      </span>
                      <strong>{value}</strong>
                      <span className="service-status">Работает</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="insights-card">
              <div className="section-heading">
                <div>
                  <h2>
                    За цифрами — возможности{" "}
                    <span className="insight-spark">✧</span>
                  </h2>
                  <p>Немного контекста для ваших решений.</p>
                </div>
              </div>
              <div className="insight-feature">
                <div className="insight-icon">
                  <Icon name={sales ? "chart" : "pulse"} size={20} />
                </div>
                <div>
                  <span className="insight-label">
                    {sales ? "ХОРОШАЯ ДИНАМИКА" : "ВСЁ ПОД КОНТРОЛЕМ"}
                  </span>
                  <h3>
                    {sales
                      ? "Ваш бизнес набирает темп"
                      : "Система работает стабильно"}
                  </h3>
                  <p>
                    {sales ? (
                      <>
                        Выручка выросла на <strong>{growth}%</strong> по
                        сравнению
                        <br className="desktop-break" /> с предыдущим периодом.
                        Так держать!
                      </>
                    ) : (
                      <>
                        Среднее время отклика снизилось на{" "}
                        <strong>18,4%</strong>.<br className="desktop-break" />{" "}
                        Все сервисы работают в штатном режиме.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="insight-note">
                <span className="note-icon">
                  <Icon name={sales ? "calendar" : "clock"} size={17} />
                </span>
                <p>
                  {sales ? (
                    <>
                      Самый продуктивный день — <strong>{bestDay}.</strong>
                      <br />
                      Продажи на {bestGain}% выше среднего.
                    </>
                  ) : (
                    <>
                      Доступность за последние 30 дней —{" "}
                      <strong>99,98%.</strong>
                      <br />
                      Активных инцидентов нет.
                    </>
                  )}
                </p>
              </div>
              <button
                className="insights-link"
                onClick={() => setModal("reports")}
              >
                Перейти к подробному отчёту
                <Icon name="arrowRight" size={16} />
              </button>
            </section>
          </div>
          <footer className="page-footer">
            <span>
              <span className="mini-brand">✦</span> Меньше шума. Больше ясности.
            </span>
            <span>
              Демонстрационные данные<span className="footer-dot">·</span>Forma
              Analytics
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button onClick={() => setToast("")} aria-label="Закрыть уведомление">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Информационная панель"
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon name="close" />
            </button>
            {modal === "search" ? (
              <>
                <h2>Поиск по пространству</h2>
                <div className="search-field">
                  <Icon name="search" />
                  <input
                    autoFocus
                    placeholder="Продажи, мониторинг, источники…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="search-results">
                  {[
                    ["overview", "Обзор продаж"],
                    ["monitoring", "Мониторинг системы"],
                    ["sources", "Источники данных"],
                    ["reports", "Подробные отчёты"],
                  ]
                    .filter(([, name]) =>
                      name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map(([id, label]) => (
                      <button
                        key={id}
                        onClick={() => {
                          setModal(null);
                          navigate(id);
                        }}
                      >
                        <Icon name={id === "monitoring" ? "pulse" : "chart"} />
                        {label}
                        <Icon name="arrowRight" size={16} />
                      </button>
                    ))}
                  {![
                    "Обзор продаж",
                    "Мониторинг системы",
                    "Источники данных",
                    "Подробные отчёты",
                  ].some((s) =>
                    s.toLowerCase().includes(search.toLowerCase()),
                  ) && <p>Ничего не найдено. Попробуйте другой запрос.</p>}
                </div>
              </>
            ) : modal === "project" ? (
              <>
                <span className="modal-eyebrow">ВАШЕ ПРОСТРАНСТВО</span>
                <h2>Новый проект</h2>
                <p>Соберите связанные показатели в отдельном проекте.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (projectName.trim()) {
                      setProject(projectName.trim());
                      setProjectName("");
                      setModal(null);
                      setToast(
                        "Проект создан. Сейчас в нём показаны демоданные.",
                      );
                    }
                  }}
                >
                  <label className="field-label">
                    Название проекта
                    <input
                      autoFocus
                      required
                      maxLength={40}
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Например, Интернет-магазин"
                    />
                  </label>
                  <button className="button primary" type="submit">
                    Создать проект
                    <Icon name="plus" size={16} />
                  </button>
                </form>
              </>
            ) : modal === "api" ? (
              <>
                <span className="modal-eyebrow">ЕДИНЫЙ ИНТЕРФЕЙС</span>
                <h2>Один виджет. Два движка.</h2>
                <p>
                  Режим продаж использует SVG, мониторинг — Canvas. Модули
                  загружаются при первом выборе режима.
                </p>
                <pre>{`<Visualization\n  mode="${mode}"\n  data={[{ time, value, previous }]}\n  comparison={true}\n  onHover={(point) => {}}\n/>`}</pre>
                <p className="modal-small">
                  mode: sales | monitoring · time: Unix timestamp в мс
                </p>
              </>
            ) : modal === "reports" ? (
              <>
                <span className="modal-eyebrow">ОТЧЁТ ЗА ПЕРИОД</span>
                <h2>{sales ? "Продажи в деталях" : "Состояние системы"}</h2>
                <p>
                  {sales
                    ? `Последние ${days} дней, июнь 2026`
                    : `Последние ${minutes} минут`}
                </p>
                <div className="report-list">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <span>{s.label}</span>
                      <strong>
                        {s.value} {s.unit}
                      </strong>
                      <span className="positive">{s.change}</span>
                    </div>
                  ))}
                </div>
                <p className="modal-small">
                  Демонстрационный отчёт. Экспорт содержит все точки текущего
                  графика.
                </p>
                <button className="button primary" onClick={exportData}>
                  <Icon name="download" size={16} />
                  Скачать подробный CSV
                </button>
              </>
            ) : modal === "sources" ? (
              <>
                <span className="modal-eyebrow">ИСТОЧНИКИ ДАННЫХ</span>
                <h2>{sales ? "Каналы продаж" : "Подключённые сервисы"}</h2>
                <p>Данные проекта «{project}» за выбранный период.</p>
                <div className="report-list">
                  {(sales
                    ? [
                        ["Органический поиск", "42%", "Поисковые системы"],
                        [
                          "Прямые переходы",
                          "28%",
                          "Адресная строка и закладки",
                        ],
                        ["Социальные сети", "18%", "Переходы из соцсетей"],
                        ["Другие источники", "12%", "Email и партнёры"],
                      ]
                    : [
                        ["API Gateway", "78 мс", "Работает"],
                        ["База данных", "12 мс", "Работает"],
                        ["Платёжный сервис", "134 мс", "Работает"],
                        ["CDN", "24 мс", "Работает"],
                      ]
                  ).map(([name, value, desc]) => (
                    <div key={name}>
                      <span>
                        {name}
                        <small>{desc}</small>
                      </span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : modal === "notifications" ? (
              <>
                <h2>Уведомления</h2>
                <div className="notification-item">
                  <span className="notification-icon">
                    <Icon name="check" />
                  </span>
                  <div>
                    <strong>Данные успешно обновлены</strong>
                    <p>Все показатели проекта синхронизированы.</p>
                    <small>Сегодня, 14:00</small>
                  </div>
                </div>
                <div className="notification-item">
                  <span className="notification-icon">
                    <Icon name="chart" />
                  </span>
                  <div>
                    <strong>Отчёт за июнь готов</strong>
                    <p>Посмотрите, как изменились ваши показатели.</p>
                    <button
                      className="text-button"
                      onClick={() => setModal("reports")}
                    >
                      Открыть отчёт
                      <Icon name="arrowRight" size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : modal === "settings" ? (
              <>
                <h2>Настройки виджета</h2>
                <p>
                  Настройте отображение данных для вашего рабочего процесса.
                </p>
                <div className="settings-row">
                  <span>Сравнение с предыдущим периодом</span>
                  <input
                    type="checkbox"
                    checked={comparison}
                    onChange={(e) => setComparison(e.target.checked)}
                  />
                </div>
                <div className="settings-row">
                  <span>Автообновление мониторинга</span>
                  <input
                    type="checkbox"
                    checked={live}
                    onChange={(e) => setLive(e.target.checked)}
                  />
                </div>
                <div className="settings-row">
                  <span>Часовой пояс</span>
                  <strong>UTC +0</strong>
                </div>
                <button
                  className="button primary"
                  onClick={() => {
                    setModal(null);
                    setToast("Настройки применены");
                  }}
                >
                  Готово
                  <Icon name="check" size={16} />
                </button>
              </>
            ) : modal === "help" ? (
              <>
                <span className="modal-eyebrow">РЯДОМ, КОГДА НУЖНО</span>
                <h2>Как работать с аналитикой</h2>
                <div className="help-content">
                  <h3>Выберите режим</h3>
                  <p>
                    «Продажи» покажет выручку по дням. «Мониторинг» — плотный
                    ряд времени отклика с обновлением каждые 2 секунды.
                  </p>
                  <h3>Исследуйте данные</h3>
                  <p>
                    Наведите курсор на график, чтобы увидеть точное значение.
                    Меняйте период и включайте сравнение.
                  </p>
                  <h3>Сохраните результат</h3>
                  <p>
                    Кнопка «Экспорт» скачает CSV с данными выбранного режима.
                  </p>
                </div>
                <button className="text-button" onClick={() => setModal("api")}>
                  Посмотреть API виджета
                  <Icon name="arrowRight" size={15} />
                </button>
              </>
            ) : modal === "profile" ? (
              <>
                <div className="avatar profile-large">АК</div>
                <h2>Александр К.</h2>
                <p>Личный аккаунт · Forma workspace</p>
                <div className="settings-row">
                  <span>Текущий проект</span>
                  <strong>{project}</strong>
                </div>
                <div className="settings-row">
                  <span>Тариф</span>
                  <strong>Free</strong>
                </div>
                <p className="modal-small">
                  Вы используете демонстрационное рабочее пространство.
                </p>
              </>
            ) : (
              <>
                <span className="modal-eyebrow">FORMA PRO</span>
                <h2>Больше места для роста</h2>
                <p>Профессиональная аналитика для вашей команды.</p>
                <div className="pro-features">
                  {[
                    "Неограниченное количество проектов",
                    "История данных за 12 месяцев",
                    "Совместная работа и доступы",
                    "Автоматические отчёты",
                  ].map((t) => (
                    <p key={t}>
                      <Icon name="check" size={18} />
                      {t}
                    </p>
                  ))}
                </div>
                <div className="pro-notice">
                  Тариф Pro скоро появится. Сейчас все возможности
                  демонстрационного виджета доступны бесплатно.
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
