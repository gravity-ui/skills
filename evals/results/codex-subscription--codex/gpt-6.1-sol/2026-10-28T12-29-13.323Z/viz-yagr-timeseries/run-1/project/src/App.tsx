import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, useThemeType, type Theme } from "@gravity-ui/uikit";
import { CpuChart } from "./CpuChart";
import {
  appendCpuSample,
  createDemoHistory,
  demoCpuValue,
  getCpuStats,
  hosts,
  lowerBound,
  SAMPLE_INTERVAL,
  type CpuHistory,
} from "./cpu-data";
import { Icon } from "./icons";
import "./styles.css";

const number = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const date = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});
const time = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const displayPercent = (value: number | null) =>
  value === null ? "—" : number.format(value);

function Sparkline({
  history,
  hours,
  peak = false,
  color = "var(--accent)",
}: {
  history: CpuHistory;
  hours: number;
  peak?: boolean;
  color?: string;
}) {
  const points = useMemo(() => {
    const start = lowerBound(
      history.timestamps,
      (history.timestamps.at(-1) ?? 0) - hours * 3_600_000,
    );
    const count = history.values.length - start;
    const samples = Array.from({ length: 36 }, (_, i) => {
      const from = start + Math.floor((i * count) / 36);
      const to = Math.min(
        history.values.length,
        Math.max(from + 1, start + Math.floor(((i + 1) * count) / 36)),
      );
      let value = 0;
      for (let j = from; j < to; j++)
        value = peak
          ? Math.max(value, history.values[j])
          : value + history.values[j];
      return peak ? value : value / Math.max(1, to - from);
    });
    const min = Math.min(...samples);
    const span = Math.max(1, Math.max(...samples) - min);
    return samples
      .map((value, i) => `${i * 3},${36 - ((value - min) / span) * 27}`)
      .join(" ");
  }, [history, hours, peak]);
  return (
    <svg
      className="sparkline"
      viewBox="0 0 105 44"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>("system");
  return (
    <ThemeProvider theme={theme} lang="ru">
      <MonitoringPage onThemeChange={setTheme} />
    </ThemeProvider>
  );
}

function MonitoringPage({
  onThemeChange,
}: {
  onThemeChange: (theme: Theme) => void;
}) {
  const theme = useThemeType();
  const [hostId, setHostId] = useState(hosts[0].id);
  const host = hosts.find((item) => item.id === hostId)!;
  const [history, setHistory] = useState(() => createDemoHistory());
  const [paused, setPaused] = useState(false);
  const [hours, setHours] = useState(24);
  const [resetKey, setResetKey] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeNav, setActiveNav] = useState("cpu");
  const [exported, setExported] = useState(false);
  const stats = useMemo(() => getCpuStats(history, hours), [history, hours]);
  const latestTime = history.timestamps.at(-1) ?? Date.now();

  useEffect(() => {
    if (paused) return;
    const update = () => {
      const now = Math.floor(Date.now() / SAMPLE_INTERVAL) * SAMPLE_INTERVAL;
      setHistory((previous) =>
        appendCpuSample(previous, now, demoCpuValue(now, host.offset)),
      );
    };
    update();
    const timer = window.setInterval(update, SAMPLE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, host.offset]);

  useEffect(() => {
    if (!exported) return;
    const timer = window.setTimeout(() => setExported(false), 3000);
    return () => window.clearTimeout(timer);
  }, [exported]);

  function selectHost(id: string) {
    const selected = hosts.find((item) => item.id === id)!;
    setHostId(id);
    setHistory(createDemoHistory(Date.now(), selected.offset));
    setResetKey((key) => key + 1);
  }

  function exportCsv() {
    const start = lowerBound(
      history.timestamps,
      latestTime - hours * 3_600_000,
    );
    const rows = [
      "timestamp,cpu_percent",
      ...history.timestamps
        .slice(start)
        .map(
          (stamp, i) =>
            `${new Date(stamp).toISOString()},${history.values[start + i]}`,
        ),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${hostId}-cpu-${hours}h.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  }

  const navItems = [
    { id: "overview", label: "Обзор", icon: "grid" as const },
    { id: "cpu", label: "Мониторинг", icon: "chart" as const },
    { id: "servers", label: "Серверы", icon: "server" as const },
    { id: "details", label: "Сбор метрик", icon: "layers" as const },
  ];

  return (
    <div className={`app theme-${theme}`}>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <aside className="sidebar">
        <a href="#overview" className="brand" aria-label="Pulse — обзор">
          <span className="brand-mark">
            <Icon name="pulse" size={23} />
          </span>
          pulse<span className="brand-period">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">A</span>
          <div>
            <strong>Acme workspace</strong>
            <span>Инфраструктура</span>
          </div>
        </div>
        <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
              aria-current={activeNav === item.id ? "location" : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === "servers" && <small>3</small>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <span>Все системы в норме</span>
            <Icon name="arrow" size={14} />
          </div>
          <div className="profile">
            <span className="profile-avatar">АК</span>
            <div>
              <strong>Алексей К.</strong>
              <span>Администратор</span>
            </div>
            <span className="profile-dot" />
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Инфраструктура</span>
            <Icon name="chevron" size={13} />
            <strong>Мониторинг</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-badge">
              <span className="status-dot" />
              Демо-среда
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              onClick={() =>
                onThemeChange(theme === "light" ? "dark" : "light")
              }
              aria-label={
                theme === "light"
                  ? "Включить тёмную тему"
                  : "Включить светлую тему"
              }
              title="Переключить тему"
            >
              <Icon name={theme === "light" ? "moon" : "sun"} size={19} />
            </button>
            <span className="top-avatar" aria-label="Профиль: Алексей К.">
              АК
            </span>
          </div>
        </header>

        <main id="main">
          <section id="overview" className="page-heading">
            <div>
              <div className="eyebrow">ОБЗОР ИНФРАСТРУКТУРЫ</div>
              <h1>
                Мониторинг<span className="heading-dot">.</span>
              </h1>
              <p>
                Всё о производительности ваших серверов — в реальном времени.
              </p>
            </div>
            <button
              className="button export-button"
              onClick={exportCsv}
              aria-label={exported ? "CSV сохранён" : "Экспорт данных"}
            >
              <Icon name={exported ? "check" : "download"} size={17} />
              {exported ? "CSV сохранён" : "Экспорт данных"}
            </button>
          </section>

          <div className="filter-bar">
            <div className="host-filter">
              <span className="filter-label">Сервер</span>
              <div className="select-wrap">
                <Icon name="server" size={17} />
                <select
                  aria-label="Выбрать сервер"
                  value={hostId}
                  onChange={(event) => selectHost(event.target.value)}
                >
                  {hosts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}
                    </option>
                  ))}
                </select>
                <Icon name="down" size={14} />
              </div>
              <span className="region">
                <Icon name="globe" size={14} />
                {host.region}
              </span>
            </div>
            <span className="healthy">
              <span className="status-dot" />
              Работает стабильно
            </span>
          </div>

          <section className="metric-grid" aria-label="Показатели CPU">
            <article className="metric-card">
              <div className="metric-label">
                Текущая загрузка
                <Icon name="cpu" size={17} />
              </div>
              <div className="metric-value">
                {displayPercent(stats.current)}
                <span>%</span>
              </div>
              <div className="metric-bottom">
                <span className="metric-tag">
                  <span className="status-dot" />В пределах нормы
                </span>
                <Sparkline history={history} hours={1} />
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-label">
                Средняя загрузка
                <Icon name="chart" size={17} />
              </div>
              <div className="metric-value">
                {displayPercent(stats.average)}
                <span>%</span>
              </div>
              <div className="metric-bottom">
                <span>За последние {hours} ч</span>
                <Sparkline history={history} hours={hours} color="#7c86c7" />
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-label">
                Пиковая загрузка
                <Icon name="arrow" size={17} />
              </div>
              <div className="metric-value">
                {displayPercent(stats.peak)}
                <span>%</span>
              </div>
              <div className="metric-bottom">
                <span>За последние {hours} ч</span>
                <Sparkline
                  history={history}
                  hours={hours}
                  peak
                  color="#d8a161"
                />
              </div>
            </article>
            <article className="metric-card hardware-card">
              <div className="metric-label">
                Вычислительные ресурсы
                <Icon name="layers" size={17} />
              </div>
              <div className="metric-value">
                {host.cores}
                <span>vCPU</span>
              </div>
              <div className="metric-bottom">
                <span>{host.memory} RAM</span>
                <span className="hardware-chip">x86_64</span>
              </div>
            </article>
          </section>

          <section
            id="cpu"
            className="chart-card"
            aria-labelledby="chart-title"
          >
            <div className="chart-header">
              <div>
                <div className="chart-title-line">
                  <h2 id="chart-title">Загрузка CPU</h2>
                  <span className={`live-badge ${paused ? "is-paused" : ""}`}>
                    <span className="status-dot" />
                    {paused ? "ПАУЗА" : "LIVE"}
                  </span>
                </div>
                <p>
                  Использование процессора за последние{" "}
                  {hours === 24 ? "сутки" : `${hours} ч`}
                </p>
              </div>
              <div className="chart-controls">
                <div
                  className="period-control"
                  role="group"
                  aria-label="Период графика"
                >
                  {[1, 6, 24].map((value) => (
                    <button
                      key={value}
                      aria-pressed={hours === value}
                      onClick={() => setHours(value)}
                      className={hours === value ? "selected" : ""}
                    >
                      {value} ч
                    </button>
                  ))}
                </div>
                <button
                  className={`pause-button ${paused ? "is-paused" : ""}`}
                  onClick={() => setPaused((value) => !value)}
                  aria-label={
                    paused
                      ? "Продолжить обновление"
                      : "Приостановить обновление"
                  }
                  aria-pressed={paused}
                  title={
                    paused
                      ? "Продолжить обновление"
                      : "Приостановить обновление"
                  }
                >
                  <Icon name={paused ? "play" : "pause"} size={16} />
                </button>
              </div>
            </div>
            <div className="chart-meta">
              <label className="legend-toggle">
                <input
                  type="checkbox"
                  aria-label="Показать загрузку CPU"
                  checked={visible}
                  onChange={(event) => setVisible(event.target.checked)}
                />
                <span className={`legend-line ${visible ? "" : "hidden"}`} />
                <span>CPU</span>
                <strong>{displayPercent(stats.current)}%</strong>
              </label>
              <span className="chart-date">
                {date.format(latestTime - hours * 3_600_000)} —{" "}
                {date.format(latestTime)}
                <span>·</span>
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
            <CpuChart
              history={history}
              hours={hours}
              resetKey={resetKey}
              visible={visible}
              onZoomChange={setZoomed}
            />
            <div className="chart-footer">
              <span>
                <Icon name="info" size={14} />
                <span className="desktop-hint">
                  Выделите участок для увеличения.{" "}
                </span>
                Двойной клик — сброс масштаба.
              </span>
              <button
                className="text-button"
                disabled={!zoomed}
                onClick={() => setResetKey((key) => key + 1)}
              >
                <Icon name="reset" size={13} />
                Сбросить масштаб
              </button>
            </div>
            <div className="chart-status">
              <span>
                <span className={`status-dot ${paused ? "gray" : ""}`} />
                {paused
                  ? "Обновление приостановлено"
                  : "Обновляется каждые 2 секунды"}
              </span>
              <span>
                {stats.count.toLocaleString("ru-RU")} точек
                <span className="status-separator">/</span>Обновлено в{" "}
                {time.format(latestTime)}
              </span>
            </div>
          </section>

          <div className="bottom-grid">
            <section id="servers" className="panel servers-panel">
              <div className="panel-heading">
                <h2>Серверы</h2>
                <span className="count-badge">3</span>
                <span className="panel-note">Демо-инфраструктура</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Имя сервера</th>
                      <th>Статус</th>
                      <th>CPU</th>
                      <th aria-label="Выбор сервера" />
                    </tr>
                  </thead>
                  <tbody>
                    {hosts.map((item) => (
                      <tr
                        key={item.id}
                        className={item.id === hostId ? "selected-row" : ""}
                      >
                        <td>
                          <span className="server-name">
                            <Icon name="server" size={17} />
                            <span>
                              <strong>{item.id}</strong>
                              <small>{item.ip}</small>
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className="table-status">
                            <span className="status-dot" />
                            Доступен
                          </span>
                        </td>
                        <td>
                          <span className="cpu-cell">
                            {displayPercent(
                              demoCpuValue(latestTime, item.offset),
                            )}
                            %
                            <span className="mini-bar">
                              <span
                                style={{
                                  width: `${demoCpuValue(latestTime, item.offset)}%`,
                                }}
                              />
                            </span>
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={`Показать метрики ${item.id}`}
                            title={`Показать ${item.id}`}
                            onClick={() => {
                              selectHost(item.id);
                              document
                                .getElementById("cpu")
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                            }}
                          >
                            <Icon name="chevron" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section id="details" className="panel collection-panel">
              <div className="panel-heading">
                <span className="collection-icon">
                  <Icon name="pulse" size={18} />
                </span>
                <h2>О сборе метрик</h2>
              </div>
              <p>Полная картина без пропущенных деталей.</p>
              <dl>
                <div>
                  <dt>Интервал сбора</dt>
                  <dd>2 секунды</dd>
                </div>
                <div>
                  <dt>Глубина истории</dt>
                  <dd>24 часа</dd>
                </div>
                <div>
                  <dt>Источник данных</dt>
                  <dd>
                    <span className="status-dot" />
                    Демопоток
                  </dd>
                </div>
              </dl>
              <div className="collection-info">
                <Icon name="info" size={15} />
                <span>
                  Демонстрационные данные. Реальные серверы не подключены.
                </span>
              </div>
            </section>
          </div>
          <footer className="page-footer">
            <span>
              <span className="footer-brand">pulse.</span> Спокойствие в каждой
              метрике.
            </span>
            <span>
              <span className="status-dot" />
              Все 3 сервера доступны
            </span>
          </footer>
          <div className="sr-only" role="status">
            {exported ? "Данные графика экспортированы в CSV" : ""}
          </div>
        </main>
      </div>
    </div>
  );
}
