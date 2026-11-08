import { useState } from "react";
import { Icon, type IconName } from "./Icons";
export type WidgetKind =
  | "revenue"
  | "customers"
  | "orders"
  | "conversion"
  | "chart"
  | "traffic"
  | "projects"
  | "goal"
  | "activity";
export type Widget = {
  id: string;
  kind: WidgetKind;
  x: number;
  y: number;
  w: number;
  h: number;
};
export const initial: Widget[] = [
  { id: "revenue", kind: "revenue", x: 0, y: 0, w: 3, h: 2 },
  { id: "customers", kind: "customers", x: 3, y: 0, w: 3, h: 2 },
  { id: "orders", kind: "orders", x: 6, y: 0, w: 3, h: 2 },
  { id: "conversion", kind: "conversion", x: 9, y: 0, w: 3, h: 2 },
  { id: "chart", kind: "chart", x: 0, y: 2, w: 8, h: 4 },
  { id: "traffic", kind: "traffic", x: 8, y: 2, w: 4, h: 4 },
  { id: "projects", kind: "projects", x: 0, y: 6, w: 8, h: 4 },
  { id: "goal", kind: "goal", x: 8, y: 6, w: 4, h: 4 },
];
export const widgetNames: Record<WidgetKind, string> = {
  revenue: "Общая выручка",
  customers: "Клиенты",
  orders: "Заказы",
  conversion: "Конверсия",
  chart: "Динамика выручки",
  traffic: "Источники трафика",
  projects: "Последние проекты",
  goal: "Цель на месяц",
  activity: "Активность команды",
};
export const overlaps = (a: Widget, b: Widget) =>
  a.id !== b.id &&
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y;
export function place(widgets: Widget[], moved: Widget) {
  let next = widgets.map((w) => (w.id === moved.id ? moved : { ...w }));
  const queue = [moved];
  while (queue.length) {
    const item = queue.shift()!;
    next = next.map((w) => {
      if (overlaps(item, w)) {
        const changed = { ...w, y: item.y + item.h };
        queue.push(changed);
        return changed;
      }
      return w;
    });
  }
  return next;
}
export function getFreePosition(widgets: Widget[], widget: Widget): Widget {
  for (let y = 0; ; y++) {
    for (let x = 0; x <= 12 - widget.w; x++) {
      const candidate = { ...widget, x, y };
      if (!widgets.some((item) => overlaps(candidate, item))) return candidate;
    }
  }
}
export const projects = [
  {
    name: "Редизайн веб-сайта",
    initial: "W",
    color: "lilac",
    type: "Дизайн и разработка",
    status: "В работе",
    progress: 75,
    people: ["АК", "МС", "ДВ"],
    due: "28 июн",
  },
  {
    name: "Мобильное приложение",
    initial: "M",
    color: "peach",
    type: "Продуктовый дизайн",
    status: "В работе",
    progress: 48,
    people: ["ЕП", "МС"],
    due: "30 июн",
  },
  {
    name: "Фирменный стиль",
    initial: "B",
    color: "mint",
    type: "Брендинг",
    status: "Завершён",
    progress: 100,
    people: ["АК", "ЕП", "ДВ"],
    due: "24 июн",
  },
];
export type Project = (typeof projects)[number];
function Sparkline({ index }: { index: number }) {
  const lines = [
    "0,30 9,28 17,31 25,20 33,23 41,11 49,17 57,14 65,17 73,5 81,9 90,2",
    "0,30 9,25 17,27 25,17 33,21 41,14 49,16 57,8 65,12 73,6 81,9 90,2",
    "0,29 9,32 17,23 25,25 33,16 41,20 49,10 57,15 65,7 73,12 81,3 90,6",
    "0,24 9,22 17,27 25,15 33,17 41,11 49,17 57,14 65,4 73,8 81,2 90,4",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 90 40">
      <defs>
        <linearGradient id={"spark" + index} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f18854" stopOpacity=".15" />
          <stop offset="1" stopColor="#f18854" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,40 ${lines[index]} 90,40`}
        fill={`url(#spark${index})`}
      />
      <polyline
        points={lines[index]}
        fill="none"
        stroke="#e88a61"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export const periodFactor = (period: string) =>
  period === "7 дней" ? 0.26 : period === "Этот год" ? 8.4 : 1;
function RevenueChart({ period }: { period: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [series, setSeries] = useState("revenue");
  const factor = period === "7 дней" ? 0.7 : period === "Этот год" ? 1.25 : 1;
  const values = (
    series === "revenue"
      ? [
          12, 14, 13, 18, 17, 23, 21, 22, 17, 22, 20, 28, 26, 30, 25, 28, 26,
          33, 31, 34, 29, 36, 33, 40, 38, 42, 37, 44, 42, 47,
        ]
      : [
          9, 11, 10, 13, 12, 15, 13, 16, 12, 14, 13, 18, 15, 20, 17, 19, 16, 23,
          19, 22, 20, 25, 22, 28, 25, 29, 25, 31, 29, 33,
        ]
  ).map((v) => v * factor);
  const pts = values.map((v, i) => [46 + i * 19.1, 178 - v * 3]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <>
      <div className="card-heading">
        <div>
          <h3>Динамика выручки</h3>
          <p>
            Доходы вашего бизнеса за{" "}
            {period === "7 дней"
              ? "неделю"
              : period === "Этот год"
                ? "год"
                : "месяц"}
          </p>
        </div>
        <select
          className="small-select"
          aria-label="Показатель графика"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
        >
          <option value="revenue">Выручка</option>
          <option value="expenses">Расходы</option>
        </select>
      </div>
      <div className="chart-summary">
        <strong>
          {"$" +
            (
              (series === "revenue" ? 48295 : 29450) * periodFactor(period)
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </strong>
        <span className="trend">
          <Icon name="arrow" size={12} /> 12,8%
        </span>
        <span className="muted summary-note">к прошлому периоду</span>
        <span className="chart-legend">
          <i />
          Текущий период
        </span>
      </div>
      <div className="revenue-chart" onMouseLeave={() => setHover(null)}>
        <svg
          viewBox="0 0 650 218"
          preserveAspectRatio="none"
          role="img"
          aria-label="График выручки за выбранный период"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover(
              Math.max(
                0,
                Math.min(
                  29,
                  Math.round(
                    (((e.clientX - r.left) / r.width) * 650 - 46) / 19.1,
                  ),
                ),
              ),
            );
          }}
        >
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#ed8a57" stopOpacity=".16" />
              <stop offset="1" stopColor="#ed8a57" stopOpacity=".015" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((n) => (
            <g key={n}>
              <line
                x1="46"
                x2="624"
                y1={28 + n * 50}
                y2={28 + n * 50}
                stroke="#ececea"
                strokeDasharray="3 4"
              />
              <text x="0" y={32 + n * 50}>
                {["$60k", "$40k", "$20k", "$0"][n]}
              </text>
            </g>
          ))}
          <path d={`${path} L600,178 L46,178 Z`} fill="url(#area)" />
          <path
            d={path}
            stroke="#e87e47"
            fill="none"
            strokeWidth="2.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {[0, 5, 10, 15, 20, 25, 29].map((n, i) => (
            <text
              key={n}
              x={46 + n * 19.1}
              y="207"
              textAnchor={i === 6 ? "end" : i === 0 ? "start" : "middle"}
            >
              {period === "Этот год"
                ? ["Янв", "Мар", "Май", "Июл", "Сен", "Ноя", "Дек"][i]
                : period === "7 дней"
                  ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]
                  : [
                      "1 июн",
                      "5 июн",
                      "10 июн",
                      "15 июн",
                      "20 июн",
                      "25 июн",
                      "30 июн",
                    ][i]}
            </text>
          ))}
          {hover !== null && (
            <g>
              <line
                x1={pts[hover][0]}
                x2={pts[hover][0]}
                y1="18"
                y2="178"
                stroke="#d8a285"
                strokeDasharray="4 3"
              />
              <circle
                cx={pts[hover][0]}
                cy={pts[hover][1]}
                r="4.5"
                fill="#e87e47"
                stroke="white"
                strokeWidth="2"
              />
              <rect
                x={Math.min(522, Math.max(46, pts[hover][0] - 48))}
                y="1"
                width="100"
                height="26"
                rx="6"
                fill="#292a28"
              />
              <text
                x={Math.min(522, Math.max(46, pts[hover][0] - 48)) + 50}
                y="18"
                textAnchor="middle"
                style={{ fill: "white", fontSize: 11 }}
              >
                ${Math.round(values[hover] * 1000).toLocaleString()}
              </text>
            </g>
          )}
        </svg>
      </div>
    </>
  );
}
export function WidgetContent({
  widget,
  period,
  target,
  onGoal,
  onProjects,
  onProject,
}: {
  widget: Widget;
  period: string;
  target: number;
  onGoal: () => void;
  onProjects: () => void;
  onProject: (p: Project) => void;
}) {
  const w = widget,
    factor = periodFactor(period);
  if (["revenue", "customers", "orders", "conversion"].includes(w.kind)) {
    const index = ["revenue", "customers", "orders", "conversion"].indexOf(
      w.kind,
    );
    return (
      <div className="metric-content">
        <div className="metric-label">
          <span className={"metric-icon metric-icon-" + index}>
            <Icon
              name={(["wallet", "users", "cart", "chart"] as IconName[])[index]}
              size={17}
            />
          </span>
          <span>{widgetNames[w.kind]}</span>
        </div>
        <div className="metric-number">
          {index === 0
            ? "$" + Math.round(48295 * factor).toLocaleString("en-US")
            : index === 1
              ? Math.round(2420 * factor).toLocaleString("en-US")
              : index === 2
                ? Math.round(1386 * factor).toLocaleString("en-US")
                : "3.62%"}
          <Sparkline index={index} />
        </div>
        <div className="metric-footer">
          <span className="trend">
            <Icon name="arrow" size={12} />
            {["12,8", "8,2", "5,4", "2,1"][index]}%
          </span>
          <span>к прошлому периоду</span>
        </div>
      </div>
    );
  }
  if (w.kind === "chart") return <RevenueChart period={period} />;
  if (w.kind === "traffic")
    return (
      <>
        <div className="card-heading">
          <div>
            <h3>Источники трафика</h3>
            <p>Откуда приходят ваши клиенты</p>
          </div>
        </div>
        <div className="traffic-content">
          <div className="donut">
            <svg
              viewBox="0 0 180 180"
              role="img"
              aria-label="Источники трафика: прямые 44%, поиск 28%, соцсети 18%, другое 10%"
            >
              <circle
                cx="90"
                cy="90"
                r="68"
                fill="none"
                stroke="#f2f0ec"
                strokeWidth="24"
              />
              {[
                { value: 44, offset: 0, color: "#e58a51" },
                { value: 28, offset: 44, color: "#f2ba91" },
                { value: 18, offset: 72, color: "#d3d7c6" },
                { value: 10, offset: 90, color: "#ecece6" },
              ].map((s) => (
                <circle
                  key={s.offset}
                  cx="90"
                  cy="90"
                  r="68"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="24"
                  strokeDasharray={`${s.value * 4.272 - 4} ${427.2 - s.value * 4.272 + 4}`}
                  strokeDashoffset={-s.offset * 4.272}
                  transform="rotate(-90 90 90)"
                />
              ))}
            </svg>
            <div>
              <span>Всего посетителей</span>
              <strong>
                {Math.round(24680 * factor).toLocaleString("en-US")}
              </strong>
              <span className="trend">↗ 8,4%</span>
            </div>
          </div>
          <div className="traffic-legend">
            {[
              ["#e58a51", "Прямые переходы", "44%"],
              ["#f2ba91", "Поиск", "28%"],
              ["#d3d7c6", "Социальные сети", "18%"],
              ["#ecece6", "Другое", "10%"],
            ].map(([color, label, val]) => (
              <div key={label}>
                <i style={{ background: color }} />
                <span>{label}</span>
                <b>{val}</b>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  if (w.kind === "projects")
    return (
      <>
        <div className="card-heading">
          <div>
            <h3>
              Последние проекты <span className="count-badge">6</span>
            </h3>
            <p>От идеи до результата</p>
          </div>
          <button className="text-button" onClick={onProjects}>
            Все проекты <Icon name="chevron" size={14} />
          </button>
        </div>
        <div className="project-table">
          <div className="table-head">
            <span>Название проекта</span>
            <span>Статус</span>
            <span>Прогресс</span>
            <span>Команда</span>
          </div>
          {projects.map((p) => (
            <button
              className="project-row"
              key={p.name}
              onClick={() => onProject(p)}
            >
              <span className="project-name">
                <span className={"project-logo " + p.color}>{p.initial}</span>
                <span>
                  <b>{p.name}</b>
                  <small>{p.type}</small>
                </span>
              </span>
              <span
                className={"status " + (p.progress === 100 ? "complete" : "")}
              >
                <i />
                {p.status}
              </span>
              <span className="progress-cell">
                <span className="progress-track">
                  <i
                    style={{
                      width: p.progress + "%",
                      background: p.progress === 100 ? "#8eaa8d" : undefined,
                    }}
                  />
                </span>
                <small>{p.progress}%</small>
              </span>
              <span className="avatars">
                {p.people.map((person, i) => (
                  <span key={person} className={"avatar avatar-" + i}>
                    {person}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
        <div className="project-footer">
          <span>
            <i className="live-dot" /> Всё идёт по плану
          </span>
          <span>3 из 6 проектов</span>
        </div>
      </>
    );
  if (w.kind === "goal")
    return (
      <>
        <div className="card-heading">
          <div>
            <h3>Цель на месяц</h3>
            <p>Маленькие шаги. Большие результаты.</p>
          </div>
          <span className="goal-icon">
            <Icon name="target" size={19} />
          </span>
        </div>
        <div className="goal-amount">
          <strong>$48,295</strong>
          <span>из ${target.toLocaleString("en-US")}</span>
        </div>
        <div className="goal-progress">
          <i style={{ width: Math.min(100, (48295 / target) * 100) + "%" }} />
        </div>
        <div className="goal-progress-label">
          <span>{Math.round((48295 / target) * 100)}% выполнено</span>
          <strong>Осталось 6 дней</strong>
        </div>
        <div className="goal-note">
          <span>✧</span>
          <p>
            {48295 >= target
              ? "Цель достигнута! Время отметить"
              : "Отличный темп! Ещё немного —"}
            <br />
            {48295 >= target
              ? "успех и поставить новую цель."
              : "и цель будет достигнута."}
          </p>
        </div>
        <button className="goal-link" onClick={onGoal}>
          Настроить цель <Icon name="arrow" size={14} />
        </button>
      </>
    );
  return (
    <>
      <div className="card-heading">
        <div>
          <h3>Активность команды</h3>
          <p>Последние обновления</p>
        </div>
      </div>
      <div className="activity-list">
        {[
          [
            "АК",
            "Алексей завершил задачу",
            "Макет главной страницы",
            "10 минут назад",
          ],
          [
            "МС",
            "Мария добавила комментарий",
            "Редизайн веб-сайта",
            "32 минуты назад",
          ],
          ["ДВ", "Дмитрий загрузил файлы", "Фирменный стиль", "1 час назад"],
        ].map((a, i) => (
          <div key={a[0]}>
            <span className={"avatar avatar-" + i}>{a[0]}</span>
            <section>
              <b>{a[1]}</b>
              <p>{a[2]}</p>
              <small>{a[3]}</small>
            </section>
          </div>
        ))}
      </div>
    </>
  );
}
