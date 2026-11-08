import { useEffect, useRef, useState } from "react";
import { Button, Select, TextInput } from "@gravity-ui/uikit";
import "./styles.css";

type Kind = "success" | "info" | "error";
const variants: Record<
  Kind,
  { label: string; title: string; message: string }
> = {
  success: {
    label: "Успех",
    title: "Всё получилось!",
    message: "Изменения успешно сохранены.",
  },
  info: {
    label: "Информация",
    title: "Небольшое напоминание",
    message: "У вас есть новые обновления.",
  },
  error: {
    label: "Ошибка",
    title: "Что-то пошло не так",
    message: "Не удалось сохранить. Попробуйте ещё раз.",
  },
};

function Glyph({
  name,
  size = 20,
}: {
  name: "bell" | "check" | "info" | "close" | "clock" | "arrow" | "spark";
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "bell" && (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
          <path d="M10 21h4" />
        </>
      )}
      {name === "check" && <path d="m6 12 4 4 8-8" />}
      {name === "info" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5m0-9v.1" />
        </>
      )}
      {name === "close" && <path d="m7 7 10 10M17 7 7 17" />}
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {name === "arrow" && <path d="M5 12h14m-5-5 5 5-5 5" />}
      {name === "spark" && (
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      )}
    </svg>
  );
}

function StatusIcon({ kind }: { kind: Kind }) {
  return (
    <span className={`status-icon ${kind}`}>
      <Glyph
        name={kind === "success" ? "check" : kind === "info" ? "info" : "close"}
        size={19}
      />
    </span>
  );
}

export function App() {
  const [kind, setKind] = useState<Kind>("success");
  const [message, setMessage] = useState(variants.success.message);
  const [duration, setDuration] = useState("5");
  const [toast, setToast] = useState<{
    id: number;
    kind: Kind;
    message: string;
    duration: number;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const sequence = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  function dismiss() {
    clearTimeout(timer.current);
    setToast(null);
  }
  function showToast() {
    clearTimeout(timer.current);
    setToast({
      id: ++sequence.current,
      kind,
      message: message.trim() || variants[kind].message,
      duration: Number(duration),
    });
    timer.current = setTimeout(() => setToast(null), Number(duration) * 1000);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Signal — на главную">
          <span className="brand-symbol">
            <Glyph name="bell" size={20} />
            <i />
          </span>
          signal<span className="brand-dot">.</span>
        </a>
        <span className="header-divider" />
        <span className="header-subtitle">
          Маленькие детали. Большой комфорт.
        </span>
        <span className="playground-label">
          <span />
          Интерактивная песочница
        </span>
      </header>
      <main>
        <section className="intro">
          <span className="eyebrow">
            <Glyph name="spark" size={14} /> МЕНЬШЕ ШУМА, БОЛЬШЕ СМЫСЛА
          </span>
          <h1>
            Важное — на мгновение<span>.</span>
          </h1>
          <p>
            Небольшое уведомление, которое появляется вовремя
            <br className="desktop-break" /> и исчезает само. Попробуйте, как
            это работает.
          </p>
        </section>
        <section
          className="playground"
          aria-label="Настройка и предпросмотр уведомления"
        >
          <div className="settings">
            <div className="panel-heading">
              <span className="small-icon">
                <Glyph name="bell" size={18} />
              </span>
              <h2>Ваше уведомление</h2>
            </div>
            <p className="panel-description">Настройте детали под себя.</p>
            <fieldset className="type-field">
              <legend>Тип уведомления</legend>
              <div className="type-options">
                {(Object.keys(variants) as Kind[]).map((item) => (
                  <Button
                    key={item}
                    view="outlined"
                    size="l"
                    className={`type-option ${kind === item ? "active" : ""}`}
                    aria-pressed={kind === item}
                    onClick={() => {
                      setKind(item);
                      setMessage(variants[item].message);
                    }}
                  >
                    <span className={`type-mark ${item}`}>
                      <Glyph
                        name={
                          item === "success"
                            ? "check"
                            : item === "info"
                              ? "info"
                              : "close"
                        }
                        size={15}
                      />
                    </span>
                    {variants[item].label}
                  </Button>
                ))}
              </div>
            </fieldset>
            <div className="form-field">
              <label htmlFor="notification-message">Текст сообщения</label>
              <TextInput
                id="notification-message"
                size="l"
                value={message}
                onUpdate={setMessage}
                controlProps={{ maxLength: 120 }}
                placeholder="Введите сообщение"
              />
              <span className="field-hint">
                Коротко и по делу — так лучше всего.
              </span>
            </div>
            <div className="form-field duration-field">
              <label id="duration-label">Время показа</label>
              <Select
                aria-labelledby="duration-label"
                size="l"
                width="max"
                value={[duration]}
                onUpdate={(values) => setDuration(values[0])}
                options={[
                  { value: "3", content: "3 секунды" },
                  { value: "5", content: "5 секунд" },
                  { value: "8", content: "8 секунд" },
                ]}
              />
              <span className="field-hint">
                <Glyph name="clock" size={13} /> Затем уведомление исчезнет само
              </span>
            </div>
          </div>
          <div className="preview-area">
            <span className="preview-label">
              <span />
              ПРЕДПРОСМОТР
            </span>
            <div className="browser-window" aria-hidden="true">
              <div className="browser-toolbar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="address-bar">
                  <span className="mini-lock" />
                  your-workspace.app
                </span>
                <span className="toolbar-more">···</span>
              </div>
              <div className="browser-body">
                <div className="mock-sidebar">
                  <div className="mock-logo" />
                  <div className="sidebar-line selected" />
                  <div className="sidebar-line" />
                  <div className="sidebar-line short" />
                  <div className="sidebar-line" />
                  <div className="sidebar-bottom" />
                </div>
                <div className="mock-content">
                  <div className="mock-title" />
                  <div className="mock-subtitle" />
                  <div className="mock-cards">
                    <div />
                    <div />
                    <div />
                  </div>
                  <div className="mock-line" />
                  <div className="mock-line" />
                  <div className="mock-line shorter" />
                </div>
              </div>
              <div className="sample-toast">
                <StatusIcon kind={kind} />
                <div className="toast-copy">
                  <strong>{variants[kind].title}</strong>
                  <p>{message.trim() || variants[kind].message}</p>
                </div>
                <span className="sample-close">
                  <Glyph name="close" size={15} />
                </span>
                <span className={`sample-progress ${kind}`} />
              </div>
            </div>
            <div className="preview-caption">
              <span className="caption-line" />
              <span>Появится. Сообщит. Исчезнет.</span>
              <span className="caption-line" />
            </div>
            <div className="preview-details">
              <span>
                <Glyph name="check" size={14} /> Не прерывает работу
              </span>
              <span>
                <Glyph name="check" size={14} /> Закрывается само
              </span>
            </div>
          </div>
          <div className="panel-footer">
            <span className="footer-info">
              <Glyph name="info" size={16} />
              <span>Всё готово. Нажмите кнопку в углу экрана.</span>
            </span>
            <span className="footer-arrow">
              <Glyph name="arrow" size={18} />
            </span>
          </div>
        </section>
        <div className="under-card">
          <span className="tiny-spark">✳</span> Хороший интерфейс заботится о
          вашем внимании.
        </div>
      </main>
      <footer className="site-footer">
        <span>signal — детали имеют значение</span>
        <span>Просто. Спокойно. Понятно.</span>
      </footer>
      <div
        className="notification-region"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast && (
          <div key={toast.id} className="live-toast" role="status">
            <StatusIcon kind={toast.kind} />
            <div className="toast-copy">
              <strong>{variants[toast.kind].title}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              className="toast-close"
              aria-label="Закрыть уведомление"
              onClick={dismiss}
            >
              <Glyph name="close" size={17} />
            </button>
            <span
              className={`toast-progress ${toast.kind}`}
              style={{ animationDuration: `${toast.duration}s` }}
            />
          </div>
        )}
      </div>
      <div className="corner-action">
        <span className="corner-hint">
          Нажмите — и посмотрите <span>↘</span>
        </span>
        <Button
          view="action"
          size="xl"
          className="trigger-button"
          onClick={showToast}
        >
          <Button.Icon>
            <Glyph name="bell" size={19} />
          </Button.Icon>
          Показать уведомление<span className="button-plus">+</span>
        </Button>
      </div>
    </div>
  );
}
