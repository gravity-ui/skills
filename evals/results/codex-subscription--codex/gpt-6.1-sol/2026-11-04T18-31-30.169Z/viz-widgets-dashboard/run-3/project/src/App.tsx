import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "check"
  | "calendar"
  | "note"
  | "chart"
  | "plus"
  | "chevron"
  | "search"
  | "bell"
  | "settings"
  | "help"
  | "arrow"
  | "more"
  | "grip"
  | "close"
  | "clock"
  | "target"
  | "folder"
  | "external"
  | "play"
  | "pause"
  | "reset"
  | "sun"
  | "download"
  | "layout"
  | "logout"
  | "sparkles"
  | "flame";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    sparkles: (
      <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
    ),
    flame: (
      <path d="M13 2c1 6-5 7-5 11-2-1-2-3-2-3-5 8 1 12 6 12 6 0 9-6 6-11-1 3-3 3-3 3 2-6-2-12-2-12Z" />
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 4h1m6 0h1m-8 3h1" />
      </>
    ),
    note: (
      <>
        <path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" />
        <path d="m10 14 1-4L19 2l3 3-8 8-4 1Z" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-11 12h4" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3H9Z" />
        <circle cx="12" cy="11" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 3m0 3h.01" />
      </>
    ),
    arrow: (
      <>
        <path d="m7 17 10-10M7 7h10v10" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    grip: (
      <>
        <circle cx="9" cy="5" r=".7" />
        <circle cx="15" cy="5" r=".7" />
        <circle cx="9" cy="12" r=".7" />
        <circle cx="15" cy="12" r=".7" />
        <circle cx="9" cy="19" r=".7" />
        <circle cx="15" cy="19" r=".7" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    folder: (
      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    ),
    external: (
      <>
        <path d="M14 3h7v7m-9 2 9-9m-11 0H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
      </>
    ),
    play: <path d="m9 5 11 7-11 7V5Z" />,
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    layout: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 9v12" />
      </>
    ),
    logout: (
      <>
        <path d="M9 3H4v18h5m6-14 5 5-5 5M8 12h12" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

type WidgetKind =
  | "tasks-stat"
  | "focus-stat"
  | "projects-stat"
  | "streak-stat"
  | "activity"
  | "tasks"
  | "focus"
  | "notes"
  | "calendar";
type Widget = { id: WidgetKind; span: number };
const defaults: Widget[] = [
  { id: "tasks-stat", span: 3 },
  { id: "focus-stat", span: 3 },
  { id: "projects-stat", span: 3 },
  { id: "streak-stat", span: 3 },
  { id: "activity", span: 7 },
  { id: "tasks", span: 5 },
  { id: "focus", span: 4 },
  { id: "notes", span: 4 },
  { id: "calendar", span: 4 },
];
const catalog: Record<
  WidgetKind,
  { title: string; icon: IconName; description: string }
> = {
  "tasks-stat": {
    title: "Tasks completed",
    icon: "check",
    description: "A little progress, every day.",
  },
  "focus-stat": {
    title: "Focus time",
    icon: "clock",
    description: "Make room for your best work.",
  },
  "projects-stat": {
    title: "Active projects",
    icon: "folder",
    description: "Everything you’re moving forward.",
  },
  "streak-stat": {
    title: "Day streak",
    icon: "target",
    description: "Keep your momentum going.",
  },
  activity: {
    title: "Activity overview",
    icon: "chart",
    description: "Your productivity throughout the week.",
  },
  tasks: {
    title: "My tasks",
    icon: "check",
    description: "Keep the important things in sight.",
  },
  focus: {
    title: "Focus timer",
    icon: "clock",
    description: "One task. A little uninterrupted time.",
  },
  notes: {
    title: "Quick notes",
    icon: "note",
    description: "A home for your next great idea.",
  },
  calendar: {
    title: "Calendar",
    icon: "calendar",
    description: "Your schedule, at a glance.",
  },
};
function readStore<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
const initialTasks = [
  { id: 1, text: "Finalize homepage exploration", tag: "Design", done: false },
  { id: 2, text: "Review the new brand guidelines", tag: "Brand", done: false },
  { id: 3, text: "Send proposal to Olivia", tag: "Work", done: false },
  {
    id: 4,
    text: "Gather inspiration for the moodboard",
    tag: "Design",
    done: true,
  },
];

export function App() {
  const [widgets, setWidgets] = useState<Widget[]>(() =>
    readStore("folio-widgets", defaults),
  );
  const [tasks, setTasks] = useState(() =>
    readStore("folio-tasks", initialTasks),
  );
  const [notes, setNotes] = useState(() =>
    readStore(
      "folio-notes",
      "A few things on my mind…\n\nExplore a softer color palette for the new\nwebsite. Less noise, more breathing room.\n\nGood design feels inevitable.",
    ),
  );
  const [customize, setCustomize] = useState(false),
    [addOpen, setAddOpen] = useState(false),
    [menu, setMenu] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("Overview"),
    [workspace, setWorkspace] = useState("Personal dashboard");
  const [search, setSearch] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [noticeOpen, setNoticeOpen] = useState(false);
  const [toast, setToast] = useState(""),
    [taskInput, setTaskInput] = useState(""),
    [addingTask, setAddingTask] = useState(false);
  const [period, setPeriod] = useState("This week");
  const [seconds, setSeconds] = useState(25 * 60),
    [running, setRunning] = useState(false),
    [timerMode, setTimerMode] = useState("Focus");
  const [month, setMonth] = useState(10),
    [year, setYear] = useState(2026),
    [selectedDay, setSelectedDay] = useState(4);
  const [drag, setDrag] = useState<{
      id: WidgetKind;
      x: number;
      y: number;
    } | null>(null),
    [dropTarget, setDropTarget] = useState<WidgetKind | null>(null);
  const dropRef = useRef<WidgetKind | null>(null),
    dragRef = useRef<WidgetKind | null>(null);
  const [helpOpen, setHelpOpen] = useState(false),
    [settingsOpen, setSettingsOpen] = useState(false),
    [compact, setCompact] = useState(() => readStore("folio-compact", false));
  useEffect(() => {
    localStorage.setItem("folio-widgets", JSON.stringify(widgets));
  }, [widgets]);
  useEffect(() => {
    localStorage.setItem("folio-tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("folio-notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem("folio-compact", JSON.stringify(compact));
  }, [compact]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            setToast("Session complete. Take a well-earned break!");
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setAddOpen(false);
        setHelpOpen(false);
        setSettingsOpen(false);
        setSearchOpen(false);
        setNoticeOpen(false);
        setDrag(null);
        dragRef.current = null;
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  function startDrag(e: React.PointerEvent, id: WidgetKind) {
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current = id;
    setDrag({ id, x: e.clientX, y: e.clientY });
    const move = (ev: PointerEvent) => {
      setDrag({ id, x: ev.clientX, y: ev.clientY });
      const target = document
        .elementFromPoint(ev.clientX, ev.clientY)
        ?.closest("[data-widget]")
        ?.getAttribute("data-widget") as WidgetKind | null;
      dropRef.current = target || null;
      setDropTarget(target || null);
    };
    const up = () => {
      const target = dropRef.current;
      if (target && target !== id && dragRef.current) {
        setWidgets((prev) => {
          const next = [...prev];
          const from = next.findIndex((w) => w.id === id),
            to = next.findIndex((w) => w.id === target);
          next.splice(to, 0, ...next.splice(from, 1));
          return next;
        });
      }
      setDrag(null);
      setDropTarget(null);
      dropRef.current = null;
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  function keyboardMove(e: React.KeyboardEvent, id: WidgetKind) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    setWidgets((prev) => {
      const next = [...prev];
      const i = next.findIndex((w) => w.id === id),
        j = Math.max(
          0,
          Math.min(
            next.length - 1,
            i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1),
          ),
        );
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function addTask() {
    if (!taskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: taskInput.trim(), tag: "Work", done: false },
    ]);
    setTaskInput("");
    setAddingTask(false);
  }
  const doneCount = tasks.filter((t) => t.done).length;
  const statInfo: Record<
    string,
    {
      value: string;
      change: string;
      foot: string;
      className: string;
      line: string;
    }
  > = {
    "tasks-stat": {
      value: String(23 + doneCount),
      change: "+12%",
      foot: "vs. last week",
      className: "blue",
      line: "0,30 10,25 18,29 28,15 38,19 48,14 57,20 68,7 79,10 90,2",
    },
    "focus-stat": {
      value: "18.5",
      change: "+8.2%",
      foot: "vs. last week",
      className: "purple",
      line: "0,29 10,32 20,22 30,25 40,13 50,17 60,9 70,14 80,6 90,5",
    },
    "projects-stat": {
      value: "06",
      change: "2 new",
      foot: "this month",
      className: "orange",
      line: "0,31 15,31 15,23 35,23 35,16 55,16 55,9 75,9 75,2 90,2",
    },
    "streak-stat": {
      value: "12",
      change: "Personal best",
      foot: "Keep it going!",
      className: "green",
      line: "0,33 12,27 23,30 34,20 44,22 56,13 66,15 78,5 90,1",
    },
  };
  const visibleWidgets = widgets
    .filter((w) => {
      if (activeNav === "My tasks")
        return w.id === "tasks" || w.id === "tasks-stat" || w.id === "activity";
      if (activeNav === "Calendar")
        return w.id === "calendar" || w.id === "focus" || w.id === "activity";
      if (activeNav === "Notes") return w.id === "notes";
      return true;
    })
    .filter(
      (w) =>
        !search ||
        catalog[w.id].title.toLowerCase().includes(search.toLowerCase()),
    );
  const monthName = new Date(year, month).toLocaleString("en", {
    month: "long",
  });
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelectedDay(1);
  }
  function widgetContent(w: Widget) {
    if (w.id.endsWith("-stat")) {
      const s = statInfo[w.id];
      return (
        <div className="stat-content">
          <div className="stat-top">
            <span className={`stat-icon ${s.className}`}>
              <Icon name={catalog[w.id].icon} size={17} />
            </span>
            <span>{catalog[w.id].title}</span>
          </div>
          <div className="stat-mid">
            <div className="stat-value">
              {s.value}
              {w.id === "focus-stat" && <small>hrs</small>}
              {w.id === "streak-stat" && (
                <small>
                  days <Icon name="flame" size={13} className="flame" />
                </small>
              )}
            </div>
            <svg className={`sparkline ${s.className}`} viewBox="0 0 92 38">
              <polyline
                points={s.line}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="stat-foot">
            <span
              className={
                w.id === "projects-stat" ? "neutral-change" : "positive"
              }
            >
              {w.id !== "streak-stat" && w.id !== "projects-stat" && (
                <Icon name="arrow" size={11} />
              )}{" "}
              {s.change}
            </span>
            <span>{s.foot}</span>
          </div>
        </div>
      );
    }
    if (w.id === "activity")
      return (
        <>
          <div className="activity-sub">
            <span>A little progress adds up.</span>
            <div className="chart-legend">
              <i /> Focus hours <i className="light" /> Tasks completed
            </div>
          </div>
          <div className="activity-chart">
            <div className="y-labels">
              <span>8h</span>
              <span>6h</span>
              <span>4h</span>
              <span>2h</span>
              <span>0h</span>
            </div>
            <div className="plot">
              <svg
                viewBox="0 0 620 155"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${period} activity: focus hours grow from 3 to 6.5 hours`}
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5478ed" stopOpacity=".16" />
                    <stop offset="100%" stopColor="#5478ed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 38, 76, 114, 152].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y + 1}
                    x2="620"
                    y2={y + 1}
                    stroke="#e9ecf2"
                    strokeDasharray="3 4"
                  />
                ))}
                <path
                  d={
                    period === "This week"
                      ? "M0 112 C38 112 55 65 101 68 S158 106 204 91 S265 26 310 40 S367 79 412 63 S472 7 516 24 S576 50 620 17 L620 155 L0 155Z"
                      : "M0 125 C55 120 58 91 102 99 S165 55 204 70 S270 69 310 54 S380 20 412 37 S470 42 516 18 S580 24 620 7 L620 155 L0 155Z"
                  }
                  fill="url(#chartFill)"
                />
                <path
                  d="M0 137 C46 140 62 111 101 118 S161 133 204 115 S267 82 310 98 S371 114 412 94 S477 67 516 80 S577 96 620 69"
                  fill="none"
                  stroke="#bdcdf9"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />
                <path
                  d={
                    period === "This week"
                      ? "M0 112 C38 112 55 65 101 68 S158 106 204 91 S265 26 310 40 S367 79 412 63 S472 7 516 24 S576 50 620 17"
                      : "M0 125 C55 120 58 91 102 99 S165 55 204 70 S270 69 310 54 S380 20 412 37 S470 42 516 18 S580 24 620 7"
                  }
                  fill="none"
                  stroke="#4d73e8"
                  strokeWidth="3"
                />
              </svg>
              <div className="x-labels">
                {(period === "This month"
                  ? ["1–4", "5–8", "9–12", "13–16", "17–20", "21–24", "25–30"]
                  : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                ).map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-bottom">
            <span className="tiny-trend">
              <Icon name="chart" size={14} />
            </span>
            <strong>Looking good!</strong>
            <span>You’re 12% more productive this week.</span>
          </div>
        </>
      );
    if (w.id === "tasks")
      return (
        <>
          <div className="task-progress-label">
            <span>
              {doneCount} of {tasks.length} completed
            </span>
            <span>{Math.round((doneCount / tasks.length) * 100) || 0}%</span>
          </div>
          <div className="task-progress">
            <i style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
          </div>
          <div className="task-list">
            {tasks.map((t) => (
              <div
                className={`task-row ${t.done ? "completed" : ""}`}
                key={t.id}
              >
                <button
                  className="checkbox"
                  aria-label={`${t.done ? "Mark incomplete" : "Complete"}: ${t.text}`}
                  onClick={() =>
                    setTasks((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, done: !x.done } : x,
                      ),
                    )
                  }
                >
                  {t.done && <Icon name="check" size={12} />}
                </button>
                <span>{t.text}</span>
                <span className={`task-tag ${t.tag.toLowerCase()}`}>
                  {t.tag}
                </span>
              </div>
            ))}
          </div>
          {addingTask ? (
            <form
              className="new-task"
              onSubmit={(e) => {
                e.preventDefault();
                addTask();
              }}
            >
              <input
                autoFocus
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="What needs to get done?"
                aria-label="New task"
              />
              <button
                className="icon-button"
                type="submit"
                aria-label="Save task"
              >
                <Icon name="check" size={16} />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => setAddingTask(false)}
                aria-label="Cancel"
              >
                <Icon name="close" size={14} />
              </button>
            </form>
          ) : (
            <button className="add-task" onClick={() => setAddingTask(true)}>
              <Icon name="plus" size={15} /> Add a task
            </button>
          )}
        </>
      );
    if (w.id === "focus")
      return (
        <div className="focus-content">
          <div className="timer-tabs">
            {["Focus", "Short break"].map((m) => (
              <button
                className={timerMode === m ? "selected" : ""}
                key={m}
                onClick={() => {
                  setTimerMode(m);
                  setRunning(false);
                  setSeconds(m === "Focus" ? 1500 : 300);
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="timer-display">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}
            <span>:</span>
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <p>
            {running
              ? "You’ve got this. One thing at a time."
              : timerMode === "Focus"
                ? "Time to make room for deep work."
                : "Step away. Come back refreshed."}
          </p>
          <div className="timer-controls">
            <button
              className="primary timer-start"
              onClick={() => setRunning(!running)}
            >
              <Icon name={running ? "pause" : "play"} size={14} />
              {running
                ? "Pause session"
                : seconds < 1500 && timerMode === "Focus"
                  ? "Resume focus"
                  : "Start " + (timerMode === "Focus" ? "focus" : "break")}
            </button>
            <button
              className="timer-reset"
              aria-label="Reset timer"
              onClick={() => {
                setRunning(false);
                setSeconds(timerMode === "Focus" ? 1500 : 300);
              }}
            >
              <Icon name="reset" size={17} />
            </button>
          </div>
        </div>
      );
    if (w.id === "notes")
      return (
        <>
          <textarea
            className="notes-text"
            aria-label="Quick notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="A little space for your thoughts…"
          />
          <div className="notes-footer">
            <span>
              <i /> All changes saved
            </span>
            <span>
              {notes.trim() ? notes.trim().split(/\s+/).length : 0} words
            </span>
          </div>
        </>
      );
    if (w.id === "calendar")
      return (
        <>
          <div className="calendar-month">
            <strong>
              {monthName} {year}
            </strong>
            <div>
              <button
                className="icon-button previous"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
              >
                <Icon name="chevron" size={14} />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                <Icon name="chevron" size={14} />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span className="weekday" key={`w${i}`}>
                {d}
              </span>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <span className="muted-day" key={`b${i}`}>
                {new Date(year, month, 0).getDate() - firstDay + i + 1}
              </span>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => (
              <button
                key={i}
                className={`${selectedDay === i + 1 ? "chosen" : ""} ${[4, 12, 18, 25].includes(i + 1) ? "has-event" : ""}`}
                onClick={() => setSelectedDay(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="calendar-event">
            <i />
            <span>
              {selectedDay === 4
                ? "Design catch-up"
                : selectedDay === 12
                  ? "Project review"
                  : selectedDay === 18
                    ? "Team check-in"
                    : selectedDay === 25
                      ? "Monthly planning"
                      : "A little room to breathe"}
            </span>
            <small>
              {[4, 12, 18, 25].includes(selectedDay)
                ? "14:00 – 14:30"
                : "No events"}
            </small>
          </div>
        </>
      );
  }
  return (
    <div className={`app ${compact ? "compact" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav("Overview");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          folio<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => {
            setWorkspace(
              workspace === "Personal dashboard"
                ? "Work dashboard"
                : "Personal dashboard",
            );
            setToast(
              workspace === "Personal dashboard"
                ? "Switched to your work dashboard"
                : "Switched to your personal dashboard",
            );
          }}
        >
          <span className="workspace-icon">
            S
            <span>
              <Icon name="sparkles" size={10} />
            </span>
          </span>
          <span>
            <strong>Studio workspace</strong>
            <small>Personal workspace</small>
          </span>
          <span className="switch-arrows">
            <Icon name="chevron" size={10} />
            <Icon name="chevron" size={10} />
          </span>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {(
            [
              { title: "Overview", icon: "grid" },
              { title: "My tasks", icon: "check" },
              { title: "Calendar", icon: "calendar" },
              { title: "Notes", icon: "note" },
            ] as { title: string; icon: IconName }[]
          ).map((n) => (
            <button
              className={`nav-item ${activeNav === n.title ? "active" : ""}`}
              key={n.title}
              onClick={() => {
                setActiveNav(n.title);
                setSearch("");
              }}
            >
              <Icon name={n.icon} size={19} />
              <span>{n.title}</span>
              {n.title === "My tasks" && (
                <span className="nav-count">
                  {tasks.filter((t) => !t.done).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-label dashboard-label">
          MY DASHBOARDS
          <button
            aria-label="New dashboard"
            onClick={() => {
              setAddOpen(true);
            }}
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
        <button
          className={`dashboard-link ${workspace === "Personal dashboard" ? "current" : ""}`}
          onClick={() => {
            setWorkspace("Personal dashboard");
            setActiveNav("Overview");
          }}
        >
          <i className="blue-dot" /> Personal dashboard
        </button>
        <button
          className={`dashboard-link ${workspace === "Work dashboard" ? "current" : ""}`}
          onClick={() => {
            setWorkspace("Work dashboard");
            setActiveNav("Overview");
          }}
        >
          <i className="purple-dot" /> Work dashboard
        </button>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Icon name="sparkles" size={24} />
            </div>
            <strong>A little more possibility</strong>
            <p>
              More space for your big ideas.
              <br />
              Make it yours with Folio Pro.
            </p>
            <button
              onClick={() => {
                setHelpOpen(true);
              }}
            >
              Explore Pro <Icon name="arrow" size={14} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setSettingsOpen(true)}>
            <Icon name="settings" size={18} /> Settings
          </button>
          <button className="nav-item" onClick={() => setHelpOpen(true)}>
            <Icon name="help" size={18} /> Help & support{" "}
            <Icon name="external" size={13} />
          </button>
          <button className="profile" onClick={() => setSettingsOpen(true)}>
            <span className="avatar">JD</span>
            <span>
              <strong>Jamie Davis</strong>
              <small>Personal account</small>
            </span>
            <Icon name="more" size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="layout" size={17} />
            <span className="breadcrumb-divider">/</span>
            <span>My dashboards</span>
            <Icon name="chevron" size={12} />
            <strong>{workspace}</strong>
          </div>
          <div className="header-right">
            <span className="live-dot" /> All changes saved{" "}
            <span className="header-divider" />
            <button
              className="icon-button"
              aria-label="Search widgets"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Icon name="search" size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => setNoticeOpen(!noticeOpen)}
            >
              <Icon name="bell" size={19} />
              <i />
            </button>
            <span className="avatar small">JD</span>
          </div>
          {noticeOpen && (
            <div className="notifications popover">
              <strong>
                You’re all caught up{" "}
                <span>
                  <Icon name="sparkles" size={14} />
                </span>
              </strong>
              <p>Your workspace is saved and ready for your next great idea.</p>
              <button onClick={() => setNoticeOpen(false)}>
                Got it <Icon name="check" size={14} />
              </button>
            </div>
          )}
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="date-label">
                <Icon name="sun" size={16} /> WEDNESDAY, NOVEMBER 4, 2026
              </div>
              <h1>
                {activeNav === "Overview"
                  ? "A fresh space for a focused day."
                  : activeNav === "My tasks"
                    ? "Small steps. Meaningful progress."
                    : activeNav === "Calendar"
                      ? "Make time for what matters."
                      : "A little space for your thoughts."}
                <span className="greeting-dot">
                  <Icon name="sparkles" size={23} />
                </span>
              </h1>
              <p>Your thoughts, plans, and progress. All in one place.</p>
            </div>
            <div className="heading-actions">
              <button
                className={`secondary ${customize ? "editing" : ""}`}
                onClick={() => {
                  setCustomize(!customize);
                  setMenu(null);
                }}
              >
                <Icon name={customize ? "check" : "layout"} size={16} />
                {customize ? "Done editing" : "Customize"}
              </button>
              <button className="primary" onClick={() => setAddOpen(true)}>
                <Icon name="plus" size={17} /> Add widget
              </button>
            </div>
          </div>
          <div className="dashboard-toolbar">
            <div className="dashboard-tabs">
              <button
                className="dashboard-tab"
                onClick={() => {
                  setActiveNav("Overview");
                  setSearch("");
                }}
              >
                <span className="mini-grid">
                  <Icon name="grid" size={14} />
                </span>
                {activeNav === "Overview" ? "Overview" : activeNav}
                <span className="widget-count">{visibleWidgets.length}</span>
              </button>
            </div>
            <span className="arrange-hint">
              <Icon name="grip" size={14} />
              {customize
                ? "Drag widgets to rearrange · Use ⋯ to resize or remove"
                : "Your space. Your way."}
            </span>
          </div>
          {searchOpen && (
            <div className="search-bar">
              <Icon name="search" size={18} />
              <input
                autoFocus
                placeholder="Find a widget…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Find a widget"
              />
              <button
                className="icon-button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearch("");
                }}
                aria-label="Close search"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          <div
            className={`widget-grid ${customize ? "customizing" : ""} ${drag ? "is-dragging" : ""}`}
          >
            {visibleWidgets.map((w) => (
              <section
                key={w.id}
                data-widget={w.id}
                className={`widget ${w.id.endsWith("-stat") ? "stat-widget" : `widget-${w.id}`} ${drag?.id === w.id ? "dragging" : ""} ${dropTarget === w.id && drag?.id !== w.id ? "drop-target" : ""}`}
                style={{ "--span": w.span } as CSSProperties}
              >
                {!w.id.endsWith("-stat") && (
                  <div className="widget-header">
                    <div className="widget-title">
                      <Icon name={catalog[w.id].icon} size={17} />
                      <h2>{catalog[w.id].title}</h2>
                      {w.id === "tasks" && (
                        <span className="title-count">{tasks.length}</span>
                      )}
                    </div>
                    <div className="widget-header-actions">
                      {w.id === "activity" && (
                        <select
                          value={period}
                          onChange={(e) => setPeriod(e.target.value)}
                          aria-label="Activity period"
                        >
                          <option>This week</option>
                          <option>Last week</option>
                          <option>This month</option>
                        </select>
                      )}
                      <button
                        className="drag-handle"
                        onPointerDown={(e) => startDrag(e, w.id)}
                        onKeyDown={(e) => keyboardMove(e, w.id)}
                        aria-label={`Move ${catalog[w.id].title}. Use arrow keys to reorder.`}
                        title="Drag to move"
                      >
                        <Icon name="grip" size={16} />
                      </button>
                      <button
                        className="icon-button more-button"
                        aria-label={`Options for ${catalog[w.id].title}`}
                        onClick={() => setMenu(menu === w.id ? null : w.id)}
                      >
                        <Icon name="more" size={17} />
                      </button>
                    </div>
                  </div>
                )}
                {w.id.endsWith("-stat") && (
                  <div className="stat-tools">
                    <button
                      className="drag-handle"
                      onPointerDown={(e) => startDrag(e, w.id)}
                      onKeyDown={(e) => keyboardMove(e, w.id)}
                      aria-label={`Move ${catalog[w.id].title}. Use arrow keys to reorder.`}
                    >
                      <Icon name="grip" size={14} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Options for ${catalog[w.id].title}`}
                      onClick={() => setMenu(menu === w.id ? null : w.id)}
                    >
                      <Icon name="more" size={15} />
                    </button>
                  </div>
                )}
                {menu === w.id && (
                  <>
                    <div
                      className="menu-dismiss"
                      onClick={() => setMenu(null)}
                    />
                    <div className="widget-menu popover">
                      <span className="menu-label">WIDGET WIDTH</span>
                      <div className="size-options">
                        {[
                          { label: "Small", span: 3 },
                          { label: "Medium", span: 4 },
                          { label: "Wide", span: 7 },
                          { label: "Full", span: 12 },
                        ].map((s) => (
                          <button
                            className={w.span === s.span ? "selected" : ""}
                            key={s.span}
                            onClick={() => {
                              setWidgets((prev) =>
                                prev.map((x) =>
                                  x.id === w.id ? { ...x, span: s.span } : x,
                                ),
                              );
                              setMenu(null);
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <button
                        className="remove-widget"
                        onClick={() => {
                          setWidgets((prev) =>
                            prev.filter((x) => x.id !== w.id),
                          );
                          setMenu(null);
                          setToast("Widget removed. Add it back anytime.");
                        }}
                      >
                        <Icon name="close" size={15} /> Remove widget
                      </button>
                    </div>
                  </>
                )}
                {widgetContent(w)}
              </section>
            ))}
            {visibleWidgets.length === 0 && (
              <div className="empty-dashboard">
                <Icon name="grid" size={32} />
                <h2>
                  {search
                    ? "No matching widgets"
                    : "Make a little space for what matters."}
                </h2>
                <p>
                  {search
                    ? "Try another search."
                    : "Add your first widget and make this dashboard yours."}
                </p>
                <button
                  className="primary"
                  onClick={() => (search ? setSearch("") : setAddOpen(true))}
                >
                  {search ? "Clear search" : "Add a widget"}
                </button>
              </div>
            )}
          </div>
          <footer className="dashboard-footer">
            <span>
              <Icon name="grip" size={13} /> Grab a widget handle to make this
              space your own.
            </span>
            <button
              onClick={() => {
                setWidgets(defaults);
                setActiveNav("Overview");
                setSearch("");
                setToast("Your default layout is restored.");
              }}
            >
              <Icon name="reset" size={12} /> Reset layout
            </button>
          </footer>
        </main>
      </div>
      {drag && (
        <div
          className="drag-ghost"
          style={{ left: drag.x + 16, top: drag.y + 16 }}
        >
          <Icon name={catalog[drag.id].icon} size={18} />
          {catalog[drag.id].title}
          <Icon name="grip" size={16} />
        </div>
      )}
      {addOpen && (
        <div className="modal-backdrop" onClick={() => setAddOpen(false)}>
          <div
            className="modal widget-library"
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">MAKE IT YOURS</span>
                <h2 id="library-title">A space for everything.</h2>
                <p>Pick the widgets that work for your day.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Close widget library"
                onClick={() => setAddOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="library-grid">
              {defaults.map((w) => {
                const exists = widgets.some((x) => x.id === w.id);
                return (
                  <button
                    className={`library-item ${exists ? "is-added" : ""}`}
                    key={w.id}
                    disabled={exists}
                    onClick={() => {
                      setWidgets((prev) => [...prev, w]);
                      setActiveNav("Overview");
                      setSearch("");
                      setToast(
                        `${catalog[w.id].title} added to your dashboard`,
                      );
                    }}
                  >
                    <span className="library-icon">
                      <Icon name={catalog[w.id].icon} size={22} />
                    </span>
                    <strong>{catalog[w.id].title}</strong>
                    <p>{catalog[w.id].description}</p>
                    <span className="library-action">
                      <Icon name={exists ? "check" : "plus"} size={14} />
                      {exists ? "On your dashboard" : "Add widget"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="modal-footer">
              <span>Thoughtfully simple. Entirely yours.</span>
              <button className="primary" onClick={() => setAddOpen(false)}>
                Back to dashboard <Icon name="chevron" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      {helpOpen && (
        <div className="modal-backdrop" onClick={() => setHelpOpen(false)}>
          <div
            className="modal info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close help"
              onClick={() => setHelpOpen(false)}
            >
              <Icon name="close" />
            </button>
            <span className="large-brand">
              <Icon name="sparkles" size={39} />
            </span>
            <h2 id="help-title">Find your own flow.</h2>
            <p>
              Folio is your personal space to plan, focus, and move forward.
            </p>
            <div className="help-step">
              <Icon name="grip" />
              <div>
                <strong>Give everything its place</strong>
                <p>
                  Drag a widget by its handle. You can also focus the handle and
                  use arrow keys.
                </p>
              </div>
            </div>
            <div className="help-step">
              <Icon name="layout" />
              <div>
                <strong>Make a little room</strong>
                <p>
                  Open a widget’s ⋯ menu to resize or remove it. Add it back
                  from the widget library.
                </p>
              </div>
            </div>
            <div className="help-step">
              <Icon name="check" />
              <div>
                <strong>Pick up where you left off</strong>
                <p>
                  Your layout, tasks, and notes save automatically in this
                  browser. All included widgets are free to use.
                </p>
              </div>
            </div>
            <button className="primary" onClick={() => setHelpOpen(false)}>
              Make yourself at home <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      )}
      {settingsOpen && (
        <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <div
            className="modal info-modal settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close settings"
              onClick={() => setSettingsOpen(false)}
            >
              <Icon name="close" />
            </button>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2 id="settings-title">The little preferences.</h2>
            <p>Make your space feel a little more like you.</p>
            <div className="settings-row">
              <div>
                <strong>Compact spacing</strong>
                <p>A little less space between your widgets.</p>
              </div>
              <button
                className={`toggle ${compact ? "on" : ""}`}
                role="switch"
                aria-checked={compact}
                aria-label="Compact spacing"
                onClick={() => setCompact(!compact)}
              >
                <span />
              </button>
            </div>
            <div className="settings-row">
              <div>
                <strong>Restore default layout</strong>
                <p>Start fresh with all nine widgets.</p>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  setWidgets(defaults);
                  setActiveNav("Overview");
                  setToast("Default layout restored");
                }}
              >
                Reset
              </button>
            </div>
            <div className="settings-account">
              <span className="avatar">JD</span>
              <span>
                <strong>Jamie Davis</strong>
                <small>Personal workspace · Free plan</small>
              </span>
              <span className="plan-badge">Free</span>
            </div>
            <button className="primary" onClick={() => setSettingsOpen(false)}>
              All done <Icon name="check" size={16} />
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={15} />
          </span>
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
