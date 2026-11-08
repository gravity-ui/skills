import { useRef, useState, type FormEvent, type ReactNode } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "user"
  | "shield"
  | "bell"
  | "chevron"
  | "upload"
  | "check"
  | "globe"
  | "help"
  | "arrow"
  | "close"
  | "lock";
function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 4.5-5 8-8 9-3-1-8-4.5-8-9V6z" />
        <path d="m8.5 12 2.3 2.3 4.7-4.7" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    upload: (
      <>
        <path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 8a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 4h.01" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
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
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

type Settings = {
  name: string;
  email: string;
  avatar: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  news: boolean;
  alerts: boolean;
  digest: boolean;
};
const defaults: Settings = {
  name: "Александр Иванов",
  email: "alex.ivanov@gmail.com",
  avatar: "",
  language: "ru",
  timezone: "Europe/Moscow",
  twoFactor: false,
  news: true,
  alerts: true,
  digest: false,
};
const storageKey = "kontur-profile-settings";
function loadSettings(): Settings {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    return value && typeof value === "object"
      ? { ...defaults, ...value }
      : defaults;
  } catch {
    return defaults;
  }
}
const languages = [
  ["ru", "Русский"],
  ["en", "English"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["fr", "Français"],
];
const timezones = [
  ["Europe/Kaliningrad", "(UTC+02:00) Калининград"],
  ["Europe/Moscow", "(UTC+03:00) Москва"],
  ["Asia/Dubai", "(UTC+04:00) Дубай"],
  ["Asia/Yekaterinburg", "(UTC+05:00) Екатеринбург"],
  ["Asia/Novosibirsk", "(UTC+07:00) Новосибирск"],
  ["Asia/Vladivostok", "(UTC+10:00) Владивосток"],
  ["Europe/London", "Лондон · Europe/London"],
  ["Europe/Berlin", "Берлин · Europe/Berlin"],
  ["America/New_York", "Нью-Йорк · America/New_York"],
  ["Asia/Tokyo", "(UTC+09:00) Токио"],
];

export function App() {
  const [saved, setSaved] = useState<Settings>(loadSettings);
  const [form, setForm] = useState<Settings>(saved);
  const [active, setActive] = useState("profile");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const initials =
    form.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "АИ";
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }
  function notify(message: string) {
    setToast(message);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(""), 4500);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Введите имя.");
      return;
    }
    const next = { ...form, name: form.name.trim(), email: form.email.trim() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      setForm(next);
      setError("");
      notify("Настройки успешно сохранены");
    } catch {
      setError(
        "Не удалось сохранить настройки. Попробуйте загрузить фото меньшего размера.",
      );
    }
  }
  function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Выберите изображение в формате JPG, PNG или WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Размер изображения не должен превышать 5 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Не удалось обработать изображение.");
          return;
        }
        const side = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          256,
          256,
        );
        update("avatar", canvas.toDataURL("image/webp", 0.85));
      };
      img.onerror = () =>
        setError("Не удалось открыть изображение. Выберите другой файл.");
      img.src = String(reader.result);
    };
    reader.onerror = () => setError("Не удалось прочитать файл.");
    reader.readAsDataURL(file);
  }
  const avatar = (small = false) => (
    <div className={`avatar ${small ? "avatar-small" : ""}`}>
      {form.avatar ? (
        <img src={form.avatar} alt="Фото профиля" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
  const navigate = (id: string) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#profile"
          onClick={() => navigate("profile")}
          aria-label="Контур — настройки профиля"
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          контур<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Icon name="grid" size={19} />
          </span>
          <div>
            <strong>Личное пространство</strong>
            <span>Ваш рабочий уголок</span>
          </div>
          <span className="workspace-status" />
        </div>
        <div className="nav-caption">НАСТРОЙКИ АККАУНТА</div>
        <nav aria-label="Настройки аккаунта">
          {(
            [
              { id: "profile", name: "Профиль", icon: "user" },
              { id: "security", name: "Безопасность", icon: "shield" },
              { id: "notifications", name: "Уведомления", icon: "bell" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`nav-item ${active === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {active === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-symbol">
              <Icon name="help" size={22} />
            </span>
            <strong>Всё под вашим контролем</strong>
            <p>
              Настройте пространство так,
              <br />
              как удобно именно вам.
            </p>
            <button onClick={() => setHelp(true)}>
              Нужна помощь? <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="sidebar-user">
            {avatar(true)}
            <div>
              <strong>{saved.name}</strong>
              <span>Личный аккаунт</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Аккаунт</span>
            <Icon name="chevron" size={13} />
            <strong>Настройки профиля</strong>
          </div>
          <div className="topbar-right">
            <span className="personal-label">
              <span />
              Личное пространство
            </span>
            <button
              className="top-avatar"
              onClick={() => navigate("profile")}
              aria-label="Перейти к профилю"
            >
              {avatar(true)}
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div className="eyebrow">ВАШ АККАУНТ</div>
            <h1>Настройки профиля</h1>
            <p>Управляйте личной информацией и настройте всё под себя.</p>
          </div>
          <div className="welcome-banner">
            <div className="banner-icon">
              <Icon name="user" size={23} />
            </div>
            <div>
              <strong>Ваш профиль — ваше пространство</strong>
              <p>Актуальная информация помогает сделать работу удобнее.</p>
            </div>
            <div className="banner-art" aria-hidden="true">
              <span className="art-orbit orbit-one" />
              <span className="art-orbit orbit-two" />
              <span className="art-orbit orbit-three" />
              <span className="art-shield">
                <Icon name="shield" size={30} />
              </span>
              <span className="art-spark spark-one">✦</span>
              <span className="art-spark spark-two">✦</span>
            </div>
          </div>
          <form onSubmit={save}>
            <div className="settings-card">
              <section
                id="profile"
                className="settings-section profile-section"
              >
                <div className="section-heading">
                  <h2>Личная информация</h2>
                  <p>Так вас будут видеть другие участники.</p>
                </div>
                <div className="avatar-row">
                  {avatar()}
                  <div className="avatar-controls">
                    <div className="avatar-buttons">
                      <button
                        className="button button-secondary upload-button"
                        type="button"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Icon name="upload" size={16} />
                        Загрузить фото
                      </button>
                      {form.avatar && (
                        <button
                          className="remove-photo"
                          type="button"
                          onClick={() => update("avatar", "")}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                    <span>JPG, PNG или WebP. Не больше 5 МБ.</span>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    aria-label="Загрузить аватар"
                    onChange={(event) => {
                      upload(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>
                <div className="field-grid">
                  <label className="field">
                    <span>Имя</span>
                    <input
                      required
                      maxLength={80}
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Ваше имя"
                    />
                  </label>
                  <label className="field">
                    <span>
                      Email{" "}
                      <span className="field-lock">
                        <Icon name="lock" size={12} />
                        Только для вас
                      </span>
                    </span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
              </section>
              <section className="settings-section regional-section">
                <div className="section-heading">
                  <h2>Язык и регион</h2>
                  <p>Для привычного и комфортного интерфейса.</p>
                </div>
                <div className="field-grid">
                  <label className="field">
                    <span>Язык интерфейса</span>
                    <div className="select-wrap">
                      <Icon name="globe" size={17} />
                      <select
                        value={form.language}
                        onChange={(e) => update("language", e.target.value)}
                      >
                        {languages.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Icon name="chevron" size={13} className="select-arrow" />
                    </div>
                  </label>
                  <label className="field">
                    <span>Часовой пояс</span>
                    <div className="select-wrap timezone-select">
                      <select
                        value={form.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                      >
                        {timezones.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Icon name="chevron" size={13} className="select-arrow" />
                    </div>
                  </label>
                </div>
                <p className="field-hint">
                  Часовой пояс используется для отображения времени событий и
                  уведомлений.
                </p>
              </section>
              <section
                id="security"
                className="settings-section security-section"
              >
                <div className="section-heading">
                  <h2>Безопасность</h2>
                  <p>Дополнительная защита вашего аккаунта.</p>
                </div>
                <div className="security-row">
                  <span className="security-icon">
                    <Icon name="shield" size={23} />
                  </span>
                  <div className="security-copy">
                    <label htmlFor="two-factor">
                      Двухфакторная авторизация{" "}
                      <span className="recommended">Рекомендуем</span>
                    </label>
                    <p>Подтверждайте вход с помощью дополнительного кода.</p>
                  </div>
                  <input
                    className="switch"
                    id="two-factor"
                    type="checkbox"
                    role="switch"
                    checked={form.twoFactor}
                    onChange={(e) => update("twoFactor", e.target.checked)}
                  />
                </div>
              </section>
              <section
                id="notifications"
                className="settings-section notifications-section"
              >
                <div className="section-heading">
                  <h2>Email-уведомления</h2>
                  <p>Выберите, какие письма вы хотите получать.</p>
                </div>
                <div className="notification-options">
                  {(
                    [
                      {
                        key: "news",
                        title: "Новости продукта",
                        description:
                          "Новые функции, улучшения и важные обновления.",
                      },
                      {
                        key: "alerts",
                        title: "Системные алерты",
                        description:
                          "Важные события и информация о вашем аккаунте.",
                      },
                      {
                        key: "digest",
                        title: "Дайджест за неделю",
                        description:
                          "Главное за прошедшую неделю в одном письме.",
                      },
                    ] as const
                  ).map((item) => (
                    <label className="checkbox-row" key={item.key}>
                      <input
                        type="checkbox"
                        checked={form[item.key]}
                        onChange={(e) => update(item.key, e.target.checked)}
                      />
                      <span className="checkbox-visual">
                        <Icon name="check" size={12} />
                      </span>
                      <span className="checkbox-copy">
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
            {error && (
              <div role="alert" className="error-message">
                {error}
              </div>
            )}
            <footer className="form-footer">
              <span className={`save-hint ${dirty ? "has-changes" : ""}`}>
                <Icon name={dirty ? "user" : "lock"} size={14} />
                {dirty
                  ? "Есть несохранённые изменения"
                  : "Ваши данные надёжно защищены"}
              </span>
              <div className="footer-actions">
                <button
                  className="button button-secondary cancel-button"
                  type="button"
                  onClick={() => {
                    setForm(saved);
                    setError("");
                    notify("Изменения отменены");
                  }}
                >
                  Отмена
                </button>
                <button className="button button-primary" type="submit">
                  <Icon name="check" size={17} />
                  Сохранить
                </button>
              </div>
            </footer>
          </form>
          <div className="page-bottom">
            <span>Маленькие настройки. Большой комфорт.</span>
            <span>
              Сделано для вас <span className="tiny-star">✳</span>
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          <span>
            <Icon name="check" size={18} />
          </span>
          {toast}
          <button onClick={() => setToast("")} aria-label="Закрыть уведомление">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <div
            className="help-modal"
            onKeyDown={(event) => {
              if (event.key === "Escape") setHelp(false);
              if (event.key === "Tab") {
                const buttons =
                  event.currentTarget.querySelectorAll<HTMLButtonElement>(
                    "button",
                  );
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                  event.preventDefault();
                  last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first.focus();
                }
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close"
              aria-label="Закрыть справку"
              onClick={() => setHelp(false)}
            >
              <Icon name="close" />
            </button>
            <span className="help-symbol">
              <Icon name="help" size={25} />
            </span>
            <h2 id="help-title">Ваш профиль, ваши настройки</h2>
            <p>
              Обновите имя и фото, выберите язык, часовой пояс и нужные
              уведомления. Нажмите «Сохранить», чтобы применить изменения, или
              «Отмена», чтобы вернуться к сохранённым значениям.
            </p>
            <p>
              Настройки хранятся в этом браузере. Переключатель двухфакторной
              авторизации сохраняет предпочтение; для защиты реального аккаунта
              потребуется подключение сервиса авторизации.
            </p>
            <button
              className="button button-primary"
              onClick={() => setHelp(false)}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
