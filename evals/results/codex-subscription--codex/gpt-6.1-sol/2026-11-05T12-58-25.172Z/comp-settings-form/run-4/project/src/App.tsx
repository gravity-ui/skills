import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import "./styles.css";

type IconName =
  | "user"
  | "globe"
  | "shield"
  | "bell"
  | "chevron"
  | "arrow"
  | "check"
  | "upload"
  | "mail"
  | "help"
  | "close"
  | "sparkles"
  | "lock"
  | "menu";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
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
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9V8M10 21h4" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    upload: <path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 2M12 17h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    sparkles: (
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM20 2v4m-2-2h4" />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
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
      {...props}
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
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
};
const initialProfile: Profile = {
  name: "Александра Морозова",
  email: "alexandra.morozova@gmail.com",
  avatar: "/avatar.jpg",
  language: "ru",
  timezone: "Europe/Moscow",
  twoFactor: false,
  productNews: true,
  systemAlerts: true,
  weeklyDigest: false,
};
const storageKey = "orbit-profile-settings";
function readProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      value &&
      Object.keys(initialProfile).every(
        (key) =>
          typeof value[key] === typeof initialProfile[key as keyof Profile],
      )
    )
      return value;
  } catch {
    /* Use the initial profile if browser storage is unavailable. */
  }
  return initialProfile;
}

const navigation: { id: string; icon: IconName; label: string }[] = [
  { id: "profile", icon: "user", label: "Мой профиль" },
  { id: "preferences", icon: "globe", label: "Язык и регион" },
  { id: "security", icon: "shield", label: "Безопасность" },
  { id: "notifications", icon: "bell", label: "Уведомления" },
];

function Avatar({
  profile,
  small = false,
}: {
  profile: Profile;
  small?: boolean;
}) {
  return (
    <span className={`avatar ${small ? "avatar-small" : ""}`}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name} />
      ) : (
        <span>
          {profile.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "А"}
        </span>
      )}
    </span>
  );
}

export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [activeSection, setActiveSection] = useState("profile");
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(
    null,
  );
  const [avatarError, setAvatarError] = useState("");
  const [dialog, setDialog] = useState<"help" | "upgrade" | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Выберите изображение в формате JPG, PNG или WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Размер изображения не должен превышать 2 МБ.");
      return;
    }
    try {
      const avatar = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = avatar;
      });
      update("avatar", avatar);
      setAvatarError("");
    } catch {
      setAvatarError("Не удалось открыть изображение. Выберите другой файл.");
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile.name.trim()) {
      document.getElementById("name")?.focus();
      setToast({ text: "Пожалуйста, укажите имя.", error: true });
      return;
    }
    setIsSaving(true);
    try {
      const next = {
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
      };
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      setProfile(next);
      setAvatarError("");
      setToast({ text: "Настройки профиля сохранены" });
    } catch {
      setToast({
        text: "Не удалось сохранить настройки. Проверьте доступность хранилища браузера.",
        error: true,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function cancelChanges() {
    setProfile({ ...saved });
    setAvatarError("");
    setToast({
      text: dirty ? "Изменения отменены" : "Нет несохранённых изменений",
    });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" aria-label="Orbit — настройки профиля">
          <span className="brand-symbol">
            <i />
            <i />
            <i />
            <i />
          </span>
          orbit<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            А<span />
          </span>
          <div>
            <strong>Личное пространство</strong>
            <span>Ваш маленький порядок</span>
          </div>
          <Icon name="chevron" size={15} />
        </div>
        <div className="nav-heading">НАСТРОЙКИ АККАУНТА</div>
        <nav aria-label="Настройки аккаунта">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenu(false);
              }}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {activeSection === item.id && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-art" aria-hidden="true">
              <span />
              <span />
              <span />
              <Icon name="sparkles" size={23} />
            </div>
            <span className="plan-label">БОЛЬШЕ С ORBIT</span>
            <h3>Место для больших идей</h3>
            <p>
              Больше возможностей для всего,
              <br />
              что для вас важно.
            </p>
            <button type="button" onClick={() => setDialog("upgrade")}>
              Узнать о Pro <Icon name="arrow" size={16} />
            </button>
          </div>
          <button className="support-link" onClick={() => setDialog("help")}>
            <Icon name="help" size={18} />
            Помощь и поддержка
            <Icon name="arrow" size={15} />
          </button>
          <div className="sidebar-user">
            <Avatar profile={saved} small />
            <div>
              <strong>{saved.name}</strong>
              <span>Личный аккаунт</span>
            </div>
            <span className="online-dot" title="Аккаунт активен" />
          </div>
        </div>
        <button
          className="mobile-close icon-button"
          aria-label="Закрыть меню"
          onClick={() => setMobileMenu(false)}
        >
          <Icon name="close" />
        </button>
      </aside>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          aria-label="Закрыть меню"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileMenu(true)}
              aria-label="Открыть меню"
            >
              <Icon name="menu" />
            </button>
            <span>Настройки</span>
            <Icon name="chevron" size={13} />
            <strong>Мой профиль</strong>
          </div>
          <div className="topbar-actions">
            <span className="private-label">
              <Icon name="lock" size={14} />
              Личный аккаунт
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              aria-label="Помощь"
              onClick={() => setDialog("help")}
            >
              <Icon name="help" size={20} />
            </button>
            <a
              href="#notifications"
              className="icon-button notification-button"
              aria-label="Настройки уведомлений"
              onClick={() => setActiveSection("notifications")}
            >
              <Icon name="bell" size={20} />
              <span />
            </a>
            <Avatar profile={saved} small />
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ АККАУНТ, ВАШИ ПРАВИЛА</div>
              <h1>Настройки профиля</h1>
              <p>Немного о вас и о том, как вам удобно работать.</p>
            </div>
            <span className="secure-badge">
              <span />
              Всё под вашим контролем
            </span>
          </div>
          <form className="settings-card" onSubmit={saveProfile}>
            <section id="profile" className="settings-section profile-section">
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="user" />
                </span>
                <h2>Личные данные</h2>
                <p>
                  Так вас будут видеть
                  <br className="desktop-br" /> другие участники.
                </p>
              </div>
              <div className="section-content">
                <div className="avatar-row">
                  <div className="avatar-wrap">
                    <Avatar profile={profile} />
                    <span className="avatar-check">
                      <Icon name="check" size={11} />
                    </span>
                  </div>
                  <div className="avatar-controls">
                    <div className="avatar-buttons">
                      <button
                        className="button button-outline button-small"
                        type="button"
                        onClick={() => fileInput.current?.click()}
                      >
                        <Icon name="upload" size={15} />
                        Загрузить фото
                      </button>
                      <button
                        className="text-button"
                        type="button"
                        disabled={!profile.avatar}
                        onClick={() => {
                          update("avatar", "");
                          setAvatarError("");
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                    <span className="field-hint">
                      JPG, PNG или WebP. Не больше 2 МБ.
                    </span>
                    <input
                      className="visually-hidden"
                      type="file"
                      ref={fileInput}
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Загрузить аватар"
                      onChange={uploadAvatar}
                    />
                  </div>
                </div>
                {avatarError && (
                  <p className="field-error" role="alert">
                    {avatarError}
                  </p>
                )}
                <div className="field-grid">
                  <label className="field" htmlFor="name">
                    <span>
                      Имя <span className="required">*</span>
                    </span>
                    <div className="input-wrap">
                      <Icon name="user" size={17} />
                      <input
                        id="name"
                        name="name"
                        autoComplete="name"
                        maxLength={80}
                        required
                        value={profile.name}
                        onChange={(event) => update("name", event.target.value)}
                      />
                    </div>
                  </label>
                  <label className="field" htmlFor="email">
                    <span>
                      Email <span className="required">*</span>
                    </span>
                    <div className="input-wrap">
                      <Icon name="mail" size={17} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={profile.email}
                        onChange={(event) =>
                          update("email", event.target.value)
                        }
                      />
                    </div>
                  </label>
                </div>
                <p className="email-hint">
                  <Icon name="lock" size={12} />
                  Ваш email виден только вам.
                </p>
              </div>
            </section>
            <section id="preferences" className="settings-section">
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="globe" />
                </span>
                <h2>Язык и регион</h2>
                <p>
                  Привычный язык.
                  <br className="desktop-br" /> Правильное время.
                </p>
              </div>
              <div className="section-content">
                <div className="field-grid">
                  <label className="field" htmlFor="language">
                    <span>Язык интерфейса</span>
                    <div className="select-wrap">
                      <Icon name="globe" size={17} />
                      <select
                        id="language"
                        value={profile.language}
                        onChange={(event) =>
                          update("language", event.target.value)
                        }
                      >
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="zh">中文</option>
                      </select>
                      <Icon
                        name="chevron"
                        className="select-chevron"
                        size={14}
                      />
                    </div>
                  </label>
                  <label className="field" htmlFor="timezone">
                    <span>Часовой пояс</span>
                    <div className="select-wrap">
                      <select
                        id="timezone"
                        value={profile.timezone}
                        onChange={(event) =>
                          update("timezone", event.target.value)
                        }
                      >
                        <option value="Europe/Kaliningrad">
                          (UTC+02:00) Калининград
                        </option>
                        <option value="Europe/Moscow">
                          (UTC+03:00) Москва
                        </option>
                        <option value="Europe/Samara">
                          (UTC+04:00) Самара
                        </option>
                        <option value="Asia/Yekaterinburg">
                          (UTC+05:00) Екатеринбург
                        </option>
                        <option value="Asia/Omsk">(UTC+06:00) Омск</option>
                        <option value="Asia/Novosibirsk">
                          (UTC+07:00) Новосибирск
                        </option>
                        <option value="Asia/Irkutsk">
                          (UTC+08:00) Иркутск
                        </option>
                        <option value="Asia/Yakutsk">(UTC+09:00) Якутск</option>
                        <option value="Asia/Vladivostok">
                          (UTC+10:00) Владивосток
                        </option>
                        <option value="Asia/Magadan">
                          (UTC+11:00) Магадан
                        </option>
                        <option value="Asia/Kamchatka">
                          (UTC+12:00) Камчатка
                        </option>
                        <option value="UTC">(UTC+00:00) UTC</option>
                        <option value="Europe/London">
                          Лондон · Europe/London
                        </option>
                        <option value="Europe/Berlin">
                          Берлин · Europe/Berlin
                        </option>
                        <option value="Asia/Almaty">(UTC+05:00) Алматы</option>
                        <option value="America/New_York">
                          Нью-Йорк · America/New_York
                        </option>
                        <option value="America/Los_Angeles">
                          Лос-Анджелес · America/Los_Angeles
                        </option>
                      </select>
                      <Icon
                        name="chevron"
                        className="select-chevron"
                        size={14}
                      />
                    </div>
                  </label>
                </div>
                <p className="field-hint region-hint">
                  Используем для отображения дат и времени в вашем аккаунте.
                </p>
              </div>
            </section>
            <section
              id="security"
              className="settings-section security-section"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="shield" />
                </span>
                <h2>Безопасность</h2>
                <p>
                  Дополнительная забота
                  <br className="desktop-br" /> о вашем аккаунте.
                </p>
              </div>
              <div className="section-content">
                <label className="security-control" htmlFor="two-factor">
                  <span className="security-shield">
                    <Icon name="shield" size={23} />
                  </span>
                  <span className="control-copy">
                    <span className="control-title">
                      Двухфакторная авторизация{" "}
                      <span
                        className={`status-tag ${profile.twoFactor ? "enabled" : ""}`}
                      >
                        {profile.twoFactor ? "Включена" : "Выключена"}
                      </span>
                    </span>
                    <span className="field-hint">
                      Дополнительный уровень защиты при входе.
                    </span>
                  </span>
                  <span className="toggle">
                    <input
                      id="two-factor"
                      type="checkbox"
                      role="switch"
                      checked={profile.twoFactor}
                      onChange={(event) =>
                        update("twoFactor", event.target.checked)
                      }
                    />
                    <span className="toggle-track" />
                  </span>
                </label>
              </div>
            </section>
            <section
              id="notifications"
              className="settings-section notifications-section"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="bell" />
                </span>
                <h2>Email-уведомления</h2>
                <p>
                  Только то, что вам
                  <br className="desktop-br" /> действительно интересно.
                </p>
              </div>
              <div className="section-content notification-options">
                {(
                  [
                    {
                      key: "productNews",
                      title: "Новости продукта",
                      description:
                        "Новые функции, улучшения и важные обновления.",
                    },
                    {
                      key: "systemAlerts",
                      title: "Системные алерты",
                      description:
                        "Безопасность аккаунта и важные системные события.",
                    },
                    {
                      key: "weeklyDigest",
                      title: "Дайджест за неделю",
                      description: "Всё самое важное за неделю в одном письме.",
                    },
                  ] as const
                ).map((item) => (
                  <label className="checkbox-row" key={item.key}>
                    <span className="checkbox">
                      <input
                        type="checkbox"
                        checked={profile[item.key]}
                        onChange={(event) =>
                          update(item.key, event.target.checked)
                        }
                      />
                      <span className="checkbox-visual">
                        <Icon name="check" size={13} />
                      </span>
                    </span>
                    <span className="control-copy">
                      <span className="control-title">{item.title}</span>
                      <span className="field-hint">{item.description}</span>
                    </span>
                  </label>
                ))}
                <div className="notification-note">
                  <Icon name="mail" size={14} />
                  <span>Никакого спама. Обещаем.</span>
                </div>
              </div>
            </section>
            <footer className="form-footer">
              <span className={`save-hint ${dirty ? "unsaved" : ""}`}>
                <Icon name={dirty ? "user" : "check"} size={15} />
                {dirty
                  ? "Есть несохранённые изменения"
                  : "Все изменения сохранены"}
              </span>
              <div className="form-actions">
                <button
                  className="button button-outline"
                  type="button"
                  onClick={cancelChanges}
                >
                  Отмена
                </button>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={isSaving}
                >
                  <Icon name="check" size={17} />
                  {isSaving ? "Сохранение…" : "Сохранить"}
                </button>
              </div>
            </footer>
          </form>
          <div className="page-footer">
            <span>
              <Icon name="lock" size={13} />
              Ваши данные в надёжных руках.
            </span>
            <span>
              С заботой о вашем пространстве{" "}
              <span className="little-flower">✳</span>
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div
          className={`toast ${toast.error ? "toast-error" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          <span className="toast-icon">
            <Icon name={toast.error ? "help" : "check"} size={18} />
          </span>
          {toast.text}
          <button
            className="icon-button"
            aria-label="Закрыть уведомление"
            onClick={() => setToast(null)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {dialog && (
        <div className="modal-backdrop" onClick={() => setDialog(null)}>
          <dialog
            open
            aria-modal="true"
            className="modal"
            aria-labelledby="dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              autoFocus
              className="icon-button modal-close"
              aria-label="Закрыть"
              onClick={() => setDialog(null)}
            >
              <Icon name="close" />
            </button>
            <span className="modal-icon">
              <Icon name={dialog === "help" ? "help" : "sparkles"} size={28} />
            </span>
            <h2 id="dialog-title">
              {dialog === "help"
                ? "Всё о настройках"
                : "Больше пространства с Pro"}
            </h2>
            {dialog === "help" ? (
              <>
                <p>
                  Измените личные данные, выберите язык и часовой пояс,
                  настройте безопасность и письма от Orbit.
                </p>
                <p>
                  Нажмите «Сохранить», чтобы сохранить настройки в этом
                  браузере. «Отмена» вернёт последние сохранённые значения.
                </p>
                <p className="field-hint">
                  Для аватара подойдёт JPG, PNG или WebP размером до 2 МБ.
                </p>
              </>
            ) : (
              <>
                <p>
                  Соберите все ваши идеи в одном месте: больше проектов, больше
                  места для файлов и расширенные возможности для команды.
                </p>
                <div className="coming-soon">
                  <Icon name="sparkles" size={17} />
                  Orbit Pro скоро появится
                </div>
                <p className="field-hint">
                  А пока все настройки вашего профиля доступны бесплатно.
                </p>
              </>
            )}
            <button
              type="button"
              className="button button-primary modal-done"
              onClick={() => setDialog(null)}
            >
              Понятно
            </button>
          </dialog>
        </div>
      )}
    </div>
  );
}
