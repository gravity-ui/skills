import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button, Checkbox, Select, Switch, TextInput } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "user"
  | "shield"
  | "bell"
  | "globe"
  | "chevron"
  | "upload"
  | "trash"
  | "check"
  | "help"
  | "arrow"
  | "lock"
  | "close"
  | "mail";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
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
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.8-1.7 1.2-1.7 2.7M12 17h.01" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
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
  name: "Александра Смирнова",
  email: "alexandra.smirnova@gmail.com",
  avatar: "/avatar.jpg",
  language: "ru",
  timezone: "Europe/Moscow",
  twoFactor: false,
  product: true,
  alerts: true,
  digest: false,
};
const languages = [
  { value: "ru", content: "Русский" },
  { value: "en", content: "English" },
  { value: "de", content: "Deutsch" },
  { value: "fr", content: "Français" },
  { value: "es", content: "Español" },
];
const timezones = [
  { value: "Europe/Moscow", content: "(UTC+03:00) Москва" },
  { value: "Europe/Kaliningrad", content: "(UTC+02:00) Калининград" },
  { value: "Asia/Yekaterinburg", content: "(UTC+05:00) Екатеринбург" },
  { value: "Asia/Novosibirsk", content: "(UTC+07:00) Новосибирск" },
  { value: "Asia/Vladivostok", content: "(UTC+10:00) Владивосток" },
  { value: "UTC", content: "(UTC+00:00) Всемирное время" },
  { value: "Europe/London", content: "Лондон · Europe/London" },
  { value: "Europe/Berlin", content: "Берлин · Europe/Berlin" },
  { value: "America/New_York", content: "Нью-Йорк · America/New_York" },
  { value: "Asia/Dubai", content: "(UTC+04:00) Дубай" },
];
function loadProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem("forma-profile") || "null");
    if (!value || typeof value !== "object") return initialProfile;
    const profile = { ...initialProfile };
    for (const key of Object.keys(initialProfile) as (keyof Profile)[]) {
      if (typeof value[key] === typeof initialProfile[key])
        (profile as Record<string, unknown>)[key] = value[key];
    }
    if (!languages.some((item) => item.value === profile.language))
      profile.language = "ru";
    if (!timezones.some((item) => item.value === profile.timezone))
      profile.timezone = "Europe/Moscow";
    return profile;
  } catch {
    return initialProfile;
  }
}
function Avatar({
  profile,
  small = false,
}: {
  profile: Profile;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [profile.avatar]);
  return (
    <span className={`avatar ${small ? "avatar-small" : ""}`}>
      {profile.avatar && !failed ? (
        <img
          src={profile.avatar}
          alt={small ? "" : "Фото профиля"}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {profile.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "А"}
        </span>
      )}
    </span>
  );
}

export function App() {
  const [saved, setSaved] = useState<Profile>(loadProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [active, setActive] = useState("personal");
  const [toast, setToast] = useState("");
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [uploading, setUploading] = useState(false);
  const [help, setHelp] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const helpRef = useRef<HTMLDialogElement>(null);
  const uploadVersion = useRef(0);
  const dirty = JSON.stringify(saved) !== JSON.stringify(profile);

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    if (help) helpRef.current?.showModal();
    else helpRef.current?.close();
  }, [help]);
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    if (key === "name" || key === "email")
      setErrors((e) => ({ ...e, [key]: undefined }));
  }
  function goTo(id: string) {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFileError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFileError("Выберите изображение JPG, PNG или WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Размер файла не должен превышать 5 МБ.");
      return;
    }
    const version = ++uploadVersion.current;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (version !== uploadVersion.current) return;
        const canvas = document.createElement("canvas");
        const side = Math.min(image.width, image.height);
        canvas.width = 256;
        canvas.height = 256;
        canvas
          .getContext("2d")
          ?.drawImage(
            image,
            (image.width - side) / 2,
            (image.height - side) / 2,
            side,
            side,
            0,
            0,
            256,
            256,
          );
        update("avatar", canvas.toDataURL("image/jpeg", 0.88));
        setUploading(false);
      };
      image.onerror = () => {
        if (version === uploadVersion.current) {
          setFileError("Не удалось открыть изображение. Выберите другой файл.");
          setUploading(false);
        }
      };
      image.src = reader.result as string;
    };
    reader.onerror = () => {
      if (version === uploadVersion.current) {
        setFileError("Не удалось загрузить файл. Попробуйте ещё раз.");
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!profile.name.trim()) nextErrors.name = "Укажите ваше имя";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()))
      nextErrors.email = "Введите корректный email";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(nextErrors.name ? "name" : "email")?.focus();
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
      setToast("Настройки сохранены на этом устройстве");
    } catch {
      setToast(
        "Не удалось сохранить настройки. Проверьте доступ к хранилищу браузера.",
      );
    }
  }
  function cancel() {
    uploadVersion.current++;
    setUploading(false);
    setProfile(saved);
    setErrors({});
    setFileError("");
    if (dirty) setToast("Изменения отменены");
  }

  const navigation: { id: string; title: string; icon: IconName }[] = [
    { id: "personal", title: "Мой профиль", icon: "user" },
    { id: "security", title: "Безопасность", icon: "shield" },
    { id: "notifications", title: "Уведомления", icon: "bell" },
    { id: "regional", title: "Язык и регион", icon: "globe" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          aria-label="Forma — настройки профиля"
          onClick={() => goTo("personal")}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          forma<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            A<span>✦</span>
          </span>
          <div>
            <strong>Личное пространство</strong>
            <span>Ваш уютный уголок</span>
          </div>
          <span className="workspace-chevron">
            <Icon name="chevron" size={13} />
          </span>
        </div>
        <div className="nav-label">НАСТРОЙКИ АККАУНТА</div>
        <nav className="side-nav" aria-label="Настройки аккаунта">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "nav-item active" : "nav-item"}
              onClick={() => goTo(item.id)}
              aria-current={active === item.id ? "location" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.title}</span>
              {active === item.id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-art">
              <Icon name="help" size={23} />
              <span className="spark spark-one">✦</span>
              <span className="spark spark-two">✧</span>
            </span>
            <strong>Всё начинается с вас</strong>
            <p>
              Настройте пространство так,
              <br />
              чтобы вам было удобно.
            </p>
            <button onClick={() => setHelp(true)}>
              Нужна помощь? <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="sidebar-account">
            <Avatar profile={saved} small />
            <div>
              <strong>{saved.name.split(" ")[0]}</strong>
              <span>Личный аккаунт</span>
            </div>
            <span className="account-status" title="Аккаунт активен" />
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Аккаунт</span>
            <Icon name="chevron" size={12} />
            <span>Настройки профиля</span>
          </div>
          <div className="topbar-right">
            <span className="private-badge">
              <span />
              Личное пространство
            </span>
            <button
              className="icon-button help-button"
              aria-label="Помощь"
              onClick={() => setHelp(true)}
            >
              <Icon name="help" />
            </button>
            <span className="topbar-divider" />
            <Avatar profile={saved} small />
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ АККАУНТ</div>
              <h1>
                Настройки профиля<span className="heading-dot">.</span>
              </h1>
              <p>Немного о вас. Всё — под вашим контролем.</p>
            </div>
            <span className="profile-label">
              <Icon name="user" size={15} />
              Личный профиль
            </span>
          </div>
          <form className="settings-card" onSubmit={save} noValidate>
            <section
              id="personal"
              className="settings-section personal-section"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="user" size={18} />
                </span>
                <div>
                  <h2>Личная информация</h2>
                  <p>Так вас будут видеть в рабочем пространстве.</p>
                </div>
              </div>
              <div className="avatar-row">
                <div className="avatar-wrapper">
                  <Avatar profile={profile} />
                  <span className="avatar-online" />
                </div>
                <div className="avatar-actions">
                  <div className="avatar-buttons">
                    <Button
                      size="m"
                      view="outlined"
                      className="upload-button"
                      onClick={() => fileRef.current?.click()}
                      loading={uploading}
                    >
                      <Icon name="upload" size={15} />
                      Загрузить фото
                    </Button>
                    <button
                      type="button"
                      className="icon-button delete-avatar"
                      aria-label="Удалить фото"
                      disabled={!profile.avatar || uploading}
                      onClick={() => {
                        uploadVersion.current++;
                        update("avatar", "");
                        setFileError("");
                      }}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                  <p>JPG, PNG или WebP. Не более 5 МБ.</p>
                  {fileError && (
                    <span className="field-error" role="alert">
                      {fileError}
                    </span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={upload}
                  className="visually-hidden"
                  aria-label="Загрузить аватар"
                  tabIndex={-1}
                />
              </div>
              <div className="fields-grid">
                <div className="field">
                  <label htmlFor="name">Имя</label>
                  <TextInput
                    id="name"
                    name="name"
                    size="l"
                    value={profile.name}
                    onUpdate={(v) => update("name", v)}
                    autoComplete="name"
                    validationState={errors.name ? "invalid" : undefined}
                    errorMessage={errors.name}
                    placeholder="Ваше имя"
                    controlProps={{ maxLength: 100 }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <TextInput
                    id="email"
                    name="email"
                    size="l"
                    type="email"
                    value={profile.email}
                    onUpdate={(v) => update("email", v)}
                    autoComplete="email"
                    validationState={errors.email ? "invalid" : undefined}
                    errorMessage={errors.email}
                    placeholder="you@example.com"
                    endContent={
                      <span className="input-mail">
                        <Icon name="mail" size={16} />
                      </span>
                    }
                  />
                </div>
              </div>
            </section>
            <section
              id="regional"
              className="settings-section regional-section"
            >
              <div className="fields-grid">
                <div className="field">
                  <label htmlFor="language">
                    <Icon name="globe" size={15} />
                    Язык интерфейса
                  </label>
                  <Select
                    id="language"
                    size="l"
                    width="max"
                    value={[profile.language]}
                    onUpdate={(v) => update("language", v[0])}
                    options={languages}
                    aria-label="Язык интерфейса"
                  />
                </div>
                <div className="field">
                  <label htmlFor="timezone">
                    <span className="clock-icon" />
                    Часовой пояс
                  </label>
                  <Select
                    id="timezone"
                    size="l"
                    width="max"
                    value={[profile.timezone]}
                    onUpdate={(v) => update("timezone", v[0])}
                    options={timezones}
                    filterable
                    filterPlaceholder="Найти город или часовой пояс"
                    aria-label="Часовой пояс"
                  />
                </div>
              </div>
              <p className="field-hint">
                Используем для отображения времени и отправки уведомлений.
              </p>
            </section>
            <section
              id="security"
              className="settings-section security-section"
            >
              <div
                className={`security-option ${profile.twoFactor ? "enabled" : ""}`}
              >
                <span className="section-icon">
                  <Icon name="shield" size={19} />
                </span>
                <div className="security-copy">
                  <h2 className="option-title">
                    Двухфакторная авторизация{" "}
                    <span className="recommended">Рекомендуем</span>
                  </h2>
                  <p>Дополнительное подтверждение при входе в аккаунт.</p>
                </div>
                <Switch
                  size="l"
                  checked={profile.twoFactor}
                  onUpdate={(v) => update("twoFactor", v)}
                  controlProps={{
                    "aria-label": "Двухфакторная авторизация",
                  }}
                />
              </div>
            </section>
            <section
              id="notifications"
              className="settings-section notifications-section"
            >
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="bell" size={18} />
                </span>
                <div>
                  <h2>Email-уведомления</h2>
                  <p>Выбирайте, какие письма вы хотите получать.</p>
                </div>
                <span className="notification-caption">
                  Только полезное, обещаем
                </span>
              </div>
              <div className="notification-list">
                <Checkbox
                  size="l"
                  checked={profile.product}
                  onUpdate={(v) => update("product", v)}
                >
                  <span className="checkbox-copy">
                    <strong>Новости продукта</strong>
                    <span>
                      Новые возможности, улучшения и важные обновления.
                    </span>
                  </span>
                </Checkbox>
                <Checkbox
                  size="l"
                  checked={profile.alerts}
                  onUpdate={(v) => update("alerts", v)}
                >
                  <span className="checkbox-copy">
                    <strong>Системные алерты</strong>
                    <span>Важные события и изменения в вашем аккаунте.</span>
                  </span>
                </Checkbox>
                <Checkbox
                  size="l"
                  checked={profile.digest}
                  onUpdate={(v) => update("digest", v)}
                >
                  <span className="checkbox-copy">
                    <strong>Дайджест за неделю</strong>
                    <span>Главное за последние 7 дней в одном письме.</span>
                  </span>
                </Checkbox>
              </div>
            </section>
            <footer className="form-footer">
              <span className={`save-note ${dirty ? "unsaved" : ""}`}>
                <Icon name={dirty ? "user" : "check"} size={15} />
                {dirty
                  ? "Есть несохранённые изменения"
                  : "Все изменения сохранены"}
              </span>
              <div className="form-buttons">
                <Button size="l" view="outlined" onClick={cancel}>
                  Отмена
                </Button>
                <Button
                  size="l"
                  view="action"
                  type="submit"
                  disabled={uploading}
                >
                  <Icon name="check" size={17} />
                  Сохранить
                </Button>
              </div>
            </footer>
          </form>
          <div className="privacy-note">
            <Icon name="lock" size={13} />
            <span>Ваши данные в безопасности и доступны только вам.</span>
          </div>
          <div className="page-footer">
            <span>© {new Date().getFullYear()} Forma</span>
            <span>
              Пространство, в котором легко быть собой{" "}
              <span className="tiny-flower">✳</span>
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon">
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button
            className="icon-button"
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={helpRef}
        className="help-dialog"
        aria-labelledby="help-title"
        onCancel={() => setHelp(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setHelp(false);
        }}
      >
        <button
          className="icon-button dialog-close"
          aria-label="Закрыть помощь"
          onClick={() => setHelp(false)}
        >
          <Icon name="close" />
        </button>
        <span className="dialog-icon">
          <Icon name="help" size={26} />
        </span>
        <h2 id="help-title">Пусть всё будет удобно</h2>
        <p>Все настройки находятся на одной странице.</p>
        <div className="help-content">
          <strong>Как изменить фото?</strong>
          <p>
            Нажмите «Загрузить фото» и выберите JPG, PNG или WebP до 5 МБ. Мы
            обрежем изображение по центру.
          </p>
          <strong>Как сохранить изменения?</strong>
          <p>
            Нажмите «Сохранить». Параметры сохраняются в этом браузере. Кнопка
            «Отмена» вернёт последние сохранённые настройки.
          </p>
          <strong>Как работает безопасность?</strong>
          <p>
            Здесь сохраняется предпочтение двухфакторной авторизации. Для
            реальной защиты входа потребуется подключение сервиса авторизации.
          </p>
        </div>
        <Button
          view="action"
          size="l"
          width="max"
          onClick={() => setHelp(false)}
        >
          Всё понятно
        </Button>
      </dialog>
    </div>
  );
}
