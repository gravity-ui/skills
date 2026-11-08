import { useEffect, useRef, useState } from "react";
import { Button, DropdownMenu, Modal, TextInput } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "chevron"
  | "edit"
  | "copy"
  | "link"
  | "download"
  | "archive"
  | "arrow"
  | "check"
  | "folder"
  | "grid"
  | "close";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    chevron: <path d="m6 9 6 6 6-6" />,
    edit: (
      <>
        <path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z" />
        <path d="M13 20h8" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    link: (
      <>
        <path
          d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M13 7l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
          transform="translate(1 1)"
        />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
      </>
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <path d="M5 8v12h14V8m-10 4h6" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11H3V7Z" />,
    grid: (
      <>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="15" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
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
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, setTitle] = useState("Брендинг студии Forma");
  const [draft, setDraft] = useState(title);
  const [editing, setEditing] = useState(false);
  const [archived, setArchived] = useState(false);
  const [notice, setNotice] = useState("");
  const [copies, setCopies] = useState<string[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const notify = (message: string) => {
    setNotice(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(""), 4200);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const download = () => {
    const file = new Blob(
      [
        `${title}\n\nСоздаём визуальный язык независимой дизайн-студии. От идеи и стратегии до айдентики, которая говорит сама за себя.\n\nСтатус: ${archived ? "В архиве" : "В работе"}\nУчастники: Анна Смирнова, Максим Волков, Екатерина Белова\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Информация о проекте скачана");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>
          дело<span className="brand-dot">.</span>
        </div>
        <div className="workspace">
          <span className="workspace-divider" />
          Рабочее пространство<span className="workspace-label">Личное</span>
        </div>
        <div className="profile" aria-label="Профиль Анны Смирновой">
          АС
        </div>
      </header>

      <main>
        <div className="breadcrumb">
          <Icon name="grid" size={15} />
          <span>Проекты</span>
          <span className="breadcrumb-slash">/</span>
          <span>Детали проекта</span>
        </div>
        <div className="page-heading">
          <div>
            <div className="eyebrow">ПРОСТРАНСТВО ДЛЯ ВАШИХ ИДЕЙ</div>
            <h1>
              Хорошая работа начинается здесь<span>.</span>
            </h1>
            <p>
              Все детали, люди и возможности вашего проекта — в одном месте.
            </p>
          </div>
          <span className="project-number">ПРОЕКТ / 001</span>
        </div>

        <article className="project-card">
          <div className="project-toolbar">
            <div className="project-heading">
              <span className="project-icon">
                <Icon name="folder" size={23} />
              </span>
              <div>
                <div className="project-label">ДИЗАЙН И АЙДЕНТИКА</div>
                <h2>{title}</h2>
              </div>
            </div>
            <DropdownMenu
              open={menuOpen}
              onOpenToggle={setMenuOpen}
              size="l"
              popupProps={{
                placement: "bottom-end",
                offset: 8,
                className: "actions-popup",
              }}
              renderSwitcher={(props) => (
                <Button
                  {...props}
                  size="l"
                  view="normal"
                  className={`actions-button ${menuOpen ? "is-open" : ""}`}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="actions-button-content">
                    Действия
                    <Icon name="chevron" size={16} />
                  </span>
                </Button>
              )}
              items={[
                [
                  {
                    text: "Редактировать",
                    iconStart: <Icon name="edit" />,
                    action: () => {
                      setDraft(title);
                      setEditing(true);
                    },
                  },
                  {
                    text: "Создать копию",
                    iconStart: <Icon name="copy" />,
                    action: () => {
                      const copy = `${title} — копия${copies.length ? ` ${copies.length + 1}` : ""}`;
                      setCopies([...copies, copy]);
                      notify("Копия проекта создана");
                    },
                  },
                ],
                [
                  {
                    text: "Скопировать ссылку",
                    iconStart: <Icon name="link" />,
                    action: async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `${location.origin}${location.pathname}#project-001`,
                        );
                        notify("Ссылка на проект скопирована");
                      } catch {
                        notify(
                          "Не удалось скопировать ссылку. Попробуйте ещё раз.",
                        );
                      }
                    },
                  },
                  {
                    text: "Скачать проект",
                    iconStart: <Icon name="download" />,
                    action: download,
                  },
                ],
                [
                  {
                    text: archived ? "Вернуть из архива" : "Архивировать",
                    iconStart: <Icon name="archive" />,
                    action: () => {
                      setArchived(!archived);
                      notify(
                        archived
                          ? "Проект возвращён в работу"
                          : "Проект перемещён в архив",
                      );
                    },
                  },
                ],
              ]}
            />
          </div>

          <div
            className="project-art"
            role="img"
            aria-label="Обложка проекта Forma: геометрическая зелёная композиция"
          >
            <div className="art-copy">
              <span className="art-kicker">НЕЗАВИСИМАЯ ДИЗАЙН-СТУДИЯ</span>
              <span className="forma-word">
                forma<span>®</span>
              </span>
              <span className="art-caption">Придаём идеям форму.</span>
            </div>
            <div className="art-shapes">
              <div className="shape-circle" />
              <div className="shape-arch" />
              <div className="shape-square" />
              <div className="shape-small-circle" />
            </div>
            <div className="art-bottom">
              <span>BRAND IDENTITY — 2026</span>
              <span>
                Идея. Характер. Форма. <Icon name="arrow" size={17} />
              </span>
            </div>
          </div>

          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">Статус</span>
              <span className={`status ${archived ? "archived" : ""}`}>
                <span />
                {archived ? "В архиве" : "В работе"}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Дата создания</span>
              <span className="meta-value">20 октября 2026</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Участники</span>
              <div className="mini-team">
                <span className="mini-avatar avatar-one">АС</span>
                <span className="mini-avatar avatar-two">МВ</span>
                <span className="mini-avatar avatar-three">ЕБ</span>
                <span className="team-count">3 человека</span>
              </div>
            </div>
            <div className="meta-item update-meta">
              <span className="meta-label">Обновлено</span>
              <span className="meta-value">Сегодня, 10:42</span>
            </div>
          </div>
        </article>

        <div className="details-grid">
          <section className="description-panel">
            <div className="section-heading">
              <span className="section-mark" />
              <h3>О проекте</h3>
            </div>
            <p>
              Создаём визуальный язык независимой дизайн-студии. От идеи и
              стратегии до айдентики, которая говорит сама за себя.
            </p>
            <div className="tags">
              <span>Брендинг</span>
              <span>Дизайн</span>
              <span>Стратегия</span>
            </div>
          </section>
          <section className="owner-panel">
            <div className="section-heading">
              <span className="section-mark" />
              <h3>Ответственный</h3>
            </div>
            <div className="owner">
              <span className="owner-avatar">АС</span>
              <div>
                <strong>Анна Смирнова</strong>
                <span>Арт-директор</span>
              </div>
              <span className="owner-badge">Владелец</span>
            </div>
          </section>
        </div>
        {copies.length > 0 && (
          <section className="copies-panel">
            <h3>Копии проекта</h3>
            {copies.map((copy) => (
              <div className="copy-row" key={copy}>
                <Icon name="folder" />
                <span>{copy}</span>
                <span className="copy-tag">Новый проект</span>
              </div>
            ))}
          </section>
        )}
        <footer>
          <span className="footer-dot" />
          Больше порядка. Больше пространства для идей.
          <span className="footer-brand">Сделано в деле.</span>
        </footer>
      </main>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        aria-labelledby="edit-title"
      >
        <form
          className="edit-modal"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            setTitle(draft.trim());
            setEditing(false);
            notify("Название проекта сохранено");
          }}
        >
          <div className="modal-heading">
            <h2 id="edit-title">Редактировать проект</h2>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setEditing(false)}
            >
              <Icon name="close" />
            </Button>
          </div>
          <label htmlFor="project-title">Название проекта</label>
          <TextInput
            id="project-title"
            value={draft}
            onUpdate={setDraft}
            autoFocus
            size="l"
            controlProps={{ maxLength: 100 }}
          />
          <div className="modal-buttons">
            <Button size="l" onClick={() => setEditing(false)}>
              Отмена
            </Button>
            <Button
              className="save-button"
              size="l"
              type="submit"
              disabled={!draft.trim()}
            >
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={15} />
          </span>
          {notice}
          <button
            aria-label="Закрыть уведомление"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
