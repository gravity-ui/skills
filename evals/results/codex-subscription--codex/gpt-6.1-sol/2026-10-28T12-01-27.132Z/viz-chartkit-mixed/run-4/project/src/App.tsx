import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icons";
import { channels, getMonitoringData, getSalesData } from "./data";
import { VisualizationWidget } from "./widget/VisualizationWidget";
import type { ChartMode } from "./widget/types";
import "./styles.css";

const number = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);

function Sparkline({ index = 0 }: { index?: number }) {
  const paths = [
    "M0 27 9 23 17 25 25 15 34 20 43 16 51 18 61 8 70 12 80 6 89 10 100 1",
    "M0 27 10 25 18 15 28 20 37 15 46 19 55 10 65 13 75 7 85 11 100 2",
    "M0 28 10 21 20 24 30 17 40 21 50 12 60 17 70 7 80 12 90 5 100 2",
    "M0 26 10 23 20 25 30 16 40 19 50 15 60 18 70 9 80 12 90 5 100 2",
  ];
  return (
    <svg
      className="sparkline"
      width="89"
      height="31"
      viewBox="0 0 102 34"
      fill="none"
      aria-hidden="true"
    >
      <path d={`${paths[index]} V34H0Z`} fill="#eaf0df" opacity=".5" />
      <path
        d={paths[index]}
        stroke="#8b9f68"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function App() {
  const [mode, setMode] = useState<ChartMode>("sales");
  const [days, setDays] = useState(30);
  const [minutes, setMinutes] = useState(60);
  const [channel, setChannel] = useState("Все каналы");
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [compare, setCompare] = useState(true);
  const [live, setLive] = useState(false);
  const [revision, setRevision] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [chartHeight, setChartHeight] = useState(295);
  const [modal, setModal] = useState<"settings" | "help" | "profile" | null>(
    null,
  );
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [activeNav, setActiveNav] = useState("Обзор");
  const chartCard = useRef<HTMLElement>(null);
  const rawSeries = useMemo(
    () =>
      mode === "sales"
        ? getSalesData(days, channel)
        : getMonitoringData(minutes, revision),
    [mode, days, channel, minutes, revision],
  );
  const series = useMemo(
    () => (compare ? rawSeries : rawSeries.slice(0, 1)),
    [rawSeries, compare],
  );
  const sum = rawSeries[0].points.reduce((total, p) => total + p.value, 0);
  const average = sum / rawSeries[0].points.length;
  const salesTotal =
    mode === "sales"
      ? sum
      : getSalesData(days, channel)[0].points.reduce(
          (total, p) => total + p.value,
          0,
        );
  const orderCount = Math.round(salesTotal / 3681);
  const salesReference =
    mode === "sales" ? rawSeries : getSalesData(days, channel);
  const previousRevenue = salesReference[1].points.reduce(
    (total, p) => total + p.value,
    0,
  );
  const revenueChange = `+${((salesTotal / previousRevenue - 1) * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
  const metrics =
    mode === "sales"
      ? [
          {
            title: "Выручка",
            value: `${number(salesTotal)} ₽`,
            change: revenueChange,
            icon: "money",
          },
          {
            title: "Заказы",
            value: number(orderCount),
            change: "+12,8%",
            icon: "bag",
          },
          {
            title: "Средний чек",
            value: `${number(salesTotal / Math.max(orderCount, 1))} ₽`,
            change: "+5,0%",
            icon: "cart",
          },
          {
            title: "Конверсия",
            value: "3,62%",
            change: "+0,8 п.п.",
            icon: "users",
          },
        ]
      : [
          {
            title: "Среднее время ответа",
            value: `${average.toFixed(1)} мс`,
            change: "−12,3%",
            icon: "clock",
          },
          {
            title: "Запросы",
            value: number(minutes * 1842),
            change: "+8,2%",
            icon: "bolt",
          },
          {
            title: "Доступность",
            value: "99,98%",
            change: "+0,02 п.п.",
            icon: "server",
          },
          {
            title: "Доля ошибок",
            value: "0,02%",
            change: "−0,06 п.п.",
            icon: "pulse",
          },
        ];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!live || mode !== "monitoring") return;
    const timer = setInterval(() => setRevision((v) => v + 1), 5000);
    return () => clearInterval(timer);
  }, [live, mode]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!(event.target as Element).closest("[data-dropdown]"))
        setDropdown(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdown(null);
        setModal(null);
        setFullscreen(false);
        setMobileNav(false);
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = fullscreen || modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen, modal]);

  function selectMode(next: ChartMode) {
    setMode(next);
    setZoom(1);
  }
  function navigate(label: string) {
    setActiveNav(label);
    setMobileNav(false);
    if (label === "Продажи" || label === "Обзор") selectMode("sales");
    if (label === "Мониторинг") selectMode("monitoring");
    if (label === "Отчёты") {
      download();
      setActiveNav("Обзор");
    }
  }
  function download() {
    const csv =
      "\ufeff" +
      [
        "Дата и время;" + rawSeries.map((s) => s.name).join(";"),
        ...rawSeries[0].points.map(
          (p, i) =>
            `${new Date(p.timestamp).toISOString()};${rawSeries.map((s) => String(s.points[i]?.value ?? "").replace(".", ",")).join(";")}`,
        ),
      ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-${mode}-${mode === "sales" ? days + "days" : minutes + "min"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Отчёт в формате CSV скачан");
    setDropdown(null);
  }
  function refresh() {
    setRevision((v) => v + 1);
    setToast("Данные обновлены");
  }
  const toggleDropdown = (name: string) =>
    setDropdown((v) => (v === name ? null : name));
  useEffect(() => {
    if (!fullscreen) {
      setChartHeight(295);
      return;
    }
    const body = chartCard.current?.querySelector<HTMLElement>(".chart-body");
    if (!body) return;
    const resize = () => {
      const style = getComputedStyle(body);
      setChartHeight(
        Math.max(
          160,
          body.clientHeight -
            parseFloat(style.paddingTop) -
            parseFloat(style.paddingBottom),
        ),
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(body);
    resize();
    return () => observer.disconnect();
  }, [fullscreen]);
  const periodLabel =
    mode === "sales"
      ? `${31 - days}–30 октября 2026`
      : `Последние ${minutes} минут`;

  return (
    <div className="app-shell">
      {mobileNav && (
        <div className="nav-backdrop" onClick={() => setMobileNav(false)} />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          aria-label="Pulse — главная"
          onClick={(e) => {
            e.preventDefault();
            navigate("Обзор");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          pulse<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace-switcher"
          onClick={() => setModal("profile")}
        >
          <span className="workspace-icon">
            m<span>↗</span>
          </span>
          <span>
            <strong>Мой бизнес</strong>
            <small>Рабочее пространство</small>
          </span>
          <Icon name="down" size={15} />
        </button>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Главная навигация">
          {[
            { label: "Обзор", icon: "grid" },
            { label: "Продажи", icon: "chart" },
            { label: "Мониторинг", icon: "pulse" },
            { label: "Отчёты", icon: "report" },
          ].map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => navigate(item.label)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Мониторинг" && <span className="nav-status" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-art">
              <svg viewBox="0 0 180 64" fill="none">
                <path
                  d="M1 58h178M1 39h178M1 20h178"
                  stroke="#dce3d0"
                  strokeDasharray="3 4"
                />
                <path
                  d="m3 49 19-4 16 5 17-17 18 5 15-13 15 5 19-17 17 7 15-13 23-4"
                  stroke="#80965f"
                  strokeWidth="2"
                />
                <circle cx="177" cy="3" r="3" fill="#80965f" />
                <path
                  d="m3 49 19-4 16 5 17-17 18 5 15-13 15 5 19-17 17 7 15-13 23-4v59H3Z"
                  fill="#a8bb87"
                  opacity=".1"
                />
              </svg>
            </div>
            <strong>Всё связано. Всё видно.</strong>
            <p>
              Ваши данные складываются
              <br />в полную картину.
            </p>
            <span className="note-caption">
              <span className="tiny-dot" /> В одном рабочем пространстве
            </span>
          </div>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon name="settings" size={19} />
            Настройки
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <Icon name="help" size={19} />
            Помощь и поддержка
            <Icon name="chevron" size={14} style={{ marginLeft: "auto" }} />
          </button>
          <div className="sidebar-footer">
            <span className="mini-brand">pulse</span>
            <span>Версия 1.0</span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu"
              aria-label="Открыть меню"
              onClick={() => setMobileNav(true)}
            >
              <Icon name="menu" />
            </button>
            <Icon name="grid" size={16} />
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{activeNav}</strong>
          </div>
          <div className="topbar-right">
            <span className="connection">
              <span className="tiny-dot" />
              Все системы в норме
            </span>
            <span className="topbar-divider" />
            <button
              className="profile"
              onClick={() => setModal("profile")}
              aria-label="Профиль пользователя"
            >
              АК
            </button>
          </div>
        </header>
        <main>
          <section className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div>
              <h1>
                {activeNav === "Продажи"
                  ? "Аналитика продаж"
                  : activeNav === "Мониторинг"
                    ? "Мониторинг системы"
                    : "Обзор аналитики"}
                <span className="heading-dot">.</span>
              </h1>
              <p>Важные показатели, понятные решения.</p>
            </div>
            <div className="heading-actions">
              <div className="dropdown-wrap" data-dropdown>
                <button
                  className="button date-button"
                  aria-expanded={dropdown === "date"}
                  onClick={() => toggleDropdown("date")}
                >
                  <Icon name="calendar" size={17} />
                  {periodLabel}
                  <Icon name="down" size={13} />
                </button>
                {dropdown === "date" && (
                  <div className="dropdown period-dropdown">
                    <div className="dropdown-label">
                      {mode === "sales" ? "Период отчёта" : "Окно мониторинга"}
                    </div>
                    {(mode === "sales" ? [7, 14, 30] : [15, 30, 60]).map(
                      (n) => (
                        <button
                          key={n}
                          onClick={() => {
                            mode === "sales" ? setDays(n) : setMinutes(n);
                            setZoom(1);
                            setDropdown(null);
                          }}
                        >
                          <span>
                            Последние {n} {mode === "sales" ? "дней" : "минут"}
                          </span>
                          {n === (mode === "sales" ? days : minutes) && (
                            <Icon name="check" size={16} />
                          )}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
              <button className="button export-button" onClick={download}>
                <Icon name="download" size={17} />
                <span>Экспорт</span>
              </button>
            </div>
          </section>

          <div className="metrics-grid">
            {metrics.map((metric, i) => (
              <article className="metric-card" key={metric.title}>
                <div className="metric-label">
                  {metric.title}
                  <Icon name={metric.icon} size={18} />
                </div>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-bottom">
                  <div>
                    <span className="metric-change">
                      <Icon name="arrow" size={12} />
                      {metric.change}
                    </span>
                    <span className="metric-comparison">
                      к предыдущему периоду
                    </span>
                  </div>
                  <Sparkline index={i} />
                </div>
              </article>
            ))}
          </div>

          <section
            ref={chartCard}
            className={`chart-card ${fullscreen ? "fullscreen" : ""}`}
            aria-label="Виджет визуализации"
          >
            <div className="chart-heading">
              <div>
                <div className="section-title">
                  <span className="title-marker" />
                  <h2>Динамика показателей</h2>
                  <button
                    className="info-button"
                    aria-label="О виджете"
                    onClick={() => setModal("help")}
                  >
                    <Icon name="info" size={15} />
                  </button>
                </div>
                <p>
                  {mode === "sales"
                    ? "Следите за ростом и находите новые возможности"
                    : "Каждая секунда под контролем — состояние системы в реальном времени"}
                </p>
              </div>
              <div className="chart-heading-right">
                <div
                  className="mode-switch"
                  role="tablist"
                  aria-label="Режим графика"
                >
                  <button
                    role="tab"
                    aria-selected={mode === "sales"}
                    className={mode === "sales" ? "selected" : ""}
                    onClick={() => selectMode("sales")}
                  >
                    <Icon name="chart" size={16} />
                    Продажи
                  </button>
                  <button
                    role="tab"
                    aria-selected={mode === "monitoring"}
                    className={mode === "monitoring" ? "selected" : ""}
                    onClick={() => selectMode("monitoring")}
                  >
                    <Icon name="pulse" size={16} />
                    Мониторинг
                  </button>
                </div>
                <div className="dropdown-wrap" data-dropdown>
                  <button
                    className="icon-button more-button"
                    aria-label="Меню графика"
                    aria-expanded={dropdown === "chart"}
                    onClick={() => toggleDropdown("chart")}
                  >
                    <Icon name="more" size={20} />
                  </button>
                  {dropdown === "chart" && (
                    <div className="dropdown chart-menu">
                      <button
                        onClick={() => {
                          setCompare((v) => !v);
                          setDropdown(null);
                        }}
                      >
                        <span>
                          {compare ? "Скрыть сравнение" : "Показать сравнение"}
                        </span>
                      </button>
                      <button onClick={download}>Скачать данные CSV</button>
                      <button
                        onClick={() => {
                          setFullscreen((v) => !v);
                          setDropdown(null);
                        }}
                      >
                        Развернуть график
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="chart-toolbar">
              <div className="legend">
                <span>
                  <i style={{ background: "#789c47" }} />
                  {mode === "sales" ? "Текущий период" : "Время ответа"}
                </span>
                <button
                  className={!compare ? "muted" : ""}
                  aria-pressed={compare}
                  onClick={() => setCompare((v) => !v)}
                >
                  <i className="dashed-dot" />
                  {mode === "sales" ? "Предыдущий период" : "Базовый уровень"}
                </button>
              </div>
              <div className="chart-tools">
                {mode === "sales" ? (
                  <>
                    <div className="dropdown-wrap" data-dropdown>
                      <button
                        className="filter-button"
                        aria-expanded={dropdown === "channel"}
                        onClick={() => toggleDropdown("channel")}
                      >
                        {channel}
                        <Icon name="down" size={12} />
                      </button>
                      {dropdown === "channel" && (
                        <div className="dropdown channel-dropdown">
                          {["Все каналы", ...channels.map((c) => c.name)].map(
                            (c) => (
                              <button
                                key={c}
                                onClick={() => {
                                  setChannel(c);
                                  setDropdown(null);
                                }}
                              >
                                <span>{c}</span>
                                {channel === c && (
                                  <Icon name="check" size={14} />
                                )}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                    <span className="tool-separator" />
                    <span className="granularity">По дням</span>
                  </>
                ) : (
                  <>
                    <button
                      className={`live-button ${live ? "enabled" : ""}`}
                      onClick={() => setLive((v) => !v)}
                    >
                      <span className="tiny-dot" />
                      {live ? "В эфире" : "Пауза"}
                    </button>
                    <div className="zoom-controls">
                      <button
                        className="icon-button"
                        disabled={zoom <= 1}
                        aria-label="Уменьшить масштаб"
                        onClick={() => setZoom((v) => Math.max(1, v / 2))}
                      >
                        <Icon name="minus" size={14} />
                      </button>
                      <span>{zoom}×</span>
                      <button
                        className="icon-button"
                        disabled={zoom >= 8}
                        aria-label="Увеличить масштаб"
                        onClick={() => setZoom((v) => Math.min(8, v * 2))}
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                  </>
                )}
                <button
                  className="icon-button expand-button"
                  aria-label={
                    fullscreen ? "Свернуть график" : "Развернуть график"
                  }
                  onClick={() => setFullscreen((v) => !v)}
                >
                  <Icon name={fullscreen ? "close" : "expand"} size={15} />
                </button>
              </div>
            </div>
            <div className="chart-body">
              <VisualizationWidget
                mode={mode}
                series={series}
                height={chartHeight}
                unit={mode === "sales" ? "₽" : "мс"}
                zoom={zoom}
              />
            </div>
            <div className="chart-footer">
              <span>
                <span className="tiny-dot" />
                {mode === "sales"
                  ? "Данные актуальны"
                  : live
                    ? "Обновление каждые 5 секунд"
                    : "Демонстрационный снимок"}
                <span className="footer-dot">·</span>
                {number(rawSeries[0].points.length)}{" "}
                {mode === "sales" ? "точек данных" : "измерений"}
              </span>
              <button onClick={refresh}>
                <Icon name="refresh" size={12} />
                {revision ? "Обновлено только что" : "Обновлено в 18:00"}
              </button>
            </div>
          </section>

          <div className="bottom-grid">
            <section className="channel-card">
              <div className="bottom-card-heading">
                <div className="section-title">
                  <span className="title-marker" />
                  <h2>
                    {mode === "sales"
                      ? "Продажи по каналам"
                      : "Состояние сервисов"}
                  </h2>
                </div>
                <span className="subtle-pill">
                  {mode === "sales" ? "2 канала" : "3 сервиса"}
                </span>
              </div>
              {mode === "sales" ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Канал продаж</th>
                        <th>Выручка</th>
                        <th>Доля</th>
                        <th>Динамика</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.map((c, i) => (
                        <tr
                          key={c.name}
                          className={channel === c.name ? "highlight-row" : ""}
                          onClick={() => {
                            setChannel(
                              channel === c.name ? "Все каналы" : c.name,
                            );
                            chartCard.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              setChannel(
                                channel === c.name ? "Все каналы" : c.name,
                              );
                          }}
                        >
                          <td>
                            <div className="channel-name">
                              <span className={`channel-icon channel-${i}`}>
                                <Icon name={i ? "bag" : "cart"} size={17} />
                              </span>
                              <span>
                                <strong>{c.name}</strong>
                                <small>{c.description}</small>
                              </span>
                            </div>
                          </td>
                          <td className="table-number">
                            {number(
                              getSalesData(days, c.name)[0].points.reduce(
                                (a, p) => a + p.value,
                                0,
                              ),
                            )}{" "}
                            ₽
                          </td>
                          <td>
                            <div className="share-cell">
                              <span>{c.share}%</span>
                              <span className="share-track">
                                <i
                                  style={{
                                    width: `${c.share}%`,
                                    background: c.color,
                                  }}
                                />
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="table-change">
                              <Icon name="arrow" size={13} />
                              {c.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="service-list">
                  {[
                    {
                      name: "API Gateway",
                      time: `${average.toFixed(0)} мс`,
                      percent: "99,99%",
                    },
                    { name: "База данных", time: "12 мс", percent: "99,98%" },
                    {
                      name: "Обработка заказов",
                      time: "86 мс",
                      percent: "99,97%",
                    },
                  ].map((s) => (
                    <div className="service-row" key={s.name}>
                      <span className="service-name">
                        <Icon name="server" size={17} />
                        {s.name}
                      </span>
                      <span>{s.time}</span>
                      <strong>{s.percent}</strong>
                      <span className="service-ok">
                        <span className="tiny-dot" />
                        Работает
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="table-footer">
                {mode === "sales"
                  ? "Нажмите на канал, чтобы посмотреть его динамику"
                  : "Все сервисы работают в штатном режиме"}
                <Icon name={mode === "sales" ? "chevron" : "check"} size={13} />
              </div>
            </section>
            <aside className="insight-card">
              <div className="insight-header">
                <span className="insight-icon">
                  <Icon name="bolt" size={17} />
                </span>
                В фокусе<span className="insight-badge">INSIGHT</span>
              </div>
              <h3>
                {mode === "sales" ? (
                  <>
                    Хороший темп. <br />
                    Продолжайте расти.
                  </>
                ) : (
                  <>
                    Стабильность — <br />
                    ваше преимущество.
                  </>
                )}
              </h3>
              <p>
                {mode === "sales" ? (
                  <>
                    Выручка выросла на <strong>{revenueChange.slice(1)}</strong>{" "}
                    к прошлому периоду. Онлайн-магазин приносит больше всего
                    продаж.
                  </>
                ) : (
                  <>
                    Система отвечает в среднем за{" "}
                    <strong>{average.toFixed(1)} мс</strong>. Доступность выше
                    целевого уровня 99,9%.
                  </>
                )}
              </p>
              <div className="insight-footer">
                <span className="tiny-dot" />
                {mode === "sales"
                  ? "Выше показателей прошлого периода"
                  : "Все показатели в пределах нормы"}
                <Icon name="arrow" size={16} />
              </div>
            </aside>
          </div>
          <footer className="page-footer">
            <span>Меньше шума. Больше смысла в данных.</span>
            <span>
              <span className="tiny-dot" />
              Демонстрационные данные<span className="footer-dot">·</span>
              Часовой пояс: UTC
            </span>
          </footer>
        </main>
      </div>

      {toast && (
        <div role="status" className="toast">
          <span className="toast-check">
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
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              autoFocus
              onClick={() => setModal(null)}
              aria-label="Закрыть окно"
            >
              <Icon name="close" />
            </button>
            <span className="modal-icon">
              <Icon
                name={
                  modal === "settings"
                    ? "settings"
                    : modal === "profile"
                      ? "users"
                      : "help"
                }
                size={24}
              />
            </span>
            <h2 id="modal-title">
              {modal === "settings"
                ? "Настройки виджета"
                : modal === "profile"
                  ? "Ваше пространство"
                  : "Всё о ваших графиках"}
            </h2>
            {modal === "settings" ? (
              <>
                <p>Настройте отображение показателей под свои задачи.</p>
                <label className="setting-row">
                  <span>
                    <strong>Сравнение периодов</strong>
                    <small>Показывать вторую линию на графике</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={compare}
                    onChange={(e) => setCompare(e.target.checked)}
                  />
                </label>
                <label className="setting-row">
                  <span>
                    <strong>Автообновление мониторинга</strong>
                    <small>Новые измерения каждые 5 секунд</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={live}
                    onChange={(e) => setLive(e.target.checked)}
                  />
                </label>
                <button
                  className="button primary-button"
                  onClick={() => {
                    setModal(null);
                    setToast("Настройки применены");
                  }}
                >
                  Готово
                  <Icon name="check" size={17} />
                </button>
              </>
            ) : modal === "profile" ? (
              <>
                <p>Мой бизнес · Основное рабочее пространство</p>
                <div className="profile-detail">
                  <span className="profile">АК</span>
                  <span>
                    <strong>Алексей Козлов</strong>
                    <small>Администратор пространства</small>
                  </span>
                  <span className="subtle-pill">Демо</span>
                </div>
                <div className="profile-stat">
                  <span>Подключено источников</span>
                  <strong>2</strong>
                </div>
                <div className="profile-stat">
                  <span>Часовой пояс</span>
                  <strong>UTC</strong>
                </div>
                <button
                  className="button primary-button"
                  onClick={() => setModal("settings")}
                >
                  Настройки пространства
                  <Icon name="settings" size={16} />
                </button>
              </>
            ) : (
              <>
                <p>Один виджет — два способа видеть ваши данные.</p>
                <div className="help-item">
                  <Icon name="chart" />
                  <div>
                    <strong>Продажи</strong>
                    <p>
                      Выберите период и канал продаж. Наведите на график, чтобы
                      увидеть выручку за день. Нажмите на легенду, чтобы
                      включить сравнение.
                    </p>
                  </div>
                </div>
                <div className="help-item">
                  <Icon name="pulse" />
                  <div>
                    <strong>Мониторинг</strong>
                    <p>
                      Тысячи измерений с точностью до секунды. Выделите область
                      графика или используйте «+», чтобы рассмотреть детали.
                      Кнопка «В эфире» включает автообновление.
                    </p>
                  </div>
                </div>
                <div className="help-item">
                  <Icon name="download" />
                  <div>
                    <strong>Ваши данные под рукой</strong>
                    <p>
                      Кнопка «Экспорт» скачивает все данные выбранного периода в
                      формате CSV.
                    </p>
                  </div>
                </div>
                <button
                  className="button primary-button"
                  onClick={() => setModal(null)}
                >
                  Всё понятно
                  <Icon name="check" size={17} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
