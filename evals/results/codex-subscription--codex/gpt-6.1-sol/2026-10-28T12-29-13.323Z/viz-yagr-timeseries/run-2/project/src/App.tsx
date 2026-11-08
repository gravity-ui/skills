import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useThemeType } from "@gravity-ui/uikit";
import { CpuChart } from "./CpuChart";
import { createDemoSource } from "./telemetry";
import "./styles.css";

type IconName =
  | "activity"
  | "server"
  | "clock"
  | "chevron"
  | "arrow"
  | "download"
  | "sun"
  | "moon"
  | "pause"
  | "play"
  | "reset"
  | "settings"
  | "cpu"
  | "expand";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    server: (
      <>
        <rect x="4" y="3" width="16" height="7" rx="2" />
        <rect x="4" y="14" width="16" height="7" rx="2" />
        <path d="M8 6.5h.01M8 17.5h.01M15 6.5h2M15 17.5h2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="m7 14 4-4 3 3 4-6M13 7h5v5" />,
    download: <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />,
    pause: <path d="M9 5v14M15 5v14" />,
    play: <path d="m8 5 11 7-11 7Z" />,
    reset: <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />,
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2" />
        <circle cx="15" cy="17" r="2" />
      </>
    ),
    cpu: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3" />
      </>
    ),
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const percent = (value: number) =>
  value.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
const dateTime = (time: number) =>
  new Date(time).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const noSubscription = () => () => {};

export function App({ onToggleTheme }: { onToggleTheme: () => void }) {
  const theme = useThemeType();
  const [source] = useState(createDemoSource);
  const [live, setLive] = useState(true);
  const [hours, setHours] = useState(24);
  const [resetToken, setResetToken] = useState(0);
  const [threshold, setThreshold] = useState(true);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", close);
    };
  }, [expanded]);
  const data = useSyncExternalStore(
    live ? source.subscribe : noSubscription,
    source.getSnapshot,
  );
  const start = data.updatedAt - hours * 3_600_000;
  const rangeStats = useMemo(() => {
    if (hours === 24) return data;
    const first = data.timeline.findIndex(
      (time) => time >= data.updatedAt - hours * 3_600_000,
    );
    const values = data.values.slice(Math.max(0, first));
    let sum = 0;
    let maximum = 0;
    const histogram = new Uint32Array(1001);
    for (const value of values) {
      sum += value;
      maximum = Math.max(maximum, value);
      histogram[Math.round(value * 10)]++;
    }
    let count = 0;
    let p95 = 0;
    for (let i = 0; i < histogram.length; i++) {
      count += histogram[i];
      if (count >= Math.ceil(values.length * 0.95)) {
        p95 = i / 10;
        break;
      }
    }
    return { average: sum / (values.length || 1), maximum, p95 };
  }, [data, hours]);
  const peaks = useMemo(() => {
    const result: { time: number; value: number }[] = [];
    for (let i = data.values.length - 2; i > 0; i--) {
      if (
        data.values[i] >= 65 &&
        data.values[i] >= data.values[i - 1] &&
        data.values[i] > data.values[i + 1] &&
        (!result.length || result.at(-1)!.time - data.timeline[i] > 3_600_000)
      ) {
        result.push({ time: data.timeline[i], value: data.values[i] });
        if (result.length === 3) break;
      }
    }
    return result;
  }, [data]);

  function exportCsv() {
    const rows = ["timestamp,cpu_percent"];
    data.timeline.forEach((time, index) => {
      if (time >= start)
        rows.push(`${new Date(time).toISOString()},${data.values[index]}`);
    });
    const url = URL.createObjectURL(
      new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `cpu-${hours}h-${new Date(data.updatedAt).toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Pulse — главная">
          <span className="brand-icon">
            <Icon name="activity" size={23} />
          </span>
          pulse<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <div className="workspace">
          <span className="workspace-avatar">A</span>
          <div>
            <strong>Acme Infrastructure</strong>
            <small>Основное пространство</small>
          </div>
          <span className="workspace-dots">⌘</span>
        </div>
        <div className="nav-label">ИНФРАСТРУКТУРА</div>
        <nav aria-label="Основная навигация">
          <a href="#overview" className="nav-item active" aria-current="page">
            <Icon name="activity" />
            Мониторинг
            <span className="nav-active-dot" />
          </a>
          <a href="#system" className="nav-item">
            <Icon name="server" />
            Сервер<span className="nav-count">1</span>
          </a>
          <a href="#events" className="nav-item">
            <Icon name="clock" />
            История нагрузки
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="connection">
            <span className="status-dot" />
            Демонстрационный режим
          </div>
          <div className="profile">
            <span className="profile-avatar">АК</span>
            <div>
              <strong>Алексей К.</strong>
              <small>Администратор</small>
            </div>
            <span className="profile-more">···</span>
          </div>
        </div>
      </aside>

      <div className="page">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Инфраструктура</span>
            <Icon name="chevron" size={13} />
            <strong>Мониторинг</strong>
          </div>
          <div className="topbar-right">
            <span className="environment">
              <span className="status-dot" />
              Production
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button theme-button"
              onClick={onToggleTheme}
              aria-label={
                theme === "light"
                  ? "Включить тёмную тему"
                  : "Включить светлую тему"
              }
              title="Переключить тему"
            >
              <Icon name={theme === "light" ? "moon" : "sun"} />
            </button>
            <span className="header-avatar">АК</span>
          </div>
        </header>
        <main id="overview">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ОБЗОР ИНФРАСТРУКТУРЫ</div>
              <h1>Мониторинг</h1>
              <p>Все показатели вашего сервера — в одном месте.</p>
            </div>
            <button className="button export-button" onClick={exportCsv}>
              <Icon name="download" size={16} />
              Экспорт данных
            </button>
          </div>

          <div className="server-bar">
            <div className="server-identity">
              <span className="server-icon">
                <Icon name="server" size={19} />
              </span>
              <strong>production-01</strong>
              <span className="server-ip">10.128.0.24</span>
              <span className="healthy">
                <span className="status-dot" />В норме
              </span>
            </div>
            <span className="server-region">
              eu-central-1 <span>·</span> Ubuntu 24.04
            </span>
          </div>

          <div className="metric-grid">
            {[
              {
                label: "Текущая загрузка",
                value: data.current,
                caption: live
                  ? "Обновляется каждые 2 секунды"
                  : "Обновления приостановлены",
                icon: "cpu" as IconName,
                className: "current",
              },
              {
                label: "Средняя загрузка",
                value: rangeStats.average,
                caption: `За последние ${hours} ч`,
                icon: "activity" as IconName,
                className: "",
              },
              {
                label: "Пиковая загрузка",
                value: rangeStats.maximum,
                caption: `Максимум за ${hours} ч`,
                icon: "arrow" as IconName,
                className: "",
              },
              {
                label: "95-й перцентиль",
                value: rangeStats.p95,
                caption: "95% значений ниже этого уровня",
                icon: "settings" as IconName,
                className: "",
              },
            ].map((metric) => (
              <article
                className={`metric-card ${metric.className}`}
                key={metric.label}
              >
                <div className="metric-label">
                  {metric.label}
                  <Icon name={metric.icon} size={17} />
                </div>
                <div className="metric-value">
                  {percent(metric.value)}
                  <span>%</span>
                  {metric.className === "current" && (
                    <span className="metric-status">В норме</span>
                  )}
                </div>
                <div className="metric-caption">
                  {metric.className === "current" && (
                    <span
                      className={live ? "status-dot" : "status-dot paused-dot"}
                    />
                  )}
                  {metric.caption}
                </div>
              </article>
            ))}
          </div>

          <section
            className={`chart-card ${expanded ? "chart-expanded" : ""}`}
            aria-labelledby="chart-title"
          >
            <div className="chart-heading">
              <div>
                <div className="chart-title-line">
                  <h2 id="chart-title">Загрузка CPU</h2>
                  <span className={`live-badge ${!live ? "is-paused" : ""}`}>
                    <span className="status-dot" />
                    {live ? "В реальном времени" : "На паузе"}
                  </span>
                </div>
                <p>Использование процессора · последние {hours} ч</p>
              </div>
              <div className="chart-heading-actions">
                <button
                  className="icon-button"
                  onClick={() => setExpanded(!expanded)}
                  aria-label={
                    expanded ? "Свернуть график" : "Развернуть график"
                  }
                  title={expanded ? "Свернуть график" : "Развернуть график"}
                >
                  <Icon name="expand" size={16} />
                </button>
                <details className="chart-settings">
                  <summary
                    className="icon-button"
                    aria-label="Настройки графика"
                    title="Настройки графика"
                  >
                    <Icon name="settings" size={17} />
                  </summary>
                  <div className="settings-popover">
                    <strong>Отображение</strong>
                    <label>
                      <input
                        type="checkbox"
                        checked={threshold}
                        onChange={(e) => setThreshold(e.target.checked)}
                      />
                      Порог нагрузки 80%
                    </label>
                  </div>
                </details>
              </div>
            </div>
            <div className="chart-toolbar">
              <div
                className="range-control"
                role="group"
                aria-label="Период графика"
              >
                {[1, 6, 12, 24].map((value) => (
                  <button
                    key={value}
                    onClick={() => setHours(value)}
                    className={hours === value ? "selected" : ""}
                    aria-pressed={hours === value}
                  >
                    {value} ч
                  </button>
                ))}
              </div>
              <div className="chart-controls">
                <button
                  className="reset-button"
                  onClick={() => setResetToken((token) => token + 1)}
                  title="Сбросить масштаб"
                >
                  <Icon name="reset" size={14} />
                  <span>Сбросить масштаб</span>
                </button>
                <span className="control-divider" />
                <button
                  className={`button live-control ${live ? "" : "resume"}`}
                  onClick={() => setLive(!live)}
                >
                  <Icon name={live ? "pause" : "play"} size={14} />
                  {live ? "Пауза" : "Продолжить"}
                </button>
              </div>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-line" />
                CPU, %
              </span>
              {threshold && (
                <span>
                  <i className="legend-threshold" />
                  Порог 80%
                </span>
              )}
              <span className="chart-date">
                {dateTime(start)} — {dateTime(data.updatedAt)}
              </span>
            </div>
            <CpuChart
              source={source}
              live={live}
              hours={hours}
              resetToken={resetToken}
              threshold={threshold}
            />
            <div className="chart-footer">
              <span>
                <Icon name="expand" size={13} />
                Выделите область для увеличения · двойной клик для сброса
              </span>
              <span>
                <span
                  className={live ? "status-dot" : "status-dot paused-dot"}
                />
                {data.values.length.toLocaleString("ru-RU")} точек
                <span className="footer-separator">·</span>Шаг 2 сек
              </span>
            </div>
          </section>

          <div className="details-grid">
            <section className="detail-card" id="system">
              <div className="detail-card-heading">
                <h2>О сервере</h2>
                <Icon name="server" size={17} />
              </div>
              <dl className="server-details">
                <div>
                  <dt>Процессор</dt>
                  <dd>Intel Xeon Platinum</dd>
                </div>
                <div>
                  <dt>Виртуальные ядра</dt>
                  <dd>8 vCPU</dd>
                </div>
                <div>
                  <dt>Оперативная память</dt>
                  <dd>32 ГБ</dd>
                </div>
                <div>
                  <dt>Источник данных</dt>
                  <dd>
                    <span className="demo-label">Демонстрационный поток</span>
                  </dd>
                </div>
              </dl>
            </section>
            <section className="detail-card" id="events">
              <div className="detail-card-heading">
                <h2>Последние пики нагрузки</h2>
                <span className="subtle-label">За 24 часа</span>
              </div>
              <div className="events">
                {peaks.length ? (
                  peaks.map((peak) => (
                    <div className="event" key={peak.time}>
                      <span
                        className={`event-icon ${peak.value >= 80 ? "warning" : ""}`}
                      >
                        <Icon
                          name={peak.value >= 80 ? "arrow" : "activity"}
                          size={15}
                        />
                      </span>
                      <div>
                        <strong>
                          Загрузка CPU достигла {percent(peak.value)}%
                        </strong>
                        <small>
                          {peak.value >= 80
                            ? "Превышен порог нагрузки 80%"
                            : "Нагрузка в пределах допустимого"}
                        </small>
                      </div>
                      <time dateTime={new Date(peak.time).toISOString()}>
                        {new Date(peak.time).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  ))
                ) : (
                  <p className="empty-events">
                    За последние сутки пиков выше 65% не было.
                  </p>
                )}
              </div>
            </section>
          </div>
          <footer className="page-footer">
            <span>
              <span className="status-dot" />
              Демонстрационные данные · без подключения к серверу
            </span>
            <span>
              Последнее обновление:{" "}
              {new Date(data.updatedAt).toLocaleTimeString("ru-RU")}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
