import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Select,
  Switch,
  Text,
  TextInput,
} from "@gravity-ui/uikit";
import {
  MarkdownEditorView,
  useMarkdownEditor,
} from "@gravity-ui/markdown-editor";
import { YfmStaticView } from "@gravity-ui/markdown-editor/view";
import "@diplodoc/transform/dist/css/yfm.css";
import { renderMarkdown } from "./markdown";
import "./App.css";

const initialMarkdown = `## Хорошие идеи начинаются с заметки

Соберите мысли в одном месте. Добавьте **важные детали**,
выделите *главное* и превратите идею в понятный план.

### Что дальше?

- Опишите свою идею
- Добавьте детали и полезные ссылки
- Поделитесь результатом с командой

> Не обязательно писать идеально. Просто начните.

Больше возможностей — в [руководстве по Markdown](https://www.markdownguide.org/basic-syntax/).
`;
const storageKey = "workspace-markdown-note";
type Note = { title: string; category: string; markdown: string };
const emptyNote: Note = {
  title: "",
  category: "ideas",
  markdown: initialMarkdown,
};

function readNote(): Note {
  try {
    const note = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      note &&
      typeof note.title === "string" &&
      typeof note.markdown === "string" &&
      ["ideas", "work", "personal"].includes(note.category)
    )
      return note;
  } catch {
    /* Keep the form available if storage is inaccessible. */
  }
  return emptyNote;
}

export function App() {
  const [original, setOriginal] = useState(readNote);
  const [title, setTitle] = useState(original.title);
  const [category, setCategory] = useState(original.category);
  const [markdown, setMarkdown] = useState(original.markdown);
  const [mode, setMode] = useState<"markup" | "wysiwyg">("markup");
  const [showPreview, setShowPreview] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState("");
  const editor = useMarkdownEditor({
    preset: "commonmark",
    md: { html: false, linkify: false },
    initial: { mode: "markup", markup: original.markdown },
    markupConfig: { placeholder: "Начните писать… Результат появится справа." },
    wysiwygConfig: { placeholderOptions: { value: "Начните писать…" } },
  });

  useEffect(() => {
    const onChange = () => {
      setMarkdown(editor.getValue());
      setStatus("");
    };
    editor.on("change", onChange);
    return () => {
      editor.off("change", onChange);
    };
  }, [editor]);

  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  const dirty =
    title !== original.title ||
    category !== original.category ||
    markdown !== original.markdown;
  const words = markdown.trim() ? markdown.trim().split(/\s+/u).length : 0;

  function save() {
    setAttempted(true);
    const value = editor.getValue();
    if (!title.trim() || !value.trim()) {
      setStatus("Заполните название и текст заметки.");
      if (!title.trim()) document.getElementById("note-title")?.focus();
      else editor.focus();
      return;
    }
    const note = { title: title.trim(), category, markdown: value };
    try {
      localStorage.setItem(storageKey, JSON.stringify(note));
      setOriginal(note);
      setTitle(note.title);
      setStatus("Заметка сохранена в этом браузере.");
    } catch {
      setStatus(
        "Не удалось сохранить заметку. Проверьте доступ к хранилищу браузера и попробуйте ещё раз.",
      );
    }
  }

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function changeMode(next: typeof mode) {
    editor.setEditorMode(next);
    setMode(next);
  }

  function reset() {
    setTitle(original.title);
    setCategory(original.category);
    editor.replace(original.markdown);
    setMarkdown(original.markdown);
    setAttempted(false);
    setStatus("Изменения отменены.");
    setResetOpen(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            п.
          </span>
          <Text variant="subheader-3">пространство</Text>
        </div>
        <div className="header-end">
          <Text color="secondary" className="workspace-name">
            Личное пространство
          </Text>
          <span className="profile" aria-label="Ваш профиль">
            ВЫ
          </span>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumb">
          <span>Мои заметки</span>
          <span aria-hidden="true">/</span>
          <span>Новая заметка</span>
        </div>
        <div className="page-heading">
          <div>
            <div className="title-row">
              <Text as="h1" variant="display-1">
                Новая заметка
              </Text>
              <span className="draft-badge">Черновик</span>
            </div>
            <Text as="p" variant="body-2" color="secondary">
              Место для ваших идей, планов и важных деталей.
            </Text>
          </div>
          <Button view="flat" size="l" onClick={() => setHelpOpen(true)}>
            <span className="help-symbol" aria-hidden="true">
              ?
            </span>{" "}
            Как это работает
          </Button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          noValidate
        >
          <section className="form-card" aria-label="Новая заметка">
            <div className="card-heading">
              <span className="section-number">01</span>
              <Text variant="subheader-2">Основное</Text>
              <Text color="secondary" className="card-heading-hint">
                Начните с самого важного
              </Text>
            </div>
            <div className="metadata">
              <div className="field">
                <label htmlFor="note-title">
                  Название <span className="required">*</span>
                </label>
                <TextInput
                  id="note-title"
                  size="xl"
                  placeholder="Дайте вашей идее название"
                  value={title}
                  onUpdate={(value) => {
                    setTitle(value);
                    setStatus("");
                  }}
                  validationState={
                    attempted && !title.trim() ? "invalid" : undefined
                  }
                  errorMessage={
                    attempted && !title.trim()
                      ? "Введите название заметки"
                      : undefined
                  }
                  controlProps={{ maxLength: 160, "aria-required": true }}
                />
              </div>
              <div className="field">
                <label htmlFor="note-category">Категория</label>
                <Select
                  id="note-category"
                  size="xl"
                  width="max"
                  value={[category]}
                  onUpdate={([value]) => {
                    setCategory(value);
                    setStatus("");
                  }}
                  options={[
                    { value: "ideas", content: "Идеи и вдохновение" },
                    { value: "work", content: "Рабочие заметки" },
                    { value: "personal", content: "Личное" },
                  ]}
                />
              </div>
            </div>
            <div className="content-heading">
              <div className="content-label">
                <label id="content-label">
                  Текст заметки <span className="required">*</span>
                </label>
                <span className="markdown-badge">Markdown</span>
              </div>
              <Button
                view="flat-secondary"
                size="s"
                onClick={() => setHelpOpen(true)}
              >
                Справка по разметке <span aria-hidden="true">↗</span>
              </Button>
            </div>
            <div
              className={`editor-frame${attempted && !markdown.trim() ? " editor-frame-invalid" : ""}`}
            >
              <div className="editor-controls">
                <div
                  className="mode-tabs"
                  role="group"
                  aria-label="Режим редактора"
                >
                  <Button
                    size="m"
                    view={mode === "markup" ? "raised" : "flat-secondary"}
                    selected={mode === "markup"}
                    onClick={() => changeMode("markup")}
                    aria-pressed={mode === "markup"}
                  >
                    Markdown
                  </Button>
                  <Button
                    size="m"
                    view={mode === "wysiwyg" ? "raised" : "flat-secondary"}
                    selected={mode === "wysiwyg"}
                    onClick={() => changeMode("wysiwyg")}
                    aria-pressed={mode === "wysiwyg"}
                  >
                    Визуальный
                  </Button>
                </div>
                <Switch
                  size="m"
                  checked={showPreview}
                  onUpdate={setShowPreview}
                >
                  Предпросмотр
                </Switch>
              </div>
              <div
                className={`editor-grid${showPreview ? "" : " editor-grid-single"}`}
              >
                <div
                  className="source-pane"
                  role="group"
                  aria-labelledby="content-label"
                  aria-describedby="markdown-hint"
                >
                  <MarkdownEditorView
                    editor={editor}
                    stickyToolbar={false}
                    settingsVisible={false}
                    className="note-editor"
                  />
                </div>
                {showPreview && (
                  <section
                    className="preview-pane"
                    aria-label="Предпросмотр заметки"
                  >
                    <div className="preview-heading">
                      <Text variant="caption-2" color="secondary">
                        ПРЕДПРОСМОТР
                      </Text>
                      <span className="live-status">
                        <span className="live-dot" />В реальном времени
                      </span>
                    </div>
                    <div className="preview-content">
                      {markdown.trim() ? (
                        <YfmStaticView html={html} className="note-preview" />
                      ) : (
                        <div className="empty-preview">
                          <Text variant="subheader-2">
                            Здесь появится ваша заметка
                          </Text>
                          <Text as="p" color="secondary">
                            Начните писать — и сразу увидите результат.
                          </Text>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
              <div className="editor-footer">
                <span>Markdown помогает сосредоточиться на содержании</span>
                <span>
                  {words} слов <span className="count-separator">·</span>{" "}
                  {markdown.length} символов
                </span>
              </div>
            </div>
            {attempted && !markdown.trim() && (
              <Text as="p" color="danger" role="alert">
                Добавьте текст заметки
              </Text>
            )}
            <div className="field-hint" id="markdown-hint">
              <span className="tip-mark" aria-hidden="true">
                i
              </span>
              <span>
                Пишите с разметкой — форматирование появится автоматически.
                Попробуйте <code>**жирный**</code>, <code>*курсив*</code> или{" "}
                <code># Заголовок</code>.
              </span>
            </div>
          </section>
          <div className="form-actions">
            <div className="save-info">
              <span className="storage-mark" aria-hidden="true">
                ◷
              </span>
              <Text color="secondary">
                Заметка будет сохранена в этом браузере
              </Text>
            </div>
            <div className="action-buttons">
              <Button
                size="xl"
                view="outlined"
                disabled={!dirty}
                onClick={() => setResetOpen(true)}
              >
                Отменить
              </Button>
              <Button size="xl" view="action" type="submit">
                Сохранить заметку{" "}
                <span className="save-arrow" aria-hidden="true">
                  ↗
                </span>
              </Button>
            </div>
          </div>
          <div className="save-status" role="status">
            {status || (dirty ? "Есть несохранённые изменения" : "")}
          </div>
        </form>
        <footer className="page-footer">
          <span>Меньше отвлекающего. Больше ваших мыслей.</span>
          <span>Сделано для ясности</span>
        </footer>
      </main>
      <Modal
        open={helpOpen}
        onOpenChange={setHelpOpen}
        aria-labelledby="help-title"
      >
        <div className="help-dialog">
          <Text as="h2" id="help-title" variant="header-1">
            Немного разметки. Больше смысла.
          </Text>
          <Text as="p" color="secondary">
            Введите эти символы в режиме Markdown и посмотрите на результат
            справа.
          </Text>
          <table className="help-table">
            <thead>
              <tr>
                <th>Разметка</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>## Заголовок</code>
                </td>
                <td>
                  <strong>Заголовок раздела</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <code>**жирный**</code>
                </td>
                <td>
                  <strong>жирный</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <code>*курсив*</code>
                </td>
                <td>
                  <em>курсив</em>
                </td>
              </tr>
              <tr>
                <td>
                  <code>- Пункт списка</code>
                </td>
                <td>• Пункт списка</td>
              </tr>
              <tr>
                <td>
                  <code>[ссылка](https://example.com)</code>
                </td>
                <td>Ссылка на страницу</td>
              </tr>
              <tr>
                <td>
                  <code>&gt; Цитата</code>
                </td>
                <td>Блок цитаты</td>
              </tr>
              <tr>
                <td>
                  <code>`код`</code>
                </td>
                <td>
                  <code>код</code>
                </td>
              </tr>
            </tbody>
          </table>
          <Text as="p" color="secondary">
            Кнопки над текстом добавляют разметку к выделенному фрагменту. В
            визуальном режиме можно редактировать уже оформленный текст.
          </Text>
          <Button view="action" size="l" onClick={() => setHelpOpen(false)}>
            Всё понятно
          </Button>
        </div>
      </Modal>
      <Modal
        open={resetOpen}
        onOpenChange={setResetOpen}
        aria-labelledby="reset-title"
      >
        <div className="help-dialog">
          <Text as="h2" id="reset-title" variant="header-1">
            Отменить изменения?
          </Text>
          <Text as="p" color="secondary">
            Форма вернётся к последней сохранённой версии. Несохранённые
            изменения будут потеряны.
          </Text>
          <div className="action-buttons">
            <Button size="l" onClick={() => setResetOpen(false)}>
              Продолжить редактирование
            </Button>
            <Button size="l" view="outlined-danger" onClick={reset}>
              Отменить изменения
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
