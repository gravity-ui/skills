import { useEffect, useState } from "react";
import { Button, DropdownMenu, Icon, Modal } from "@gravity-ui/uikit";
import {
  ArrowDownToLine,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleQuestion,
  Clock,
  Copy,
  FileText,
  Folder,
  Link,
  Pencil,
  Plus,
  Star,
  StarFill,
  TrashBin,
  Xmark,
} from "@gravity-ui/icons";
import "./styles.css";

type Document = {
  id: number;
  title: string;
  description: string;
  favorite: boolean;
  completed: boolean[];
};
const initialDocuments: Document[] = [
  {
    id: 1,
    title: "План запуска проекта",
    description:
      "Общий план, ключевые этапы и всё, что нужно для успешного запуска.",
    favorite: false,
    completed: [true, true, false],
  },
  {
    id: 2,
    title: "Заметки со встречи",
    description: "Итоги обсуждения с командой и следующие шаги.",
    favorite: true,
    completed: [true, false, false],
  },
  {
    id: 3,
    title: "Идеи и вдохновение",
    description: "Собираем интересные находки и идеи для нашего проекта.",
    favorite: false,
    completed: [false, false, false],
  },
];
const icon = (data: typeof FileText, size = 18) => (
  <Icon data={data} size={size} />
);

export function App() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("prostranstvo-documents") || "null",
      );
      if (
        Array.isArray(saved) &&
        saved.every(
          (item) =>
            typeof item.id === "number" &&
            typeof item.title === "string" &&
            typeof item.description === "string" &&
            typeof item.favorite === "boolean" &&
            Array.isArray(item.completed) &&
            item.completed.length === 3 &&
            item.completed.every((step: unknown) => typeof step === "boolean"),
        )
      )
        return saved;
    } catch {
      /* Start with sample documents if browser storage is unavailable. */
    }
    return initialDocuments;
  });
  const [selected, setSelected] = useState(
    () => Number(location.hash.replace("#document-", "")) || 1,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState<"edit" | "new" | "delete" | "help" | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const doc = documents.find((item) => item.id === selected);
  const completed = doc?.completed || [false, false, false];
  const visibleDocuments = documents.filter(
    (item) => filter !== "favorites" || item.favorite,
  );

  useEffect(() => {
    try {
      localStorage.setItem("prostranstvo-documents", JSON.stringify(documents));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [documents]);
  useEffect(() => {
    const followLink = () => {
      const id = Number(location.hash.replace("#document-", ""));
      if (id) setSelected(id);
    };
    window.addEventListener("hashchange", followLink);
    return () => window.removeEventListener("hashchange", followLink);
  }, []);
  function setCompleted(update: (items: boolean[]) => boolean[]) {
    setDocuments((items) =>
      items.map((item) =>
        item.id === selected
          ? { ...item, completed: update(item.completed) }
          : item,
      ),
    );
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function openEditor(isNew = false) {
    setTitle(isNew ? "" : doc?.title || "");
    setDescription(isNew ? "" : doc?.description || "");
    setModal(isNew ? "new" : "edit");
  }
  function saveDocument() {
    if (!title.trim()) return;
    if (modal === "new") {
      const id = Date.now();
      setDocuments((items) => [
        ...items,
        {
          id,
          title: title.trim(),
          description: description.trim(),
          favorite: false,
          completed: [false, false, false],
        },
      ]);
      setSelected(id);
      setFilter("all");
    } else {
      setDocuments((items) =>
        items.map((item) =>
          item.id === selected
            ? { ...item, title: title.trim(), description: description.trim() }
            : item,
        ),
      );
    }
    setModal(null);
    setToast("Документ сохранён");
  }
  function duplicate() {
    if (!doc) return;
    const id = Date.now();
    setDocuments((items) => [
      ...items,
      { ...doc, id, title: `${doc.title} — копия`, favorite: false },
    ]);
    setSelected(id);
    setFilter("all");
    setToast("Копия документа создана");
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${location.origin}${location.pathname}#document-${selected}`,
      );
      setToast("Ссылка скопирована");
    } catch {
      setToast("Не удалось скопировать ссылку. Попробуйте ещё раз.");
    }
  }
  function download() {
    if (!doc) return;
    const content = `# ${doc.title}\n\n${doc.description}\n\n## О проекте\nСоздаём удобный и понятный продукт, который помогает команде работать вместе.\n\n## Ключевые этапы\n${["Определить цели и задачи", "Собрать команду проекта", "Подготовить первый прототип"].map((text, index) => `- [${completed[index] ? "x" : " "}] ${text}`).join("\n")}`;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/markdown;charset=utf-8" }),
    );
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${doc.title}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Документ скачан");
  }
  function toggleFavorite() {
    setDocuments((items) =>
      items.map((item) =>
        item.id === selected ? { ...item, favorite: !item.favorite } : item,
      ),
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Пространство — главная">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          пространство<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <div className="workspace-avatar">С</div>
          <div>
            <strong>Студия</strong>
            <span>Рабочее пространство</span>
          </div>
          <span className="workspace-indicator" />
        </div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Навигация">
          <button
            className={filter === "all" ? "nav-item active" : "nav-item"}
            onClick={() => setFilter("all")}
          >
            {icon(Folder)}
            <span>Все документы</span>
            <span className="nav-count">{documents.length}</span>
          </button>
          <button
            className={filter === "favorites" ? "nav-item active" : "nav-item"}
            onClick={() => setFilter("favorites")}
          >
            {icon(Star)}
            <span>Избранное</span>
          </button>
          <button
            className={filter === "recent" ? "nav-item active" : "nav-item"}
            onClick={() => setFilter("recent")}
          >
            {icon(Clock)}
            <span>Недавние</span>
          </button>
        </nav>
        <div className="nav-label document-label">
          ДОКУМЕНТЫ
          <button
            className="bare-icon"
            aria-label="Новый документ"
            onClick={() => openEditor(true)}
          >
            {icon(Plus, 15)}
          </button>
        </div>
        <div className="document-nav">
          {(filter === "recent"
            ? [...visibleDocuments].reverse()
            : visibleDocuments
          ).map((item) => (
            <button
              key={item.id}
              className={`document-link ${selected === item.id ? "selected" : ""}`}
              onClick={() => {
                setSelected(item.id);
                setMenuOpen(false);
              }}
            >
              {icon(FileText, 16)}
              <span>{item.title}</span>
            </button>
          ))}
          {visibleDocuments.length === 0 && (
            <p className="nav-empty">Пока нет избранных документов</p>
          )}
        </div>
        <div className="sidebar-bottom">
          <button className="help-link" onClick={() => setModal("help")}>
            {icon(CircleQuestion)}Помощь и поддержка
          </button>
          <div className="profile">
            <span className="avatar avatar-purple">АК</span>
            <div>
              <strong>Александр Ким</strong>
              <span>Личное пространство</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            {icon(Folder, 16)}
            <button onClick={() => setFilter("all")}>Документы</button>
            {icon(ChevronRight, 13)}
            <span>{doc?.title || "Все документы"}</span>
          </div>
          <div className="topbar-right">
            <span className="workspace-top-label">Рабочее пространство</span>
            <span className="avatar top-avatar">АК</span>
          </div>
        </header>
        <main>
          <button
            className="back-link"
            onClick={() => {
              setFilter("all");
              setSelected(documents[0]?.id || 0);
            }}
          >
            {icon(ArrowLeft, 15)}Все документы
          </button>
          {doc ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ДОКУМЕНТ КОМАНДЫ</div>
                  <h1>{doc.title}</h1>
                  <p className="page-description">
                    Хорошие идеи начинаются с понятного плана.
                  </p>
                </div>
                <div className="heading-actions">
                  <button
                    className={`favorite-button ${doc.favorite ? "is-favorite" : ""}`}
                    aria-label={
                      doc.favorite
                        ? "Убрать из избранного"
                        : "Добавить в избранное"
                    }
                    aria-pressed={doc.favorite}
                    onClick={toggleFavorite}
                  >
                    {icon(doc.favorite ? StarFill : Star, 19)}
                  </button>
                  <DropdownMenu
                    open={menuOpen}
                    onOpenToggle={setMenuOpen}
                    size="l"
                    popupProps={{
                      placement: "bottom-end",
                      offset: 8,
                      className: "actions-popup",
                    }}
                    menuProps={{ "aria-label": "Действия с документом" }}
                    renderSwitcher={(props) => (
                      <Button
                        {...props}
                        className={`actions-button ${menuOpen ? "is-open" : ""}`}
                        view="action"
                        size="l"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                      >
                        {icon(Plus, 16)}
                        <span>Действия</span>
                        <span
                          className={`dropdown-arrow ${menuOpen ? "rotated" : ""}`}
                        >
                          {icon(ChevronDown, 13)}
                        </span>
                      </Button>
                    )}
                    items={[
                      {
                        text: "Редактировать",
                        iconStart: icon(Pencil, 17),
                        action: () => openEditor(),
                      },
                      {
                        text: "Создать копию",
                        iconStart: icon(Copy, 17),
                        action: duplicate,
                      },
                      {
                        text: "Копировать ссылку",
                        iconStart: icon(Link, 17),
                        action: () => {
                          void copyLink();
                        },
                      },
                      {
                        text: "Скачать документ",
                        iconStart: icon(ArrowDownToLine, 17),
                        action: download,
                      },
                      {
                        text: "Удалить документ",
                        iconStart: icon(TrashBin, 17),
                        className: "delete-menu-item",
                        theme: "danger",
                        action: () => setModal("delete"),
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="document-meta">
                <span className="status">
                  <span />В работе
                </span>
                <span className="meta-divider" />
                <span className="mini-avatar">АК</span>
                <span>Александр Ким</span>
                <span className="meta-dot">·</span>
                <span>Обновлено сегодня</span>
              </div>
              <div className="content-layout">
                <article className="document-card">
                  <div className="document-cover">
                    <div className="cover-grid" />
                    <span className="cover-orbit orbit-one" />
                    <span className="cover-orbit orbit-two" />
                    <span className="cover-orbit orbit-three" />
                    <span className="cover-caption">ОТ ИДЕИ К РЕЗУЛЬТАТУ</span>
                    <div className="cover-graphic">
                      <div className="graphic-card graphic-back" />
                      <div className="graphic-card graphic-front">
                        <span />
                        <span />
                        <span />
                        <div className="graphic-check">✓</div>
                      </div>
                      <span className="spark spark-one">✦</span>
                      <span className="spark spark-two">✦</span>
                    </div>
                  </div>
                  <div className="document-body">
                    <div className="doc-icon">{icon(FileText, 25)}</div>
                    <h2>{doc.title}</h2>
                    <p className="document-description">{doc.description}</p>
                    <div className="document-rule" />
                    <h3>О проекте</h3>
                    <p>
                      Создаём удобный и понятный продукт, который помогает
                      команде работать вместе. Этот документ — наша отправная
                      точка: здесь собраны цели, основные этапы и следующие
                      шаги.
                    </p>
                    <div className="callout">
                      <span className="callout-spark">✦</span>
                      <div>
                        <strong>Наша цель</strong>
                        <p>
                          Превратить идею в результат, которым будет гордиться
                          вся команда.
                        </p>
                      </div>
                    </div>
                    <h3 className="milestones-title">
                      Ключевые этапы{" "}
                      <span>{completed.filter(Boolean).length} из 3</span>
                    </h3>
                    <div className="checklist">
                      {[
                        "Определить цели и задачи",
                        "Собрать команду проекта",
                        "Подготовить первый прототип",
                      ].map((text, index) => (
                        <label
                          key={text}
                          className={
                            completed[index] ? "task completed" : "task"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={completed[index]}
                            onChange={() =>
                              setCompleted((items) =>
                                items.map((item, position) =>
                                  position === index ? !item : item,
                                ),
                              )
                            }
                          />
                          <span>{text}</span>
                        </label>
                      ))}
                    </div>
                    <div className="doc-footer">
                      {icon(Clock, 14)}Последнее изменение сегодня в 12:40
                    </div>
                  </div>
                </article>
                <aside className="details">
                  <section className="details-section">
                    <h3>О документе</h3>
                    <dl>
                      <dt>Создал</dt>
                      <dd>
                        <span className="mini-avatar">АК</span>Александр Ким
                      </dd>
                      <dt>Дата создания</dt>
                      <dd>24 октября 2026</dd>
                      <dt>Пространство</dt>
                      <dd>{icon(Folder, 14)}Студия</dd>
                      <dt>Статус</dt>
                      <dd>
                        <span className="small-status">
                          <span />В работе
                        </span>
                      </dd>
                    </dl>
                  </section>
                  <section className="details-section participants">
                    <h3>
                      Участники <span>3</span>
                    </h3>
                    <div className="participant-avatars">
                      <span
                        className="avatar avatar-purple"
                        title="Александр Ким"
                      >
                        АК
                      </span>
                      <span
                        className="avatar avatar-peach"
                        title="Мария Иванова"
                      >
                        МИ
                      </span>
                      <span
                        className="avatar avatar-green"
                        title="Даниил Смирнов"
                      >
                        ДС
                      </span>
                    </div>
                    <p>Вместе получается больше.</p>
                  </section>
                  <div className="hint-card">
                    <div className="hint-icon">{icon(CircleQuestion, 18)}</div>
                    <strong>Всё под рукой</strong>
                    <p>
                      Редактируйте, делитесь или создавайте копию документа
                      через меню «Действия».
                    </p>
                    <span>Одна кнопка — много возможностей.</span>
                  </div>
                </aside>
              </div>
              <div className="page-footer">
                <span>
                  {icon(CircleCheck, 14)}
                  {storageError
                    ? "Изменения доступны до перезагрузки страницы"
                    : "Все изменения сохранены в браузере"}
                </span>
                <span>Сделано для совместной работы</span>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">{icon(FileText, 32)}</span>
              <h1>Здесь будет ваш следующий план</h1>
              <p>Создайте документ, чтобы собрать идеи в одном месте.</p>
              <Button view="action" size="l" onClick={() => openEditor(true)}>
                {icon(Plus, 16)} Создать документ
              </Button>
            </div>
          )}
        </main>
      </div>
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        aria-labelledby="modal-title"
        contentClassName="dialog"
      >
        <button
          className="dialog-close bare-icon"
          aria-label="Закрыть"
          onClick={() => setModal(null)}
        >
          {icon(Xmark)}
        </button>
        {(modal === "edit" || modal === "new") && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveDocument();
            }}
          >
            <div className="dialog-symbol">{icon(FileText, 24)}</div>
            <h2 id="modal-title">
              {modal === "new" ? "Новый документ" : "Редактировать документ"}
            </h2>
            <p>Дайте идеям название и добавьте немного контекста.</p>
            <label className="form-field">
              Название
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Название документа"
                required
                maxLength={100}
              />
            </label>
            <label className="form-field">
              Описание
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="О чём этот документ?"
                rows={3}
              />
            </label>
            <div className="dialog-actions">
              <Button size="l" onClick={() => setModal(null)}>
                Отмена
              </Button>
              <Button
                type="submit"
                size="l"
                view="action"
                disabled={!title.trim()}
              >
                Сохранить
              </Button>
            </div>
          </form>
        )}
        {modal === "delete" && (
          <>
            <div className="dialog-symbol danger-symbol">
              {icon(TrashBin, 24)}
            </div>
            <h2 id="modal-title">Удалить документ?</h2>
            <p>Документ «{doc?.title}» будет удалён из пространства.</p>
            <div className="dialog-actions">
              <Button size="l" onClick={() => setModal(null)}>
                Отмена
              </Button>
              <Button
                size="l"
                view="outlined-danger"
                onClick={() => {
                  const remaining = documents.filter(
                    (item) => item.id !== selected,
                  );
                  setDocuments(remaining);
                  setSelected(remaining[0]?.id || 0);
                  setModal(null);
                  setToast("Документ удалён");
                }}
              >
                Удалить
              </Button>
            </div>
          </>
        )}
        {modal === "help" && (
          <>
            <div className="dialog-symbol">{icon(CircleQuestion, 24)}</div>
            <h2 id="modal-title">Ваше пространство для идей</h2>
            <p>
              Выберите документ слева или создайте новый кнопкой «+». В меню
              «Действия» можно изменить документ, создать копию, скопировать
              ссылку, скачать или удалить его.
            </p>
            <p>
              Добавляйте важное в избранное звёздочкой и отмечайте выполненные
              этапы прямо в документе.
            </p>
            <div className="dialog-actions">
              <Button view="action" size="l" onClick={() => setModal(null)}>
                Понятно
              </Button>
            </div>
          </>
        )}
      </Modal>
      {toast && (
        <div className="toast" role="status">
          {icon(CircleCheck, 19)}
          {toast}
          <button
            className="bare-icon"
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            {icon(Xmark, 14)}
          </button>
        </div>
      )}
    </div>
  );
}
