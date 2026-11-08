import { useMemo, useState, useEffect } from "react";
import { Icon } from "./components/Icon";
import { Visualization, type Series } from "./components/Visualization";
import "./styles.css";
type Mode = "sales" | "monitoring";
const money = (v: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(v);
const shortDate = (x: number) =>
  new Date(x)
    .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
    .replace(".", "");
const time = (x: number) =>
  new Date(x).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
const salesValues = [
  91, 111, 101, 83, 95, 141, 125, 116, 139, 148, 109, 121, 166, 158, 137, 152,
  143, 176, 184, 156, 166, 211, 185, 178, 194, 218, 207, 231, 203, 226,
];
const salesScale = 2858040 / salesValues.reduce((sum, v) => sum + v, 0);
const dailyRevenue = salesValues.map((v) => Math.round(v * salesScale));
dailyRevenue[29] += 2858040 - dailyRevenue.reduce((sum, v) => sum + v, 0);
const channels = [
  {
    name: "Интернет-магазин",
    sub: "Основной сайт",
    icon: "globe",
    color: "purple",
    revenue: 1486200,
    orders: 412,
    change: 18.6,
    share: 52,
  },
  {
    name: "Маркетплейсы",
    sub: "Ozon, Wildberries",
    icon: "bag",
    color: "blue",
    revenue: 857400,
    orders: 286,
    change: 14.2,
    share: 30,
  },
  {
    name: "Прямые продажи",
    sub: "Отдел продаж",
    icon: "money",
    color: "orange",
    revenue: 514440,
    orders: 94,
    change: 9.8,
    share: 18,
  },
];
export function App() {
  const [mode, setMode] = useState<Mode>("sales");
  const [active, setActive] = useState("overview");
  const [period, setPeriod] = useState(30);
  const [dateOpen, setDateOpen] = useState(false);
  const [channel, setChannel] = useState("all");
  const [compare, setCompare] = useState(true);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"settings" | "help" | "channels" | null>(
    null,
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspace, setWorkspace] = useState("Acme Store");
  const [refresh, setRefresh] = useState(0);
  const [updated, setUpdated] = useState("Только что");
  const [autoRefresh, setAutoRefresh] = useState(true);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (mode !== "monitoring" || !autoRefresh) return;
    const id = setInterval(() => {
      setRefresh((v) => v + 1);
      setUpdated("Только что");
    }, 15000);
    return () => clearInterval(id);
  }, [mode, autoRefresh]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(".date-wrap")) setDateOpen(false);
      if (!target.closest(".workspace-wrap")) setWorkspaceOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(".modal button,.modal input"),
        );
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [modal]);
  const factor =
    ((channel === "all"
      ? 1
      : channels.find((c) => c.name === channel)!.share / 100) *
      (workspace === "Acme Store" ? 1 : 0.64) *
      dailyRevenue.slice(-period).reduce((sum, v) => sum + v, 0)) /
    2858040;
  const series = useMemo<Series[]>(() => {
    if (mode === "sales") {
      const data = dailyRevenue.slice(30 - period).map((v, i) => ({
        x: Date.UTC(2025, 5, 31 - period + i),
        y:
          v *
          (channel === "all"
            ? 1
            : channels.find((c) => c.name === channel)!.share / 100) *
          (workspace === "Acme Store" ? 1 : 0.64),
      }));
      return [
        { id: "current", label: "Текущий период", color: "#9276df", data },
        ...(compare
          ? [
              {
                id: "previous",
                label: "Предыдущий период",
                color: "#b1c883",
                dashed: true,
                data: data.map((p, i) => ({
                  ...p,
                  y: p.y * (0.65 + 0.16 * Math.sin(i * 0.75 + 1)),
                })),
              },
            ]
          : []),
      ];
    }
    const end = Date.UTC(2025, 5, 30, 12, 0, refresh * 15);
    const data = Array.from({ length: 3600 }, (_, i) => ({
      x: end - (3599 - i) * 1000,
      y: Math.round(
        112 +
          18 * Math.sin(i * 0.017) +
          12 * Math.sin(i * 0.43) +
          7 * Math.sin(i * 2.1) +
          ((i + refresh * 19) % 237 < 7 ? 95 : 0),
      ),
    }));
    return [
      { id: "latency", label: "Время отклика", color: "#9276df", data },
      ...(compare
        ? [
            {
              id: "baseline",
              label: "Базовый уровень",
              color: "#b1c883",
              dashed: true,
              data: data.map((p, i) => ({
                ...p,
                y: 80 + 9 * Math.sin(i * 0.025),
              })),
            },
          ]
        : []),
    ];
  }, [mode, period, channel, compare, workspace, refresh]);
  const stats =
    mode === "sales"
      ? [
          {
            label: "Общая выручка",
            value: money(2858040 * factor),
            unit: "₽",
            change: "+16,8%",
            icon: "money",
            note: "к предыдущему периоду",
          },
          {
            label: "Заказы",
            value: money(792 * factor),
            unit: "",
            change: "+12,4%",
            icon: "bag",
            note: "к предыдущему периоду",
          },
          {
            label: "Средний чек",
            value: "3 609",
            unit: "₽",
            change: "+3,9%",
            icon: "ticket",
            note: "к предыдущему периоду",
          },
          {
            label: "Конверсия",
            value: "4,28",
            unit: "%",
            change: "+0,6 п.п.",
            icon: "target",
            note: "к предыдущему периоду",
          },
        ]
      : [
          {
            label: "Среднее время отклика",
            value: "112",
            unit: "мс",
            change: "−8,2%",
            icon: "clock",
            note: "за последний час",
          },
          {
            label: "Запросов в минуту",
            value: "2 406",
            unit: "",
            change: "+12,4%",
            icon: "pulse",
            note: "за последний час",
          },
          {
            label: "Доступность",
            value: "99,98",
            unit: "%",
            change: "+0,02 п.п.",
            icon: "target",
            note: "за последний час",
          },
          {
            label: "Частота ошибок",
            value: "0,02",
            unit: "%",
            change: "−0,04 п.п.",
            icon: "bolt",
            note: "за последний час",
          },
        ];
  function navigate(next: string) {
    setActive(next);
    if (next === "monitoring") setMode("monitoring");
    if (next === "overview") setMode("sales");
    if (next === "channels") setModal("channels");
    if (next === "settings") setModal("settings");
  }
  function exportData() {
    const csv =
      "\uFEFFДата;Серия;Значение\n" +
      series
        .flatMap((s) =>
          s.data.map(
            (p) =>
              `${new Date(p.x).toISOString()};${s.label};${Number(p.y.toFixed(2))}`,
          ),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-${mode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Данные экспортированы в CSV");
  }
  function changeMode(value: Mode) {
    setMode(value);
    setActive(value === "sales" ? "overview" : "monitoring");
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-mark">✳</span>pulse
          <span className="brand-dot">.</span>
        </a>
        <div className="workspace-wrap">
          <button
            className="workspace"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            aria-expanded={workspaceOpen}
          >
            <span className="workspace-avatar">
              {workspace === "Acme Store" ? "A" : "S"}
            </span>
            <span>
              <strong>{workspace}</strong>
              <small>Рабочее пространство</small>
            </span>
            <Icon name="down" size={15} />
          </button>
          {workspaceOpen && (
            <div className="workspace-menu">
              {["Acme Store", "Studio Shop"].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setWorkspace(w);
                    setWorkspaceOpen(false);
                    setToast(`Выбрано пространство ${w}`);
                  }}
                >
                  {w}
                  {w === workspace && <Icon name="check" size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="nav-heading">АНАЛИТИКА</div>
        <nav>
          {[
            { id: "overview", name: "Обзор", icon: "grid" },
            { id: "monitoring", name: "Мониторинг", icon: "pulse" },
            { id: "channels", name: "Источники данных", icon: "layers" },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.name}</span>
              {item.id === "monitoring" && <span className="tiny-live" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-status">
            <span className="status-orbit">
              <Icon name="check" size={14} />
            </span>
            <div>
              <strong>Все системы в норме</strong>
              <small>Данные синхронизированы</small>
            </div>
          </div>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon name="settings" size={19} />
            Настройки
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <Icon name="help" size={19} />
            Помощь и поддержка
            <Icon name="external" size={13} />
          </button>
          <div className="profile">
            <div className="profile-avatar">АК</div>
            <div>
              <strong>Алексей Ковалёв</strong>
              <small>Администратор</small>
            </div>
            <button
              aria-label="Настройки профиля"
              onClick={() => setModal("settings")}
            >
              <Icon name="down" size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="grid" size={17} />
            <span>Рабочее пространство</span>
            <span className="slash">/</span>
            <strong>{mode === "sales" ? "Обзор" : "Мониторинг"}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-dot" />
            Данные обновлены
            <span className="top-divider" />
            <span className="top-avatar">АК</span>
          </div>
        </header>
        <main>
          <section className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div>
              <h1>
                {mode === "sales" ? "Обзор аналитики" : "Мониторинг системы"}
                <span className="heading-dot" />
              </h1>
              <p>
                {mode === "sales"
                  ? "От общей картины к деталям. Всё важное — в одном месте."
                  : "Следите за производительностью и состоянием ваших сервисов."}
              </p>
            </div>
            <div className="heading-actions">
              {mode === "sales" ? (
                <div className="date-wrap">
                  <button
                    className="button"
                    onClick={() => setDateOpen(!dateOpen)}
                    aria-expanded={dateOpen}
                  >
                    <Icon name="calendar" size={17} />
                    {31 - period} – 30 июня, 2025
                    <Icon name="down" size={15} />
                  </button>
                  {dateOpen && (
                    <div className="date-menu">
                      <div className="menu-label">Период аналитики</div>
                      {[7, 14, 30].map((days) => (
                        <button
                          key={days}
                          onClick={() => {
                            setPeriod(days);
                            setDateOpen(false);
                          }}
                        >
                          Последние {days} дней
                          {days === period && <Icon name="check" size={17} />}
                        </button>
                      ))}
                      <small>Демонстрационные данные · июнь 2025</small>
                    </div>
                  )}
                </div>
              ) : (
                <span className="button">
                  <Icon name="clock" size={17} />
                  Последний час
                </span>
              )}
              <button className="button dark-button" onClick={exportData}>
                <Icon name="download" size={17} />
                Экспорт
              </button>
            </div>
          </section>
          <section className="stats-grid">
            {stats.map((s, i) => (
              <article
                className={`stat-card ${i === 0 ? "featured" : ""}`}
                key={s.label}
              >
                <div className="stat-label">
                  {s.label}
                  <span className="stat-icon">
                    <Icon name={s.icon} size={18} />
                  </span>
                </div>
                <div className="stat-value">
                  {s.value}
                  <span>{s.unit}</span>
                </div>
                <div className="stat-bottom">
                  <span className="change">
                    <Icon name="arrow" size={12} />
                    {s.change}
                  </span>
                  <span>{s.note}</span>
                </div>
              </article>
            ))}
          </section>
          <section className="chart-card">
            <div className="chart-top">
              <div className="chart-title">
                <span className="section-icon">
                  <Icon name="chart" size={20} />
                </span>
                <div>
                  <h2>Динамика показателей</h2>
                  <p>Данные, которые помогают видеть больше</p>
                </div>
              </div>
              <div
                className="segmented"
                role="tablist"
                aria-label="Режим визуализации"
              >
                <button
                  role="tab"
                  aria-selected={mode === "sales"}
                  className={mode === "sales" ? "selected" : ""}
                  onClick={() => changeMode("sales")}
                >
                  <Icon name="chart" size={16} />
                  Продажи
                </button>
                <button
                  role="tab"
                  aria-selected={mode === "monitoring"}
                  className={mode === "monitoring" ? "selected" : ""}
                  onClick={() => changeMode("monitoring")}
                >
                  <Icon name="pulse" size={17} />
                  Мониторинг
                </button>
              </div>
            </div>
            <div className="chart-toolbar">
              <div className="chart-metric">
                <span>
                  {mode === "sales" ? "Выручка" : "Время отклика"}
                  <Icon name="info" size={13} />
                </span>
                <strong>
                  {mode === "sales" ? `${money(2858040 * factor)} ₽` : "112 мс"}
                  <span className="growth-pill">
                    <Icon name="arrow" size={12} />
                    {mode === "sales" ? "16,8%" : "8,2%"}
                  </span>
                </strong>
              </div>
              <div className="chart-options">
                <div className="legend">
                  <span>
                    <i className="legend-dot purple-dot" />
                    {mode === "sales" ? "Текущий период" : "Время отклика"}
                  </span>
                  {compare && (
                    <span>
                      <i className="legend-dot green-dot" />
                      {mode === "sales"
                        ? "Предыдущий период"
                        : "Базовый уровень"}
                    </span>
                  )}
                </div>
                {mode === "sales" ? (
                  <div className="select-wrap">
                    <select
                      aria-label="Источник продаж"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                    >
                      <option value="all">Все источники</option>
                      {channels.map((c) => (
                        <option key={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <Icon name="down" size={13} />
                  </div>
                ) : (
                  <span className="monitor-live">
                    <span className="live-dot" />
                    {autoRefresh
                      ? "В реальном времени"
                      : "Обновление приостановлено"}
                  </span>
                )}
              </div>
            </div>
            <div className="axis-caption">
              {mode === "sales" ? "ВЫРУЧКА, ₽" : "ВРЕМЯ ОТКЛИКА, МС"}
            </div>
            <Visualization
              mode={mode}
              series={series}
              unit={mode === "sales" ? "₽" : "мс"}
              formatX={mode === "sales" ? shortDate : time}
              formatY={money}
            />
            <div className="chart-footer">
              <span>
                <Icon name={mode === "sales" ? "bolt" : "pulse"} size={15} />
                {mode === "sales" ? (
                  <>
                    Лучший день — <strong>28 июня</strong>
                    <span className="footer-separator">·</span>
                    {money(Math.max(...series[0].data.map((p) => p.y)))} ₽
                  </>
                ) : (
                  <>
                    <strong>3 600 точек</strong>
                    <span className="footer-separator">·</span>Интервал — 1
                    секунда
                  </>
                )}
              </span>
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={compare}
                  onChange={(e) => setCompare(e.target.checked)}
                />
                <span className="switch" />
                {mode === "sales"
                  ? "Сравнить с прошлым периодом"
                  : "Показать базовый уровень"}
              </label>
            </div>
          </section>
          <section className="bottom-grid">
            <article className="sources-card">
              <div className="section-top">
                <div>
                  <h2>
                    {mode === "sales"
                      ? "Продажи по источникам"
                      : "Состояние сервисов"}
                  </h2>
                  <p>
                    {mode === "sales"
                      ? "Откуда приходят ваши покупатели"
                      : "Доступность и производительность"}
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setModal("channels")}
                >
                  Все источники
                  <Icon name="chevron" size={14} />
                </button>
              </div>
              {mode === "sales" ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ИСТОЧНИК</th>
                        <th>ВЫРУЧКА</th>
                        <th>ДИНАМИКА</th>
                        <th>ДОЛЯ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.map((c) => (
                        <tr
                          key={c.name}
                          className={channel === c.name ? "row-selected" : ""}
                          onClick={() =>
                            setChannel(channel === c.name ? "all" : c.name)
                          }
                        >
                          <td>
                            <span className={`source-icon ${c.color}`}>
                              <Icon name={c.icon} size={18} />
                            </span>
                            <span>
                              <strong>{c.name}</strong>
                              <small>{c.sub}</small>
                            </span>
                          </td>
                          <td>
                            {money(
                              (c.share / 100) *
                                dailyRevenue
                                  .slice(-period)
                                  .reduce((sum, v) => sum + v, 0) *
                                (workspace === "Acme Store" ? 1 : 0.64),
                            )}{" "}
                            ₽
                          </td>
                          <td>
                            <span className="table-growth">
                              ↗ +{c.change.toString().replace(".", ",")}%
                            </span>
                          </td>
                          <td>
                            <div className="share">
                              <span className="share-track">
                                <span style={{ width: `${c.share}%` }} />
                              </span>
                              {c.share}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="service-list">
                  {[
                    { name: "API Gateway", latency: "84 мс" },
                    { name: "База данных", latency: "12 мс" },
                    { name: "Платёжный сервис", latency: "112 мс" },
                  ].map((s) => (
                    <div key={s.name}>
                      <span className="source-icon purple">
                        <Icon name="layers" size={18} />
                      </span>
                      <strong>{s.name}</strong>
                      <span>{s.latency}</span>
                      <span className="healthy">
                        <span className="live-dot" />
                        Работает
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
            <article className="insight-card">
              <div className="insight-heading">
                <span className="insight-icon">
                  <Icon name="bolt" size={19} />
                </span>
                <span>Полезное наблюдение</span>
                <span className="insight-tag">INSIGHT</span>
              </div>
              <h3>
                {mode === "sales" ? (
                  <>
                    Хороший месяц.
                    <br />И это видно в цифрах.
                  </>
                ) : (
                  <>
                    Всё под контролем.
                    <br />
                    Система работает стабильно.
                  </>
                )}
              </h3>
              <p>
                {mode === "sales" ? (
                  <>
                    Выручка выросла на <strong>16,8%</strong> относительно
                    прошлого периода. Основной вклад — у интернет-магазина.
                  </>
                ) : (
                  <>
                    Среднее время отклика снизилось на <strong>8,2%</strong>.
                    Все сервисы доступны и работают в пределах нормы.
                  </>
                )}
              </p>
              <div className="insight-chart" aria-hidden="true">
                {[
                  26, 37, 31, 46, 39, 54, 50, 64, 59, 72, 67, 88, 78, 96, 89,
                  110, 105, 122,
                ].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      height: h / 1.7,
                      background:
                        i > 13 ? "#b9d995" : i > 8 ? "#d0dfbc" : "#e0e9d5",
                    }}
                  />
                ))}
              </div>
              <div className="insight-footer">
                <span className="live-dot" />
                {mode === "sales"
                  ? "Продолжайте в том же темпе"
                  : "Производительность в норме"}
                <Icon name="arrow" size={16} />
              </div>
            </article>
          </section>
          <footer className="page-footer">
            <span>
              <span className="live-dot" />
              Последнее обновление: {updated.toLowerCase()}
              <button
                aria-label="Обновить данные"
                title="Обновить данные"
                onClick={() => {
                  setRefresh((v) => v + 1);
                  setUpdated(
                    new Date().toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  );
                  setToast("Демонстрационные данные обновлены");
                }}
              >
                <Icon name="refresh" size={13} />
              </button>
            </span>
            <span>
              Демонстрационные данные<span className="footer-separator">·</span>
              Часовой пояс: UTC
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={() => setModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModal(null);
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
              autoFocus
              className="modal-close"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon name="close" />
            </button>
            <span className="modal-icon">
              <Icon
                name={
                  modal === "settings"
                    ? "settings"
                    : modal === "help"
                      ? "help"
                      : "layers"
                }
                size={24}
              />
            </span>
            <h2 id="modal-title">
              {modal === "settings"
                ? "Настройки пространства"
                : modal === "help"
                  ? "Всё важное о Pulse"
                  : "Источники данных"}
            </h2>
            {modal === "settings" ? (
              <>
                <p>Настройте аналитику под свой рабочий процесс.</p>
                <div className="setting-row">
                  <div>
                    <strong>Автообновление мониторинга</strong>
                    <small>Обновлять данные каждые 15 секунд</small>
                  </div>
                  <label className="switch-label">
                    <input
                      aria-label="Автообновление"
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    <span className="switch" />
                  </label>
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Сравнение периодов</strong>
                    <small>Показывать предыдущий период на графике</small>
                  </div>
                  <label className="switch-label">
                    <input
                      aria-label="Сравнение периодов"
                      type="checkbox"
                      checked={compare}
                      onChange={(e) => setCompare(e.target.checked)}
                    />
                    <span className="switch" />
                  </label>
                </div>
                <button
                  className="button dark-button modal-action"
                  onClick={() => {
                    setModal(null);
                    setToast("Настройки сохранены");
                  }}
                >
                  Готово
                  <Icon name="check" size={17} />
                </button>
              </>
            ) : modal === "help" ? (
              <>
                <p>
                  Pulse объединяет продажи и мониторинг в одном пространстве.
                </p>
                <div className="help-item">
                  <Icon name="chart" />
                  <div>
                    <strong>Исследуйте продажи</strong>
                    <p>
                      Выберите период и источник. Наведите курсор на график,
                      чтобы увидеть точные значения.
                    </p>
                  </div>
                </div>
                <div className="help-item">
                  <Icon name="pulse" />
                  <div>
                    <strong>Следите за системой</strong>
                    <p>
                      Переключитесь в «Мониторинг» и используйте ползунок
                      масштаба, чтобы рассмотреть плотный временной ряд.
                    </p>
                  </div>
                </div>
                <div className="help-item">
                  <Icon name="download" />
                  <div>
                    <strong>Сохраняйте результаты</strong>
                    <p>
                      Кнопка «Экспорт» скачивает текущие серии графика в формате
                      CSV.
                    </p>
                  </div>
                </div>
                <div className="demo-note">
                  Это демо: реальные внешние источники не подключены.
                </div>
              </>
            ) : (
              <>
                <p>
                  Три демонстрационных источника в пространстве {workspace}.
                </p>
                {channels.map((c) => (
                  <button
                    className="channel-detail"
                    key={c.name}
                    onClick={() => {
                      setChannel(c.name);
                      changeMode("sales");
                      setModal(null);
                    }}
                  >
                    <span className={`source-icon ${c.color}`}>
                      <Icon name={c.icon} />
                    </span>
                    <span>
                      <strong>{c.name}</strong>
                      <small>
                        {c.sub} · {c.orders} заказов
                      </small>
                    </span>
                    <span className="connected">Демо</span>
                    <Icon name="chevron" size={16} />
                  </button>
                ))}
                <div className="demo-note">
                  <Icon name="info" size={16} />
                  Выберите источник, чтобы посмотреть его аналитику.
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
