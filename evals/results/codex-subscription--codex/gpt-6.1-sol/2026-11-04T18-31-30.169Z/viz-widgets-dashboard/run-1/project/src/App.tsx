import React, { useEffect, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "chevron"
  | "plus"
  | "search"
  | "bell"
  | "arrow"
  | "up"
  | "down"
  | "more"
  | "grip"
  | "close"
  | "calendar"
  | "sliders"
  | "chart"
  | "database"
  | "settings"
  | "help"
  | "external"
  | "check"
  | "download"
  | "clock"
  | "users"
  | "wallet"
  | "cursor"
  | "bag"
  | "logout"
  | "sparkles"
  | "copy"
  | "reset"
  | "file";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    up: <path d="m7 15 10-10M7 5h10v10" />,
    down: <path d="m7 9 10 10M7 19h10V9" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    grip: (
      <>
        {[8, 16].map((x) =>
          [5, 12, 19].map((y) => (
            <circle key={x + "-" + y} cx={x} cy={y} r="1" />
          )),
        )}
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h8m4 0h4M4 17h3m4 0h9" />
        <circle cx="14" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 15l4-5 4 3 5-7" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 2.7m0 3h.01" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="15" rx="3" />
        <path d="M3 9V5a2 2 0 0 1 2-2h12v3m4 6h-6v5h6" />
      </>
    ),
    cursor: <path d="m5 3 15 9-7 2-3 7Z" />,
    bag: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m5-13 5 5-5 5m-7-5h12" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 3v7h7" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H4v20h16V8Zm0 0v6h6M8 12h8m-8 4h8" />
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
type Kind =
  | "revenue-stat"
  | "visitors"
  | "conversion"
  | "orders"
  | "revenue"
  | "traffic"
  | "activity"
  | "goals"
  | "note";
type Widget = {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
};
const defaults: Widget[] = [
  { id: "s1", kind: "revenue-stat", x: 0, y: 0, w: 3, h: 3 },
  { id: "s2", kind: "visitors", x: 3, y: 0, w: 3, h: 3 },
  { id: "s3", kind: "conversion", x: 6, y: 0, w: 3, h: 3 },
  { id: "s4", kind: "orders", x: 9, y: 0, w: 3, h: 3 },
  { id: "revenue", kind: "revenue", x: 0, y: 3, w: 8, h: 7 },
  { id: "traffic", kind: "traffic", x: 8, y: 3, w: 4, h: 7 },
  { id: "activity", kind: "activity", x: 0, y: 10, w: 5, h: 5 },
  { id: "goals", kind: "goals", x: 5, y: 10, w: 4, h: 5 },
  { id: "note", kind: "note", x: 9, y: 10, w: 3, h: 5 },
];
const titles: Record<Kind, string> = {
  "revenue-stat": "Total revenue",
  visitors: "Total visitors",
  conversion: "Conversion rate",
  orders: "Total orders",
  revenue: "Revenue overview",
  traffic: "Traffic sources",
  activity: "Recent activity",
  goals: "Monthly goals",
  note: "Quick notes",
};
const overlap = (a: Widget, b: Widget) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function arrange(widgets: Widget[], moved: Widget) {
  const placed = [moved];
  for (const widget of widgets) {
    if (widget.id === moved.id) continue;
    const next = { ...widget };
    while (placed.some((p) => overlap(p, next))) next.y++;
    placed.push(next);
  }
  return widgets.map((w) => placed.find((p) => p.id === w.id)!);
}
function loadWidgets(name = "Overview") {
  try {
    const data = JSON.parse(
      localStorage.getItem("forma-layout-" + name) ||
        (name === "Overview" ? localStorage.getItem("forma-layout") : null) ||
        "null",
    );
    return Array.isArray(data) &&
      data.every(
        (w) =>
          w.id &&
          titles[w.kind as Kind] &&
          Number.isFinite(w.x) &&
          Number.isFinite(w.y) &&
          w.w > 0 &&
          w.h > 0,
      )
      ? data
      : defaults;
  } catch {
    return defaults;
  }
}
const catalog: Kind[] = [
  "revenue-stat",
  "visitors",
  "conversion",
  "orders",
  "revenue",
  "traffic",
  "activity",
  "goals",
  "note",
];
const descriptions: Record<Kind, string> = {
  "revenue-stat": "Your revenue at a glance",
  visitors: "Keep an eye on your audience",
  conversion: "See what turns visits into sales",
  orders: "Track your latest order volume",
  revenue: "Explore revenue trends over time",
  traffic: "Understand where visitors come from",
  activity: "Stay on top of recent events",
  goals: "Make progress on what matters",
  note: "A little space for your big ideas",
};

export function App() {
  const [widgets, setWidgets] = useState<Widget[]>(() => loadWidgets());
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Last 30 days");
  const [dateOpen, setDateOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [dashboard, setDashboard] = useState("Overview");
  const [dashboardNames, setDashboardNames] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("forma-dashboard-names") ||
          '["Overview","Acquisition","Revenue"]',
      );
    } catch {
      return ["Overview", "Acquisition", "Revenue"];
    }
  });
  const [chartTab, setChartTab] = useState("Revenue");
  const [note, setNote] = useState(
    () =>
      localStorage.getItem("forma-note") ||
      "Big things start with small steps. ✨\n\n→ Review the new landing page\n→ Plan next month’s campaign\n→ Celebrate the little wins",
  );
  const [done, setDone] = useState<boolean[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("forma-goals") || "[false,false,false]",
      );
    } catch {
      return [false, false, false];
    }
  });
  const [sourceConnected, setSourceConnected] = useState(true);
  const [compact, setCompact] = useState(false);
  const [drag, setDrag] = useState<{
    id: string;
    mode: "move" | "resize";
    sx: number;
    sy: number;
    original: Widget;
    next: Widget;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(drag);
  const [chartHover, setChartHover] = useState<number | null>(null);
  useEffect(() => {
    localStorage.setItem("forma-layout-" + dashboard, JSON.stringify(widgets));
  }, [widgets, dashboard]);
  useEffect(() => {
    localStorage.setItem(
      "forma-dashboard-names",
      JSON.stringify(dashboardNames),
    );
  }, [dashboardNames]);
  useEffect(() => {
    localStorage.setItem("forma-note", note);
  }, [note]);
  useEffect(() => {
    localStorage.setItem("forma-goals", JSON.stringify(done));
  }, [done]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3200);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
      if (e.key === "Escape") {
        setModal(null);
        setMenu(null);
        setDateOpen(false);
        setNoticeOpen(false);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !gridRef.current) return;
      const step = (gridRef.current.clientWidth + 16) / 12;
      const dx = Math.round((e.clientX - d.sx) / step),
        dy = Math.round((e.clientY - d.sy) / 42);
      let next: Widget;
      if (d.mode === "move")
        next = {
          ...d.original,
          x: Math.max(0, Math.min(12 - d.original.w, d.original.x + dx)),
          y: Math.max(0, Math.min(40, d.original.y + dy)),
        };
      else
        next = {
          ...d.original,
          w: Math.max(3, Math.min(12 - d.original.x, d.original.w + dx)),
          h: Math.max(
            d.original.kind.includes("stat") ||
              ["visitors", "conversion", "orders"].includes(d.original.kind)
              ? 3
              : d.original.kind === "traffic"
                ? 7
                : 5,
            Math.min(16, d.original.h + dy),
          ),
        };
      dragRef.current = { ...d, next };
      setDrag({ ...d, next });
    };
    const up = () => {
      const d = dragRef.current;
      if (d) {
        setWidgets((ws) => arrange(ws, d.next));
        setToast(
          d.mode === "move" ? "Widget position saved" : "Widget size saved",
        );
      }
      dragRef.current = null;
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [!!drag]);
  function startDrag(
    e: React.PointerEvent,
    w: Widget,
    mode: "move" | "resize",
  ) {
    if (window.innerWidth < 780) return;
    e.preventDefault();
    setMenu(null);
    const d = {
      id: w.id,
      mode,
      sx: e.clientX,
      sy: e.clientY,
      original: w,
      next: w,
    };
    dragRef.current = d;
    setDrag(d);
  }
  function openDashboard(name: string) {
    setWidgets(loadWidgets(name));
    setDashboard(name);
    setMenu(null);
  }
  function addWidget(kind: Kind) {
    const base = defaults.find((w) => w.kind === kind)!;
    const bottom = Math.max(0, ...widgets.map((w) => w.y + w.h));
    const w = { ...base, id: `${kind}-${Date.now()}`, x: 0, y: bottom };
    setWidgets([...widgets, w]);
    setToast(`${titles[kind]} added to your dashboard`);
    setModal(null);
    setSearch("");
  }
  function exportData() {
    const csv =
      "Metric,Value,Change\nRevenue,48295.00,12.8%\nVisitors,24582,8.2%\nConversion,3.62%,1.4%\nOrders,1429,6.3%\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma-overview.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Your report has been exported");
  }
  const month =
    period === "Last 7 days"
      ? "Nov 1 – Nov 7, 2024"
      : period === "This month"
        ? "Nov 1 – Nov 30, 2024"
        : "Oct 1 – Oct 30, 2024";
  const totalRows = Math.max(
    15,
    ...widgets.map((w) => w.y + w.h),
    drag ? drag.next.y + drag.next.h : 0,
  );
  function renderWidget(w: Widget) {
    const statKinds = ["revenue-stat", "visitors", "conversion", "orders"];
    if (statKinds.includes(w.kind)) {
      const stats: Record<
        string,
        {
          value: string;
          change: string;
          icon: IconName;
          line: string;
          negative?: boolean;
        }
      > = {
        "revenue-stat": {
          value: period === "Last 7 days" ? "$12,845.00" : "$48,295.00",
          change: "12.8%",
          icon: "wallet",
          line: "0,29 8,26 16,29 24,20 32,23 40,14 48,19 56,10 64,13 72,4 80,8 88,2",
        },
        visitors: {
          value: period === "Last 7 days" ? "6,428" : "24,582",
          change: "8.2%",
          icon: "users",
          line: "0,31 8,25 16,27 24,22 32,24 40,17 48,20 56,10 64,14 72,7 80,10 88,2",
        },
        conversion: {
          value: "3.62%",
          change: "1.4%",
          icon: "cursor",
          line: "0,9 8,15 16,10 24,19 32,14 40,23 48,18 56,26 64,21 72,29 80,26 88,32",
          negative: true,
        },
        orders: {
          value: period === "Last 7 days" ? "386" : "1,429",
          change: "6.3%",
          icon: "bag",
          line: "0,32 8,27 16,30 24,22 32,25 40,17 48,21 56,12 64,16 72,7 80,10 88,2",
        },
      };
      const s = stats[w.kind];
      return (
        <>
          <div className="stat-top">
            <span>
              <Icon name={s.icon} size={15} />
              {titles[w.kind]}
            </span>
            <button
              className="stat-drag"
              title="Drag widget"
              onPointerDown={(e) => startDrag(e, w, "move")}
            >
              <Icon name="grip" size={17} />
            </button>
          </div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-bottom">
            <span className={s.negative ? "change negative" : "change"}>
              <Icon name={s.negative ? "down" : "up"} size={12} />
              {s.change}
            </span>
            <span className="comparison">vs. previous period</span>
            <svg
              className={"sparkline " + (s.negative ? "negative" : "")}
              viewBox="0 0 90 38"
            >
              <polyline
                points={s.line}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </>
      );
    }
    if (w.kind === "revenue")
      return (
        <>
          <div className="chart-toolbar">
            <div className="segmented">
              {["Revenue", "Orders"].map((tab) => (
                <button
                  key={tab}
                  className={chartTab === tab ? "selected" : ""}
                  onClick={() => setChartTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="chart-legends">
              <span>
                <i className="legend-dot" />
                This month
              </span>
              <span>
                <i className="legend-dot gray" />
                Last month
              </span>
            </div>
          </div>
          <div
            className="revenue-chart"
            onPointerLeave={() => setChartHover(null)}
          >
            <div className="y-axis">
              {(chartTab === "Revenue"
                ? ["$20k", "$15k", "$10k", "$5k", "$0"]
                : ["600", "450", "300", "150", "0"]
              ).map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div
              className="chart-plot"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setChartHover(
                  Math.max(
                    0,
                    Math.min(
                      29,
                      Math.round(((e.clientX - r.left) / r.width) * 29),
                    ),
                  ),
                );
              }}
            >
              <svg viewBox="0 0 700 170" preserveAspectRatio="none">
                <defs>
                  <linearGradient
                    id={"fill-" + w.id}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#d6b640" stopOpacity=".18" />
                    <stop offset="100%" stopColor="#d6b640" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[5, 44, 84, 124, 165].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="700"
                    y1={y}
                    y2={y}
                    stroke="#edeeea"
                    strokeDasharray="3 4"
                  />
                ))}
                <path
                  d="M0 140 C18 140 23 128 40 135 S63 118 80 125 S105 138 120 115 S143 104 160 114 S188 112 205 125 S229 115 245 104 S265 123 285 100 S310 102 330 83 S354 105 373 90 S396 105 415 82 S442 69 460 80 S482 60 500 72 S525 66 545 49 S568 68 590 49 S615 58 637 40 S674 39 700 29"
                  stroke="#c7ccc7"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  fill="none"
                />
                <path
                  d="M0 142 C15 145 21 125 39 132 S61 140 80 109 S99 122 118 106 S143 127 163 111 S184 98 203 107 S226 78 245 82 S266 100 286 88 S310 96 329 69 S351 76 371 62 S394 70 413 58 S438 74 458 48 S481 57 500 44 S525 60 544 26 S567 45 587 34 S608 53 628 24 S649 38 667 20 S689 23 700 9 L700 170 L0 170Z"
                  fill={`url(#fill-${w.id})`}
                />
                <path
                  d="M0 142 C15 145 21 125 39 132 S61 140 80 109 S99 122 118 106 S143 127 163 111 S184 98 203 107 S226 78 245 82 S266 100 286 88 S310 96 329 69 S351 76 371 62 S394 70 413 58 S438 74 458 48 S481 57 500 44 S525 60 544 26 S567 45 587 34 S608 53 628 24 S649 38 667 20 S689 23 700 9"
                  fill="none"
                  stroke="#bfa342"
                  strokeWidth="2.5"
                />
              </svg>
              {chartHover !== null && (
                <div
                  className="chart-tooltip"
                  style={{ left: `${Math.min(80, (chartHover / 29) * 100)}%` }}
                >
                  <small>Oct {chartHover + 1}</small>
                  <strong>
                    {chartTab === "Revenue"
                      ? "$" + (4200 + chartHover * 487).toLocaleString()
                      : Math.round(132 + chartHover * 15) + " orders"}
                  </strong>
                </div>
              )}
            </div>
            <div className="x-axis">
              {[
                "Oct 1",
                "Oct 5",
                "Oct 10",
                "Oct 15",
                "Oct 20",
                "Oct 25",
                "Oct 30",
              ].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </div>
        </>
      );
    if (w.kind === "traffic")
      return (
        <div className="traffic-body">
          <div className="donut">
            <div>
              <span>Total visitors</span>
              <strong>{period === "Last 7 days" ? "6,428" : "24,582"}</strong>
            </div>
          </div>
          <div className="traffic-legend">
            {[
              ["Direct", "#dbc472", "42.8%"],
              ["Organic search", "#8faaa0", "28.6%"],
              ["Social media", "#b6c6c0", "18.2%"],
              ["Referral", "#e9ebe5", "10.4%"],
            ].map(([name, color, value]) => (
              <div key={name}>
                <span>
                  <i style={{ background: color }} />
                  {name}
                </span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      );
    if (w.kind === "activity")
      return (
        <>
          <div className="activity-list">
            {[
              {
                initial: "JD",
                name: "James Davis",
                action: "purchased Pro plan",
                time: "2 min ago",
                color: "sage",
                amount: "+$129.00",
              },
              {
                initial: "SW",
                name: "Sarah Wilson",
                action: "purchased Team plan",
                time: "18 min ago",
                color: "peach",
                amount: "+$249.00",
              },
              {
                initial: "MC",
                name: "Michael Chen",
                action: "purchased Pro plan",
                time: "35 min ago",
                color: "lavender",
                amount: "+$129.00",
              },
            ].map((a) => (
              <div className="activity-row" key={a.initial}>
                <div className={"avatar " + a.color}>{a.initial}</div>
                <div className="activity-person">
                  <strong>{a.name}</strong>
                  <span>
                    {a.action} <span className="time-inline">· {a.time}</span>
                  </span>
                </div>
                <div className="activity-amount">
                  {a.amount}
                  <span>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="card-link" onClick={() => setModal("activity")}>
            View all activity
            <Icon name="arrow" size={15} />
          </button>
        </>
      );
    if (w.kind === "goals")
      return (
        <div className="goals-body">
          {[
            {
              title: "Revenue target",
              value: "$48,295",
              total: "$60,000",
              pct: 80,
              color: "#d4bb63",
            },
            {
              title: "New customers",
              value: "842",
              total: "1,000",
              pct: 84,
              color: "#91aaa0",
            },
            {
              title: "Monthly orders",
              value: "1,429",
              total: "2,000",
              pct: 71,
              color: "#b1bfb8",
            },
          ].map((goal, i) => (
            <button
              className={"goal " + (done[i] ? "goal-done" : "")}
              key={goal.title}
              onClick={() =>
                setDone((d) => d.map((v, j) => (i === j ? !v : v)))
              }
              title="Click to mark goal as complete"
            >
              <div>
                <span>
                  {done[i] && <Icon name="check" size={12} />} {goal.title}
                </span>
                <span>
                  <strong>{done[i] ? "Complete" : goal.value}</strong>
                  <em> / {goal.total}</em>
                </span>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: (done[i] ? 100 : goal.pct) + "%",
                    background: goal.color,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      );
    return (
      <>
        <textarea
          className="note-input"
          aria-label="Your quick notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write something worth remembering…"
        />
        <div className="note-footer">
          <span>
            <span className="small-dot" />
            Saved automatically
          </span>
          <span>{note.length} characters</span>
        </div>
      </>
    );
  }
  return (
    <div className={"app " + (compact ? "compact" : "")}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openDashboard("Overview");
          }}
        >
          <div className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </div>
          forma<span className="brand-period">.</span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => setModal("workspace")}
        >
          <span className="workspace-icon">
            S<span>✦</span>
          </span>
          <span>
            <strong>Studio workspace</strong>
            <small>
              Pro plan <span>✦</span>
            </small>
          </span>
          <span className="double-chevron">
            ⌃<br />⌄
          </span>
        </button>
        <button
          className="sidebar-search"
          onClick={() => {
            setModal("search");
            setSearch("");
          }}
        >
          <Icon name="search" size={17} />
          <span>Search anything</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          <button
            className="nav-item active"
            onClick={() => openDashboard("Overview")}
          >
            <Icon name="grid" />
            <span>Dashboards</span>
            <span className="nav-count">{dashboardNames.length}</span>
            <Icon name="chevron" size={13} />
          </button>
          <div className="sub-nav">
            {dashboardNames.map((name) => (
              <button
                className={dashboard === name ? "selected" : ""}
                key={name}
                onClick={() => {
                  openDashboard(name);
                  setToast(`${name} dashboard opened`);
                }}
              >
                <span className="sub-dot" />
                {name}
                {name === "Overview" && <span className="personal-dot" />}
              </button>
            ))}
            <button
              className="new-dashboard"
              onClick={() => {
                setModal("new-dashboard");
                setSearch("");
              }}
            >
              <Icon name="plus" size={13} />
              New dashboard
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal("reports")}>
            <Icon name="chart" />
            <span>Reports</span>
          </button>
          <button className="nav-item" onClick={() => setModal("sources")}>
            <Icon name="database" />
            <span>Data sources</span>
            <span className="nav-count">4</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Icon name="sparkles" size={18} />
            </div>
            <strong>A little more possibility.</strong>
            <p>
              More insights. More room to grow.
              <br />
              Make it happen with Pro.
            </p>
            <button onClick={() => setModal("plans")}>
              Explore plans
              <Icon name="arrow" size={15} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon name="settings" />
            <span>Settings</span>
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <Icon name="help" />
            <span>Help & getting started</span>
            <Icon name="external" size={14} />
          </button>
          <button className="profile" onClick={() => setModal("profile")}>
            <span className="profile-photo">AL</span>
            <span>
              <strong>Alex Lawson</strong>
              <small>alex@studio.design</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <Icon name="chevron" size={13} />
            <span>Dashboards</span>
            <Icon name="chevron" size={13} />
            <strong>{dashboard}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-badge">
              <i />
              All systems operational
            </span>
            <span className="topbar-divider" />
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                title="Notifications"
                onClick={() => setNoticeOpen(!noticeOpen)}
              >
                <Icon name="bell" size={19} />
                <i />
              </button>
              {noticeOpen && (
                <div className="popover notification-popover">
                  <strong>You’re all caught up</strong>
                  <p>
                    Your data synced successfully.
                    <br />
                    All 4 sources are up to date.
                  </p>
                  <small>Last sync just now</small>
                </div>
              )}
            </div>
            <button
              className="topbar-avatar"
              onClick={() => setModal("profile")}
              title="Your profile"
            >
              AL
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="heading-title">
                <h1>{dashboard}</h1>
                <span className="dashboard-label">My dashboard</span>
              </div>
              <p>
                A little clarity for your every day. Here’s how things are
                looking.
              </p>
            </div>
            <button
              className={"button customize " + (editing ? "is-editing" : "")}
              onClick={() => {
                setEditing(!editing);
                if (editing) setToast("Your dashboard layout has been saved");
              }}
            >
              <Icon name={editing ? "check" : "sliders"} size={16} />
              {editing ? "Done editing" : "Customize"}
            </button>
          </div>
          <div className="dashboard-toolbar">
            <div className="toolbar-left">
              <span className="overview-indicator" />
              <strong>
                {editing ? "Make this space yours" : "Business at a glance"}
              </strong>
              <span className="toolbar-separator" />
              <span className="saved-status">
                <Icon name={editing ? "grip" : "check"} size={13} />
                {editing
                  ? "Drag to move. Pull a corner to resize."
                  : "All changes saved"}
              </span>
            </div>
            <div className="toolbar-actions">
              <div className="date-wrap">
                <button
                  className="button date-button"
                  onClick={() => setDateOpen(!dateOpen)}
                >
                  <Icon name="calendar" size={16} />
                  {period}
                  <Icon name="chevron" className="rotate" size={12} />
                </button>
                {dateOpen && (
                  <div className="popover date-menu">
                    {["Last 7 days", "Last 30 days", "This month"].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          setDateOpen(false);
                        }}
                      >
                        {p}
                        {period === p && <Icon name="check" size={15} />}
                      </button>
                    ))}
                    <small>{month}</small>
                  </div>
                )}
              </div>
              <button
                className="button primary"
                onClick={() => {
                  setModal("widgets");
                  setSearch("");
                }}
              >
                <Icon name="plus" size={17} />
                Add widget
              </button>
            </div>
          </div>
          <div
            className={
              "dashboard-grid " +
              (editing ? "editing" : "") +
              (drag ? " is-dragging" : "")
            }
            ref={gridRef}
            style={{ gridTemplateRows: `repeat(${totalRows}, 26px)` }}
          >
            {widgets.length === 0 && (
              <div className="dashboard-empty">
                <Icon name="grid" size={30} />
                <h2>A little space for possibility.</h2>
                <p>Add your first widget and make this dashboard yours.</p>
                <button
                  className="button primary"
                  onClick={() => setModal("widgets")}
                >
                  <Icon name="plus" size={16} />
                  Add widget
                </button>
              </div>
            )}
            {drag && (
              <div
                className="drop-placeholder"
                style={{
                  gridColumn: `${drag.next.x + 1} / span ${drag.next.w}`,
                  gridRow: `${drag.next.y + 1} / span ${drag.next.h}`,
                }}
              >
                <Icon name="grid" size={24} />
              </div>
            )}
            {widgets.map((w) => (
              <section
                key={w.id}
                className={
                  "widget widget-" +
                  w.kind +
                  (drag?.id === w.id ? " dragging" : "")
                }
                style={{
                  gridColumn: `${w.x + 1} / span ${w.w}`,
                  gridRow: `${w.y + 1} / span ${w.h}`,
                  ...(drag?.id === w.id
                    ? {
                        transform: `translate(${((drag.next.x - w.x) * ((gridRef.current?.clientWidth || 1000) + 16)) / 12}px,${(drag.next.y - w.y) * 42}px)`,
                        width:
                          drag.mode === "resize"
                            ? (drag.next.w *
                                ((gridRef.current?.clientWidth || 1000) + 16)) /
                                12 -
                              16
                            : undefined,
                        height:
                          drag.mode === "resize"
                            ? drag.next.h * 42 - 16
                            : undefined,
                      }
                    : {}),
                }}
              >
                {["revenue-stat", "visitors", "conversion", "orders"].includes(
                  w.kind,
                ) ? null : (
                  <div
                    className="widget-header"
                    onPointerDown={(e) => {
                      if (!(e.target as HTMLElement).closest("button"))
                        startDrag(e, w, "move");
                    }}
                  >
                    <h2>
                      {titles[w.kind]}
                      {w.kind === "activity" && (
                        <span className="activity-live" />
                      )}
                    </h2>
                    <div className="widget-header-actions">
                      <button
                        className="drag-handle"
                        title="Drag widget"
                        onPointerDown={(e) => startDrag(e, w, "move")}
                      >
                        <Icon name="grip" size={15} />
                      </button>
                      <button
                        className="widget-menu-button"
                        title={`Options for ${titles[w.kind]}`}
                        onClick={() => setMenu(menu === w.id ? null : w.id)}
                      >
                        <Icon name="more" size={18} />
                      </button>
                    </div>
                    {menu === w.id && (
                      <div className="popover widget-menu">
                        <button
                          onClick={() => {
                            const newW = {
                              ...w,
                              id: `${w.kind}-${Date.now()}`,
                              y: Math.max(...widgets.map((a) => a.y + a.h)),
                              x: 0,
                            };
                            setWidgets([...widgets, newW]);
                            setMenu(null);
                            setToast("Widget duplicated");
                          }}
                        >
                          <Icon name="copy" size={14} />
                          Duplicate widget
                        </button>
                        <button
                          className="danger"
                          onClick={() => {
                            setWidgets(widgets.filter((a) => a.id !== w.id));
                            setMenu(null);
                            setToast("Widget removed");
                          }}
                        >
                          <Icon name="close" size={14} />
                          Remove widget
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {renderWidget(w)}
                {editing && (
                  <button
                    className="remove-widget"
                    title="Remove widget"
                    onClick={() =>
                      setWidgets(widgets.filter((a) => a.id !== w.id))
                    }
                  >
                    <Icon name="close" size={12} />
                  </button>
                )}
                <button
                  className="resize-handle"
                  title="Resize widget"
                  onPointerDown={(e) => startDrag(e, w, "resize")}
                >
                  <svg viewBox="0 0 12 12">
                    <path
                      d="m3 10 7-7m-3 7 3-3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>
              </section>
            ))}
          </div>
          <div className="dashboard-footer">
            <span>
              <Icon name="clock" size={13} />
              Last updated just now <span>·</span> Updates every 5 minutes
            </span>
            <button
              onClick={() => {
                setWidgets(defaults);
                setToast("Default layout restored");
              }}
            >
              <Icon name="reset" size={13} />
              Reset layout
            </button>
            <span>
              Made for your way of working.
              <span className="footer-star">✳</span>
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={15} />
          </span>
          {toast}
          <button onClick={() => setToast("")} title="Dismiss">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
              setSearch("");
            }
          }}
        >
          <div
            className={
              "modal " +
              (["widgets", "search"].includes(modal) ? "widget-library" : "")
            }
            role="dialog"
            aria-modal="true"
            aria-label={modal === "widgets" ? "Widget library" : modal}
          >
            <button
              className="modal-close icon-button"
              onClick={() => {
                setModal(null);
                setSearch("");
              }}
              title="Close dialog"
            >
              <Icon name="close" />
            </button>
            {["widgets", "search"].includes(modal) ? (
              <>
                <div className="modal-eyebrow">
                  <Icon name="grid" size={15} /> MAKE IT YOURS
                </div>
                <h2>
                  {modal === "search"
                    ? "Find your next insight."
                    : "A home for every insight."}
                </h2>
                <p>
                  Add a widget, find your focus, and make your dashboard work
                  for you.
                </p>
                <label className="library-search">
                  <Icon name="search" size={18} />
                  <input
                    autoFocus
                    placeholder="Search widgets…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <kbd>⌘ K</kbd>
                </label>
                <div className="library-grid">
                  {catalog
                    .filter((k) =>
                      (titles[k] + " " + descriptions[k])
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((k) => (
                      <button
                        className="library-card"
                        key={k}
                        onClick={() => addWidget(k)}
                      >
                        <div className={"library-preview preview-" + k}>
                          {k === "traffic" ? (
                            <div className="mini-donut" />
                          ) : k === "revenue" ? (
                            <svg viewBox="0 0 140 55">
                              <path
                                d="m0 48 15-8 13 4 17-20 18 7 17-13 15 4 14-17 13 5 18-10"
                                fill="none"
                                stroke="#b6a053"
                                strokeWidth="3"
                              />
                            </svg>
                          ) : k === "note" ? (
                            <div className="mini-note">
                              <span />
                              <span />
                              <span />
                            </div>
                          ) : k === "goals" ? (
                            <div className="mini-bars">
                              <i />
                              <i />
                              <i />
                            </div>
                          ) : k === "activity" ? (
                            <div className="mini-avatars">
                              <i>JD</i>
                              <i>SW</i>
                              <i>MC</i>
                            </div>
                          ) : (
                            <>
                              <span className="preview-stat">
                                {k === "revenue-stat"
                                  ? "$48,295"
                                  : k === "visitors"
                                    ? "24,582"
                                    : k === "orders"
                                      ? "1,429"
                                      : "3.62%"}
                              </span>
                              <span className="preview-change">↗ 12.8%</span>
                            </>
                          )}
                        </div>
                        <div className="library-card-bottom">
                          <strong>{titles[k]}</strong>
                          <span>{descriptions[k]}</span>
                          <span className="library-plus">
                            <Icon name="plus" size={16} />
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
                {!catalog.some((k) =>
                  (titles[k] + " " + descriptions[k])
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                ) && (
                  <div className="empty-state">
                    No widgets found. Try “revenue” or “notes”.
                  </div>
                )}
              </>
            ) : modal === "activity" ? (
              <>
                <div className="modal-eyebrow">YOUR BUSINESS, IN MOTION</div>
                <h2>Recent activity</h2>
                <p>The latest from your workspace.</p>
                <div className="full-activity">
                  {[
                    "James Davis purchased Pro plan",
                    "Sarah Wilson purchased Team plan",
                    "Michael Chen purchased Pro plan",
                    "Emma Taylor joined your workspace",
                    "Your October report is ready",
                    "Data sources synced successfully",
                  ].map((a, i) => (
                    <div key={a}>
                      <span className="event-icon">
                        <Icon
                          name={
                            i < 3
                              ? "bag"
                              : i === 3
                                ? "users"
                                : i === 4
                                  ? "file"
                                  : "check"
                          }
                          size={18}
                        />
                      </span>
                      <strong>{a}</strong>
                      <small>{[2, 18, 35, 48, 60, 65][i]} min ago</small>
                    </div>
                  ))}
                </div>
              </>
            ) : modal === "sources" ? (
              <>
                <div className="modal-eyebrow">CONNECTED AND UP TO DATE</div>
                <h2>Your data, together.</h2>
                <p>Manage the sources powering your dashboard.</p>
                <div className="source-list">
                  {[
                    ["G", "Google Analytics", "Website traffic & audience"],
                    ["S", "Stripe", "Payments & subscriptions"],
                    ["S", "Shopify", "Orders & customers"],
                    ["M", "Mailchimp", "Email & campaigns"],
                  ].map(([initial, name, desc], i) => (
                    <div key={name}>
                      <span className={"source-logo source-" + i}>
                        {initial}
                      </span>
                      <span>
                        <strong>{name}</strong>
                        <small>{desc}</small>
                      </span>
                      <button
                        className={
                          "connection " +
                          (i === 3 && !sourceConnected ? "disconnected" : "")
                        }
                        onClick={() => {
                          if (i === 3) setSourceConnected(!sourceConnected);
                          else setToast(`${name} synced successfully`);
                        }}
                      >
                        {i === 3 && !sourceConnected ? "Connect" : "Connected"}
                        <Icon
                          name={i === 3 && !sourceConnected ? "plus" : "check"}
                          size={13}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : modal === "reports" ? (
              <>
                <div className="modal-eyebrow">THE BIGGER PICTURE</div>
                <h2>Your monthly snapshot.</h2>
                <p>
                  Take your key metrics with you. Export a report to share with
                  your team.
                </p>
                <div className="report-preview">
                  <Icon name="file" size={30} />
                  <div>
                    <strong>{dashboard} report</strong>
                    <span>{month} · 4 key metrics · CSV</span>
                  </div>
                </div>
                <button
                  className="button primary modal-primary"
                  onClick={exportData}
                >
                  <Icon name="download" size={17} />
                  Export report
                </button>
              </>
            ) : modal === "settings" ? (
              <>
                <div className="modal-eyebrow">YOUR WORKSPACE</div>
                <h2>A few personal touches.</h2>
                <p>Set up your space just the way you like it.</p>
                <div className="settings-row">
                  <div>
                    <strong>Compact spacing</strong>
                    <p>Make a little more room for your insights.</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={compact}
                    className={"toggle " + (compact ? "on" : "")}
                    onClick={() => setCompact(!compact)}
                  >
                    <i />
                  </button>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Dashboard layout</strong>
                    <p>Return all widgets to their original positions.</p>
                  </div>
                  <button
                    className="button"
                    onClick={() => {
                      setWidgets(defaults);
                      setToast("Default layout restored");
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Export your data</strong>
                    <p>Download your current overview as CSV.</p>
                  </div>
                  <button className="button" onClick={exportData}>
                    <Icon name="download" size={16} />
                    Export
                  </button>
                </div>
              </>
            ) : modal === "new-dashboard" ? (
              <>
                <div className="modal-eyebrow">A FRESH PERSPECTIVE</div>
                <h2>Create a dashboard.</h2>
                <p>Give your next big idea a little space.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (search.trim()) {
                      const name = search.trim();
                      setDashboardNames((names) =>
                        names.includes(name) ? names : [...names, name],
                      );
                      openDashboard(name);
                      setModal(null);
                      setSearch("");
                      setToast("Your dashboard is ready");
                    }
                  }}
                >
                  <label className="form-label">
                    Dashboard name
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="e.g. Growth overview"
                      required
                      maxLength={40}
                    />
                  </label>
                  <button
                    type="submit"
                    className="button primary modal-primary"
                  >
                    <Icon name="plus" size={16} />
                    Create dashboard
                  </button>
                </form>
              </>
            ) : modal === "help" ? (
              <>
                <div className="modal-eyebrow">A LITTLE GUIDANCE</div>
                <h2>Make yourself at home.</h2>
                <p>Your workspace is as flexible as your ideas.</p>
                <div className="help-steps">
                  {[
                    [
                      "grip",
                      "Find your flow",
                      "Grab a widget header and drag it anywhere on the grid.",
                    ],
                    [
                      "sliders",
                      "Make room",
                      "Click Customize to show controls. Drag a bottom corner to resize.",
                    ],
                    [
                      "plus",
                      "Add a new perspective",
                      "Open Add widget to explore charts, metrics, goals, and notes.",
                    ],
                    [
                      "check",
                      "Pick up where you left off",
                      "Your layout, notes, and completed goals are saved in this browser.",
                    ],
                  ].map(([icon, title, text]) => (
                    <div key={title}>
                      <Icon name={icon as IconName} size={20} />
                      <span>
                        <strong>{title}</strong>
                        <p>{text}</p>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : modal === "plans" ? (
              <>
                <div className="modal-eyebrow">
                  <Icon name="sparkles" size={15} /> A LITTLE MORE POSSIBILITY
                </div>
                <h2>Room for what’s next.</h2>
                <p>You’re on the Pro workspace plan.</p>
                <div className="plan-card">
                  <div>
                    <strong>Forma Pro</strong>
                    <span>YOUR CURRENT PLAN</span>
                  </div>
                  <h3>
                    $19<small> / member / month</small>
                  </h3>
                  {[
                    "Unlimited dashboards & widgets",
                    "All your data sources in one place",
                    "Custom layouts that feel like you",
                    "CSV reports, ready to share",
                  ].map((s) => (
                    <p key={s}>
                      <Icon name="check" size={16} />
                      {s}
                    </p>
                  ))}
                </div>
                <button
                  className="button primary modal-primary"
                  onClick={() => {
                    setModal(null);
                    setToast("You already have everything in Forma Pro");
                  }}
                >
                  You’re all set
                  <Icon name="check" size={16} />
                </button>
              </>
            ) : modal === "profile" ? (
              <>
                <span className="large-avatar">AL</span>
                <h2>Alex Lawson</h2>
                <p>alex@studio.design</p>
                <div className="profile-details">
                  <span>
                    Workspace<strong>Studio workspace</strong>
                  </span>
                  <span>
                    Role<strong>Workspace owner</strong>
                  </span>
                  <span>
                    Plan<strong>Forma Pro ✦</strong>
                  </span>
                </div>
                <button
                  className="button modal-primary"
                  onClick={() => setModal("settings")}
                >
                  <Icon name="settings" size={16} />
                  Workspace settings
                </button>
              </>
            ) : (
              <>
                <div className="modal-eyebrow">A PLACE FOR YOUR IDEAS</div>
                <h2>Studio workspace</h2>
                <p>Your shared home for a clearer view of business.</p>
                <div className="workspace-detail">
                  <span className="workspace-icon">S✦</span>
                  <div>
                    <strong>Studio workspace</strong>
                    <p>4 connected sources · Pro plan</p>
                  </div>
                  <Icon name="check" size={20} />
                </div>
                <button
                  className="button modal-primary"
                  onClick={() => setModal("settings")}
                >
                  <Icon name="settings" size={16} />
                  Manage workspace
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
