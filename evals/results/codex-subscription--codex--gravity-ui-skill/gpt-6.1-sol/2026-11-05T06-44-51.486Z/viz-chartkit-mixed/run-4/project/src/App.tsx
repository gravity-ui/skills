import { useEffect, useMemo, useState } from "react";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  Button,
  Checkbox,
  DropdownMenu,
  Icon,
  Modal,
  SegmentedRadioGroup,
  Select,
  Switch,
  Text,
} from "@gravity-ui/uikit";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowRotateRight,
  ArrowUpRight,
  Bell,
  Calendar,
  ChartColumn,
  ChartLine,
  Check,
  ChevronDown,
  CircleCheck,
  CircleQuestion,
  Database,
  Ellipsis,
  FileText,
  Gear,
  House,
  Layers,
  Pulse,
  Sliders,
  Xmark,
} from "@gravity-ui/icons";
import { VisualizationWidget } from "./VisualizationWidget";
import {
  END_DATE,
  exportCsv,
  getMonitoringData,
  getSalesData,
  type VisualizationMode,
} from "./data";
import "./styles.css";

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
const dateFmt = (n: number) =>
  new Date(n)
    .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
    .replace(".", "");
function BrandIcon() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M7 19h5l3-10 4 15 3-10 3 0"
        stroke="var(--g-color-text-brand-contrast)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function App() {
  const [compact, setCompact] = useState(() => window.innerWidth < 1000);
  const [mode, setMode] = useState<VisualizationMode>("sales");
  const [period, setPeriod] = useState("30");
  const [minutes, setMinutes] = useState("60");
  const [compare, setCompare] = useState(true);
  const [hidden, setHidden] = useState<string[]>([]);
  const [live, setLive] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [refreshed, setRefreshed] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [chartHeight, setChartHeight] = useState("310");
  const sales = mode === "sales";
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 750) setCompact(true);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  useEffect(() => {
    if (sales || !live) return;
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [sales, live]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const allSeries = useMemo(
    () =>
      sales
        ? getSalesData(Number(period))
        : getMonitoringData(Number(minutes), now),
    [sales, period, minutes, now],
  );
  const visibleSeries = allSeries.filter(
    (s) => !hidden.includes(s.id) && (!sales || compare || s.id !== "previous"),
  );
  const total = allSeries[0].data.reduce((sum, p) => sum + p.y, 0) * 1000;
  const previous = allSeries[1].data.reduce((sum, p) => sum + p.y, 0) * 1000;
  const growth = ((total / previous - 1) * 100).toFixed(1).replace(".", ",");
  const count = Math.round(total / 3240);
  const previousCount = Math.round(previous / (3240 / 1.052));
  const ordersGrowth = ((count / previousCount - 1) * 100)
    .toFixed(1)
    .replace(".", ",");
  const rangeLabel = sales
    ? `${dateFmt(END_DATE - (Number(period) - 1) * 86400000)} — ${dateFmt(END_DATE)} 2026`
    : `Последние ${minutes} минут`;
  const refresh = () => {
    setNow(Date.now());
    setRefreshed(true);
    setToast("Данные обновлены");
  };
  const changeMode = (value: string) => {
    setMode(value as VisualizationMode);
    setHidden([]);
  };
  const download = () => {
    exportCsv(visibleSeries, mode);
    setToast("CSV-файл экспортирован");
  };
  const showHelp = () => setModal("help");

  return (
    <>
      <AsideHeader
        className="app-shell"
        compact={compact}
        onChangeCompact={setCompact}
        hideSectionDividers
        logo={{
          text: () => (
            <span className="brand-text">
              pulse<span className="brand-dot">.</span>
            </span>
          ),
          icon: BrandIcon,
          iconSize: 32,
          iconClassName: "brand-icon",
          onClick: () => {
            changeMode("sales");
            setPeriod("30");
          },
        }}
        aboveMenuContent={
          !compact && (
            <div className="workspace-picker">
              <span className="workspace-avatar">S</span>
              <div>
                <strong>Studio workspace</strong>
                <span>Командный аккаунт</span>
              </div>
              <Icon data={ChevronDown} size={14} />
            </div>
          )
        }
        menuItems={[
          {
            id: "home",
            title: "Обзор",
            icon: House,
            onItemClick: () => {
              changeMode("sales");
              setToast("Показан обзор продаж");
            },
          },
          {
            id: "charts",
            title: "Визуализация",
            icon: ChartLine,
            current: true,
            onItemClick: () =>
              document
                .getElementById("chart-card")
                ?.scrollIntoView({ behavior: "smooth" }),
          },
          {
            id: "sources",
            title: "Источники данных",
            icon: Database,
            onItemClick: () => setModal("sources"),
          },
          {
            id: "reports",
            title: "Отчёты",
            icon: FileText,
            onItemClick: () => setModal("reports"),
          },
        ]}
        renderFooter={() => (
          <div className={`sidebar-footer ${compact ? "is-compact" : ""}`}>
            {!compact && (
              <div className="workspace-note">
                <span className="tiny-symbol">
                  <Icon data={Layers} size={18} />
                </span>
                <Text variant="subheader-1">Все данные. Одна картина.</Text>
                <p>
                  Находите главное в цифрах
                  <br />
                  вместе с Pulse.
                </p>
                <Button view="flat" size="s" onClick={showHelp}>
                  Узнать больше <Icon data={ArrowUpRight} size={14} />
                </Button>
              </div>
            )}
            <Button
              view="flat"
              width="max"
              className="footer-nav"
              onClick={() => setModal("settings")}
            >
              <Icon data={Gear} size={18} />
              {!compact && "Настройки"}
            </Button>
            <Button
              view="flat"
              width="max"
              className="footer-nav"
              onClick={showHelp}
            >
              <Icon data={CircleQuestion} size={18} />
              {!compact && "Помощь и поддержка"}
            </Button>
            <div className="profile">
              <span className="profile-avatar">АК</span>
              {!compact && (
                <>
                  <div>
                    <strong>Александр К.</strong>
                    <span>Личный профиль</span>
                  </div>
                  <Icon data={ChevronDown} size={14} />
                </>
              )}
            </div>
          </div>
        )}
        renderContent={() => (
          <div className="page">
            <header className="topbar">
              <div className="breadcrumb">
                Рабочее пространство <span>/</span>{" "}
                <strong>Визуализация</strong>
              </div>
              <div className="topbar-right">
                <span className="environment">
                  <span className="status-dot" /> Все системы в норме
                </span>
                <Button
                  view="flat"
                  aria-label="Уведомления"
                  onClick={() => setModal("notifications")}
                >
                  <Icon data={Bell} size={19} />
                  <span className="notification-dot" />
                </Button>
                <span className="top-avatar">АК</span>
              </div>
            </header>
            <main className="main-content">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">АНАЛИТИКА В РЕАЛЬНОМ ВРЕМЕНИ</div>
                  <Text variant="display-1" as="h1" className="page-title">
                    За цифрами — больше.
                  </Text>
                  <p>
                    От бизнес-результатов до состояния систем. Всё в одном
                    виджете.
                  </p>
                </div>
                <Button size="l" view="outlined" onClick={download}>
                  <Icon data={ArrowDownToLine} size={16} /> Экспорт
                </Button>
              </div>
              <div className="section-heading">
                <div className="section-title">
                  <span className="section-icon">
                    <Icon data={ChartColumn} size={18} />
                  </span>
                  <Text variant="subheader-2">Обзор показателей</Text>
                  <span className="small-tag">1 виджет</span>
                </div>
                <div className="updated">
                  <span className="status-dot" />
                  {refreshed ? "Только что обновлено" : "Данные актуальны"}
                  <Button
                    view="flat"
                    size="s"
                    aria-label="Обновить данные"
                    onClick={refresh}
                  >
                    <Icon data={ArrowRotateRight} size={15} />
                  </Button>
                </div>
              </div>
              <section className="chart-card" id="chart-card">
                <div className="widget-toolbar">
                  <SegmentedRadioGroup
                    value={mode}
                    onUpdate={changeMode}
                    size="l"
                    className="mode-control"
                    aria-label="Режим визуализации"
                  >
                    <SegmentedRadioGroup.Option value="sales">
                      <span className="mode-option">
                        <Icon data={ChartLine} size={17} />
                        Продажи
                      </span>
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="monitoring">
                      <span className="mode-option">
                        <Icon data={Pulse} size={17} />
                        Мониторинг
                      </span>
                    </SegmentedRadioGroup.Option>
                  </SegmentedRadioGroup>
                  <div className="widget-tools">
                    <span className="demo-label">Демо-данные</span>
                    <Button
                      view="flat"
                      size="m"
                      aria-label="Настроить виджет"
                      onClick={() => setModal("widget")}
                    >
                      <Icon data={Sliders} size={17} />
                    </Button>
                    <DropdownMenu
                      size="m"
                      defaultSwitcherProps={{
                        view: "flat",
                        "aria-label": "Действия с виджетом",
                      }}
                      items={[
                        { text: "Экспортировать CSV", action: download },
                        { text: "Обновить данные", action: refresh },
                        {
                          text: "Настроить виджет",
                          action: () => setModal("widget"),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div className="widget-heading">
                  <div>
                    <div className="widget-title-row">
                      <Text variant="header-1" as="h2">
                        {sales ? "Динамика продаж" : "Мониторинг сервисов"}
                      </Text>
                      {!sales && (
                        <span className="live-tag">
                          <span className="status-dot" />
                          {live ? "LIVE" : "ПАУЗА"}
                        </span>
                      )}
                    </div>
                    <p>
                      {sales
                        ? "Выручка и ключевые показатели вашего бизнеса"
                        : "Время ответа сервисов с детализацией до секунды"}
                    </p>
                  </div>
                  <div className="period-picker">
                    <Icon data={Calendar} size={16} />
                    <Select
                      size="m"
                      value={[sales ? period : minutes]}
                      onUpdate={(v) =>
                        sales ? setPeriod(v[0]) : setMinutes(v[0])
                      }
                      options={
                        sales
                          ? [
                              { value: "7", content: "Последние 7 дней" },
                              { value: "30", content: "Последние 30 дней" },
                              { value: "90", content: "Последние 90 дней" },
                            ]
                          : [
                              { value: "15", content: "Последние 15 минут" },
                              { value: "60", content: "Последний час" },
                              { value: "180", content: "Последние 3 часа" },
                            ]
                      }
                      aria-label="Период графика"
                    />
                  </div>
                </div>
                <div className="metrics">
                  <Metric
                    title={sales ? "Общая выручка" : "Среднее время ответа"}
                    value={
                      sales
                        ? `${fmt(total)} ₽`
                        : `${fmt(allSeries[0].data.reduce((s, p) => s + p.y, 0) / allSeries[0].data.length)} мс`
                    }
                    change={sales ? `+${growth}%` : "−12,4%"}
                    note={sales ? "к предыдущему периоду" : "за последний час"}
                    primary
                  />
                  <Metric
                    title={
                      sales ? "Количество заказов" : "Доступность сервисов"
                    }
                    value={sales ? fmt(count) : "99,98%"}
                    change={sales ? `+${ordersGrowth}%` : "+0,02%"}
                    note={
                      sales ? "к предыдущему периоду" : "за последние 24 часа"
                    }
                  />
                  <Metric
                    title={sales ? "Средний чек" : "Активных сервисов"}
                    value={sales ? `${fmt(total / count)} ₽` : "2 из 2"}
                    change={sales ? "+5,2%" : "В норме"}
                    note={
                      sales ? "к предыдущему периоду" : "ошибок не обнаружено"
                    }
                  />
                </div>
                <div className="chart-caption">
                  <span>{sales ? "Выручка, тыс. ₽" : "Время ответа, мс"}</span>
                  <span>{rangeLabel}</span>
                </div>
                <div className="chart-wrapper">
                  <VisualizationWidget
                    mode={mode}
                    series={visibleSeries}
                    height={Number(chartHeight)}
                  />
                </div>
                <div className="chart-legend">
                  <div className="series-controls">
                    {allSeries
                      .filter((s) => !sales || compare || s.id !== "previous")
                      .map((s) => (
                        <Button
                          key={s.id}
                          view="flat"
                          size="s"
                          onClick={() =>
                            setHidden((h) =>
                              h.includes(s.id)
                                ? h.filter((id) => id !== s.id)
                                : [...h, s.id],
                            )
                          }
                          className={
                            hidden.includes(s.id)
                              ? "legend-button is-hidden"
                              : "legend-button"
                          }
                          aria-pressed={!hidden.includes(s.id)}
                        >
                          <span
                            className={`legend-line ${s.dashed ? "is-dashed" : ""}`}
                            style={{ color: s.color }}
                          />
                          {s.name}
                        </Button>
                      ))}
                  </div>
                  {sales ? (
                    <Checkbox checked={compare} onUpdate={setCompare} size="m">
                      Сравнить с предыдущим периодом
                    </Checkbox>
                  ) : (
                    <Switch checked={live} onUpdate={setLive} size="m">
                      Обновлять каждые 5 сек.
                    </Switch>
                  )}
                </div>
                <div className="widget-footer">
                  <span>
                    <Icon data={Database} size={13} />
                    {sales ? "Sales Analytics" : "Infrastructure Metrics"}
                    <span className="footer-divider">·</span>
                    {fmt(allSeries[0].data.length)}{" "}
                    {sales ? "точек данных" : "точек на серию"}
                  </span>
                  <span>
                    <span className="status-dot" />
                    Обновлено{" "}
                    {new Date(now).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </section>
              <div className="bottom-grid">
                <section className="insight-card">
                  <div className="insight-icon">
                    <Icon data={ArrowUpRight} size={22} />
                  </div>
                  <div>
                    <span className="insight-eyebrow">В ФОКУСЕ</span>
                    <Text variant="subheader-2" as="h3">
                      {sales
                        ? "Продажи набирают обороты"
                        : "Сервисы работают стабильно"}
                    </Text>
                    <p>
                      {sales ? (
                        <>
                          Выручка выросла на <strong>{growth}%</strong> по
                          сравнению с предыдущим
                          <br className="wide-break" /> периодом. Хороший
                          момент, чтобы ставить новые цели.
                        </>
                      ) : (
                        <>
                          Время ответа в пределах нормы. Все сервисы доступны,
                          <br className="wide-break" /> мониторинг обновляется
                          автоматически.
                        </>
                      )}
                    </p>
                  </div>
                  <span className="insight-decoration" aria-hidden="true">
                    ↗
                  </span>
                </section>
                <section className="source-card">
                  <div className="source-heading">
                    <span className="source-icon">
                      <Icon data={Database} size={18} />
                    </span>
                    <Text variant="subheader-2">Источник данных</Text>
                    <span className="connected-tag">
                      <span className="status-dot" />
                      Подключён
                    </span>
                  </div>
                  <div className="source-details">
                    <div>
                      <strong>
                        {sales ? "Sales Analytics" : "Infrastructure Metrics"}
                      </strong>
                      <span>
                        {sales
                          ? "Демонстрационный набор продаж"
                          : "Демонстрационный поток метрик"}
                      </span>
                    </div>
                    <Button
                      view="flat"
                      size="s"
                      aria-label="Информация об источнике"
                      onClick={() => setModal("sources")}
                    >
                      <Icon data={ArrowUpRight} size={18} />
                    </Button>
                  </div>
                </section>
              </div>
              <footer className="page-footer">
                <span>
                  <Icon data={CircleCheck} size={14} /> Ваши данные складываются
                  в понятную картину
                </span>
                <span>
                  Создано с Gravity UI <span className="footer-divider">·</span>{" "}
                  Pulse © 2026
                </span>
              </footer>
            </main>
          </div>
        )}
      />
      <Modal
        open={Boolean(modal)}
        onOpenChange={(open) => !open && setModal(null)}
        aria-label="Информация и настройки"
      >
        <div className="modal-body">
          <div className="modal-heading">
            <Text variant="header-1">
              {
                (
                  {
                    help: "Знакомьтесь, Pulse",
                    sources: "Источники данных",
                    reports: "Экспорт отчётов",
                    settings: "Настройки пространства",
                    notifications: "Уведомления",
                    widget: "Настройки виджета",
                  } as Record<string, string>
                )[modal ?? ""]
              }
            </Text>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon data={Xmark} size={18} />
            </Button>
          </div>
          {modal === "widget" || modal === "settings" ? (
            <>
              <p>Настройте отображение данных под свои задачи.</p>
              <label className="setting-row">
                <span>Высота графика</span>
                <Select
                  value={[chartHeight]}
                  onUpdate={(v) => setChartHeight(v[0])}
                  options={[
                    { value: "250", content: "Компактная" },
                    { value: "310", content: "Стандартная" },
                    { value: "420", content: "Увеличенная" },
                  ]}
                />
              </label>
              <div className="setting-row">
                <span>Сравнение периодов</span>
                <Switch checked={compare} onUpdate={setCompare} />
              </div>
              <div className="setting-row">
                <span>Обновление мониторинга</span>
                <Switch checked={live} onUpdate={setLive} />
              </div>
              <Button
                view="action"
                size="l"
                width="max"
                onClick={() => {
                  setModal(null);
                  setToast("Настройки применены");
                }}
              >
                Готово
              </Button>
            </>
          ) : modal === "sources" ? (
            <>
              <p>Виджет использует локальные демонстрационные данные.</p>
              {[
                {
                  name: "Sales Analytics",
                  description: "Продажи по дням · до 90 дней",
                },
                {
                  name: "Infrastructure Metrics",
                  description: "2 сервиса · одна точка в секунду",
                },
              ].map((s) => (
                <div className="source-modal-row" key={s.name}>
                  <Icon data={Database} size={22} />
                  <div>
                    <strong>{s.name}</strong>
                    <p>{s.description}</p>
                  </div>
                  <Icon data={CircleCheck} size={19} />
                </div>
              ))}
              <p>
                Переключайтесь между источниками с помощью вкладок «Продажи» и
                «Мониторинг».
              </p>
            </>
          ) : modal === "reports" ? (
            <>
              <p>
                Скачайте текущие видимые серии за выбранный период. CSV содержит
                название серии, дату в ISO 8601 и значение.
              </p>
              <div className="report-summary">
                <strong>{sales ? "Продажи" : "Мониторинг"}</strong>
                <span>{rangeLabel}</span>
              </div>
              <Button view="action" size="l" onClick={download}>
                <Icon data={ArrowDownToLine} size={17} /> Скачать CSV
              </Button>
            </>
          ) : modal === "notifications" ? (
            <div className="notifications-empty">
              <Icon data={CircleCheck} size={38} />
              <Text variant="subheader-2">Всё спокойно</Text>
              <p>Новых уведомлений нет. Оба источника данных доступны.</p>
            </div>
          ) : (
            <>
              <p>
                Pulse объединяет бизнес-аналитику и мониторинг в одном виджете.
              </p>
              <div className="help-item">
                <Icon data={ChartLine} size={20} />
                <div>
                  <strong>Продажи</strong>
                  <p>
                    Выберите период, сравните выручку и скройте ненужные серии
                    нажатием на легенду.
                  </p>
                </div>
              </div>
              <div className="help-item">
                <Icon data={Pulse} size={20} />
                <div>
                  <strong>Мониторинг</strong>
                  <p>
                    Наблюдайте за плотным временным рядом. Выделите область
                    графика для увеличения; двойной щелчок сбрасывает масштаб.
                  </p>
                </div>
              </div>
              <p className="muted">
                Это демо: продажи генерируются локально, мониторинг имитирует
                поток метрик.
              </p>
            </>
          )}
        </div>
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <Icon data={CircleCheck} size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
function Metric({
  title,
  value,
  change,
  note,
  primary,
}: {
  title: string;
  value: string;
  change: string;
  note: string;
  primary?: boolean;
}) {
  return (
    <div className={`metric ${primary ? "primary-metric" : ""}`}>
      <span className="metric-label">
        {title}
        <Icon data={CircleQuestion} size={13} />
      </span>
      <div className="metric-value">{value}</div>
      <div className="metric-comparison">
        <span className="metric-change">
          <Icon data={ArrowUpRight} size={12} />
          {change}
        </span>
        <span>{note}</span>
      </div>
    </div>
  );
}
