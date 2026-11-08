import {useRef, useState} from 'react';
import {Button, Card, Checkbox, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import './App.css';

type ProfileSettings = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
  avatar: string | null;
};

const initialSettings: ProfileSettings = {
  name: 'Александр Иванов',
  email: 'alex.ivanov@example.com',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: true,
  productNews: true,
  systemAlerts: true,
  weeklyDigest: false,
  avatar: null,
};

const languageOptions = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'es', content: 'Español'},
  {value: 'de', content: 'Deutsch'},
];

const timezoneOptions = [
  {value: 'Europe/Moscow', content: 'Москва (UTC+3)'},
  {value: 'Europe/Kaliningrad', content: 'Калининград (UTC+2)'},
  {value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)'},
  {value: 'Asia/Novosibirsk', content: 'Новосибирск (UTC+7)'},
  {value: 'Asia/Vladivostok', content: 'Владивосток (UTC+10)'},
  {value: 'Europe/London', content: 'Лондон (UTC+0)'},
  {value: 'America/New_York', content: 'Нью-Йорк (UTC−5)'},
];

function Field({label, hint, children}: {label: string; hint?: string; children: React.ReactNode}) {
  return (
    <div className="profile-field">
      <Text variant="body-2" className="profile-field__label">{label}</Text>
      {children}
      {hint && <Text variant="caption-2" color="secondary" className="profile-field__hint">{hint}</Text>}
    </div>
  );
}

export function App() {
  const [settings, setSettings] = useState<ProfileSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setSettings((current) => ({...current, [key]: value}));
    setSaved(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(true);
      event.target.value = '';
      return;
    }
    setAvatarError(false);
    const reader = new FileReader();
    reader.onload = () => update('avatar', typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    setSaved(false);
    setAvatarError(false);
    if (avatarInput.current) avatarInput.current.value = '';
  };

  return (
    <main className="settings-page">
      <div className="settings-page__container">
        <div className="settings-breadcrumb">
          <Text variant="body-2" color="secondary">Настройки</Text>
          <span className="settings-breadcrumb__divider">/</span>
          <Text variant="body-2">Профиль</Text>
        </div>

        <header className="settings-header">
          <div>
            <Text variant="header-1" className="settings-header__title">Настройки профиля</Text>
            <Text variant="body-2" color="secondary" className="settings-header__subtitle">
              Управляйте личными данными и предпочтениями аккаунта
            </Text>
          </div>
          <div className="settings-header__badge"><span />Аккаунт активен</div>
        </header>

        <Card className="profile-card" view="outlined" size="l">
          <section className="profile-section profile-section--identity">
            <div className="profile-section__heading">
              <div className="section-mark section-mark--profile">01</div>
              <div>
                <Text variant="subheader-1" className="profile-section__title">Личная информация</Text>
                <Text variant="caption-1" color="secondary">Основные данные вашего аккаунта</Text>
              </div>
            </div>

            <div className="avatar-row">
              <div className="avatar-preview" aria-label="Аватар профиля">
                {settings.avatar ? <img src={settings.avatar} alt="Аватар профиля" /> : <span>АИ</span>}
                <div className="avatar-preview__status" />
              </div>
              <div className="avatar-details">
                <Text variant="body-2" className="avatar-details__title">Фото профиля</Text>
                <Text variant="caption-2" color={avatarError ? 'danger' : 'secondary'}>
                  {avatarError ? 'Файл должен быть меньше 5 МБ' : 'PNG или JPG, не более 5 МБ'}
                </Text>
                <div className="avatar-actions">
                  <Button size="s" view="outlined" onClick={() => avatarInput.current?.click()}>
                    Загрузить фото
                  </Button>
                  {settings.avatar && <Button size="s" view="flat" onClick={() => update('avatar', null)}>Удалить</Button>}
                  <input
                    ref={avatarInput}
                    className="visually-hidden"
                    type="file"
                    accept="image/png,image/jpeg"
                    aria-label="Выбрать фото профиля"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </div>

            <div className="profile-grid">
              <Field label="Имя" hint="Так вас будут видеть коллеги">
                <TextInput size="l" value={settings.name} onUpdate={(value) => update('name', value)} placeholder="Ваше имя" />
              </Field>
              <Field label="Email" hint="Используется для входа и уведомлений">
                <TextInput size="l" type="email" value={settings.email} onUpdate={(value) => update('email', value)} placeholder="name@example.com" />
              </Field>
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section__heading">
              <div className="section-mark section-mark--locale">02</div>
              <div>
                <Text variant="subheader-1" className="profile-section__title">Региональные настройки</Text>
                <Text variant="caption-1" color="secondary">Язык интерфейса и местное время</Text>
              </div>
            </div>
            <div className="profile-grid">
              <Field label="Язык интерфейса">
                <Select size="l" width="max" value={[settings.language]} options={languageOptions} onUpdate={(value) => update('language', value[0] ?? 'ru')} />
              </Field>
              <Field label="Часовой пояс" hint="Время будет отображаться в выбранном часовом поясе">
                <Select size="l" width="max" value={[settings.timezone]} options={timezoneOptions} onUpdate={(value) => update('timezone', value[0] ?? 'Europe/Moscow')} />
              </Field>
            </div>
          </section>

          <section className="profile-section profile-section--security">
            <div className="profile-section__heading">
              <div className="section-mark section-mark--security">03</div>
              <div>
                <Text variant="subheader-1" className="profile-section__title">Безопасность</Text>
                <Text variant="caption-1" color="secondary">Дополнительная защита вашего аккаунта</Text>
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-row__copy">
                <Text variant="body-2" className="setting-row__title">Двухфакторная авторизация</Text>
                <Text variant="caption-2" color="secondary">Запрашивать код при входе с нового устройства</Text>
              </div>
              <Switch size="m" checked={settings.twoFactor} onUpdate={(value) => update('twoFactor', value)} aria-label="Двухфакторная авторизация" />
            </div>
          </section>

          <section className="profile-section profile-section--notifications">
            <div className="profile-section__heading">
              <div className="section-mark section-mark--notifications">04</div>
              <div>
                <Text variant="subheader-1" className="profile-section__title">Email-уведомления</Text>
                <Text variant="caption-1" color="secondary">Выберите, какие письма вы хотите получать</Text>
              </div>
            </div>
            <div className="notification-options">
              <div className="notification-card">
                <Checkbox size="l" checked={settings.productNews} onUpdate={(value) => update('productNews', value)}>
                  <span className="notification-option">
                    <Text variant="body-2">Новости продукта</Text>
                    <Text variant="caption-2" color="secondary">Новые функции, улучшения и анонсы</Text>
                  </span>
                </Checkbox>
              </div>
              <div className="notification-card">
                <Checkbox size="l" checked={settings.systemAlerts} onUpdate={(value) => update('systemAlerts', value)}>
                  <span className="notification-option">
                    <Text variant="body-2">Системные алерты</Text>
                    <Text variant="caption-2" color="secondary">Важные события и безопасность аккаунта</Text>
                  </span>
                </Checkbox>
              </div>
              <div className="notification-card">
                <Checkbox size="l" checked={settings.weeklyDigest} onUpdate={(value) => update('weeklyDigest', value)}>
                  <span className="notification-option">
                    <Text variant="body-2">Дайджест за неделю</Text>
                    <Text variant="caption-2" color="secondary">Краткий обзор активности раз в неделю</Text>
                  </span>
                </Checkbox>
              </div>
            </div>
          </section>

          <footer className="profile-card__footer">
            <Text variant="caption-2" color="secondary" className="save-status" aria-live="polite">
              {saved ? 'Изменения сохранены' : 'Изменения сохраняются только после подтверждения'}
            </Text>
            <div className="form-actions">
              <Button size="l" view="normal" onClick={handleCancel}>Отмена</Button>
              <Button size="l" view="action" onClick={() => setSaved(true)}>Сохранить</Button>
            </div>
          </footer>
        </Card>
        <Text variant="caption-2" color="secondary" className="page-footnote">Последнее обновление профиля: сегодня, 10:42</Text>
      </div>
    </main>
  );
}
