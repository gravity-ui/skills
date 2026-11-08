import React, { useState, useEffect, useRef } from "react";
import "./styles.css";

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 4v16h17M8 15v-4m5 4V7m5 8v-6" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    arrow: <path d="m7 17 10-10M7 7h10v10" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16 12-12 4 4L8 20H4v-4ZM14 6l4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" />
      </>
    ),
    bag: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M16 10h5v6h-5a3 3 0 0 1 0-6Z" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="3" />
        <circle cx="16" cy="17" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    grip: (
      <>
        <path
          d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"
          strokeWidth="3"
        />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />
      </>
    ),
    logout: <path d="M9 4H4v16h5m5-13 5 5-5 5m-6-5h11" />,
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
      {paths[name] || paths.grid}
    </svg>
  );
}
type Widget = {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
const initial: Widget[] = [
  ...["revenue", "users", "orders", "conversion"].map((type, i) => ({
    id: type,
    type,
    x: i * 3,
    y: 0,
    w: 3,
    h: 2,
  })),
  { id: "chart", type: "chart", x: 0, y: 2, w: 8, h: 4 },
  { id: "traffic", type: "traffic", x: 8, y: 2, w: 4, h: 4 },
  { id: "tasks", type: "tasks", x: 0, y: 6, w: 4, h: 4 },
  { id: "activity", type: "activity", x: 4, y: 6, w: 4, h: 4 },
  { id: "goal", type: "goal", x: 8, y: 6, w: 4, h: 4 },
];
const titles: Record<string, string> = {
  revenue: "Общий доход",
  users: "Посетители",
  orders: "Заказы",
  conversion: "Конверсия",
  chart: "Динамика дохода",
  traffic: "Источники трафика",
  tasks: "Мои задачи",
  activity: "Последняя активность",
  goal: "Цель месяца",
  notes: "Заметки",
};
const overlap = (a: Widget, b: Widget) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function App() {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("pulse-layout") || "null") || initial
      );
    } catch {
      return initial;
    }
  });
  const [edit, setEdit] = useState(false),
    [drawer, setDrawer] = useState(false),
    [query, setQuery] = useState(""),
    [period, setPeriod] = useState("Этот месяц"),
    [periodOpen, setPeriodOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [modal, setModal] = useState(""),
    [page, setPage] = useState("Обзор"),
    [tab, setTab] = useState("Обзор"),
    [toast, setToast] = useState(""),
    [tasks, setTasks] = useState<boolean[]>(() => {
      try {
        return (
          JSON.parse(localStorage.getItem("pulse-tasks") || "null") || [
            false,
            false,
            true,
            false,
          ]
        );
      } catch {
        return [false, false, true, false];
      }
    }),
    [note, setNote] = useState(() => localStorage.getItem("pulse-note") || ""),
    [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(
      null,
    );
  useEffect(() => {
    localStorage.setItem("pulse-tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("pulse-note", note);
  }, [note]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setDrawer((v) => !v);
      }
      if (e.key === "Escape") {
        setDrawer(false);
        setModal("");
        setMenu(false);
        setPeriodOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const grid = useRef<HTMLDivElement>(null);
  const factor =
    period === "Эта неделя" ? 0.24 : period === "Сегодня" ? 0.035 : 1;
  useEffect(() => {
    localStorage.setItem("pulse-layout", JSON.stringify(widgets));
  }, [widgets]);
  useEffect(() => {
    if (toast) {
      let timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  function move(id: string, x: number, y: number) {
    setWidgets((old) => {
      const item = old.find((w) => w.id === id)!;
      const moved = {
        ...item,
        x: Math.max(0, Math.min(12 - item.w, x)),
        y: Math.max(0, y),
      };
      let rest = old.filter((w) => w.id !== id);
      const hits = rest.filter((w) => overlap(w, moved));
      if (hits.length === 1 && hits[0].w === item.w && hits[0].h === item.h) {
        rest = rest.map((w) =>
          w.id === hits[0].id ? { ...w, x: item.x, y: item.y } : w,
        );
      } else {
        rest = rest.map((w) =>
          hits.some((h) => h.id === w.id)
            ? { ...w, y: Math.max(...old.map((a) => a.y + a.h)) }
            : w,
        );
        let placed: Widget[] = [moved];
        rest = rest.map((w) => {
          let next = { ...w };
          while (placed.some((p) => overlap(p, next))) next.y++;
          placed.push(next);
          return next;
        });
      }
      return [...rest, moved];
    });
  }
  function startDrag(e: React.PointerEvent, w: Widget) {
    if (!edit) return;
    e.preventDefault();
    const rect = grid.current!.getBoundingClientRect();
    const startX = e.clientX,
      startY = e.clientY;
    const computed = getComputedStyle(grid.current!);
    const gap = parseFloat(computed.columnGap) || 20;
    const step = (rect.width + gap) / 12;
    const rowStep = (parseFloat(computed.gridAutoRows) || 52) + gap;
    let dest = { x: w.x, y: w.y };
    setDrag({ id: w.id, ...dest });
    const onMove = (ev: PointerEvent) => {
      dest = {
        x: Math.max(
          0,
          Math.min(12 - w.w, w.x + Math.round((ev.clientX - startX) / step)),
        ),
        y: Math.max(0, w.y + Math.round((ev.clientY - startY) / rowStep)),
      };
      if (window.innerWidth <= 1000) {
        const target = document
          .elementFromPoint(ev.clientX, ev.clientY)
          ?.closest("[data-widget]");
        const other = widgets.find(
          (a) => a.id === target?.getAttribute("data-widget"),
        );
        if (other && other.id !== w.id) dest = { x: other.x, y: other.y };
      }
      setDrag({ id: w.id, ...dest });
    };
    const onUp = () => {
      move(w.id, dest.x, dest.y);
      setDrag(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  function add(type: string) {
    const metric = ["revenue", "users", "orders", "conversion"].includes(type);
    setWidgets((old) => [
      ...old,
      {
        id: type + Date.now(),
        type,
        x: 0,
        y: Math.max(0, ...old.map((w) => w.y + w.h)),
        w: metric ? 3 : type === "chart" ? 8 : 4,
        h: metric ? 2 : 4,
      },
    ]);
    setDrawer(false);
    setToast("Виджет добавлен на дашборд");
  }
  const money = (n: number) => Math.round(n * factor).toLocaleString("ru-RU");
  function contents(w: Widget) {
    if (["revenue", "users", "orders", "conversion"].includes(w.type)) {
      const i = ["revenue", "users", "orders", "conversion"].indexOf(w.type);
      return (
        <>
          <div className="metric-label">
            <span>{titles[w.type]}</span>
            <span className={"metric-icon m" + i}>
              <Icon name={["wallet", "users", "bag", "target"][i]} size={18} />
            </span>
          </div>
          <div className="metric-value">
            {[money(1248500) + " ₽", money(24892), money(1842), "7,4%"][i]}
            <Spark index={i} />
          </div>
          <div className="metric-foot">
            <span className="positive">
              <Icon name="arrow" size={12} />
              {["12,8", "8,2", "16,4", "2,1"][i]}%
            </span>
            <span>к прошлому периоду</span>
          </div>
        </>
      );
    }
    if (w.type === "chart")
      return (
        <>
          <div className="chart-summary">
            <strong>
              {money(1248500)} <span>₽</span>
            </strong>
            <span className="positive">↗ 12,8%</span>
            <div className="legend">
              <i />
              Текущий месяц <i className="pale" />
              Прошлый месяц
            </div>
          </div>
          <div className="line-chart">
            <div className="y-labels">
              <span>600 тыс.</span>
              <span>450 тыс.</span>
              <span>300 тыс.</span>
              <span>150 тыс.</span>
              <span>0</span>
            </div>
            <svg viewBox="0 0 650 155" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#6fc4a4" stopOpacity=".22" />
                  <stop offset="1" stopColor="#6fc4a4" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[5, 40, 75, 110, 145].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="650"
                  y2={y}
                  stroke="#ecefef"
                  strokeDasharray="4 4"
                />
              ))}
              <path
                d="M0 132C30 132 30 110 60 112S100 133 130 109S175 105 200 87S230 81 260 94S300 120 330 96S370 84 395 72S435 80 460 67S500 75 525 55S560 63 590 43S625 53 650 37"
                fill="none"
                stroke="#c4d2cd"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <path
                d="M0 119C30 120 35 92 60 94S100 114 130 88S165 90 195 65S235 67 260 71S300 89 330 61S367 74 395 40S435 43 460 35S490 52 520 22S560 34 590 17S625 23 650 3V155H0Z"
                fill="url(#area)"
              />
              <path
                d="M0 119C30 120 35 92 60 94S100 114 130 88S165 90 195 65S235 67 260 71S300 89 330 61S367 74 395 40S435 43 460 35S490 52 520 22S560 34 590 17S625 23 650 3"
                fill="none"
                stroke="#369d7b"
                strokeWidth="2.8"
              />
            </svg>
          </div>
          <div className="x-labels">
            {[
              "1 июн",
              "5 июн",
              "10 июн",
              "15 июн",
              "20 июн",
              "25 июн",
              "30 июн",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </>
      );
    if (w.type === "traffic")
      return (
        <div className="traffic-body">
          <div className="donut">
            <div>
              <strong>{money(24892)}</strong>
              <span>посетителей</span>
            </div>
          </div>
          <div className="traffic-legend">
            {[
              ["Поиск", "42%", "#439c7d"],
              ["Прямые заходы", "28%", "#9bcbb6"],
              ["Соцсети", "18%", "#b2b7e9"],
              ["Другое", "12%", "#e4e8ec"],
            ].map(([t, n, c]) => (
              <div key={t}>
                <i style={{ background: c }} />
                <span>{t}</span>
                <b>{n}</b>
              </div>
            ))}
          </div>
          <div className="card-bottom">
            <span>Всего 4 источника</span>
            <span className="positive">↗ 8,2% за месяц</span>
          </div>
        </div>
      );
    if (w.type === "tasks")
      return (
        <>
          <div className="task-progress">
            <span>{tasks.filter(Boolean).length} из 4 выполнено</span>
            <span>{tasks.filter(Boolean).length * 25}%</span>
          </div>
          <div className="progress-track">
            <i style={{ width: tasks.filter(Boolean).length * 25 + "%" }} />
          </div>
          <div className="tasks">
            {[
              "Обновить главную страницу",
              "Подготовить отчёт за июнь",
              "Запустить email-рассылку",
              "Обсудить план с командой",
            ].map((t, i) => (
              <label key={t} className={tasks[i] ? "done" : ""}>
                <input
                  type="checkbox"
                  checked={tasks[i]}
                  onChange={() =>
                    setTasks((old) => old.map((v, j) => (j === i ? !v : v)))
                  }
                />
                <span>{t}</span>
                {i === 0 ? (
                  <small>Сегодня</small>
                ) : i === 3 ? (
                  <small className="neutral">Завтра</small>
                ) : null}
              </label>
            ))}
          </div>
          <button
            className="text-button"
            onClick={() => setModal("Новая задача")}
          >
            <Icon name="plus" size={15} /> Добавить задачу
          </button>
        </>
      );
    if (w.type === "activity")
      return (
        <div className="activities">
          {[
            [
              "bag",
              "Новый заказ #1048",
              "Анна Смирнова · 12 500 ₽",
              "2 мин назад",
            ],
            [
              "users",
              "Новый пользователь",
              "Михаил присоединился к проекту",
              "18 мин назад",
            ],
            [
              "check",
              "Задача выполнена",
              "Запустить email-рассылку",
              "42 мин назад",
            ],
          ].map(([icon, title, sub, time], i) => (
            <div className="activity" key={title}>
              <span className={"activity-icon a" + i}>
                <Icon name={icon} size={16} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{sub}</p>
                <small>{time}</small>
              </div>
            </div>
          ))}
          <button
            className="text-button activity-all"
            onClick={() => setModal("Вся активность")}
          >
            Вся активность <span>→</span>
          </button>
        </div>
      );
    if (w.type === "goal")
      return (
        <>
          <div className="goal-label">
            <span className="goal-icon">
              <Icon name="target" size={22} />
            </span>
            <div>
              <strong>Доход за июнь</strong>
              <p>План — 1 500 000 ₽</p>
            </div>
            <span className="goal-tag">В процессе</span>
          </div>
          <div className="goal-number">
            1 248 500 <span>/ 1 500 000 ₽</span>
          </div>
          <div className="progress-track goal-track">
            <i style={{ width: "83%" }} />
          </div>
          <div className="goal-sub">
            <span>
              <b>83%</b> от цели
            </span>
            <span>Осталось 8 дней</span>
          </div>
          <div className="goal-tip">
            <span>✧</span>
            <p>
              Отличный темп! До цели осталось
              <br />
              <strong>251 500 ₽</strong>
            </p>
          </div>
        </>
      );
    return (
      <textarea
        className="notes"
        placeholder="Запишите важные мысли…"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          localStorage.setItem("pulse-note", e.target.value);
        }}
      />
    );
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
          <span className="brand-symbol">
            p<span />
          </span>
          pulse<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace"
          onClick={() => setModal("Рабочее пространство")}
        >
          <span className="workspace-icon">S</span>
          <span>
            Studio Workspace<small>Рабочее пространство</small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          {[
            ["grid", "Дашборды"],
            ["chart", "Аналитика"],
            ["layers", "Все виджеты"],
          ].map(([icon, text]) => (
            <button
              key={text}
              className={text === "Дашборды" ? "nav-item active" : "nav-item"}
              onClick={() =>
                text === "Все виджеты"
                  ? setDrawer(true)
                  : text === "Аналитика"
                    ? (setPage("Аналитика"), setTab("Аналитика"))
                    : (setPage("Обзор"), setTab("Обзор"))
              }
            >
              <Icon name={icon} />
              {text}
              {text === "Дашборды" && <span className="count">3</span>}
            </button>
          ))}
        </nav>
        <div className="nav-caption dashboard-caption">
          МОИ ДАШБОРДЫ
          <button
            title="Создать дашборд"
            onClick={() => setModal("Новый дашборд")}
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
        {["Обзор", "Маркетинг", "Продажи"].map((p, i) => (
          <button
            key={p}
            onClick={() => {
              setPage(p);
              setTab("Обзор");
            }}
            className={"dashboard-link " + (page === p ? "selected" : "")}
          >
            <i className={"dot dot" + i} />
            {p}
            {p === "Обзор" && <span>⌘ 1</span>}
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="upgrade">
            <span className="upgrade-icon">✧</span>
            <strong>Больше возможностей</strong>
            <p>
              Создавайте больше.
              <br />
              Собирайте важное в одном месте.
            </p>
            <button onClick={() => setModal("Возможности Pro")}>
              Попробовать Pro <span>↗</span>
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal("Настройки")}>
            <Icon name="settings" />
            Настройки
          </button>
          <button
            className="nav-item"
            onClick={() => setModal("Помощь и поддержка")}
          >
            <Icon name="help" />
            Помощь и поддержка
            <Icon name="arrow" size={15} />
          </button>
          <button className="profile" onClick={() => setModal("Профиль")}>
            <span className="avatar">АК</span>
            <span>
              <strong>Александр Ким</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="grid" size={17} />
            <span>Дашборды</span>
            <span className="slash">/</span>
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button className="search-button" onClick={() => setDrawer(true)}>
              <Icon name="search" size={18} />
              <span>Поиск</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="top-divider" />
            <button
              className="notification"
              title="Уведомления"
              onClick={() => setModal("Уведомления")}
            >
              <Icon name="bell" />
              <i />
            </button>
            <button
              className="avatar small"
              onClick={() => setModal("Профиль")}
            >
              АК
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО</div>
              <h1>
                {page}
                <span className="heading-dot" />
              </h1>
              <p>Всё, что важно, — в одном месте.</p>
            </div>
            <div className="heading-actions">
              <button
                className={"button " + (edit ? "editing" : "")}
                onClick={() => {
                  setEdit(!edit);
                  setTab("Обзор");
                  if (edit) setToast("Расположение виджетов сохранено");
                }}
              >
                <Icon name={edit ? "check" : "edit"} size={16} />
                {edit ? "Готово" : "Настроить"}
              </button>
              <button
                className="button primary"
                onClick={() => setDrawer(true)}
              >
                <Icon name="plus" size={18} />
                Добавить виджет
              </button>
            </div>
          </div>
          <div className="dashboard-toolbar">
            <div className="tabs">
              {["Обзор", "Аналитика", "Мои задачи"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "current" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                  {t === "Обзор" && <span>{widgets.length}</span>}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <span className="live-dot" />
              <span className="updated">Обновлено только что</span>
              <div className="dropdown-wrap">
                <button
                  className="button period"
                  onClick={() => setPeriodOpen(!periodOpen)}
                >
                  <Icon name="calendar" size={15} />
                  {period}
                  <Icon name="chevron" size={14} />
                </button>
                {periodOpen && (
                  <div className="dropdown">
                    {["Сегодня", "Эта неделя", "Этот месяц"].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          setPeriodOpen(false);
                        }}
                      >
                        {p}
                        {p === period ? " ✓" : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="dropdown-wrap">
                <button
                  className="more-button"
                  title="Действия с дашбордом"
                  onClick={() => setMenu(!menu)}
                >
                  •••
                </button>
                {menu && (
                  <div className="dropdown">
                    <button
                      onClick={() => {
                        setWidgets(initial);
                        setMenu(false);
                        setToast("Исходное расположение восстановлено");
                      }}
                    >
                      Сбросить расположение
                    </button>
                    <button
                      onClick={() => {
                        const a = document.createElement("a");
                        const url = URL.createObjectURL(
                          new Blob([JSON.stringify(widgets, null, 2)], {
                            type: "application/json",
                          }),
                        );
                        a.href = url;
                        a.download = "pulse-dashboard.json";
                        a.click();
                        URL.revokeObjectURL(url);
                        setMenu(false);
                      }}
                    >
                      Экспортировать дашборд
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {edit && (
            <div className="edit-banner">
              <Icon name="grip" size={16} />
              Перетаскивайте виджеты за заголовок. Используйте стрелки на
              клавиатуре, чтобы перемещать выбранный виджет.
              <button onClick={() => setEdit(false)}>Готово</button>
            </div>
          )}
          <div
            ref={grid}
            className={
              "widget-grid " +
              (edit ? "edit-grid" : "") +
              " " +
              (tab !== "Обзор" ? "filtered" : "")
            }
          >
            {[...widgets]
              .sort((a, b) => a.y - b.y || a.x - b.x)
              .filter(
                (w) =>
                  tab === "Обзор" ||
                  (tab === "Мои задачи"
                    ? ["tasks", "goal", "notes"].includes(w.type)
                    : !["tasks", "activity", "notes"].includes(w.type)),
              )
              .map((w) => (
                <section
                  key={w.id}
                  data-widget={w.id}
                  className={
                    "widget widget-" +
                    w.type +
                    (drag?.id === w.id ? " dragging" : "")
                  }
                  style={
                    tab === "Обзор"
                      ? {
                          gridColumn: `${w.x + 1} / span ${w.w}`,
                          gridRow: `${w.y + 1} / span ${w.h}`,
                        }
                      : { gridColumn: `span ${w.w}`, gridRow: `span ${w.h}` }
                  }
                >
                  {edit && (
                    <div
                      className="edit-handle"
                      onPointerDown={(e) => startDrag(e, w)}
                      tabIndex={0}
                      role="button"
                      aria-label={"Переместить " + titles[w.type]}
                      onKeyDown={(e) => {
                        const directions: Record<string, number[]> = {
                          ArrowLeft: [-1, 0],
                          ArrowRight: [1, 0],
                          ArrowUp: [0, -1],
                          ArrowDown: [0, 1],
                        };
                        if (directions[e.key]) {
                          e.preventDefault();
                          move(
                            w.id,
                            w.x + directions[e.key][0],
                            w.y + directions[e.key][1],
                          );
                        }
                      }}
                    >
                      <Icon name="grip" size={16} />
                      <span>Переместить</span>
                      <button
                        title="Удалить виджет"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() =>
                          setWidgets((old) => old.filter((a) => a.id !== w.id))
                        }
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  )}
                  {!["revenue", "users", "orders", "conversion"].includes(
                    w.type,
                  ) && (
                    <div className="widget-heading">
                      <h2>{titles[w.type]}</h2>
                      {w.type === "chart" ? (
                        <span className="mini-label">
                          По дням <Icon name="chevron" size={12} />
                        </span>
                      ) : (
                        <span className="widget-dots">•••</span>
                      )}
                    </div>
                  )}
                  {contents(w)}
                </section>
              ))}
            {drag && (
              <div
                className="drop-preview"
                style={{
                  gridColumn: `${drag.x + 1} / span ${widgets.find((w) => w.id === drag.id)!.w}`,
                  gridRow: `${drag.y + 1} / span ${widgets.find((w) => w.id === drag.id)!.h}`,
                }}
              />
            )}
          </div>
          <button className="add-zone" onClick={() => setDrawer(true)}>
            <span>
              <Icon name="plus" size={17} />
            </span>
            Ваш дашборд может больше. <strong>Добавьте виджет</strong>
          </button>
          <footer>
            <span>
              <span className="footer-mark">◈</span> Ваш ритм. Ваши данные. Ваш
              Pulse.
            </span>
            <span>
              Демонстрационные данные <i /> Все изменения сохранены
            </span>
          </footer>
        </main>
      </div>
      {drawer && (
        <div className="overlay" onMouseDown={() => setDrawer(false)}>
          <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Добавить виджет</h2>
              <button onClick={() => setDrawer(false)} aria-label="Закрыть">
                <Icon name="close" />
              </button>
            </div>
            <p>Соберите пространство под свои задачи.</p>
            <div className="search-field">
              <Icon name="search" size={18} />
              <input
                autoFocus
                placeholder="Найти виджет…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="widget-catalog">
              {Object.entries(titles)
                .filter(([, title]) =>
                  title.toLowerCase().includes(query.toLowerCase()),
                )
                .map(([type, title]) => (
                  <button key={type} onClick={() => add(type)}>
                    <span className="catalog-icon">
                      <Icon
                        name={
                          type === "chart"
                            ? "chart"
                            : type === "goal"
                              ? "target"
                              : "grid"
                        }
                      />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>
                        {["revenue", "users", "orders", "conversion"].includes(
                          type,
                        )
                          ? "Ключевые показатели"
                          : "Обзор и планирование"}
                      </small>
                    </span>
                    <Icon name="plus" size={18} />
                  </button>
                ))}
            </div>
          </aside>
        </div>
      )}
      {modal && (
        <div className="overlay modal-overlay" onMouseDown={() => setModal("")}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>{modal}</h2>
              <button onClick={() => setModal("")} aria-label="Закрыть">
                <Icon name="close" />
              </button>
            </div>
            {modal === "Новый дашборд" || modal === "Новая задача" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = new FormData(e.currentTarget).get(
                    "name",
                  ) as string;
                  if (modal === "Новый дашборд") {
                    setPage(value);
                    setWidgets([]);
                  } else {
                    setNote(note + "\n☐ " + value);
                    if (!widgets.some((w) => w.type === "notes")) add("notes");
                    setToast("Задача добавлена в заметки");
                  }
                  setModal("");
                }}
              >
                <p>
                  {modal === "Новый дашборд"
                    ? "Начните с чистого пространства и добавьте нужные виджеты."
                    : "Добавьте задачу в виджет заметок."}
                </p>
                <input name="name" placeholder="Название" required autoFocus />
                <button className="button primary" type="submit">
                  Создать
                </button>
              </form>
            ) : (
              <>
                <p>
                  {modal === "Уведомления"
                    ? "Вы в курсе всех событий. Новых уведомлений пока нет."
                    : modal === "Профиль"
                      ? "Александр Ким · Личный аккаунт"
                      : modal === "Помощь и поддержка"
                        ? "Нажмите «Настроить», чтобы перемещать виджеты. Перетащите заголовок в нужную ячейку или используйте стрелки клавиатуры. Изменения сохраняются автоматически."
                        : modal === "Вся активность"
                          ? "Сегодня: новый заказ #1048 на 12 500 ₽, новый пользователь Михаил и завершённая email-рассылка."
                          : modal === "Возможности Pro"
                            ? "В этом демо вы уже можете добавлять любое количество виджетов и настраивать своё пространство."
                            : modal === "Настройки"
                              ? "Настройки хранятся в этом браузере. Вы можете восстановить исходное расположение виджетов."
                              : "Studio Workspace · Личное рабочее пространство"}
                </p>
                {modal === "Настройки" && (
                  <button
                    className="button"
                    onClick={() => {
                      setWidgets(initial);
                      setModal("");
                      setToast("Настройки восстановлены");
                    }}
                  >
                    Восстановить дашборд
                  </button>
                )}
                <button
                  className="button primary modal-done"
                  onClick={() => setModal("")}
                >
                  Понятно
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
function Spark({ index }: { index: number }) {
  return (
    <svg className={"spark spark" + index} viewBox="0 0 96 38">
      <path
        d={
          [
            "M0 33 10 27 19 30 29 19 38 23 48 16 58 21 67 12 77 16 86 7 96 3",
            "M0 30 10 27 20 31 30 24 40 26 50 14 60 18 70 11 80 13 90 4 96 7",
            "M0 33 10 28 20 29 30 20 40 25 50 17 60 20 70 9 80 13 90 3 96 5",
            "M0 30 10 28 20 31 30 22 40 24 50 19 60 21 70 12 80 16 90 9 96 10",
          ][index]
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
