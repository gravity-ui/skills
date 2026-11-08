import { useEffect, useRef, useState } from "react";
import { Button } from "@gravity-ui/uikit";
import "./styles.css";

type Kind = "success" | "info" | "warning" | "error";
type Position = "bottom-right" | "top-right" | "bottom-left";
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
    label: "Инфо",
    title: "Есть новости",
    message: "Для вас доступно новое обновление.",
  },
  warning: {
    label: "Внимание",
    title: "Обратите внимание",
    message: "Проверьте изменения перед сохранением.",
  },
  error: {
    label: "Ошибка",
    title: "Что-то пошло не так",
    message: "Не удалось сохранить изменения. Попробуйте ещё раз.",
  },
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
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
      {name === "success" ? (
        <path d="m6 12 4 4 8-8" />
      ) : name === "close" ? (
        <path d="m7 7 10 10M17 7 7 17" />
      ) : name === "bell" ? (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
          <path d="M12 2V1" />
        </>
      ) : name === "arrow" ? (
        <path d="M5 12h14m-5-5 5 5-5 5" />
      ) : name === "reset" ? (
        <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />
      ) : name === "clock" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      ) : name === "layers" ? (
        <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />
      ) : name === "cursor" ? (
        <path d="m5 3 14 10-7 1-3 7L5 3Z" />
      ) : name === "code" ? (
        <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18" />
      ) : name === "chevron" ? (
        <path d="m9 6 6 6-6 6" />
      ) : name === "warning" ? (
        <>
          <path d="m12 3 10 18H2L12 3Z" />
          <path d="M12 9v5m0 3v.1" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path
            d={name === "error" ? "m9 9 6 6m0-6-6 6" : "M12 11v6m0-10v.1"}
          />
        </>
      )}
    </svg>
  );
}

function Notice({
  kind,
  message,
  duration,
  onClose,
  live = false,
}: {
  kind: Kind;
  message: string;
  duration?: number;
  onClose?: () => void;
  live?: boolean;
}) {
  return (
    <div className={`notice ${kind} ${live ? "live-notice" : ""}`}>
      <span className="notice-icon">
        <Icon name={kind} size={21} />
      </span>
      <div className="notice-copy">
        <strong>{variants[kind].title}</strong>
        <p>{message || variants[kind].message}</p>
      </div>
      {onClose ? (
        <button
          className="close-button"
          aria-label="Закрыть уведомление"
          onClick={onClose}
        >
          <Icon name="close" size={17} />
        </button>
      ) : (
        <span className="preview-close">
          <Icon name="close" size={17} />
        </span>
      )}
      <div className="notice-track">
        <span
          style={live ? { animationDuration: `${duration}s` } : undefined}
        />
      </div>
    </div>
  );
}

export function App() {
  const [kind, setKind] = useState<Kind>("success");
  const [message, setMessage] = useState(variants.success.message);
  const [duration, setDuration] = useState(5);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [toast, setToast] = useState<{
    id: number;
    kind: Kind;
    message: string;
    duration: number;
    position: Position;
  } | null>(null);
  const counter = useRef(0);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(
      () => setToast(null),
      toast.duration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [toast]);
  function chooseKind(next: Kind) {
    if (message === variants[kind].message) setMessage(variants[next].message);
    setKind(next);
  }
  function reset() {
    setKind("success");
    setMessage(variants.success.message);
    setDuration(5);
    setPosition("bottom-right");
    setToast(null);
  }
  function showToast() {
    setToast({ id: ++counter.current, kind, message, duration, position });
  }
  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="#" className="brand" aria-label="Forma — главная">
          <span className="brand-mark">
            f<span>•</span>
          </span>
          <span>
            forma<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="header-divider" />
        <span className="workspace-name">Песочница интерфейсов</span>
        <div className="header-right">
          <span className="playground-label">PLAYGROUND</span>
          <span className="avatar">F</span>
        </div>
      </header>
      <main>
        <div className="breadcrumb">
          <span>Компоненты</span>
          <Icon name="chevron" size={13} />
          <span>Обратная связь</span>
          <Icon name="chevron" size={13} />
          <span className="current">Уведомления</span>
        </div>
        <section className="page-heading">
          <div>
            <div className="eyebrow">
              <span /> МАЛЕНЬКИЕ ДЕТАЛИ, БОЛЬШОЙ ОПЫТ
            </div>
            <h1>
              Уведомления<span>.</span>
            </h1>
            <p>Нужное сообщение. В нужный момент. Без лишних действий.</p>
          </div>
          <span className="component-badge">
            <span /> Интерактивный компонент
          </span>
        </section>
        <div className="workspace-grid">
          <section
            className="preview-panel"
            aria-label="Предпросмотр уведомления"
          >
            <div className="panel-top">
              <div>
                <span className="tiny-dot" /> Предпросмотр
              </div>
              <span className="live-tag">LIVE</span>
            </div>
            <div className="preview-stage">
              <div className="preview-grid" />
              <div className="preview-content">
                <span className="preview-overline">
                  ТАК ЭТО БУДЕТ ВЫГЛЯДЕТЬ
                </span>
                <Notice kind={kind} message={message} />
                <div className="preview-annotation">
                  <span className="annotation-line" />
                  <Icon name="clock" size={14} />
                  <span>Исчезнет само через {duration} сек.</span>
                </div>
              </div>
              <div className="stage-bottom">
                <span>
                  <span className="status-dot" /> Всё под вашим контролем
                </span>
                <span>0{Object.keys(variants).indexOf(kind) + 1} / 04</span>
              </div>
            </div>
            <div className="preview-footer">
              <span className="footer-icon">
                <Icon name="cursor" size={18} />
              </span>
              <p>
                Попробуйте в действии
                <span>Нажмите на кнопку в правом нижнем углу экрана.</span>
              </p>
              <span className="diagonal-arrow">↘</span>
            </div>
          </section>
          <section className="settings-panel" aria-labelledby="settings-title">
            <div className="settings-heading">
              <h2 id="settings-title">Настройте под себя</h2>
              <Icon name="layers" size={18} />
            </div>
            <p className="settings-description">
              Меняйте детали. Смотрите результат.
            </p>
            <fieldset>
              <legend>Тип уведомления</legend>
              <div className="type-options">
                {(Object.keys(variants) as Kind[]).map((item) => (
                  <button
                    key={item}
                    className={`type-option ${item} ${kind === item ? "selected" : ""}`}
                    onClick={() => chooseKind(item)}
                    aria-pressed={kind === item}
                  >
                    <span>
                      <Icon name={item} size={18} />
                    </span>
                    {variants[item].label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="field-label" htmlFor="message">
              Текст сообщения
            </label>
            <textarea
              id="message"
              maxLength={140}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={variants[kind].message}
            />
            <div className="character-count">{message.length} / 140</div>
            <div className="duration-heading">
              <label className="field-label" htmlFor="duration">
                Время показа
              </label>
              <output htmlFor="duration">{duration} сек.</output>
            </div>
            <input
              id="duration"
              className="duration-range"
              type="range"
              min="2"
              max="10"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              style={
                {
                  "--range-fill": `${((duration - 2) / 8) * 100}%`,
                } as React.CSSProperties
              }
            />
            <div className="range-labels">
              <span>2 сек.</span>
              <span>10 сек.</span>
            </div>
            <label className="field-label position-label" htmlFor="position">
              Расположение
            </label>
            <div className="select-wrap">
              <span className="position-icon">▣</span>
              <select
                id="position"
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value as Position)
                }
              >
                <option value="bottom-right">Справа внизу</option>
                <option value="top-right">Справа вверху</option>
                <option value="bottom-left">Слева внизу</option>
              </select>
              <span className="select-chevron">⌄</span>
            </div>
            <div className="settings-bottom">
              <Button view="flat" size="m" onClick={reset}>
                <span className="reset-content">
                  <Icon name="reset" size={15} />
                  Сбросить настройки
                </span>
              </Button>
            </div>
          </section>
        </div>
        <section className="features" aria-label="Как работают уведомления">
          <div className="feature">
            <span className="feature-icon">
              <Icon name="cursor" />
            </span>
            <div>
              <h3>Одно нажатие</h3>
              <p>
                Мгновенная обратная связь,
                <br />
                когда она нужна.
              </p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">
              <Icon name="clock" />
            </span>
            <div>
              <h3>Исчезает само</h3>
              <p>
                Уведомление уйдёт автоматически.
                <br />
                Можно закрыть и раньше.
              </p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">
              <Icon name="layers" />
            </span>
            <div>
              <h3>Не отвлекает</h3>
              <p>
                Оставайтесь в потоке —<br />
                всё важное в углу экрана.
              </p>
            </div>
          </div>
        </section>
        <footer className="page-footer">
          <span>Сделано с вниманием к деталям.</span>
          <span>
            <Icon name="code" size={14} /> Маленький компонент. Большая польза.
          </span>
        </footer>
      </main>
      <div
        className={`toast-region ${toast?.position || position}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast && (
          <Notice
            key={toast.id}
            kind={toast.kind}
            message={toast.message}
            duration={toast.duration}
            live
            onClose={() => setToast(null)}
          />
        )}
      </div>
      <div className="trigger-area">
        <span className="trigger-hint">Немного магии в один клик</span>
        <button className="trigger-button" onClick={showToast}>
          <Icon name="bell" size={19} />
          <span>Показать уведомление</span>
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}
