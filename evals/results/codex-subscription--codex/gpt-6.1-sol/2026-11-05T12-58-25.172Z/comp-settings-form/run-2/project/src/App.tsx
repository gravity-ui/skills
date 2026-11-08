import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode, FormEvent } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "user"
  | "shield"
  | "bell"
  | "help"
  | "arrow"
  | "chevron"
  | "check"
  | "upload"
  | "close"
  | "globe"
  | "clock"
  | "menu"
  | "leaf";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
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
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 2.2M12 17h.01" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    check: <path d="m5 12 4 4L19 6" />,
    upload: <path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    leaf: (
      <>
        <path d="M20 4C7 2 2 9 6 16s15 5 14-12Z" />
        <path d="M4 21 15 10" />
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
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

type Profile = {
  name: string;
  email: string;
  avatar: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  product: boolean;
  alerts: boolean;
  digest: boolean;
};
const initialProfile: Profile = {
  name: "Александр Морозов",
  email: "alex.morozov@gmail.com",
  avatar: "/avatar.jpg",
  language: "ru",
  timezone: "Europe/Moscow",
  twoFactor: false,
  product: true,
  alerts: true,
  digest: false,
};
function readProfile(): Profile {
  try {
    const data = localStorage.getItem("forma-profile");
    return data ? { ...initialProfile, ...JSON.parse(data) } : initialProfile;
  } catch {
    return initialProfile;
  }
}

export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [active, setActive] = useState("profile");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const helpDialog = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setError("");
  };
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (!help) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        helpDialog.current?.querySelectorAll<HTMLElement>(
          'button, summary, [href], input, select, [tabindex="0"]',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHelp(false);
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [help]);
  const goTo = (section: string) => {
    setActive(section);
    setMobileMenu(false);
    document
      .getElementById(section)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
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
        canvas.width = canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
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
        update("avatar", canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = () =>
        setError("Не удалось прочитать изображение. Попробуйте другой файл.");
      img.src = String(reader.result);
    };
    reader.onerror = () =>
      setError("Не удалось загрузить файл. Попробуйте ещё раз.");
    reader.readAsDataURL(file);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!profile.name.trim()) {
      setError("Укажите ваше имя.");
      return;
    }
    const clean = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
    };
    try {
      localStorage.setItem("forma-profile", JSON.stringify(clean));
      setSaved(clean);
      setProfile(clean);
      setToast("Настройки профиля сохранены");
      setError("");
    } catch {
      setError(
        "Не удалось сохранить настройки. Проверьте доступность хранилища браузера.",
      );
    }
  };
  const avatar = (className: string, source: Profile = profile) => (
    <div className={`avatar ${className}`}>
      <span aria-hidden="true">
        {source.name
          .trim()
          .split(/\s+/)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </span>
      {source.avatar && (
        <img
          key={source.avatar}
          src={source.avatar}
          alt="Аватар профиля"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div className="sidebar-scrim" onClick={() => setMobileMenu(false)} />
      )}
      <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          aria-label="Forma — главная"
          onClick={(e) => {
            e.preventDefault();
            goTo("profile");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          forma<span className="brand-dot">.</span>
        </a>
        <div className="workspace-wrapper">
          <button
            className="workspace"
            onClick={() => setWorkspaceOpen((v) => !v)}
            aria-expanded={workspaceOpen}
          >
            <span className="workspace-icon">A</span>
            <span>
              <strong>Личное пространство</strong>
              <small>Бесплатный план</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
          {workspaceOpen && (
            <div className="workspace-popover">
              <span className="eyebrow">ВАШЕ ПРОСТРАНСТВО</span>
              <div>
                <span className="workspace-icon">A</span>
                <span>Личное пространство</span>
                <Icon name="check" size={16} />
              </div>
              <p>Ваши настройки доступны на этом устройстве.</p>
            </div>
          )}
        </div>
        <div className="nav-label">ЛИЧНЫЙ КАБИНЕТ</div>
        <nav aria-label="Основная навигация">
          <button className="nav-item selected" onClick={() => goTo("profile")}>
            <Icon name="grid" />
            Настройки
            <span className="nav-indicator" />
          </button>
          <div className="subnav">
            <button
              className={active === "profile" ? "current" : ""}
              onClick={() => goTo("profile")}
            >
              Мой профиль
            </button>
            <button
              className={active === "security" ? "current" : ""}
              onClick={() => goTo("security")}
            >
              Безопасность
            </button>
            <button
              className={active === "notifications" ? "current" : ""}
              onClick={() => goTo("notifications")}
            >
              Уведомления
            </button>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="little-spark">✳</span>
            <p>
              Меньше рутины.
              <br />
              <strong>Больше возможностей.</strong>
            </p>
            <span className="note-line" />
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <Icon name="help" size={19} />
            Помощь и поддержка
            <Icon name="arrow" size={16} />
          </button>
          <div className="sidebar-user">
            {avatar("avatar-small", saved)}
            <div>
              <strong>
                {saved.name.split(" ")[0]}{" "}
                {saved.name.split(" ")[1]?.[0]
                  ? `${saved.name.split(" ")[1][0]}.`
                  : ""}
              </strong>
              <span>Личный аккаунт</span>
            </div>
            <span className="online-dot" title="Аккаунт активен" />
          </div>
        </div>
        <span className="sidebar-copyright">© 2026 Forma</span>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu"
              aria-label="Открыть меню"
              onClick={() => setMobileMenu(true)}
            >
              <Icon name="menu" />
            </button>
            <span>Личный кабинет</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-current">Настройки</span>
          </div>
          <div className="topbar-right">
            <span className="personal-badge">
              <span />
              Личное пространство
            </span>
            <button
              className="top-avatar-button"
              onClick={() => goTo("profile")}
              aria-label="Перейти к профилю"
            >
              {avatar("avatar-top", saved)}
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="heading-eyebrow">ВАШ АККАУНТ</div>
              <h1>Настройки</h1>
              <p>Настройте пространство так, как удобно вам.</p>
            </div>
            <span className="private-label">
              <Icon name="shield" size={16} />
              Только для вас
            </span>
          </div>
          <nav className="tabs" aria-label="Разделы настроек">
            {(
              [
                { id: "profile", label: "Мой профиль", icon: "user" },
                { id: "security", label: "Безопасность", icon: "shield" },
                { id: "notifications", label: "Уведомления", icon: "bell" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                className={active === tab.id ? "active" : ""}
                onClick={() => goTo(tab.id)}
              >
                <Icon name={tab.icon} size={17} />
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="content-grid">
            <form className="settings-card" onSubmit={save}>
              <section id="profile" className="form-section profile-section">
                <div className="section-heading">
                  <h2>Личная информация</h2>
                  <p>Ваши основные данные и предпочтения.</p>
                </div>
                <div className="avatar-row">
                  <div className="avatar-edit">
                    {avatar("avatar-large")}
                    <span className="avatar-status">
                      <Icon name="check" size={10} />
                    </span>
                  </div>
                  <div className="avatar-controls">
                    <div className="avatar-buttons">
                      <button
                        className="button button-secondary upload-button"
                        type="button"
                        onClick={() => fileInput.current?.click()}
                      >
                        <Icon name="upload" size={15} />
                        Загрузить фото
                      </button>
                      {profile.avatar && (
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => update("avatar", "")}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                    <span className="field-hint">
                      JPG, PNG или WebP. Не более 5 МБ.
                    </span>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={upload}
                      aria-label="Загрузить аватар"
                    />
                  </div>
                </div>
                <div className="fields-grid">
                  <label className="field">
                    <span>
                      Имя <span className="required">*</span>
                    </span>
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={80}
                      value={profile.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Ваше имя"
                    />
                  </label>
                  <label className="field">
                    <span>
                      Email <span className="required">*</span>
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={profile.email}
                      maxLength={254}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="name@example.com"
                    />
                  </label>
                  <label className="field">
                    <span>Язык интерфейса</span>
                    <div className="select-wrap">
                      <Icon name="globe" size={17} />
                      <select
                        value={profile.language}
                        onChange={(e) => update("language", e.target.value)}
                      >
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                      </select>
                      <Icon name="chevron" size={16} />
                    </div>
                  </label>
                  <label className="field">
                    <span>Часовой пояс</span>
                    <div className="select-wrap">
                      <Icon name="clock" size={17} />
                      <select
                        value={profile.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                      >
                        <option value="Europe/Moscow">Москва (UTC+3)</option>
                        <option value="Europe/Kaliningrad">
                          Калининград (UTC+2)
                        </option>
                        <option value="Asia/Yekaterinburg">
                          Екатеринбург (UTC+5)
                        </option>
                        <option value="Asia/Novosibirsk">
                          Новосибирск (UTC+7)
                        </option>
                        <option value="Asia/Vladivostok">
                          Владивосток (UTC+10)
                        </option>
                        <option value="Europe/London">Лондон</option>
                        <option value="Europe/Berlin">Берлин</option>
                        <option value="America/New_York">Нью-Йорк</option>
                        <option value="Asia/Dubai">Дубай (UTC+4)</option>
                        <option value="UTC">Всемирное время (UTC)</option>
                      </select>
                      <Icon name="chevron" size={16} />
                    </div>
                  </label>
                </div>
              </section>
              <section id="security" className="form-section security-section">
                <div className="section-heading">
                  <h2>
                    Безопасность{" "}
                    <span className="section-tag">РЕКОМЕНДУЕМ</span>
                  </h2>
                </div>
                <div className="toggle-row">
                  <div className="setting-icon">
                    <Icon name="shield" size={20} />
                  </div>
                  <div className="setting-copy">
                    <label htmlFor="two-factor">
                      Двухфакторная авторизация
                    </label>
                    <p>Дополнительный уровень защиты вашего аккаунта.</p>
                  </div>
                  <button
                    type="button"
                    id="two-factor"
                    className={`switch ${profile.twoFactor ? "on" : ""}`}
                    role="switch"
                    aria-checked={profile.twoFactor}
                    aria-label="Двухфакторная авторизация"
                    onClick={() => update("twoFactor", !profile.twoFactor)}
                  >
                    <span />
                  </button>
                </div>
              </section>
              <section
                id="notifications"
                className="form-section notifications-section"
              >
                <div className="section-heading">
                  <h2>Email-уведомления</h2>
                  <p>Выберите, какие письма вы хотите получать.</p>
                </div>
                <div className="checkboxes">
                  {(
                    [
                      {
                        key: "product",
                        title: "Новости продукта",
                        description:
                          "Новые функции, обновления и полезные возможности.",
                      },
                      {
                        key: "alerts",
                        title: "Системные алерты",
                        description:
                          "Важные события и безопасность вашего аккаунта.",
                      },
                      {
                        key: "digest",
                        title: "Дайджест за неделю",
                        description:
                          "Всё самое важное — в одном письме по понедельникам.",
                      },
                    ] as const
                  ).map((item) => (
                    <label className="checkbox-row" key={item.key}>
                      <input
                        type="checkbox"
                        checked={profile[item.key]}
                        onChange={(e) => update(item.key, e.target.checked)}
                      />
                      <span className="custom-checkbox">
                        <Icon name="check" size={12} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <footer className="form-footer">
                <span className={`save-status ${dirty ? "unsaved" : ""}`}>
                  <span />
                  {dirty
                    ? "Есть несохранённые изменения"
                    : "Все изменения сохранены"}
                </span>
                <div className="footer-buttons">
                  <button
                    className="button button-secondary cancel-button"
                    type="button"
                    onClick={() => {
                      setProfile({ ...saved });
                      setError("");
                      if (dirty) setToast("Изменения отменены");
                    }}
                  >
                    Отмена
                  </button>
                  <button className="button button-primary" type="submit">
                    <Icon name="check" size={16} />
                    Сохранить
                  </button>
                </div>
              </footer>
            </form>
            <aside className="right-column">
              <div className="profile-tip">
                <span className="tip-label">
                  <span />
                  ПРОСТРАНСТВО ДЛЯ ВАС
                </span>
                <div className="profile-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-dot art-dot-one" />
                  <div className="art-dot art-dot-two" />
                  <div className="art-spark">✳</div>
                  <div className="art-profile">
                    <div className="art-head" />
                    <div className="art-body" />
                  </div>
                  <div className="art-verified">
                    <Icon name="check" size={18} />
                  </div>
                  <div className="art-small-dot" />
                </div>
                <h3>
                  Ваш профиль.
                  <br />
                  Ваши правила.
                </h3>
                <p>
                  Пара простых настроек —<br />и Forma станет чуть ближе
                  <br />к вашему ритму.
                </p>
                <div className="tip-footer">
                  <Icon name="leaf" size={15} />
                  <span>Комфорт начинается с деталей</span>
                </div>
              </div>
              <div className="privacy-card">
                <span className="privacy-icon">
                  <Icon name="shield" size={21} />
                </span>
                <h3>Данные под защитой</h3>
                <p>
                  Личная информация видна только вам. Вы решаете, чем делиться и
                  какие уведомления получать.
                </p>
                <button onClick={() => setHelp(true)}>
                  Подробнее о безопасности
                  <Icon name="arrow" size={15} />
                </button>
              </div>
              <div className="small-note">
                <Icon name="help" size={16} />
                <p>
                  Нужна помощь?
                  <br />
                  <button onClick={() => setHelp(true)}>Мы всегда рядом</button>
                </p>
              </div>
            </aside>
          </div>
          <div className="page-footer">
            <span>Маленькие настройки. Большая разница.</span>
            <span>
              Сделано с заботой <span className="footer-flower">✳</span>
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <div
            className="help-modal"
            ref={helpDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Закрыть справку"
              onClick={() => setHelp(false)}
            >
              <Icon name="close" />
            </button>
            <span className="privacy-icon">
              <Icon name="help" size={24} />
            </span>
            <h2 id="help-title">Мы рядом, чтобы помочь</h2>
            <p>Всё, что нужно знать о настройках профиля.</p>
            <details open>
              <summary>Где хранятся мои данные?</summary>
              <p>
                Настройки сохраняются локально в этом браузере на вашем
                устройстве. Они не передаются на сервер и не синхронизируются
                между устройствами.
              </p>
            </details>
            <details>
              <summary>Как изменить фотографию?</summary>
              <p>
                Нажмите «Загрузить фото» и выберите JPG, PNG или WebP размером
                до 5 МБ. Изображение автоматически обрежется по центру. Затем
                нажмите «Сохранить».
              </p>
            </details>
            <details>
              <summary>Как работает двухфакторная авторизация?</summary>
              <p>
                На этой странице можно сохранить предпочтение 2FA. Для настоящей
                защиты с одноразовыми кодами необходимо подключение к серверу
                авторизации.
              </p>
            </details>
            <details>
              <summary>Как отменить изменения?</summary>
              <p>
                Нажмите «Отмена», чтобы вернуть последние сохранённые настройки.
                Изменения вступают в силу только после нажатия «Сохранить».
              </p>
            </details>
            <button
              className="button button-primary modal-done"
              onClick={() => setHelp(false)}
            >
              Всё понятно
              <Icon name="check" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
