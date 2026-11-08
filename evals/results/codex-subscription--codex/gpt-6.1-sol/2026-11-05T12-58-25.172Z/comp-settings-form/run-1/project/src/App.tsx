import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import "./styles.css";

type IconName =
  | "user"
  | "bell"
  | "shield"
  | "chevron"
  | "arrow"
  | "help"
  | "upload"
  | "check"
  | "globe"
  | "clock"
  | "mail"
  | "close"
  | "sparkles"
  | "external"
  | "menu";
const paths: Record<IconName, ReactNode> = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  chevron: <path d="m8 10 4 4 4-4" />,
  arrow: <path d="m9 5 7 7-7 7" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 2.5M12 17h.01" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V3m-4 4 4-4 4 4M4 15v5h16v-5" />
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
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      <path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5L20 2Z" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7m0-7L10 14" />
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};
function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
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

const copy = {
  ru: {
    workspace: "Личное пространство",
    settings: "Настройки",
    profile: "Мой профиль",
    security: "Безопасность",
    notifications: "Уведомления",
    account: "Ваш аккаунт",
    title: "Настройки профиля",
    subtitle: "Ваши данные и предпочтения — всё в одном месте.",
    saved: "Все изменения сохранены",
    unsaved: "Есть несохранённые изменения",
    personal: "Личные данные",
    personalHint:
      "Познакомимся поближе. Так вас будут видеть другие участники.",
    photo: "Фото профиля",
    upload: "Загрузить фото",
    remove: "Удалить",
    imageHint: "JPG, PNG или WebP. Не больше 5 МБ.",
    name: "Имя",
    namePlaceholder: "Как к вам обращаться?",
    email: "Email",
    emailHint: "Используем для входа в аккаунт и важных писем.",
    preferences: "Язык и время",
    preferencesHint: "Пусть пространство говорит на вашем языке.",
    language: "Язык интерфейса",
    timezone: "Часовой пояс",
    securityHint: "Дополнительная защита вашего аккаунта.",
    twoFactor: "Двухфакторная авторизация",
    twoFactorHint: "Дополнительный код подтверждения при входе в аккаунт.",
    enabled: "Включена",
    disabled: "Выключена",
    notificationsHint: "Выбирайте, какие письма вы хотите получать.",
    emailNotifications: "Email-уведомления",
    news: "Новости продукта",
    newsHint: "Новые возможности, обновления и полезные советы.",
    alerts: "Системные алерты",
    alertsHint: "Важные события и изменения в вашем аккаунте.",
    digest: "Дайджест за неделю",
    digestHint: "Краткий обзор вашей активности за неделю.",
    privacy: "Эти настройки всегда можно изменить",
    save: "Сохранить",
    cancel: "Отмена",
    success: "Настройки профиля сохранены",
    cancelled: "Изменения отменены",
    help: "Нужна помощь?",
    helpTitle: "Мы рядом, если что",
    helpHint: "Ответы на вопросы о вашем аккаунте.",
    tipTitle: "Маленькие настройки.\nБольшой комфорт.",
    tipText: "Создайте пространство, в котором приятно работать.",
    nameError: "Введите ваше имя.",
    emailError: "Введите корректный email.",
    imageError: "Выберите изображение JPG, PNG или WebP размером до 5 МБ.",
    readError: "Не удалось прочитать файл. Попробуйте другое изображение.",
    storageError:
      "Не удалось сохранить данные. Попробуйте уменьшить размер фото.",
    helpContent:
      "Измените нужные поля и нажмите «Сохранить». Кнопка «Отмена» восстановит последние сохранённые настройки. Фото можно загрузить в формате JPG, PNG или WebP, размером до 5 МБ. Настройки сохраняются в этом браузере.",
    understood: "Понятно",
    member: "Личный аккаунт",
  },
  en: {
    workspace: "Personal workspace",
    settings: "Settings",
    profile: "My profile",
    security: "Security",
    notifications: "Notifications",
    account: "Your account",
    title: "Profile settings",
    subtitle: "Your personal details and preferences, all in one place.",
    saved: "All changes saved",
    unsaved: "You have unsaved changes",
    personal: "Personal information",
    personalHint:
      "Let’s get to know you. This is how other members will see you.",
    photo: "Profile photo",
    upload: "Upload photo",
    remove: "Remove",
    imageHint: "JPG, PNG or WebP. Up to 5 MB.",
    name: "Name",
    namePlaceholder: "What should we call you?",
    email: "Email",
    emailHint: "Used to sign in and receive important messages.",
    preferences: "Language & time",
    preferencesHint: "Make your workspace feel a little more like you.",
    language: "Interface language",
    timezone: "Time zone",
    securityHint: "An extra layer of protection for your account.",
    twoFactor: "Two-factor authentication",
    twoFactorHint: "An additional verification code when signing in.",
    enabled: "Enabled",
    disabled: "Disabled",
    notificationsHint: "Choose the emails you’d like to receive.",
    emailNotifications: "Email notifications",
    news: "Product news",
    newsHint: "New features, updates and useful tips.",
    alerts: "System alerts",
    alertsHint: "Important events and changes to your account.",
    digest: "Weekly digest",
    digestHint: "A quick overview of your activity each week.",
    privacy: "You can change these settings anytime",
    save: "Save changes",
    cancel: "Cancel",
    success: "Profile settings saved",
    cancelled: "Changes discarded",
    help: "Need help?",
    helpTitle: "We’re here for you",
    helpHint: "Answers to your account questions.",
    tipTitle: "Small settings.\nA big difference.",
    tipText: "Create a space that feels good to work in.",
    nameError: "Please enter your name.",
    emailError: "Please enter a valid email.",
    imageError: "Choose a JPG, PNG or WebP image up to 5 MB.",
    readError: "Could not read this file. Please try another image.",
    storageError: "Could not save your settings. Try a smaller photo.",
    helpContent:
      "Edit your details and select “Save changes”. “Cancel” restores your last saved settings. Upload a JPG, PNG or WebP photo up to 5 MB. Settings are stored in this browser.",
    understood: "Got it",
    member: "Personal account",
  },
};
type Profile = {
  name: string;
  email: string;
  avatar: string;
  language: "ru" | "en";
  timezone: string;
  twoFactor: boolean;
  news: boolean;
  alerts: boolean;
  digest: boolean;
};
const defaults: Profile = {
  name: "Александр Петров",
  email: "alex.petrov@gmail.com",
  avatar: "/avatar.jpg",
  language: "ru",
  timezone: "Europe/Moscow",
  twoFactor: false,
  news: true,
  alerts: true,
  digest: false,
};
const storageKey = "orbit-profile-v1";
const timezones = [
  ["Pacific/Honolulu", "(UTC−10:00) Гонолулу", "(UTC−10:00) Honolulu"],
  ["America/Los_Angeles", "Лос-Анджелес", "Los Angeles"],
  ["America/New_York", "Нью-Йорк", "New York"],
  ["America/Sao_Paulo", "(UTC−03:00) Сан-Паулу", "(UTC−03:00) São Paulo"],
  ["UTC", "(UTC+00:00) Всемирное время", "(UTC+00:00) Universal time"],
  ["Europe/London", "Лондон", "London"],
  ["Europe/Berlin", "Берлин", "Berlin"],
  ["Europe/Moscow", "(UTC+03:00) Москва", "(UTC+03:00) Moscow"],
  ["Asia/Dubai", "(UTC+04:00) Дубай", "(UTC+04:00) Dubai"],
  [
    "Asia/Yekaterinburg",
    "(UTC+05:00) Екатеринбург",
    "(UTC+05:00) Yekaterinburg",
  ],
  ["Asia/Almaty", "(UTC+05:00) Алматы", "(UTC+05:00) Almaty"],
  ["Asia/Kolkata", "(UTC+05:30) Калькутта", "(UTC+05:30) Kolkata"],
  ["Asia/Novosibirsk", "(UTC+07:00) Новосибирск", "(UTC+07:00) Novosibirsk"],
  ["Asia/Shanghai", "(UTC+08:00) Шанхай", "(UTC+08:00) Shanghai"],
  ["Asia/Tokyo", "(UTC+09:00) Токио", "(UTC+09:00) Tokyo"],
  ["Asia/Vladivostok", "(UTC+10:00) Владивосток", "(UTC+10:00) Vladivostok"],
  ["Australia/Sydney", "Сидней", "Sydney"],
];
function getInitialProfile(): Profile {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(storageKey) || "null",
    );
    if (stored && typeof stored === "object") {
      const value = stored as Profile;
      if (
        typeof value.name === "string" &&
        typeof value.email === "string" &&
        typeof value.avatar === "string" &&
        ["ru", "en"].includes(value.language) &&
        timezones.some(([zone]) => zone === value.timezone) &&
        ["twoFactor", "news", "alerts", "digest"].every(
          (key) => typeof value[key as keyof Profile] === "boolean",
        )
      )
        return value;
    }
  } catch {
    /* Editing still works when browser storage is unavailable. */
  }
  return { ...defaults };
}
function Avatar({
  src,
  name,
  className = "",
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <span className={`avatar ${className}`}>
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>
          {name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "O"}
        </span>
      )}
    </span>
  );
}

export function App() {
  const [saved, setSaved] = useState<Profile>(getInitialProfile);
  const [profile, setProfile] = useState<Profile>(() => ({ ...saved }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const fileRef = useRef<HTMLInputElement>(null);
  const helpRef = useRef<HTMLDialogElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const imageVersion = useRef(0);
  const t = copy[profile.language];
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  useEffect(() => {
    document.title = `${t.title} · orbit`;
    document.documentElement.lang = profile.language;
  }, [profile.language, t.title]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (helpOpen) helpRef.current?.showModal();
    else if (helpRef.current?.open) helpRef.current.close();
  }, [helpOpen]);
  useEffect(() => {
    function warnOnExit(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warnOnExit);
    return () => window.removeEventListener("beforeunload", warnOnExit);
  }, [dirty]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setToast("");
  }
  function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setErrors((current) => ({ ...current, avatar: t.imageError }));
      return;
    }
    const version = ++imageVersion.current;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const image = new Image();
      image.onload = () => {
        if (version !== imageVersion.current) return;
        // Keep even a 5 MB source photo small enough for persistent browser storage.
        const canvas = document.createElement("canvas");
        const scale = Math.min(
          1,
          512 / Math.max(image.naturalWidth, image.naturalHeight),
        );
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          update("avatar", canvas.toDataURL("image/webp", 0.88));
        } else update("avatar", result);
      };
      image.onerror = () => {
        if (version === imageVersion.current)
          setErrors((current) => ({ ...current, avatar: t.readError }));
      };
      image.src = result;
    };
    reader.onerror = () =>
      setErrors((current) => ({ ...current, avatar: t.readError }));
    reader.readAsDataURL(file);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!profile.name.trim()) nextErrors.name = t.nameError;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()))
      nextErrors.email = t.emailError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    const next = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      setProfile(next);
      setToast(t.success);
    } catch {
      setErrors({ storage: t.storageError });
    }
  }
  function cancel() {
    imageVersion.current++;
    setProfile({ ...saved });
    setErrors({});
    setToast(copy[saved.language].cancelled);
  }
  function navigate(id: string) {
    setActiveSection(id);
    setMobileNavOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="app-shell">
      {mobileNavOpen && (
        <button
          className="nav-overlay"
          aria-label={t.cancel}
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        id="profile-navigation"
        className={`sidebar ${mobileNavOpen ? "is-open" : ""}`}
      >
        <a
          href="#personal"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            navigate("personal");
          }}
          aria-label="orbit"
        >
          <span className="brand-mark">
            <span />
            <span />
          </span>
          orbit<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <div className="workspace-icon">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>{t.workspace}</strong>
            <span>Personal workspace</span>
          </div>
          <span className="workspace-dot" />
        </div>
        <div className="nav-label">{t.settings}</div>
        <nav aria-label={t.settings} className="side-nav">
          {(
            [
              { id: "personal", name: "user", label: t.profile },
              { id: "security", name: "shield", label: t.security },
              { id: "notifications", name: "bell", label: t.notifications },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              aria-current={activeSection === item.id ? "location" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.name} />
              <span>{item.label}</span>
              {activeSection === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="comfort-card">
            <div className="comfort-symbol">
              <Icon name="sparkles" size={22} />
            </div>
            <h3>{t.tipTitle}</h3>
            <p>{t.tipText}</p>
            <span className="comfort-orbit orbit-one" />
            <span className="comfort-orbit orbit-two" />
          </div>
          <button
            className="help-button"
            ref={helpButtonRef}
            onClick={() => setHelpOpen(true)}
          >
            <Icon name="help" size={19} />
            <span>{t.help}</span>
            <Icon name="external" size={15} />
          </button>
          <div className="sidebar-account">
            <Avatar src={saved.avatar} name={saved.name} />
            <div>
              <strong>{saved.name}</strong>
              <span>{t.member}</span>
            </div>
            <span className="account-online" />
          </div>
        </div>
      </aside>

      <div className="page-shell">
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu icon-button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t.settings}
            aria-expanded={mobileNavOpen}
            aria-controls="profile-navigation"
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumbs">
            <span>{t.settings}</span>
            <Icon name="arrow" size={12} />
            <span>{t.profile}</span>
          </div>
          <div className="topbar-right">
            <span className="personal-label">{t.workspace}</span>
            <span className="topbar-divider" />
            <Avatar src={saved.avatar} name={saved.name} />
          </div>
        </header>

        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">{t.account}</div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
            <span className={`save-status ${dirty ? "is-dirty" : ""}`}>
              <span />
              {dirty ? t.unsaved : t.saved}
            </span>
          </div>

          <form className="settings-card" noValidate onSubmit={save}>
            <section
              className="settings-section personal-section"
              id="personal"
              aria-labelledby="personal-title"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="user" />
                </span>
                <div>
                  <h2 id="personal-title">{t.personal}</h2>
                  <p>{t.personalHint}</p>
                </div>
              </div>
              <div className="avatar-row">
                <div className="avatar-wrap">
                  <Avatar
                    src={profile.avatar}
                    name={profile.name}
                    className="large-avatar"
                  />
                  <span className="avatar-edit">
                    <Icon name="user" size={12} />
                  </span>
                </div>
                <div className="avatar-controls">
                  <div className="avatar-actions">
                    <button
                      className="button button-outline upload-button"
                      type="button"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Icon name="upload" size={16} />
                      {t.upload}
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      disabled={!profile.avatar}
                      onClick={() => {
                        imageVersion.current++;
                        update("avatar", "");
                      }}
                    >
                      {t.remove}
                    </button>
                  </div>
                  <p
                    className={errors.avatar ? "field-error" : "field-hint"}
                    id="avatar-hint"
                  >
                    {errors.avatar || t.imageHint}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    className="visually-hidden"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label={t.photo}
                    aria-describedby="avatar-hint"
                    onChange={onPhoto}
                  />
                </div>
              </div>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="name">{t.name}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    placeholder={t.namePlaceholder}
                    value={profile.name}
                    onChange={(event) => update("name", event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p className="field-error" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="email">{t.email}</label>
                  <div className="input-with-icon">
                    <Icon name="mail" size={17} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      placeholder="you@example.com"
                      value={profile.email}
                      onChange={(event) => update("email", event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby="email-hint"
                    />
                  </div>
                  <p
                    className={errors.email ? "field-error" : "field-hint"}
                    id="email-hint"
                  >
                    {errors.email || t.emailHint}
                  </p>
                </div>
              </div>
            </section>

            <section
              className="settings-section"
              aria-labelledby="preferences-title"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="globe" />
                </span>
                <div>
                  <h2 id="preferences-title">{t.preferences}</h2>
                  <p>{t.preferencesHint}</p>
                </div>
              </div>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="language">{t.language}</label>
                  <div className="select-wrap">
                    <span
                      className={`language-flag flag-${profile.language}`}
                      aria-hidden="true"
                    >
                      {profile.language === "en" && (
                        <svg viewBox="0 0 60 40">
                          <rect width="60" height="40" fill="#31558e" />
                          <path
                            d="m0 0 60 40M60 0 0 40"
                            stroke="#fff"
                            strokeWidth="9"
                          />
                          <path
                            d="m0 0 60 40M60 0 0 40"
                            stroke="#ce5362"
                            strokeWidth="3"
                          />
                          <path
                            d="M30 0v40M0 20h60"
                            stroke="#fff"
                            strokeWidth="13"
                          />
                          <path
                            d="M30 0v40M0 20h60"
                            stroke="#ce5362"
                            strokeWidth="7"
                          />
                        </svg>
                      )}
                    </span>
                    <select
                      id="language"
                      value={profile.language}
                      onChange={(event) =>
                        update(
                          "language",
                          event.target.value as Profile["language"],
                        )
                      }
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                    <Icon name="chevron" size={17} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="timezone">{t.timezone}</label>
                  <div className="select-wrap">
                    <Icon
                      name="clock"
                      size={17}
                      className="select-start-icon"
                    />
                    <select
                      id="timezone"
                      value={profile.timezone}
                      onChange={(event) =>
                        update("timezone", event.target.value)
                      }
                    >
                      {timezones.map(([zone, ru, en]) => (
                        <option key={zone} value={zone}>
                          {profile.language === "ru" ? ru : en}
                        </option>
                      ))}
                    </select>
                    <Icon name="chevron" size={17} />
                  </div>
                </div>
              </div>
            </section>

            <section
              className="settings-section"
              id="security"
              aria-labelledby="security-title"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="shield" />
                </span>
                <div>
                  <h2 id="security-title">{t.security}</h2>
                  <p>{t.securityHint}</p>
                </div>
              </div>
              <div className="security-option">
                <div>
                  <div className="option-title">
                    <label htmlFor="two-factor">{t.twoFactor}</label>
                    <span
                      className={`security-badge ${profile.twoFactor ? "enabled" : ""}`}
                    >
                      {profile.twoFactor ? t.enabled : t.disabled}
                    </span>
                  </div>
                  <p id="two-factor-hint">{t.twoFactorHint}</p>
                </div>
                <button
                  type="button"
                  id="two-factor"
                  role="switch"
                  aria-checked={profile.twoFactor}
                  aria-label={t.twoFactor}
                  aria-describedby="two-factor-hint"
                  className={`toggle ${profile.twoFactor ? "checked" : ""}`}
                  onClick={() => update("twoFactor", !profile.twoFactor)}
                >
                  <span />
                </button>
              </div>
            </section>

            <section
              className="settings-section notifications-section"
              id="notifications"
              aria-labelledby="notifications-title"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="bell" />
                </span>
                <div>
                  <h2 id="notifications-title">{t.notifications}</h2>
                  <p>{t.notificationsHint}</p>
                </div>
                <span className="email-chip">
                  <Icon name="mail" size={13} />
                  Email
                </span>
              </div>
              <fieldset className="notification-options">
                <legend className="visually-hidden">
                  {t.emailNotifications}
                </legend>
                {(
                  [
                    { key: "news", title: t.news, hint: t.newsHint },
                    { key: "alerts", title: t.alerts, hint: t.alertsHint },
                    { key: "digest", title: t.digest, hint: t.digestHint },
                  ] as const
                ).map((item) => (
                  <label className="checkbox-row" key={item.key}>
                    <span className="checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={profile[item.key]}
                        onChange={(event) =>
                          update(item.key, event.target.checked)
                        }
                        aria-describedby={`${item.key}-hint`}
                      />
                      <span className="checkbox-visual">
                        <Icon name="check" size={13} />
                      </span>
                    </span>
                    <span>
                      <span className="checkbox-title">{item.title}</span>
                      <span className="checkbox-hint" id={`${item.key}-hint`}>
                        {item.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </section>

            <footer className="form-footer">
              <span className="privacy-note">
                <Icon name="shield" size={15} />
                {t.privacy}
              </span>
              <div className="footer-actions">
                <button
                  className="button button-outline cancel-button"
                  type="button"
                  onClick={cancel}
                  disabled={!dirty && !Object.values(errors).some(Boolean)}
                >
                  {t.cancel}
                </button>
                <button className="button button-primary" type="submit">
                  <Icon name="check" size={16} />
                  {t.save}
                </button>
              </div>
              {errors.storage && (
                <p className="field-error storage-error" role="alert">
                  {errors.storage}
                </p>
              )}
            </footer>
          </form>
          <div className="page-footer">
            <span className="footer-brand">orbit.</span>
            <span>Made for your flow.</span>
            <span className="footer-year">
              © {new Date().getFullYear()} Orbit
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={15} />
          </span>
          {toast}
          <button
            className="icon-button"
            type="button"
            aria-label={t.cancel}
            onClick={() => setToast("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={helpRef}
        className="help-dialog"
        onCancel={() => setHelpOpen(false)}
        onClose={() => {
          setHelpOpen(false);
          helpButtonRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setHelpOpen(false);
        }}
        aria-labelledby="help-title"
      >
        <div className="dialog-header">
          <span className="section-icon">
            <Icon name="help" />
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={t.cancel}
            onClick={() => setHelpOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <h2 id="help-title">{t.helpTitle}</h2>
        <p>{t.helpContent}</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setHelpOpen(false)}
        >
          {t.understood}
        </button>
      </dialog>
    </div>
  );
}
