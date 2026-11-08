import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Checkbox, Select, Switch, TextInput } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "grid"
  | "folder"
  | "check"
  | "users"
  | "settings"
  | "help"
  | "chevron"
  | "bell"
  | "user"
  | "globe"
  | "shield"
  | "mail"
  | "upload"
  | "camera"
  | "lock"
  | "arrow"
  | "close"
  | "menu"
  | "spark";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    folder: (
      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-.6 2.2-2 .9-2-.6-2 3.4L4 10.5v3L2.4 15l2 3.4 2-.6 2 .9L9 21h4l.6-2.3 2-.9 2 .6 2-3.4-1.6-1.5v-3L19.6 9l-2-3.4-2 .6-2-.9L13 3Z" />
        <circle cx="11" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1-1.5 2m0 3h.01" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-11 12a2 2 0 0 0 4 0" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" />
        <path d="m8.5 11.5 2.5 2.5 4.5-5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>
    ),
    camera: (
      <>
        <path d="m8 5 1-2h6l1 2h4a2 2 0 0 1 2 2v12H2V7a2 2 0 0 1 2-2h4Z" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    spark: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
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
const initial: Settings = {
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
const storageKey = "orbit-profile-settings-v1";
function readSettings(): Settings {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      data &&
      Object.keys(initial).every(
        (key) => typeof data[key] === typeof initial[key as keyof Settings],
      )
    )
      return { ...initial, ...data };
  } catch {}
  return initial;
}
const languages = [
  { value: "ru", content: "Русский" },
  { value: "en", content: "English" },
  { value: "de", content: "Deutsch" },
  { value: "es", content: "Español" },
  { value: "fr", content: "Français" },
];
const timezones = [
  { value: "Europe/Moscow", content: "(UTC+03:00) Москва" },
  { value: "Europe/Kaliningrad", content: "(UTC+02:00) Калининград" },
  { value: "Europe/Samara", content: "(UTC+04:00) Самара" },
  { value: "Asia/Yekaterinburg", content: "(UTC+05:00) Екатеринбург" },
  { value: "Asia/Novosibirsk", content: "(UTC+07:00) Новосибирск" },
  { value: "Asia/Vladivostok", content: "(UTC+10:00) Владивосток" },
  { value: "UTC", content: "(UTC+00:00) Всемирное время" },
  { value: "Europe/Berlin", content: "Берлин — Europe/Berlin" },
  { value: "America/New_York", content: "Нью-Йорк — America/New_York" },
  { value: "Asia/Almaty", content: "(UTC+05:00) Алматы" },
];
function Avatar({
  settings,
  small = false,
}: {
  settings: Settings;
  small?: boolean;
}) {
  const initials =
    settings.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "А";
  return (
    <div className={`avatar ${small ? "avatar-small" : ""}`}>
      {settings.avatar ? (
        <img src={settings.avatar} alt="Аватар профиля" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-icon">
        <Icon name={icon} size={19} />
      </div>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
export function App() {
  const [saved, setSaved] = useState<Settings>(readSettings);
  const [form, setForm] = useState<Settings>(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tab, setTab] = useState("profile");
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }
  function notify(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((x) => ({
        ...x,
        avatar: "Выберите изображение JPG, PNG или WebP.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((x) => ({
        ...x,
        avatar: "Размер файла не должен превышать 5 МБ.",
      }));
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const context = canvas.getContext("2d");
      if (!context) throw new Error();
      const crop = Math.min(bitmap.width, bitmap.height);
      context.drawImage(
        bitmap,
        (bitmap.width - crop) / 2,
        (bitmap.height - crop) / 2,
        crop,
        crop,
        0,
        0,
        256,
        256,
      );
      bitmap.close();
      update("avatar", canvas.toDataURL("image/webp", 0.85));
    } catch {
      setErrors((x) => ({
        ...x,
        avatar: "Не удалось открыть изображение. Попробуйте другой файл.",
      }));
    }
  }
  function save(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Введите ваше имя";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "Введите корректный email";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(nextErrors.name ? "name" : "email")?.focus();
      return;
    }
    const cleaned = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(cleaned));
      setForm(cleaned);
      setSaved(cleaned);
      notify("Настройки успешно сохранены");
    } catch {
      notify(
        "Не удалось сохранить настройки. Проверьте доступ к хранилищу браузера.",
      );
    }
  }
  function goTo(id: string) {
    setTab(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSidebarOpen(false);
  }
  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <a className="brand" href="#" aria-label="Orbit — главная">
          <span className="brand-symbol">
            <span />
          </span>
          orbit<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <div className="workspace-icon">А</div>
          <div>
            <strong>Моё пространство</strong>
            <span>Личный аккаунт</span>
          </div>
          <span className="workspace-dots">···</span>
        </div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="primary-nav" aria-label="Основная навигация">
          <a href="#profile" onClick={() => goTo("profile")}>
            <Icon name="grid" />
            Обзор
          </a>
          <a href="#preferences" onClick={() => goTo("preferences")}>
            <Icon name="globe" />
            Предпочтения
          </a>
          <a href="#security" onClick={() => goTo("security")}>
            <Icon name="shield" />
            Безопасность
          </a>
          <a href="#notifications" onClick={() => goTo("notifications")}>
            <Icon name="bell" />
            Уведомления
          </a>
          <div className="nav-divider" />
          <a
            className="active"
            href="#profile"
            onClick={() => goTo("profile")}
            aria-current="page"
          >
            <Icon name="settings" />
            Настройки
            <span className="active-dot" />
          </a>
        </nav>
        <div className="sidebar-bottom">
          <button className="help-link" onClick={() => setHelpOpen(true)}>
            <Icon name="help" />
            Помощь и поддержка
            <Icon name="arrow" size={16} />
          </button>
          <div className="sidebar-account">
            <Avatar settings={saved} small />
            <div>
              <strong>{saved.name || "Ваш профиль"}</strong>
              <span>Личный аккаунт</span>
            </div>
            <Icon name="chevron" size={16} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Открыть меню"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Icon name="menu" />
            </button>
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>Настройки</strong>
          </div>
          <div className="topbar-right">
            <span className="personal-label">
              <span />
              Личное пространство
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              aria-label="Настройки уведомлений"
              onClick={() => goTo("notifications")}
            >
              <Icon name="bell" />
            </button>
            <Avatar settings={saved} small />
          </div>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ АККАУНТ</div>
              <h1>Настройки профиля</h1>
              <p>Всё, чтобы сделать пространство своим.</p>
            </div>
            <span className="account-badge">
              <Icon name="user" size={14} />
              Личный аккаунт
            </span>
          </div>
          <div className="tabs" role="navigation" aria-label="Разделы настроек">
            {[
              { id: "profile", label: "Мой профиль", icon: "user" },
              { id: "security", label: "Безопасность", icon: "shield" },
              { id: "notifications", label: "Уведомления", icon: "bell" },
            ].map((item) => (
              <button
                key={item.id}
                className={tab === item.id ? "selected" : ""}
                onClick={() => goTo(item.id)}
              >
                <Icon name={item.icon as IconName} size={17} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="settings-layout">
            <form className="settings-card" onSubmit={save} noValidate>
              <section id="profile" className="form-section">
                <SectionHeading
                  icon="user"
                  title="Личная информация"
                  description="Как вас будут видеть другие участники."
                />
                <div className="avatar-field">
                  <div className="avatar-wrapper">
                    <Avatar settings={form} />
                    <button
                      type="button"
                      className="camera-button"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Загрузить аватар"
                    >
                      <Icon name="camera" size={13} />
                    </button>
                  </div>
                  <div className="avatar-actions">
                    <div>
                      <Button size="m" onClick={() => fileRef.current?.click()}>
                        <Icon name="upload" size={15} />
                        Загрузить фото
                      </Button>
                      {form.avatar && (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => update("avatar", "")}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                    <p>JPG, PNG или WebP. Не более 5 МБ.</p>
                  </div>
                  <input
                    hidden
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={upload}
                    aria-label="Файл аватара"
                  />
                </div>
                {errors.avatar && (
                  <p className="field-error" role="alert">
                    {errors.avatar}
                  </p>
                )}
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="name">Имя</label>
                    <TextInput
                      id="name"
                      size="l"
                      value={form.name}
                      onUpdate={(v) => update("name", v)}
                      autoComplete="name"
                      validationState={errors.name ? "invalid" : undefined}
                      errorMessage={errors.name}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <TextInput
                      id="email"
                      type="email"
                      size="l"
                      value={form.email}
                      onUpdate={(v) => update("email", v)}
                      autoComplete="email"
                      startContent={<Icon name="mail" size={17} />}
                      validationState={errors.email ? "invalid" : undefined}
                      errorMessage={errors.email}
                    />
                  </div>
                </div>
              </section>
              <section id="preferences" className="form-section">
                <SectionHeading
                  icon="globe"
                  title="Предпочтения"
                  description="Настройте интерфейс под себя."
                />
                <div className="field-grid">
                  <div className="field">
                    <label id="language-label" htmlFor="language">
                      Язык интерфейса
                    </label>
                    <Select
                      id="language"
                      aria-labelledby="language-label"
                      size="l"
                      width="max"
                      value={[form.language]}
                      options={languages}
                      onUpdate={(v) => update("language", v[0])}
                    />
                  </div>
                  <div className="field">
                    <label id="timezone-label" htmlFor="timezone">
                      Часовой пояс
                    </label>
                    <Select
                      id="timezone"
                      aria-labelledby="timezone-label"
                      size="l"
                      width="max"
                      value={[form.timezone]}
                      options={timezones}
                      filterable
                      filterPlaceholder="Найти часовой пояс"
                      onUpdate={(v) => update("timezone", v[0])}
                    />
                  </div>
                </div>
                <p className="field-hint">
                  Время событий и уведомлений будет отображаться в вашем часовом
                  поясе.
                </p>
              </section>
              <section id="security" className="form-section">
                <SectionHeading icon="shield" title="Безопасность" />
                <div className="security-row">
                  <div>
                    <div className="setting-title">
                      Двухфакторная авторизация
                      <span className="recommended">Рекомендуем</span>
                    </div>
                    <p>Дополнительный уровень защиты вашего аккаунта.</p>
                  </div>
                  <Switch
                    size="l"
                    checked={form.twoFactor}
                    onUpdate={(v) => update("twoFactor", v)}
                    controlProps={{ "aria-label": "Двухфакторная авторизация" }}
                  />
                </div>
                {form.twoFactor && (
                  <p className="twofactor-note">
                    <Icon name="lock" size={14} />
                    Предпочтение сохранится локально. Для защиты входа
                    необходимо подключение сервера авторизации.
                  </p>
                )}
              </section>
              <section
                id="notifications"
                className="form-section notifications-section"
              >
                <SectionHeading
                  icon="bell"
                  title="Email-уведомления"
                  description="Выберите, какие письма вы хотите получать."
                />
                <div className="notification-options">
                  {[
                    {
                      key: "news",
                      title: "Новости продукта",
                      description:
                        "Новые возможности, улучшения и важные обновления.",
                    },
                    {
                      key: "alerts",
                      title: "Системные алерты",
                      description:
                        "Важные события и информация о безопасности аккаунта.",
                    },
                    {
                      key: "digest",
                      title: "Дайджест за неделю",
                      description:
                        "Главное о вашей активности — в одном письме.",
                    },
                  ].map((item) => (
                    <Checkbox
                      key={item.key}
                      size="l"
                      checked={form[item.key as "news" | "alerts" | "digest"]}
                      onUpdate={(v) =>
                        update(item.key as "news" | "alerts" | "digest", v)
                      }
                    >
                      <span className="checkbox-content">
                        <span>{item.title}</span>
                        <span>{item.description}</span>
                      </span>
                    </Checkbox>
                  ))}
                </div>
              </section>
              <footer className="form-footer">
                <span className={`save-status ${dirty ? "has-changes" : ""}`}>
                  <span />
                  {dirty
                    ? "Есть несохранённые изменения"
                    : "Все изменения сохранены"}
                </span>
                <div>
                  <Button
                    size="l"
                    onClick={() => {
                      setForm(saved);
                      setErrors({});
                      notify("Изменения отменены");
                    }}
                  >
                    Отмена
                  </Button>
                  <Button view="action" size="l" type="submit">
                    Сохранить
                    <Icon name="check" size={16} />
                  </Button>
                </div>
              </footer>
            </form>
            <aside className="details-column">
              <div className="profile-preview">
                <div className="preview-cover">
                  <div className="cover-orbit orbit-one" />
                  <div className="cover-orbit orbit-two" />
                  <span className="cover-star">✦</span>
                  <span className="cover-dot" />
                </div>
                <div className="preview-body">
                  <Avatar settings={form} />
                  <h3>{form.name.trim() || "Ваше имя"}</h3>
                  <p>{form.email || "Ваш email"}</p>
                  <span className="profile-badge">
                    <span />
                    Личный профиль
                  </span>
                  <div className="preview-divider" />
                  <div className="preview-caption">
                    <Icon name="user" size={15} />
                    <span>Так выглядит ваш профиль</span>
                  </div>
                </div>
              </div>
              <div className="privacy-card">
                <div className="privacy-icon">
                  <Icon name="shield" size={23} />
                </div>
                <h3>Ваши данные под защитой</h3>
                <p>
                  Вы сами решаете, какую информацию указывать и какие
                  уведомления получать.
                </p>
                <button onClick={() => setHelpOpen(true)}>
                  Подробнее о приватности
                  <Icon name="arrow" size={15} />
                </button>
              </div>
              <p className="side-note">
                <Icon name="lock" size={14} />
                <span>
                  Настройки доступны только вам.
                  <br />
                  Вы можете изменить их в любой момент.
                </span>
              </p>
            </aside>
          </div>
          <div className="page-footer">
            <span>© {new Date().getFullYear()} Orbit</span>
            <span>Пространство для ваших идей.</span>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon">
            <Icon name="check" size={18} />
          </span>
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Закрыть уведомление"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {helpOpen && (
        <div className="modal-backdrop" onClick={() => setHelpOpen(false)}>
          <div
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHelpOpen(false);
              if (e.key === "Tab") {
                e.preventDefault();
              }
            }}
          >
            <div className="modal-heading">
              <span className="privacy-icon">
                <Icon name="shield" />
              </span>
              <button
                autoFocus
                className="icon-button"
                onClick={() => setHelpOpen(false)}
                aria-label="Закрыть"
              >
                <Icon name="close" />
              </button>
            </div>
            <h2 id="help-title">Ваш профиль, ваши настройки</h2>
            <p>
              Измените данные и нажмите «Сохранить». Кнопка «Отмена» вернёт
              последние сохранённые значения.
            </p>
            <p>
              Данные и фото хранятся только в этом браузере. Они не отправляются
              на сервер и не синхронизируются с другими устройствами.
            </p>
            <p>
              Язык, часовой пояс, уведомления и двухфакторная авторизация
              сохраняются как предпочтения. Отправка писем и защита входа
              требуют подключения сервера.
            </p>
            <div className="modal-note">
              <Icon name="lock" size={18} />
              Вы управляете своими данными.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
