import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button, TextArea, TextInput } from "@gravity-ui/uikit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

const example = `## Идеи, которыми хочется поделиться

Хороший текст начинается с **одной простой мысли**.
Добавьте немного *вдохновения* — и продолжайте писать.

### План на сегодня
- Собрать интересные идеи
- Записать самое важное
- Поделиться результатом

> Не бойтесь чистого листа. Просто начните.

Подробнее о [Markdown](https://www.markdownguide.org/).

Небольшой фрагмент кода: \`hello, world\`.
`;

function DocumentIcon({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 18 : 24}
      height={small ? 18 : 24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v6h6M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function App() {
  const [savedNote] = useState(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("markdown-note") || "null",
      );
      if (
        saved &&
        typeof saved === "object" &&
        "title" in saved &&
        "markdown" in saved &&
        typeof saved.title === "string" &&
        typeof saved.markdown === "string"
      )
        return { title: saved.title, markdown: saved.markdown };
    } catch {
      /* Start with an empty form if storage is unavailable. */
    }
    return { title: "", markdown: "" };
  });
  const [title, setTitle] = useState(savedNote.title);
  const [markdown, setMarkdown] = useState(savedNote.markdown);
  const [showHelp, setShowHelp] = useState(false);
  const [status, setStatus] = useState("");
  const editor = useRef<HTMLTextAreaElement>(null);
  const words = markdown.trim() ? markdown.trim().split(/\s+/u).length : 0;

  function updateMarkdown(value: string) {
    setMarkdown(value);
    setStatus("");
  }

  function insert(
    before: string,
    after = "",
    fallback = "текст",
    line = false,
  ) {
    const control = editor.current;
    if (!control) return;
    const start = control.selectionStart;
    const end = control.selectionEnd;
    const selected = markdown.slice(start, end) || fallback;
    const prefix =
      line && start > 0 && markdown[start - 1] !== "\n" ? "\n" : "";
    const text =
      prefix +
      before +
      (line ? selected.split("\n").join("\n" + before) : selected) +
      after;
    updateMarkdown(markdown.slice(0, start) + text + markdown.slice(end));
    requestAnimationFrame(() => {
      control.focus();
      control.setSelectionRange(
        start + prefix.length + before.length,
        start + text.length - after.length,
      );
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      (event.ctrlKey || event.metaKey) &&
      ["b", "i", "k"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      const key = event.key.toLowerCase();
      if (key === "b") insert("**", "**");
      if (key === "i") insert("*", "*");
      if (key === "k") insert("[", "](https://example.com)", "название ссылки");
    }
  }

  function saveNote(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !markdown.trim()) {
      setStatus("Добавьте название и текст заметки.");
      return;
    }
    try {
      localStorage.setItem(
        "markdown-note",
        JSON.stringify({ title: title.trim(), markdown }),
      );
      setStatus("Заметка сохранена в этом браузере.");
    } catch {
      setStatus(
        "Не удалось сохранить заметку. Проверьте настройки хранилища браузера.",
      );
    }
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">
          <span className="brand-icon">
            <DocumentIcon />
          </span>
          Заметки
          <span className="brand-divider" />
          <span className="workspace">Личное пространство</span>
        </div>
        <span className="avatar" aria-label="Личный профиль">
          Я
        </span>
      </header>
      <main className="main">
        <div className="breadcrumb">
          Мои заметки<span>/</span>
          <span>Новая заметка</span>
        </div>
        <div className="page-heading">
          <div>
            <div className="eyebrow">ПРОСТРАНСТВО ДЛЯ ВАШИХ МЫСЛЕЙ</div>
            <h1>Начните с одной мысли</h1>
            <p>Пишите, оформляйте и сразу смотрите, что получается.</p>
          </div>
          <span className="heading-decoration" aria-hidden="true">
            ✳
          </span>
        </div>
        <form className="note-form" onSubmit={saveNote}>
          <div className="form-heading">
            <div className="form-title">
              <DocumentIcon small />
              <h2>Новая заметка</h2>
            </div>
            <span className="draft-badge">
              <span />
              Черновик
            </span>
          </div>
          <div className="title-field">
            <label htmlFor="note-title">Название</label>
            <TextInput
              id="note-title"
              name="title"
              size="xl"
              value={title}
              onUpdate={(value) => {
                setTitle(value);
                setStatus("");
              }}
              placeholder="О чём будет ваша заметка?"
              controlProps={{ required: true, maxLength: 200 }}
            />
          </div>
          <div className="content-label">
            <label htmlFor="note-content">Текст заметки</label>
            <span className="markdown-badge">
              M↓<span>Markdown</span>
            </span>
          </div>
          <div className="editor-shell">
            <div className="editor-pane">
              <div className="pane-heading">
                <span className="pane-title">
                  <span aria-hidden="true">↗</span>Редактор
                </span>
                <Button
                  view="flat-secondary"
                  size="s"
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  aria-expanded={showHelp}
                  aria-controls="markdown-help"
                >
                  {showHelp ? "Скрыть подсказки" : "Подсказки"}
                  <span className="help-icon" aria-hidden="true">
                    ?
                  </span>
                </Button>
              </div>
              <div
                className="toolbar"
                role="group"
                aria-label="Форматирование Markdown"
              >
                <Button
                  type="button"
                  view="flat"
                  onClick={() => insert("**", "**")}
                  title="Жирный (Ctrl/⌘ + B)"
                  aria-label="Жирный"
                >
                  <b>B</b>
                </Button>
                <Button
                  type="button"
                  view="flat"
                  onClick={() => insert("*", "*")}
                  title="Курсив (Ctrl/⌘ + I)"
                  aria-label="Курсив"
                >
                  <i>I</i>
                </Button>
                <Button
                  type="button"
                  view="flat"
                  onClick={() => insert("## ", "", "Заголовок", true)}
                  title="Заголовок"
                  aria-label="Заголовок"
                >
                  <b>H₂</b>
                </Button>
                <span className="toolbar-divider" />
                <Button
                  type="button"
                  view="flat"
                  onClick={() =>
                    insert("[", "](https://example.com)", "название ссылки")
                  }
                  title="Ссылка (Ctrl/⌘ + K)"
                  aria-label="Ссылка"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
                      transform="translate(2 0)"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </Button>
                <Button
                  type="button"
                  view="flat"
                  onClick={() => insert("- ", "", "Пункт списка", true)}
                  title="Маркированный список"
                  aria-label="Маркированный список"
                >
                  ☷
                </Button>
                <Button
                  type="button"
                  view="flat"
                  onClick={() => insert("> ", "", "Цитата", true)}
                  title="Цитата"
                  aria-label="Цитата"
                >
                  <span className="quote-icon">“</span>
                </Button>
                <Button
                  type="button"
                  view="flat"
                  onClick={() => insert("`", "`", "код")}
                  title="Код"
                  aria-label="Код"
                >
                  <span className="code-icon">&lt;/&gt;</span>
                </Button>
              </div>
              {showHelp && (
                <div className="markdown-help" id="markdown-help">
                  <strong>Быстрая подсказка</strong>
                  <span>
                    <code>**жирный**</code> · <code>*курсив*</code> ·{" "}
                    <code>## Заголовок</code>
                  </span>
                  <span>
                    <code>- пункт списка</code> ·{" "}
                    <code>[ссылка](https://...)</code>
                  </span>
                  <span>
                    <code>&gt; цитата</code> · <code>`код`</code> ·{" "}
                    <code>```</code> для блока кода
                  </span>
                </div>
              )}
              <TextArea
                id="note-content"
                name="markdown"
                className="markdown-input"
                view="clear"
                controlRef={editor}
                value={markdown}
                onUpdate={updateMarkdown}
                onKeyDown={handleKeyDown}
                rows={17}
                placeholder={
                  "Начните писать здесь…\n\n## Добавьте заголовок\nВыделите **главное** или составьте список.\n\nВаш текст оживёт справа →"
                }
                controlProps={{
                  required: true,
                  "aria-describedby": "editor-hint",
                  spellCheck: true,
                }}
              />
              <div className="editor-footer">
                <span>
                  {markdown.length.toLocaleString("ru-RU")} симв.{" "}
                  <span className="count-dot">·</span>{" "}
                  {words.toLocaleString("ru-RU")} слов
                </span>
                <Button
                  type="button"
                  size="s"
                  view="flat-secondary"
                  disabled={!!markdown}
                  onClick={() => updateMarkdown(example)}
                >
                  Вставить пример<span aria-hidden="true">↗</span>
                </Button>
              </div>
            </div>
            <section
              className="preview-pane"
              aria-label="Предпросмотр Markdown"
            >
              <div className="pane-heading">
                <span className="pane-title">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                  Предпросмотр
                </span>
                <span className="live-badge">
                  <span />В реальном времени
                </span>
              </div>
              {markdown.trim() ? (
                <div className="markdown-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml
                    components={{
                      a: ({ node, children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="empty-preview">
                  <div className="empty-document" aria-hidden="true">
                    <span>Aa</span>
                    <i />
                    <i />
                    <i />
                  </div>
                  <h3>Ваши мысли обретают форму</h3>
                  <p>
                    Начните писать в редакторе —<br />и здесь появится
                    оформленный текст.
                  </p>
                  <span className="empty-caption">
                    Каждое изменение видно сразу
                  </span>
                </div>
              )}
            </section>
          </div>
          <p className="editor-hint" id="editor-hint">
            <span className="hint-spark" aria-hidden="true">
              ✧
            </span>
            Используйте Markdown или кнопки на панели, чтобы оформить текст.
          </p>
          <div className="form-footer">
            <span className="save-note">Сохранение в этом браузере</span>
            <Button view="action" size="xl" type="submit">
              Сохранить заметку<span aria-hidden="true">↗</span>
            </Button>
          </div>
          {status && (
            <p className="save-status" role="status">
              {status}
            </p>
          )}
        </form>
        <footer className="page-footer">
          <span className="footer-dot" />
          Меньше отвлечений. Больше хороших мыслей.
        </footer>
      </main>
    </div>
  );
}
