import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Icon, type IconName } from "./Icons";
import {
  initial,
  widgetNames,
  place,
  getFreePosition,
  projects,
  WidgetContent,
  type Widget,
  type WidgetKind,
  type Project,
} from "./widgets";
import "./styles.css";

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => [
      ...ref.current!.querySelectorAll<HTMLElement>(
        'button,input,select,[tabindex="0"]',
      ),
    ];
    (
      ref.current!.querySelector<HTMLElement>("input") || focusable()[0]
    )?.focus();
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const list = focusable(),
          first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function readLayout(): Widget[] {
  try {
    const saved = JSON.parse(localStorage.getItem("forma-layout") || "null");
    if (
      Array.isArray(saved) &&
      saved.every(
        (w) =>
          w.id &&
          widgetNames[w.kind as WidgetKind] &&
          Number.isInteger(w.x) &&
          w.x >= 0 &&
          Number.isInteger(w.y) &&
          w.y >= 0 &&
          w.w > 0 &&
          w.w <= 12 &&
          w.x + w.w <= 12 &&
          w.h > 0,
      )
    )
      return saved;
  } catch {
    /* Start with the default layout if storage is unavailable. */
  }
  return initial;
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* The dashboard remains usable without browser storage. */
  }
}
function read(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
type DragState = {
  widget: Widget;
  startX: number;
  startY: number;
  col: number;
  row: number;
  next: Widget;
  mobile: boolean;
  targetId: string | null;
};
export function App() {
  const [widgets, setWidgets] = useState<Widget[]>(readLayout);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [popover, setPopover] = useState(false);
  const [period, setPeriod] = useState("Этот месяц");
  const [nav, setNav] = useState("Обзор");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [compact, setCompact] = useState(
    () => read("forma-compact", "false") === "true",
  );
  const [project, setProject] = useState<Project | null>(null);
  const [target, setTarget] = useState(() =>
    Math.max(1, Number(read("forma-goal", "60000")) || 60000),
  );
  const [goalInput, setGoalInput] = useState("60000");
  const [invited, setInvited] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [drag, setDrag] = useState<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const [drop, setDrop] = useState<Widget | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  useEffect(() => save("forma-layout", JSON.stringify(widgets)), [widgets]);
  useEffect(() => save("forma-goal", String(target)), [target]);
  useEffect(() => save("forma-compact", String(compact)), [compact]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3400);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const close = () => setPopover(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const notify = (s: string) => setToast(s);
  const beginDrag = (e: ReactPointerEvent, widget: Widget) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = gridRef.current!.getBoundingClientRect(),
      gap = parseFloat(getComputedStyle(gridRef.current!).columnGap);
    dragRef.current = {
      widget,
      startX: e.clientX,
      startY: e.clientY,
      col: (r.width + gap) / 12,
      row: (compact ? 47 : 57) + gap,
      next: widget,
      mobile: window.innerWidth < 760,
      targetId: null,
    };
    setDrag({ id: widget.id, dx: 0, dy: 0 });
  };
  const moveDrag = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mobile) {
      const hit = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-widget-id]");
      if (hit && hit.dataset.widgetId !== d.widget.id) {
        d.targetId = hit.dataset.widgetId || null;
        setDrop(widgets.find((w) => w.id === d.targetId) || null);
      }
      return;
    }
    const dx = e.clientX - d.startX,
      dy = e.clientY - d.startY;
    d.next = {
      ...d.widget,
      x: Math.max(
        0,
        Math.min(12 - d.widget.w, d.widget.x + Math.round(dx / d.col)),
      ),
      y: Math.max(0, d.widget.y + Math.round(dy / d.row)),
    };
    setDrag({ id: d.widget.id, dx, dy });
    setDrop(d.next);
  };
  const endDrag = () => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mobile && d.targetId) {
      setWidgets((items) => {
        const next = [...items],
          a = items.findIndex((w) => w.id === d.widget.id),
          b = items.findIndex((w) => w.id === d.targetId);
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
      notify("Расположение виджетов сохранено");
    } else if (
      !d.mobile &&
      (d.next.x !== d.widget.x || d.next.y !== d.widget.y)
    ) {
      setWidgets((items) => place(items, d.next));
      notify("Расположение виджетов сохранено");
    }
    dragRef.current = null;
    setDrag(null);
    setDrop(null);
  };
  const addWidget = (kind: WidgetKind) => {
    const small = ["revenue", "customers", "orders", "conversion"].includes(
      kind,
    );
    const widget: Widget = {
      id: kind + "-" + Date.now(),
      kind,
      x: 0,
      y: 0,
      w: small ? 3 : kind === "chart" || kind === "projects" ? 8 : 4,
      h: small ? 2 : 4,
    };
    setWidgets((items) => [...items, getFreePosition(items, widget)]);
    setModal(null);
    notify("Виджет добавлен на дашборд");
  };
  const exportReport = () => {
    const blob = new Blob(
      [
        "\uFEFFПоказатель;Значение\nВыручка;48295\nКлиенты;2420\nЗаказы;1386\nКонверсия;3.62%\n\nПроект;Статус;Прогресс\n" +
          projects
            .map((p) => `${p.name};${p.status};${p.progress}%`)
            .join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma-report-june-2026.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Отчёт скачан");
  };
  const shownWidgets =
    nav === "Аналитика"
      ? widgets.filter((w) => w.kind !== "projects" && w.kind !== "goal")
      : nav === "Проекты"
        ? widgets.filter((w) =>
            ["projects", "goal", "activity"].includes(w.kind),
          )
        : widgets;
  const activeWidgets =
    nav === "Обзор"
      ? shownWidgets
      : shownWidgets.reduce<Widget[]>(
          (acc, w) => [...acc, getFreePosition(acc, w)],
          [],
        );
  const openGoal = () => {
    setGoalInput(String(target));
    setModal("goal");
  };
  const allProjects: Project[] = [
    ...projects,
    {
      name: "Лендинг продукта",
      initial: "L",
      color: "lilac",
      type: "Разработка",
      status: "В работе",
      progress: 35,
      people: ["АК"],
      due: "5 июл",
    },
    {
      name: "Летняя кампания",
      initial: "S",
      color: "peach",
      type: "Маркетинг",
      status: "В работе",
      progress: 20,
      people: ["МС"],
      due: "10 июл",
    },
    {
      name: "Дизайн-система",
      initial: "D",
      color: "mint",
      type: "Дизайн",
      status: "В работе",
      progress: 60,
      people: ["ДВ"],
      due: "12 июл",
    },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setNav("Обзор");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          forma<span className="brand-period">.</span>
        </a>
        <div className="workspace-box">
          <span className="workspace-icon">
            a<span>✳</span>
          </span>
          <div>
            <strong>Acme Studio</strong>
            <small>Рабочее пространство</small>
          </div>
          <Icon name="chevron" size={14} />
        </div>
        <div className="nav-caption">ПРОСТРАНСТВО</div>
        <nav>
          {(
            [
              { label: "Обзор", icon: "grid" },
              { label: "Аналитика", icon: "chart" },
              { label: "Проекты", icon: "folder" },
              { label: "Отчёты", icon: "report" },
            ] as { label: string; icon: IconName }[]
          ).map((item) => (
            <button
              aria-label={item.label}
              key={item.label}
              className={"nav-item " + (nav === item.label ? "active" : "")}
              onClick={() => {
                if (item.label === "Отчёты") setModal("report");
                else {
                  setNav(item.label);
                  setEditing(false);
                }
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Проекты" && <small>6</small>}
              {nav === item.label && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="nav-caption dashboards-caption">
          МОИ ДАШБОРДЫ{" "}
          <button
            aria-label="Создать дашборд"
            onClick={() => setModal("dashboard")}
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
        <button
          className={"dashboard-item " + (nav === "Обзор" ? "selected" : "")}
          onClick={() => setNav("Обзор")}
        >
          <span className="dashboard-dot" />
          Основной дашборд
        </button>
        <button
          className={
            "dashboard-item " + (nav === "Аналитика" ? "selected" : "")
          }
          onClick={() => setNav("Аналитика")}
        >
          <span className="dashboard-dot sage" />
          Маркетинг
        </button>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-symbol">✧</span>
            <strong>Вместе — больше</strong>
            <p>Пригласите команду и двигайтесь к целям вместе.</p>
            <button onClick={() => setModal("invite")}>
              <Icon name="users" size={15} />
              Пригласить коллег
            </button>
          </div>
          <button
            aria-label="Настройки"
            className="nav-item"
            onClick={() => setModal("settings")}
          >
            <Icon name="settings" size={19} />
            <span>Настройки</span>
          </button>
          <button
            aria-label="Помощь и поддержка"
            className="nav-item"
            onClick={() => setModal("help")}
          >
            <Icon name="help" size={19} />
            <span>Помощь и поддержка</span>
            <Icon name="external" size={13} />
          </button>
          <button
            aria-label="Личный аккаунт"
            className="profile"
            onClick={() => setModal("profile")}
          >
            <span className="profile-avatar">А</span>
            <span>
              <strong>Алексей Иванов</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{nav}</strong>
          </div>
          <div className="topbar-right">
            <span className="today-date">Среда, 24 июня</span>
            <button
              className="icon-button"
              aria-label="Поиск"
              onClick={() => {
                setSearch("");
                setModal("search");
              }}
            >
              <Icon name="search" size={19} />
            </button>
            <div className="popover-parent">
              <button
                className="icon-button notification-button"
                aria-label="Уведомления"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopover(!popover);
                }}
              >
                <Icon name="bell" size={19} />
                <i />
              </button>
              {popover && (
                <div
                  className="popover notifications"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3>
                    Уведомления <span>2 новых</span>
                  </h3>
                  <p>
                    <b>Цель почти достигнута</b>
                    <span>Вы выполнили 80% плана на июнь.</span>
                    <small>Сегодня, 09:15</small>
                  </p>
                  <p>
                    <b>Проект завершён</b>
                    <span>Фирменный стиль готов к просмотру.</span>
                    <small>Сегодня, 08:40</small>
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setPopover(false);
                      notify("Все уведомления прочитаны");
                    }}
                  >
                    Отметить всё прочитанным <Icon name="check" size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <button
              className="top-avatar"
              aria-label="Профиль"
              onClick={() => setModal("profile")}
            >
              А
            </button>
          </div>
        </header>
        <main>
          <div className="page-intro">
            <div>
              <div className="eyebrow">ВАША РАБОТА. ВАШ РИТМ.</div>
              <h1>
                {nav === "Обзор"
                  ? "Всё под контролем"
                  : nav === "Аналитика"
                    ? "Больше ясности в цифрах"
                    : "От идеи к результату"}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {nav === "Обзор"
                  ? "С возвращением, Алексей. Вот как идут дела у вашего бизнеса."
                  : nav === "Аналитика"
                    ? "Следите за ключевыми показателями и находите точки роста."
                    : "Следите за прогрессом и двигайтесь к целям вместе с командой."}
              </p>
            </div>
            <span className="live-label">
              <i className="live-dot" />
              Данные обновлены <span>·</span> 2 мин назад
            </span>
          </div>
          <div className="dashboard-toolbar">
            <div className="view-tabs">
              <button className="selected" onClick={() => setNav("Обзор")}>
                <Icon name="grid" size={16} />
                {nav === "Аналитика"
                  ? "Аналитика"
                  : nav === "Проекты"
                    ? "Проекты"
                    : "Основной дашборд"}
              </button>
              <span className="widget-counter">
                {shownWidgets.length} виджетов
              </span>
            </div>
            <div className="toolbar-actions">
              <div className="period-control">
                <Icon name="calendar" size={16} />
                <select
                  aria-label="Период"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option>Этот месяц</option>
                  <option>7 дней</option>
                  <option>Этот год</option>
                </select>
                <span className="select-chevron">⌄</span>
              </div>
              <button
                className={
                  "button customize-button " + (editing ? "editing" : "")
                }
                onClick={() => {
                  if (nav !== "Обзор") setNav("Обзор");
                  setEditing(!editing);
                }}
              >
                <Icon name={editing ? "check" : "settings"} size={16} />
                {editing ? "Готово" : "Настроить"}
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setSearch("");
                  setModal("add");
                }}
              >
                <Icon name="plus" size={17} />
                Добавить виджет
              </button>
            </div>
          </div>
          {editing && (
            <div className="edit-banner">
              <Icon name="grip" size={18} />
              <span>
                Перетаскивайте виджеты за ручку, меняйте ширину или убирайте
                лишнее.
              </span>
              <button
                onClick={() => {
                  setWidgets(initial);
                  notify("Начальная раскладка восстановлена");
                }}
              >
                <Icon name="reset" size={14} />
                Сбросить
              </button>
            </div>
          )}
          <div
            ref={gridRef}
            className={
              "widget-grid " +
              (editing ? "is-editing " : "") +
              (compact ? "compact " : "")
            }
            style={{
              gridTemplateRows: `repeat(${Math.max(4, ...activeWidgets.map((w) => w.y + w.h))}, ${compact ? "47" : "57"}px)`,
            }}
          >
            {drop && (
              <div
                className="drop-placeholder"
                style={{
                  gridColumn: `${drop.x + 1} / span ${drop.w}`,
                  gridRow: `${drop.y + 1} / span ${drop.h}`,
                }}
              />
            )}
            {activeWidgets.map((w) => (
              <article
                key={w.id}
                data-widget-id={w.id}
                className={
                  "widget widget-" +
                  w.kind +
                  (drag?.id === w.id ? " dragging" : "") +
                  (drop?.id === w.id && drag?.id !== w.id
                    ? " mobile-drop-target"
                    : "")
                }
                style={{
                  gridColumn: `${w.x + 1} / span ${w.w}`,
                  gridRow: `${w.y + 1} / span ${w.h}`,
                  transform:
                    drag?.id === w.id
                      ? `translate(${drag.dx}px, ${drag.dy}px)`
                      : undefined,
                }}
              >
                <div className="widget-tools">
                  <button
                    className="drag-handle"
                    aria-label={"Переместить " + widgetNames[w.kind]}
                    title="Перетащите виджет. Стрелки — перемещение с клавиатуры."
                    onPointerDown={(e) => beginDrag(e, w)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={() => {
                      dragRef.current = null;
                      setDrag(null);
                      setDrop(null);
                    }}
                    onKeyDown={(e) => {
                      const moves: Record<string, [number, number]> = {
                        ArrowLeft: [-1, 0],
                        ArrowRight: [1, 0],
                        ArrowUp: [0, -1],
                        ArrowDown: [0, 1],
                      };
                      if (moves[e.key]) {
                        e.preventDefault();
                        const [dx, dy] = moves[e.key];
                        setWidgets((items) =>
                          place(items, {
                            ...w,
                            x: Math.min(12 - w.w, Math.max(0, w.x + dx)),
                            y: Math.max(0, w.y + dy),
                          }),
                        );
                      }
                    }}
                  >
                    <Icon name="grip" size={15} />
                  </button>
                  {editing && (
                    <>
                      <button
                        className="resize-widget"
                        title="Изменить ширину"
                        aria-label={"Изменить ширину: " + widgetNames[w.kind]}
                        onClick={() =>
                          setWidgets((items) =>
                            place(items, {
                              ...w,
                              w:
                                w.w === 12
                                  ? w.kind === "chart" || w.kind === "projects"
                                    ? 8
                                    : [
                                          "revenue",
                                          "customers",
                                          "orders",
                                          "conversion",
                                        ].includes(w.kind)
                                      ? 3
                                      : 4
                                  : w.w === 3
                                    ? 6
                                    : 12,
                              x: 0,
                            }),
                          )
                        }
                      >
                        <Icon name="expand" size={13} />
                      </button>
                      <button
                        title="Удалить виджет"
                        aria-label={"Удалить: " + widgetNames[w.kind]}
                        onClick={() => {
                          setWidgets((items) =>
                            items.filter((a) => a.id !== w.id),
                          );
                          notify("Виджет удалён. Его можно добавить снова.");
                        }}
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </>
                  )}
                </div>
                <WidgetContent
                  widget={w}
                  period={period}
                  target={target}
                  onGoal={openGoal}
                  onProjects={() => setModal("projects")}
                  onProject={(p) => {
                    setProject(p);
                    setModal("project");
                  }}
                />
              </article>
            ))}
          </div>
          {!activeWidgets.length && (
            <div className="empty-state">
              <Icon name="grid" size={36} />
              <h2>Место для ваших идей</h2>
              <p>Добавьте первый виджет и соберите свой дашборд.</p>
              <button
                className="button primary"
                onClick={() => setModal("add")}
              >
                <Icon name="plus" size={16} />
                Добавить виджет
              </button>
            </div>
          )}
          <footer className="page-footer">
            <span>
              <Icon name="grip" size={14} />
              Ваш дашборд — ваши правила. Перетаскивайте виджеты, как удобно
              вам.
            </span>
            <span>
              Все изменения сохранены <Icon name="check" size={13} />
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button aria-label="Закрыть" onClick={() => setToast("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {(modal === "add" || modal === "search") && (
        <Modal
          title={
            modal === "add" ? "Ваш следующий виджет" : "Найдём то, что нужно"
          }
          subtitle={
            modal === "add"
              ? "Добавьте важное. Создайте пространство под себя."
              : "Поиск по виджетам и показателям дашборда."
          }
          onClose={() => setModal(null)}
        >
          <div className="modal-search">
            <Icon name="search" size={18} />
            <input
              placeholder="Найти виджет…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="widget-catalog">
            {(Object.keys(widgetNames) as WidgetKind[])
              .filter((k) =>
                widgetNames[k].toLowerCase().includes(search.toLowerCase()),
              )
              .map((kind, i) => (
                <button
                  key={kind}
                  onClick={() => {
                    if (
                      modal === "search" &&
                      widgets.some((w) => w.kind === kind)
                    ) {
                      setNav("Обзор");
                      setModal(null);
                      setTimeout(
                        () =>
                          document
                            .querySelector(".widget-" + kind)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            }),
                        100,
                      );
                    } else addWidget(kind);
                  }}
                >
                  <span className={"catalog-icon catalog-icon-" + (i % 3)}>
                    <Icon
                      name={
                        kind === "chart"
                          ? "chart"
                          : kind === "projects"
                            ? "folder"
                            : kind === "goal"
                              ? "target"
                              : kind === "customers"
                                ? "users"
                                : kind === "orders"
                                  ? "cart"
                                  : "grid"
                      }
                      size={22}
                    />
                  </span>
                  <strong>{widgetNames[kind]}</strong>
                  <small>
                    {kind === "chart"
                      ? "Тренды и ключевые изменения"
                      : kind === "goal"
                        ? "Ваш прогресс на пути к цели"
                        : kind === "projects"
                          ? "Вся работа в одном месте"
                          : "Все важные цифры перед глазами"}
                  </small>
                  <span className="catalog-add">
                    <Icon
                      name={
                        modal === "search" &&
                        widgets.some((w) => w.kind === kind)
                          ? "arrow"
                          : "plus"
                      }
                      size={17}
                    />
                  </span>
                </button>
              ))}
          </div>
          {!(Object.keys(widgetNames) as WidgetKind[]).some((k) =>
            widgetNames[k].toLowerCase().includes(search.toLowerCase()),
          ) && (
            <p className="empty-search">
              Ничего не найдено. Попробуйте другое название.
            </p>
          )}
        </Modal>
      )}
      {modal === "goal" && (
        <Modal
          title="Ближе к вашей цели"
          subtitle="Укажите план по выручке на этот месяц."
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTarget(Number(goalInput));
              setModal(null);
              notify("Цель на месяц обновлена");
            }}
          >
            <label className="form-label">
              План по выручке, $
              <input
                className="form-input"
                type="number"
                min="1"
                max="100000000"
                required
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
            </label>
            <div className="form-note">
              Текущая выручка: $48,295. Прогресс рассчитается автоматически.
            </div>
            <button className="button primary full-width" type="submit">
              Сохранить цель <Icon name="check" size={16} />
            </button>
          </form>
        </Modal>
      )}
      {modal === "invite" && (
        <Modal
          title="Хорошая работа начинается с команды"
          subtitle="Добавьте коллег в своё рабочее пространство."
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInvited((p) => [...p, inviteEmail]);
              setInviteEmail("");
              notify("Коллега добавлен в список приглашений");
            }}
          >
            <label className="form-label">
              Электронная почта
              <input
                className="form-input"
                type="email"
                required
                placeholder="name@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </label>
            <p className="form-note">
              Список приглашений сохраняется в текущей сессии. Отправка писем
              пока не подключена.
            </p>
            <button className="button primary full-width">
              Добавить приглашение <Icon name="plus" size={16} />
            </button>
          </form>
          {invited.map((email, i) => (
            <div className="invite-row" key={i}>
              <Icon name="users" size={17} />
              <span>{email}</span>
              <span className="status">В списке</span>
            </div>
          ))}
        </Modal>
      )}
      {modal === "report" && (
        <Modal
          title="Всё важное в одном отчёте"
          subtitle="Показатели и прогресс проектов за июнь 2026."
          onClose={() => setModal(null)}
        >
          <div className="report-preview">
            <Icon name="report" size={32} />
            <div>
              <strong>Обзор бизнеса · Июнь 2026</strong>
              <p>4 показателя · 3 проекта · Формат CSV</p>
            </div>
          </div>
          <button
            className="button primary full-width"
            onClick={() => {
              exportReport();
              setModal(null);
            }}
          >
            <Icon name="download" size={17} />
            Скачать отчёт
          </button>
        </Modal>
      )}
      {(modal === "projects" || modal === "project") && (
        <Modal
          title={
            modal === "project" && project
              ? project.name
              : "Проекты вашей команды"
          }
          subtitle="Отслеживайте работу и празднуйте результаты."
          onClose={() => setModal(null)}
        >
          {(modal === "project" && project ? [project] : allProjects).map(
            (p) => (
              <div className="project-detail" key={p.name}>
                <div className="project-name">
                  <span className={"project-logo " + p.color}>{p.initial}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <p>
                      {p.type} · Срок: {p.due}
                    </p>
                  </div>
                  <span
                    className={
                      "status " + (p.progress === 100 ? "complete" : "")
                    }
                  >
                    {p.status}
                  </span>
                </div>
                <div className="detail-progress">
                  <span className="progress-track">
                    <i style={{ width: p.progress + "%" }} />
                  </span>
                  <span>{p.progress}%</span>
                </div>
              </div>
            ),
          )}
        </Modal>
      )}
      {modal === "settings" && (
        <Modal
          title="Пространство под вас"
          subtitle="Настройте отображение вашего дашборда."
          onClose={() => setModal(null)}
        >
          <div className="settings-row">
            <div>
              <strong>Компактный вид</strong>
              <p>Меньше отступов, больше информации.</p>
            </div>
            <button
              className={"toggle " + (compact ? "on" : "")}
              role="switch"
              aria-checked={compact}
              aria-label="Компактный вид"
              onClick={() => setCompact(!compact)}
            >
              <span />
            </button>
          </div>
          <button
            className="button full-width"
            onClick={() => {
              setWidgets(initial);
              setModal(null);
              notify("Начальная раскладка восстановлена");
            }}
          >
            <Icon name="reset" size={16} />
            Восстановить начальную раскладку
          </button>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="Освойтесь за минуту"
          subtitle="Ваш дашборд работает так, как удобно вам."
          onClose={() => setModal(null)}
        >
          <div className="help-list">
            {[
              [
                "grip",
                "Двигайте свободно",
                "Наведите курсор на виджет и потяните за ручку в правом верхнем углу. Виджет займёт место на сетке. На телефоне включите режим «Настроить».",
              ],
              [
                "settings",
                "Настройте под себя",
                "Нажмите «Настроить», чтобы менять ширину и удалять виджеты. На ручке также работают клавиши со стрелками.",
              ],
              [
                "plus",
                "Добавляйте важное",
                "Откройте каталог кнопкой «Добавить виджет». Изменения раскладки сохраняются в этом браузере.",
              ],
            ].map(([icon, title, text]) => (
              <div key={title}>
                <span className="catalog-icon">
                  <Icon name={icon as IconName} />
                </span>
                <section>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </section>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal === "profile" && (
        <Modal title="Ваш профиль" onClose={() => setModal(null)}>
          <div className="profile-card">
            <span className="profile-avatar">А</span>
            <h3>Алексей Иванов</h3>
            <p>alex@acme.studio</p>
            <span className="status complete">Владелец пространства</span>
          </div>
          <div className="settings-row">
            <strong>Рабочее пространство</strong>
            <span>Acme Studio</span>
          </div>
        </Modal>
      )}
      {modal === "dashboard" && (
        <Modal
          title="Новый взгляд на ваши данные"
          subtitle="Выберите готовый набор виджетов. Текущая раскладка будет заменена."
          onClose={() => setModal(null)}
        >
          <div className="dashboard-presets">
            {[
              ["Обзор бизнеса", "Все показатели, проекты и цели", "grid"],
              ["Маркетинг", "Выручка, клиенты и источники трафика", "chart"],
              ["Команда", "Проекты, цели и активность", "users"],
            ].map(([name, desc, icon], i) => (
              <button
                key={name}
                onClick={() => {
                  setNav("Обзор");
                  setWidgets(
                    i === 0
                      ? initial
                      : i === 1
                        ? initial.filter((w) =>
                            [
                              "revenue",
                              "customers",
                              "orders",
                              "conversion",
                              "chart",
                              "traffic",
                            ].includes(w.kind),
                          )
                        : [
                            {
                              id: "projects",
                              kind: "projects",
                              x: 0,
                              y: 0,
                              w: 8,
                              h: 4,
                            },
                            {
                              id: "goal",
                              kind: "goal",
                              x: 8,
                              y: 0,
                              w: 4,
                              h: 4,
                            },
                            {
                              id: "activity",
                              kind: "activity",
                              x: 0,
                              y: 4,
                              w: 8,
                              h: 4,
                            },
                          ],
                  );
                  setModal(null);
                  notify("Дашборд «" + name + "» настроен");
                }}
              >
                <span className="catalog-icon">
                  <Icon name={icon as IconName} />
                </span>
                <span>
                  <strong>{name}</strong>
                  <small>{desc}</small>
                </span>
                <Icon name="chevron" size={17} />
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
