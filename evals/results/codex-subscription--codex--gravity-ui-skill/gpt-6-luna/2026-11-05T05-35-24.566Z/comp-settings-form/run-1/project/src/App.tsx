import { useState, type ReactNode } from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import { unstable_FileDropZone as FileDropZone } from '@gravity-ui/uikit/unstable';
import './app.css';

type ProfileSettings = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  news: boolean;
  alerts: boolean;
  digest: boolean;
  avatar: string;
};

const initialSettings: ProfileSettings = {
  name: 'Александр Иванов',
  email: 'alex.ivanov@company.ru',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: true,
  news: true,
  alerts: true,
  digest: false,
  avatar: '',
};

const languages = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'es', content: 'Español' },
  { value: 'de', content: 'Deutsch' },
];

const timezones = [
  { value: 'Europe/Moscow', content: 'Москва (UTC+3)' },
  { value: 'Europe/Kaliningrad', content: 'Калининград (UTC+2)' },
  { value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Novosibirsk', content: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Vladivostok', content: 'Владивосток (UTC+10)' },
  { value: 'Europe/London', content: 'Лондон (UTC+0)' },
  { value: 'America/New_York', content: 'Нью-Йорк (UTC−5)' },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="settings-field">
      <Text className="settings-field__label" variant="body-2">{label}</Text>
      {children}
      {hint && <Text className="settings-field__hint" variant="caption-1" color="secondary">{hint}</Text>}
    </div>
  );
}

export function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const reset = () => {
    setSettings(initialSettings);
    setSaved(false);
  };

  const handleAvatar = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSettings((current) => ({ ...current, avatar: URL.createObjectURL(file) }));
    setSaved(false);
  };

  return (
    <main className="profile-page">
      <div className="profile-page__shell">
        <header className="page-heading">
          <div className="page-heading__copy">
            <Text className="eyebrow" variant="caption-1" color="secondary">АККАУНТ</Text>
            <Text className="page-heading__title" variant="header-1" as="h1">Настройки профиля</Text>
            <Text className="page-heading__subtitle" variant="body-2" color="secondary">
              Управляйте личными данными, безопасностью и настройками уведомлений.
            </Text>
          </div>
          <div className="profile-badge" aria-label="Ваш аккаунт">
            <span className="profile-badge__dot" />
            <Text variant="caption-1">Личный аккаунт</Text>
          </div>
        </header>

        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Разделы настроек">
            <Text className="settings-nav__caption" variant="caption-1" color="secondary">НАСТРОЙКИ</Text>
            <a className="settings-nav__link settings-nav__link--active" href="#personal">
              <span className="nav-mark nav-mark--profile" aria-hidden="true">◎</span> Профиль
            </a>
            <a className="settings-nav__link" href="#security">
              <span className="nav-mark nav-mark--security" aria-hidden="true">⌑</span> Безопасность
            </a>
            <a className="settings-nav__link" href="#notifications">
              <span className="nav-mark nav-mark--notifications" aria-hidden="true">◌</span> Уведомления
            </a>
            <div className="nav-help">
              <span className="nav-help__icon" aria-hidden="true">?</span>
              <Text variant="body-2">Нужна помощь?</Text>
              <Text variant="caption-1" color="secondary">Мы всегда на связи</Text>
              <a href="mailto:support@example.com">Связаться с поддержкой <span aria-hidden="true">↗</span></a>
            </div>
          </nav>

          <form className="settings-content" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
            <section className="settings-card" id="personal">
              <div className="section-heading">
                <span className="section-icon section-icon--person" aria-hidden="true">✳</span>
                <div>
                  <Text className="section-heading__title" variant="subheader-1">Личные данные</Text>
                  <Text variant="body-2" color="secondary">Информация, которая отображается в вашем аккаунте.</Text>
                </div>
              </div>
              <div className="avatar-row">
                <Avatar
                  className="profile-avatar"
                  size="xl"
                  shape="circle"
                  text="АИ"
                  {...(settings.avatar ? { imgUrl: settings.avatar, alt: 'Аватар профиля' } : {})}
                />
                <div className="avatar-copy">
                  <Text variant="body-2">Фотография профиля</Text>
                  <Text className="avatar-copy__hint" variant="caption-1" color="secondary">JPG или PNG, не более 5 МБ</Text>
                </div>
                <div className="avatar-upload">
                  <FileDropZone
                    accept={['image/jpeg', 'image/png']}
                    onUpdateAccepted={handleAvatar}
                    buttonText="Загрузить фото"
                    title=""
                    description=""
                  />
                </div>
              </div>
              <div className="field-grid">
                <Field label="Имя">
                  <TextInput
                    className="profile-input"
                    value={settings.name}
                    onUpdate={(value) => update('name', value)}
                    placeholder="Ваше имя"
                  />
                </Field>
                <Field label="Email" hint="На этот адрес приходят важные уведомления.">
                  <TextInput
                    className="profile-input"
                    type="email"
                    value={settings.email}
                    onUpdate={(value) => update('email', value)}
                    placeholder="name@example.com"
                  />
                </Field>
              </div>
            </section>

            <section className="settings-card">
              <div className="section-heading">
                <span className="section-icon section-icon--preferences" aria-hidden="true">◈</span>
                <div>
                  <Text className="section-heading__title" variant="subheader-1">Регион и язык</Text>
                  <Text variant="body-2" color="secondary">Настройте интерфейс под себя.</Text>
                </div>
              </div>
              <div className="field-grid">
                <Field label="Язык интерфейса">
                  <Select
                    className="profile-select"
                    value={[settings.language]}
                    options={languages}
                    onUpdate={(value) => update('language', value[0] ?? 'ru')}
                  />
                </Field>
                <Field label="Часовой пояс" hint="Используется для отображения дат и времени.">
                  <Select
                    className="profile-select"
                    value={[settings.timezone]}
                    options={timezones}
                    onUpdate={(value) => update('timezone', value[0] ?? 'Europe/Moscow')}
                  />
                </Field>
              </div>
            </section>

            <section className="settings-card security-card" id="security">
              <div className="section-heading">
                <span className="section-icon section-icon--security" aria-hidden="true">⌑</span>
                <div>
                  <Text className="section-heading__title" variant="subheader-1">Безопасность</Text>
                  <Text variant="body-2" color="secondary">Дополнительная защита вашего аккаунта.</Text>
                </div>
              </div>
              <div className="setting-row">
                <div className="setting-row__text">
                  <Text variant="body-2">Двухфакторная авторизация</Text>
                  <Text variant="caption-1" color="secondary">Запрашивать код при входе с нового устройства.</Text>
                </div>
                <Switch
                  size="m"
                  checked={settings.twoFactor}
                  onUpdate={(value) => update('twoFactor', value)}
                  title="Двухфакторная авторизация"
                  aria-label="Двухфакторная авторизация"
                />
              </div>
            </section>

            <section className="settings-card notifications-card" id="notifications">
              <div className="section-heading">
                <span className="section-icon section-icon--notifications" aria-hidden="true">◌</span>
                <div>
                  <Text className="section-heading__title" variant="subheader-1">Email-уведомления</Text>
                  <Text variant="body-2" color="secondary">Выберите, какие письма вы хотите получать.</Text>
                </div>
              </div>
              <div className="checkbox-list">
                <Checkbox className="notification-option" checked={settings.news} onUpdate={(value) => update('news', value)}>
                  <span className="checkbox-copy"><Text variant="body-2">Новости продукта</Text><Text variant="caption-1" color="secondary">Новые функции, обновления и улучшения.</Text></span>
                </Checkbox>
                <Checkbox className="notification-option" checked={settings.alerts} onUpdate={(value) => update('alerts', value)}>
                  <span className="checkbox-copy"><Text variant="body-2">Системные алерты</Text><Text variant="caption-1" color="secondary">Важная информация о безопасности и аккаунте.</Text></span>
                </Checkbox>
                <Checkbox className="notification-option" checked={settings.digest} onUpdate={(value) => update('digest', value)}>
                  <span className="checkbox-copy"><Text variant="body-2">Дайджест за неделю</Text><Text variant="caption-1" color="secondary">Главное за неделю в одном письме.</Text></span>
                </Checkbox>
              </div>
            </section>

            <footer className="form-actions">
              <div className="form-actions__status" aria-live="polite">
                {saved && <Text variant="caption-1" color="secondary"><span className="saved-check">✓</span> Изменения сохранены</Text>}
              </div>
              <Button type="button" view="flat" size="l" onClick={reset}>Отмена</Button>
              <Button type="submit" view="action" size="l">Сохранить</Button>
            </footer>
          </form>
        </div>
        <div className="page-footnote"><span className="footnote-dot" /> Все изменения защищены и доступны только вам</div>
      </div>
    </main>
  );
}
