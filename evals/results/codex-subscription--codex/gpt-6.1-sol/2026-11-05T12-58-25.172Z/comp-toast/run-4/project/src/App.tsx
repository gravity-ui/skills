import { useEffect, useRef, useState } from "react";
import { Button, Select } from "@gravity-ui/uikit";
import "./App.css";

type NoticeType = "success" | "info" | "error";
type Notice = { id: number; type: NoticeType; duration: number };
const messages = {
  success: {
    title: "Всё получилось!",
    text: "Изменения сохранены. Можно двигаться дальше.",
    label: "Успех",
    icon: "check",
  },
  info: {
    title: "Кстати, есть новости",
    text: "Всё готово к работе. Попробуйте что-нибудь новое.",
    label: "Информация",
    icon: "info",
  },
  error: {
    title: "Что-то пошло не так",
    text: "Не удалось сохранить изменения. Попробуйте ещё раз.",
    label: "Ошибка",
    icon: "alert",
  },
} as const;

function Glyph({ name, size = 20 }: { name: string; size?: number }) {
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
          <path d="M12 11v6m0-10v.1" />
        </>
      )}
      {name === "alert" && (
        <>
          <path d="m10.3 4-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4m0 4v.1" />
        </>
      )}
      {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
      {name === "arrow" && <path d="M5 12h14m-6-6 6 6-6 6" />}
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {name === "spark" && (
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      )}
    </svg>
  );
}

export function App() {
  const [type, setType] = useState<NoticeType>("success");
  const [duration, setDuration] = useState(5);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [closing, setClosing] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(
      () => setClosing(true),
      notice.duration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setNotice(null);
      setClosing(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [closing]);
  useEffect(() => {
    if (!notice) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [notice]);

  function showNotice() {
    setClosing(false);
    setNotice({ id: ++nextId.current, type, duration });
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="ping — на главную">
          <span className="brand-icon">
            <Glyph name="bell" size={20} />
          </span>
          ping<span className="brand-period">.</span>
        </a>
        <span className="header-caption">Маленькие детали. Приятный опыт.</span>
        <span className="component-badge">
          <span /> UI playground
        </span>
      </header>
      <main>
        <div className="intro">
          <div className="eyebrow">
            <span /> ПРОСТО И ВОВРЕМЯ
          </div>
          <h1>
            Хорошие новости.
            <br />
            <span>Без лишнего шума.</span>
          </h1>
          <p className="intro-description">
            Одно нажатие — и вы в курсе. Лёгкие уведомления,
            <br className="desktop-break" /> которые появляются по делу и
            исчезают сами.
          </p>
          <div className="intro-decoration" aria-hidden="true">
            <div className="decoration-orbit" />
            <div className="decoration-bell">
              <Glyph name="bell" size={37} />
              <span />
            </div>
            <span className="little-spark">✳</span>
            <span className="little-dot" />
          </div>
        </div>
        <section className="playground" aria-label="Настройка уведомления">
          <div className="playground-toolbar">
            <div className="toolbar-title">
              <span className="window-dots">
                <i />
                <i />
                <i />
              </span>
              <span>Ваша маленькая песочница</span>
            </div>
            <span className="live-badge">
              <span /> Интерактивно
            </span>
          </div>
          <div className="preview-area">
            <div className="grid-pattern" />
            <span className="preview-label">ПРЕДПРОСМОТР</span>
            <div className="preview-content">
              <div className={`sample-toast ${type}`}>
                <span className="notice-icon">
                  <Glyph name={messages[type].icon} size={21} />
                </span>
                <div className="sample-copy">
                  <strong>{messages[type].title}</strong>
                  <span>{messages[type].text}</span>
                </div>
                <span className="sample-close">
                  <Glyph name="close" size={15} />
                </span>
                <span className="sample-progress" />
              </div>
              <span className="preview-hint">
                Немного внимания. И ничего лишнего.
              </span>
            </div>
            <span className="preview-caption">
              <span /> Так будет выглядеть ваше уведомление
            </span>
          </div>
          <div className="playground-controls">
            <div className="type-control">
              <label id="type-label">Тип уведомления</label>
              <Select
                aria-labelledby="type-label"
                value={[type]}
                onUpdate={(value) => setType(value[0] as NoticeType)}
                options={Object.entries(messages).map(([value, message]) => ({
                  value,
                  content: message.label,
                }))}
                size="l"
                renderSelectedOption={(option) => (
                  <span className={`select-content ${option.value}`}>
                    <span />
                    {option.content}
                  </span>
                )}
              />
            </div>
            <div className="duration-control">
              <span id="duration-label">Время на экране</span>
              <div
                className="duration-options"
                role="group"
                aria-labelledby="duration-label"
              >
                {[3, 5, 8].map((value) => (
                  <button
                    key={value}
                    className={duration === value ? "selected" : ""}
                    aria-pressed={duration === value}
                    onClick={() => setDuration(value)}
                  >
                    {value} сек
                  </button>
                ))}
              </div>
            </div>
            <div className="autoclose-note">
              <Glyph name="clock" size={18} />
              <span>
                Исчезнет само.
                <br />
                <strong>Всё предусмотрено.</strong>
              </span>
            </div>
          </div>
        </section>
        <div className="feature-row">
          <div>
            <span className="feature-icon">
              <Glyph name="spark" size={18} />
            </span>
            <span>Появляется плавно</span>
          </div>
          <div>
            <span className="feature-icon">
              <Glyph name="clock" size={18} />
            </span>
            <span>Исчезает вовремя</span>
          </div>
          <div>
            <span className="feature-icon">
              <Glyph name="check" size={18} />
            </span>
            <span>Не отвлекает от главного</span>
          </div>
        </div>
        <footer className="page-footer">
          <span>Сделано с вниманием к деталям</span>
          <span>
            Меньше шума, больше смысла <span className="footer-spark">✳</span>
          </span>
        </footer>
      </main>
      <div className="corner-action">
        <span className="action-hint">
          Попробуйте — это приятно <span>↘</span>
        </span>
        <Button
          view="action"
          size="xl"
          className="show-notification"
          onClick={showNotice}
        >
          <Glyph name="bell" size={19} />
          <span>Показать уведомление</span>
          <Glyph name="arrow" size={18} />
        </Button>
      </div>
      <div
        className="toast-region"
        role="region"
        aria-label="Уведомления"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <div
            key={notice.id}
            className={`live-toast ${notice.type} ${closing ? "is-closing" : ""}`}
            role="status"
          >
            <span className="notice-icon">
              <Glyph name={messages[notice.type].icon} size={22} />
            </span>
            <div className="sample-copy">
              <strong>{messages[notice.type].title}</strong>
              <span>{messages[notice.type].text}</span>
            </div>
            <button
              className="dismiss-toast"
              aria-label="Закрыть уведомление"
              onClick={() => setClosing(true)}
            >
              <Glyph name="close" size={17} />
            </button>
            <span
              className="toast-progress"
              style={{ animationDuration: `${notice.duration}s` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
