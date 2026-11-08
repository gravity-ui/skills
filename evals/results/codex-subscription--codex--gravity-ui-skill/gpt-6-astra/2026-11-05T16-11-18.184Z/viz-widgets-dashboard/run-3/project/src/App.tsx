import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Button,
  Icon,
  Text,
  Select,
  DropdownMenu,
  Modal,
  TextInput,
  Table,
  Progress,
  configure,
} from "@gravity-ui/uikit";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  DashKit,
  type Config,
  type PluginWidgetProps,
} from "@gravity-ui/dashkit";
import { Chart } from "@gravity-ui/charts";
import {
  LayoutCellsLarge,
  ChartLine,
  ChartColumn,
  ChartDonut,
  Database,
  Persons,
  Gear,
  CircleQuestion,
  Bell,
  Plus,
  Calendar,
  Check,
  Xmark,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownToLine,
  ArrowsRotateRight,
  Sliders,
  Grip,
  Magnifier,
  Target,
  ShoppingBag,
  CircleCheck,
  Ellipsis,
} from "@gravity-ui/icons";
import "./styles.css";

configure({ lang: "ru" });
DashKit.setSettings({
  gridLayout: {
    cols: 12,
    rowHeight: 10,
    margin: [16, 16],
    containerPadding: [0, 0],
    compactType: null,
  },
  isMobile: false,
});
const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
const icons = {
  revenue: ChartLine,
  orders: ShoppingBag,
  clients: Persons,
  average: ChartColumn,
  dynamics: ChartLine,
  sources: ChartDonut,
  products: ShoppingBag,
  goal: Target,
};
type Kind = keyof typeof icons;
const titles: Record<Kind, string> = {
  revenue: "Выручка",
  orders: "Заказы",
  clients: "Новые клиенты",
  average: "Средний чек",
  dynamics: "Динамика выручки",
  sources: "Источники продаж",
  products: "Популярные товары",
  goal: "Цель по выручке",
};
const descriptions: Record<Kind, string> = {
  revenue: "Общая выручка за выбранный период",
  orders: "Количество оформленных заказов",
  clients: "Клиенты, совершившие первую покупку",
  average: "Средняя стоимость одного заказа",
  dynamics: "Выручка в сравнении с прошлым периодом",
  sources: "Распределение выручки по каналам продаж",
  products: "Товары, которые приносят больше выручки",
  goal: "Прогресс достижения месячной цели",
};
const kinds = Object.keys(titles) as Kind[];
const initialConfig: Config = {
  salt: "orbit",
  counter: 8,
  aliases: {},
  connections: [],
  items: kinds.map((kind, i) => ({
    id: kind,
    type: "orbit-widget",
    namespace: "default",
    data: { kind },
    orderId: i,
  })),
  layout: kinds.map((kind, i) => ({
    i: kind,
    x: i < 4 ? i * 3 : i % 2 === 0 ? 0 : 8,
    y: i < 4 ? 0 : i < 6 ? 6 : 20,
    w: i < 4 ? 3 : i % 2 === 0 ? 8 : 4,
    h: i < 4 ? 6 : i < 6 ? 14 : 13,
  })),
};
const storageKey = "orbit-dashboard-v1";
function loadConfig(): Config {
  try {
    const c = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      c &&
      Array.isArray(c.items) &&
      Array.isArray(c.layout) &&
      c.items.every(
        (x: any) => x.type === "orbit-widget" && kinds.includes(x.data?.kind),
      ) &&
      c.layout.every((x: any) => [x.x, x.y, x.w, x.h].every(Number.isFinite))
    )
      return c;
  } catch {}
  return initialConfig;
}
const DashboardContext = createContext({
  factor: 1,
  period: "month",
  channel: "all",
  editing: false,
  remove: (_id: string) => {},
  duplicate: (_kind: Kind) => {},
  expand: (_kind: Kind) => {},
  showProducts: () => {},
});
const seriesValues = [
  38, 44, 40, 37, 53, 47, 39, 42, 63, 70, 59, 54, 69, 62, 57, 82, 87, 75, 65,
  72, 79, 91, 87, 80, 99, 106, 94, 103, 117, 111,
];
const palette = [
  "var(--g-color-base-brand)",
  "var(--g-color-base-positive-medium)",
  "var(--g-color-base-warning-medium)",
  "var(--g-color-base-misc-medium)",
];
const productData = [
  {
    name: "Наушники Nothing Ear",
    sub: "Электроника",
    qty: 84,
    price: 14900,
    color: "lavender",
    initials: "◉",
  },
  {
    name: "Рюкзак Daypack",
    sub: "Аксессуары",
    qty: 76,
    price: 6400,
    color: "peach",
    initials: "▥",
  },
  {
    name: "Колонка Sound Mini",
    sub: "Электроника",
    qty: 62,
    price: 8900,
    color: "sage",
    initials: "▤",
  },
  {
    name: "Термокружка Everyday",
    sub: "Для дома",
    qty: 57,
    price: 2900,
    color: "sand",
    initials: "◧",
  },
];
function Spark({ index }: { index: number }) {
  return (
    <div className={`spark spark-${index}`}>
      <Chart
        data={{
          chart: { margin: { top: 4, right: 0, bottom: 0, left: 0 } },
          xAxis: { visible: false },
          yAxis: [{ visible: false }],
          legend: { enabled: false },
          tooltip: { enabled: false },
          series: {
            data: [
              {
                type: "area",
                name: "",
                color:
                  index === 2
                    ? "var(--g-color-text-utility)"
                    : "var(--g-color-base-brand)",
                opacity: 0.09,
                lineWidth: 1.6,
                data: seriesValues
                  .filter((_, i) => i % 2 === 0)
                  .map((v, i) => ({
                    x: i,
                    y: v + Math.sin(i * (index + 1)) * 15,
                  })),
              },
            ],
          },
        }}
      />
    </div>
  );
}
function WidgetBody({ kind }: { kind: Kind }) {
  const { factor, period, channel, showProducts } =
    useContext(DashboardContext);
  if (["revenue", "orders", "clients", "average"].includes(kind)) {
    const index = kinds.indexOf(kind);
    const values = [
      money(2840650 * factor) + " ₽",
      money(1284 * factor),
      money(856 * factor),
      money(2212 * (1 + (factor - 1) * 0.1)) + " ₽",
    ];
    return (
      <div className="metric-content">
        <Text variant="display-1" className="metric-number">
          {values[index]}
        </Text>
        <Spark index={index} />
        <div className="metric-comparison">
          <span className="positive">
            <Icon data={ArrowUpRight} size={13} />
            {["18,6", "12,8", "8,2", "5,1"][index]}%
          </span>
          <span>к прошлому периоду</span>
        </div>
      </div>
    );
  }
  if (kind === "dynamics")
    return (
      <>
        <div className="chart-summary">
          <div>
            <Text variant="header-1">
              {money(2840650 * factor)} <span className="currency">₽</span>
            </Text>
            <span className="growth-pill">+18,6%</span>
          </div>
          <div className="chart-legend">
            <span>
              <i />
              Текущий период
            </span>
            <span>
              <i className="previous" />
              Прошлый период
            </span>
          </div>
        </div>
        <div className="revenue-chart">
          <Chart
            data={{
              chart: { margin: { top: 15, right: 12, bottom: 5, left: 0 } },
              legend: { enabled: false },
              xAxis: {
                type: "category",
                categories: (period === "week"
                  ? ["24", "25", "26", "27", "28", "29", "30"]
                  : Array.from({ length: 30 }, (_, i) => String(i + 1))
                ).map((x) => x + " окт"),
                grid: { enabled: false },
                ticks: { pixelInterval: 85 },
              },
              yAxis: [
                {
                  min: 0,
                  max: Math.ceil(150 * factor),
                  ticks: { pixelInterval: 55 },
                  title: { text: "тыс. ₽" },
                  grid: { enabled: true },
                },
              ],
              series: {
                data: [
                  {
                    type: "line",
                    name: "Прошлый период",
                    color: "var(--g-color-base-misc-medium)",
                    lineWidth: 2,
                    dashStyle: "Dash",
                    data: (period === "week"
                      ? seriesValues.slice(-7)
                      : seriesValues
                    ).map((v, i) => ({
                      x: i,
                      y: Math.round((v * 0.69 + Math.sin(i) * 10) * factor),
                    })),
                  },
                  {
                    type: "area",
                    name: "Текущий период",
                    color: "var(--g-color-base-brand)",
                    fillColor: "var(--g-color-base-brand)",
                    opacity: 0.07,
                    lineWidth: 2.5,
                    data: (period === "week"
                      ? seriesValues.slice(-7)
                      : seriesValues
                    ).map((v, i) => ({ x: i, y: Math.round(v * factor) })),
                  },
                ],
              },
            }}
          />
        </div>
      </>
    );
  if (kind === "sources") {
    const sourceNames = [
      "Интернет-магазин",
      "Маркетплейсы",
      "Розничные магазины",
      "Другие",
    ];
    const shares =
      channel === "all"
        ? [48, 28, 18, 6]
        : sourceNames.map((_, i) => (i === Number(channel) ? 100 : 0));
    return (
      <>
        <div className="donut-wrap">
          <Chart
            data={{
              chart: { margin: { top: 4, bottom: 4, left: 4, right: 4 } },
              legend: { enabled: false },
              series: {
                data: [
                  {
                    type: "pie",
                    innerRadius: "76%",
                    borderWidth: 3,
                    borderColor: "var(--g-color-base-background)",
                    dataLabels: { enabled: false },
                    data: sourceNames.map((name, i) => ({
                      name,
                      value: shares[i],
                      color: palette[i],
                    })),
                  },
                ],
              },
            }}
          />
          <div className="donut-label">
            <Text variant="header-1">{money(1284 * factor)}</Text>
            <span>всего заказов</span>
          </div>
        </div>
        <div className="source-list">
          {sourceNames.map((name, i) => (
            <div key={name}>
              <span>
                <i style={{ background: palette[i] }} />
                {name}
              </span>
              <strong>{shares[i]}%</strong>
            </div>
          ))}
        </div>
      </>
    );
  }
  if (kind === "products")
    return (
      <>
        <div className="product-table">
          <Table
            data={productData}
            columns={[
              {
                id: "name",
                name: "Товар",
                template: (item) => (
                  <div className="product-name">
                    <span className={`product-icon ${item.color}`}>
                      {item.initials}
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.sub}</small>
                    </span>
                  </div>
                ),
              },
              {
                id: "qty",
                name: "Продажи",
                align: "end",
                template: (item) => money(Math.round(item.qty * factor)),
              },
              {
                id: "total",
                name: "Выручка",
                align: "end",
                template: (item) => (
                  <strong>{money(item.qty * item.price * factor)} ₽</strong>
                ),
              },
            ]}
            width="max"
          />
        </div>
        <div className="table-footer">
          <span>Топ-4 товара за период</span>
          <Button view="flat" size="s" onClick={showProducts}>
            Все товары <Icon data={ChevronRight} size={14} />
          </Button>
        </div>
      </>
    );
  return (
    <div className="goal-content">
      <div className="goal-tag">
        <Icon data={Target} size={14} />
        Октябрь 2026
      </div>
      <div className="goal-value">
        <Text variant="display-1">
          {Math.min(100, Math.round(81 * factor))}
          <span className="currency">%</span>
        </Text>
        <span className="goal-ontrack">
          <i />
          Всё по плану
        </span>
      </div>
      <Progress value={Math.min(100, 81 * factor)} theme="success" size="s" />
      <div className="goal-amount">
        <strong>{money(2840650 * factor)} ₽</strong>
        <span>из 3 500 000 ₽</span>
      </div>
      <div className="goal-note">
        <span className="goal-note-icon">
          <Icon data={ChartLine} size={20} />
        </span>
        <span>
          До цели осталось{" "}
          <strong>{money(Math.max(0, 3500000 - 2840650 * factor))} ₽</strong>
          <small>Хороший темп. Продолжайте в том же духе!</small>
        </span>
      </div>
    </div>
  );
}
function Widget({ id, data, editMode }: PluginWidgetProps) {
  const kind = data.kind as Kind;
  const ctx = useContext(DashboardContext);
  const metric = kinds.indexOf(kind) < 4;
  return (
    <section
      className={`widget ${metric ? "metric" : ""} ${editMode ? "widget-editing" : ""}`}
    >
      <div className="widget-header">
        <div
          className="widget-drag"
          title={editMode ? "Перетащите виджет" : undefined}
        >
          {editMode ? (
            <Icon data={Grip} size={15} />
          ) : (
            !metric && <Icon data={icons[kind]} size={16} />
          )}
          <Text variant={metric ? "body-2" : "subheader-1"}>
            {titles[kind]}
          </Text>
        </div>
        <DropdownMenu
          size="s"
          defaultSwitcherProps={{
            view: "flat",
            size: "s",
            "aria-label": `Действия: ${titles[kind]}`,
          }}
          items={[
            { text: "Открыть подробнее", action: () => ctx.expand(kind) },
            { text: "Дублировать", action: () => ctx.duplicate(kind) },
            {
              text: "Удалить виджет",
              theme: "danger",
              action: () => ctx.remove(id),
            },
          ]}
        />
      </div>
      <WidgetBody kind={kind} />
    </section>
  );
}
DashKit.registerPlugins({
  type: "orbit-widget",
  defaultLayout: { w: 4, h: 13, minW: 2, minH: 6 },
  renderer: (props) => <Widget {...props} />,
});

export function App() {
  const [config, setConfig] = useState(loadConfig);
  const [mobileLayout, setMobileLayout] = useState<Config["layout"] | null>(
    null,
  );
  const [backup, setBackup] = useState(config);
  const [editing, setEditing] = useState(false);
  const [period, setPeriod] = useState("month");
  const [channel, setChannel] = useState("all");
  const [modal, setModal] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Kind | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [compact, setCompact] = useState(window.innerWidth < 1100);
  const [narrow, setNarrow] = useState(window.innerWidth < 720);
  const [updated, setUpdated] = useState("только что");
  useEffect(() => {
    const resize = () => {
      setNarrow(window.innerWidth < 720);
      if (window.innerWidth < 720) setCompact(true);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  function persist(next: Config) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setToast("Расположение виджетов сохранено");
    } catch {
      setToast("Не удалось сохранить: хранилище браузера недоступно");
    }
  }
  function update(next: Config) {
    setMobileLayout(null);
    setConfig(next);
    if (!editing) persist(next);
  }
  function add(kind: Kind) {
    const metric = kinds.indexOf(kind) < 4;
    const next = DashKit.setItem({
      config,
      item: {
        type: "orbit-widget",
        data: { kind },
        namespace: "default",
        layout: {
          x: 0,
          y: Math.max(0, ...config.layout.map((l) => l.y + l.h)),
          w: metric ? 3 : kind === "dynamics" || kind === "products" ? 8 : 4,
          h: metric ? 6 : 14,
        },
      },
    });
    update(next);
    setModal(null);
    setQuery("");
    setToast("Виджет добавлен на дашборд");
  }
  function remove(id: string) {
    update(DashKit.removeItem({ id, config, itemsStateAndParams: {} }).config);
    setToast("Виджет удалён. Его можно вернуть из библиотеки");
  }
  function startEdit() {
    setBackup(config);
    setEditing(true);
  }
  function finishEdit() {
    const next =
      narrow && mobileLayout ? { ...config, layout: mobileLayout } : config;
    setConfig(next);
    persist(next);
    setEditing(false);
  }
  function exportData() {
    const csv =
      "\uFEFFТовар;Продажи;Выручка, ₽\n" +
      productData
        .map(
          (p) =>
            `${p.name};${Math.round(p.qty * factor)};${Math.round(p.qty * p.price * factor)}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `orbit-${period}-${channel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Отчёт CSV выгружен");
  }
  const factor =
    (period === "week" ? 0.26 : period === "quarter" ? 2.84 : 1) *
    (channel === "all" ? 1 : [0.48, 0.28, 0.18, 0.06][Number(channel)]);
  const displayConfig = useMemo(() => {
    if (!narrow) return config;
    if (mobileLayout) return { ...config, layout: mobileLayout };
    let y = 0;
    const layout = [...config.layout]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((l) => {
        const h =
          kinds.indexOf(
            config.items.find((item) => item.id === l.i)?.data.kind as Kind,
          ) < 4
            ? 6
            : 14;
        const item = { ...l, x: 0, y, w: 12, h };
        y += h;
        return item;
      });
    return { ...config, layout };
  }, [config, narrow, mobileLayout]);
  const context = {
    factor,
    period,
    channel,
    editing,
    remove,
    duplicate: add,
    expand: setExpanded,
    showProducts: () => setModal("products"),
  };
  return (
    <DashboardContext.Provider value={context}>
      <AsideHeader
        className="app-shell"
        compact={compact}
        onChangeCompact={setCompact}
        hideCollapseButton={narrow}
        hideSectionDividers
        logo={{
          text: () => (
            <span className="brand-word">
              orbit<span>®</span>
            </span>
          ),
          icon: ChartDonut,
          iconSize: 30,
          iconClassName: "brand-icon",
          onClick: () => setActiveTab("overview"),
        }}
        aboveMenuContent={
          !compact && (
            <div className="sidebar-top">
              <div className="workspace-picker">
                <div className="workspace-avatar">S</div>
                <div>
                  <strong>Studio Store</strong>
                  <small>Рабочее пространство</small>
                </div>
                <Icon data={ChevronDown} size={13} />
              </div>
              <span className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</span>
            </div>
          )
        }
        menuItems={[
          {
            id: "overview",
            title: "Обзор",
            icon: LayoutCellsLarge,
            current: activeTab === "overview",
            onItemClick: () => setActiveTab("overview"),
          },
          {
            id: "analytics",
            title: "Аналитика",
            icon: ChartLine,
            current: activeTab === "analytics",
            onItemClick: () => setActiveTab("analytics"),
          },
          {
            id: "reports",
            title: "Отчёты",
            icon: ChartColumn,
            onItemClick: () => setModal("reports"),
          },
          {
            id: "sources",
            title: "Источники данных",
            icon: Database,
            onItemClick: () => setModal("connections"),
          },
          {
            id: "team",
            title: "Команда",
            icon: Persons,
            onItemClick: () => setModal("team"),
          },
        ]}
        renderFooter={() => (
          <div className="sidebar-bottom">
            {!compact && (
              <div className="customize-promo">
                <span className="promo-icon">
                  <Icon data={LayoutCellsLarge} size={19} />
                </span>
                <strong>Ваш дашборд. Ваши правила.</strong>
                <p>
                  Соберите всё важное
                  <br />
                  на одном экране.
                </p>
                <Button
                  view="outlined"
                  width="max"
                  onClick={() => setModal("library")}
                >
                  Добавить виджет <Icon data={Plus} size={14} />
                </Button>
              </div>
            )}
            <Button
              view="flat"
              width="max"
              onClick={() => setModal("settings")}
            >
              <Icon data={Gear} size={17} />
              {!compact && "Настройки"}
            </Button>
            <Button view="flat" width="max" onClick={() => setModal("help")}>
              <Icon data={CircleQuestion} size={17} />
              {!compact && "Помощь и поддержка"}
            </Button>
            {!compact && (
              <div className="profile">
                <div className="profile-avatar">АК</div>
                <div>
                  <strong>Александр К.</strong>
                  <small>Личный аккаунт</small>
                </div>
                <DropdownMenu
                  items={[
                    {
                      text: "Настройки профиля",
                      action: () => setModal("profile"),
                    },
                  ]}
                  defaultSwitcherProps={{
                    "aria-label": "Меню профиля",
                    size: "s",
                  }}
                />
              </div>
            )}
          </div>
        )}
        renderContent={() => (
          <div className="page">
            <header className="topbar">
              <div className="breadcrumbs">
                <span>Рабочее пространство</span>
                <Icon data={ChevronRight} size={12} />
                <strong>
                  {activeTab === "overview" ? "Обзор" : "Аналитика"}
                </strong>
              </div>
              <div className="topbar-right">
                <span className="demo-label">Демо-пространство</span>
                <Button
                  view="flat"
                  aria-label="Уведомления"
                  onClick={() => setModal("notifications")}
                >
                  <Icon data={Bell} size={18} />
                </Button>
                <span className="topbar-divider" />
                <div className="profile-avatar small">АК</div>
              </div>
            </header>
            <main className="main">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div>
                  <Text as="h1" variant="display-2">
                    {activeTab === "overview"
                      ? "Обзор бизнеса"
                      : "Аналитика продаж"}
                  </Text>
                  <p>Всё, что важно для вашего бизнеса, — на одном экране.</p>
                </div>
                <div className="heading-actions">
                  <Button size="l" view="outlined" onClick={exportData}>
                    <Icon data={ArrowDownToLine} size={16} />
                    Экспорт
                  </Button>
                  <Button
                    size="l"
                    view="action"
                    onClick={() => setModal("library")}
                  >
                    <Icon data={Plus} size={16} />
                    Добавить виджет
                  </Button>
                </div>
              </div>
              <div className="dashboard-tabs">
                <Button
                  view="flat"
                  className={activeTab === "overview" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("overview")}
                >
                  Обзор
                </Button>
                <Button
                  view="flat"
                  className={activeTab === "analytics" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("analytics")}
                >
                  Продажи
                </Button>
                <Button
                  view="flat"
                  className="tab"
                  onClick={() => setModal("audience")}
                >
                  Аудитория
                </Button>
                <div className="tabs-spacer" />
                <span className="save-state">
                  <Icon data={CircleCheck} size={14} />
                  {editing ? "Режим редактирования" : "Все изменения сохранены"}
                </span>
              </div>
              <div className="filterbar">
                <div className="filters">
                  <div className="period-control">
                    <Icon data={Calendar} size={16} />
                    <Select
                      value={[period]}
                      onUpdate={(v) => setPeriod(v[0])}
                      size="m"
                      view="clear"
                      options={[
                        { value: "month", content: "1–30 октября 2026" },
                        { value: "week", content: "24–30 октября 2026" },
                      ]}
                      aria-label="Период"
                    />
                  </div>
                  <Select
                    value={[channel]}
                    onUpdate={(v) => setChannel(v[0])}
                    size="m"
                    options={[
                      { value: "all", content: "Все каналы" },
                      { value: "0", content: "Интернет-магазин" },
                      { value: "1", content: "Маркетплейсы" },
                      { value: "2", content: "Розница" },
                    ]}
                    aria-label="Канал продаж"
                  />
                  <span className="comparison-label">
                    в сравнении с прошлым периодом
                  </span>
                </div>
                <div className="layout-actions">
                  {editing ? (
                    <>
                      <Button
                        view="flat"
                        onClick={() => {
                          setConfig(backup);
                          setMobileLayout(null);
                          setEditing(false);
                        }}
                      >
                        Отмена
                      </Button>
                      <Button view="action" onClick={finishEdit}>
                        <Icon data={Check} size={15} />
                        Готово
                      </Button>
                    </>
                  ) : (
                    <Button view="flat" onClick={startEdit}>
                      <Icon data={Sliders} size={16} />
                      Настроить
                    </Button>
                  )}
                </div>
              </div>
              {editing && (
                <div className="editing-banner">
                  <Icon data={Grip} size={17} />
                  <span>
                    Перетаскивайте виджеты за заголовок и меняйте размер за
                    нижний угол.
                  </span>
                  <Button
                    view="flat"
                    size="s"
                    onClick={() => {
                      setConfig(initialConfig);
                      setMobileLayout(null);
                    }}
                  >
                    Сбросить
                  </Button>
                </div>
              )}
              <div className={`dashboard ${editing ? "is-editing" : ""}`}>
                <DashKit
                  config={displayConfig}
                  editMode={editing}
                  noOverlay
                  draggableHandleClassName="widget-drag"
                  onChange={({ config: next }) => {
                    if (narrow) setMobileLayout(next.layout);
                    else setConfig(next);
                  }}
                />
                {config.items.length === 0 && (
                  <div className="empty-state">
                    <Icon data={LayoutCellsLarge} size={42} />
                    <Text variant="header-1">Место для ваших идей</Text>
                    <p>Добавьте первый виджет и соберите свой дашборд.</p>
                    <Button view="action" onClick={() => setModal("library")}>
                      Добавить виджет
                    </Button>
                  </div>
                )}
              </div>
              <footer className="page-footer">
                <span>
                  <i className="live-dot" />
                  Данные обновлены {updated}
                  <Button
                    view="flat"
                    size="s"
                    aria-label="Обновить данные"
                    onClick={() => {
                      setUpdated(
                        new Date().toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      );
                      setToast("Демонстрационные данные обновлены");
                    }}
                  >
                    <Icon data={ArrowsRotateRight} size={13} />
                  </Button>
                </span>
                <span>
                  <Icon data={Grip} size={13} />
                  Ваш дашборд подстраивается под вас
                </span>
              </footer>
            </main>
          </div>
        )}
      />
      <Modal
        open={modal !== null}
        onClose={() => {
          setModal(null);
          setQuery("");
        }}
        aria-label="Диалог"
      >
        <div className="modal-content">
          <div className="modal-heading">
            <Text variant="header-1">
              {
                (
                  {
                    library: "Библиотека виджетов",
                    products: "Все товары",
                    reports: "Отчёты",
                    connections: "Источники данных",
                    team: "Команда",
                    settings: "Настройки дашборда",
                    help: "Ваш дашборд — под вашим контролем",
                    profile: "Профиль",
                    notifications: "Уведомления",
                    audience: "Аудитория",
                  } as Record<string, string>
                )[modal || ""]
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
          {modal === "library" ? (
            <>
              <p className="muted">
                Выберите данные, которые хотите видеть на дашборде.
              </p>
              <TextInput
                value={query}
                onUpdate={setQuery}
                placeholder="Найти виджет"
                startContent={<Icon data={Magnifier} size={16} />}
                size="l"
              />
              <div className="widget-library">
                {kinds
                  .filter((k) =>
                    titles[k].toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((k) => (
                    <div className="library-item" key={k}>
                      <span className="library-icon">
                        <Icon data={icons[k]} size={22} />
                      </span>
                      <div>
                        <strong>{titles[k]}</strong>
                        <p>{descriptions[k]}</p>
                      </div>
                      <Button
                        view="outlined"
                        aria-label={`Добавить: ${titles[k]}`}
                        onClick={() => add(k)}
                      >
                        <Icon data={Plus} size={17} />
                      </Button>
                    </div>
                  ))}
                {!kinds.some((k) =>
                  titles[k].toLowerCase().includes(query.toLowerCase()),
                ) && (
                  <p className="muted">
                    Ничего не найдено. Попробуйте другое название.
                  </p>
                )}
              </div>
            </>
          ) : modal === "products" ? (
            <div className="modal-table">
              <WidgetBody kind="products" />
              <Button view="action" onClick={exportData}>
                Скачать список товаров
              </Button>
            </div>
          ) : modal === "reports" ? (
            <>
              <p className="muted">
                Отчёт по продажам за выбранный период. Данные учитывают фильтр
                канала.
              </p>
              <div className="report-preview">
                <Icon data={ChartColumn} size={32} />
                <div>
                  <strong>Продажи и выручка</strong>
                  <p>
                    {period === "month"
                      ? "Октябрь 2026"
                      : period === "week"
                        ? "24–30 октября 2026"
                        : "Август — октябрь 2026"}{" "}
                    · CSV
                  </p>
                </div>
                <Button view="action" onClick={exportData}>
                  Скачать
                </Button>
              </div>
            </>
          ) : modal === "connections" ? (
            <>
              <p className="muted">
                Демонстрационные источники этого пространства.
              </p>
              {["Интернет-магазин", "Маркетплейсы", "Розничные магазины"].map(
                (s) => (
                  <div className="detail-row" key={s}>
                    <Icon data={Database} size={19} />
                    <strong>{s}</strong>
                    <span className="positive">Демо-данные</span>
                  </div>
                ),
              )}
            </>
          ) : modal === "team" || modal === "profile" ? (
            <div className="detail-row">
              <div className="profile-avatar">АК</div>
              <div>
                <strong>Александр К.</strong>
                <p className="muted">Владелец · Studio Store</p>
              </div>
            </div>
          ) : modal === "settings" ? (
            <>
              <p className="muted">
                Расположение виджетов хранится в этом браузере.
              </p>
              <div className="detail-row">
                <span>Вернуть исходный набор и расположение</span>
                <Button
                  view="outlined"
                  onClick={() => {
                    update(initialConfig);
                    setModal(null);
                  }}
                >
                  Сбросить дашборд
                </Button>
              </div>
            </>
          ) : modal === "notifications" ? (
            <div className="detail-row">
              <span className="library-icon">
                <Icon data={CircleCheck} size={24} />
              </span>
              <div>
                <strong>Всё актуально</strong>
                <p className="muted">
                  Новых уведомлений нет. Данные дашборда обновлены.
                </p>
              </div>
            </div>
          ) : modal === "audience" ? (
            <>
              <p className="muted">Клиенты за выбранный период</p>
              <div className="audience-stat">
                <Text variant="display-2">{money(856 * factor)}</Text>
                <span className="positive">+8,2% новых клиентов</span>
              </div>
              <div className="detail-row">
                <span>Повторные покупки</span>
                <strong>32,4%</strong>
              </div>
              <div className="detail-row">
                <span>Средний чек</span>
                <strong>{money(2212 * (1 + (factor - 1) * 0.1))} ₽</strong>
              </div>
            </>
          ) : (
            <div className="help-content">
              <p>
                Нажмите «Настроить», чтобы перемещать виджеты за заголовки и
                изменять их размер за нижний правый угол.
              </p>
              <p>
                В меню виджета доступны просмотр, дублирование и удаление.
                Кнопка «Готово» сохраняет расположение, а «Отмена» возвращает
                предыдущий вариант.
              </p>
              <p>
                Добавляйте виджеты из библиотеки, выбирайте период и канал
                продаж, выгружайте отчёт в CSV.
              </p>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={expanded !== null}
        onClose={() => setExpanded(null)}
        aria-label="Просмотр виджета"
      >
        <div className="modal-content expanded-widget">
          <div className="modal-heading">
            <Text variant="header-1">{expanded && titles[expanded]}</Text>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setExpanded(null)}
            >
              <Icon data={Xmark} size={18} />
            </Button>
          </div>
          {expanded && <WidgetBody kind={expanded} />}
        </div>
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <Icon data={CircleCheck} size={18} />
          {toast}
          <Button
            view="flat"
            size="s"
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
      )}
    </DashboardContext.Provider>
  );
}
