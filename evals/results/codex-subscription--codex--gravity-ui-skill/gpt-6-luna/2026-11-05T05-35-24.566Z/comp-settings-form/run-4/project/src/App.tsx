import {useRef, useState} from 'react';
import {Button, Checkbox, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import './profile-settings.css';

const languageOptions = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'fr', content: 'Français'},
];

const timezoneOptions = [
  {value: 'Europe/Moscow', content: 'Москва (UTC+3)'},
  {value: 'Europe/London', content: 'Лондон (UTC+0)'},
  {value: 'Europe/Berlin', content: 'Берлин (UTC+1)'},
  {value: 'America/New_York', content: 'Нью-Йорк (UTC−5)'},
  {value: 'Asia/Tokyo', content: 'Токио (UTC+9)'},
];

export function App() {
  const [name, setName] = useState('Александр Иванов');
  const [email, setEmail] = useState('alex.ivanov@example.com');
  const [language, setLanguage] = useState(['ru']);
  const [timezone, setTimezone] = useState(['Europe/Moscow']);
  const [twoFactor, setTwoFactor] = useState(true);
  const [news, setNews] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [digest, setDigest] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    setName('Александр Иванов');
    setEmail('alex.ivanov@example.com');
    setLanguage(['ru']);
    setTimezone(['Europe/Moscow']);
    setTwoFactor(true);
    setNews(true);
    setAlerts(true);
    setDigest(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <main className="settings-page">
      <div className="settings-shell">
        <header className="page-heading">
          <div className="breadcrumb">Рабочее пространство <span>/</span> Настройки</div>
          <Text variant="header-1">Настройки профиля</Text>
          <Text className="page-subtitle" color="secondary" variant="body-2">
            Управляйте личными данными и предпочтениями аккаунта
          </Text>
        </header>

        <form className="settings-card" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
          {saved && <div className="save-notice" role="status">Изменения сохранены</div>}
          <section className="form-section profile-section">
            <div className="section-heading">
              <Text variant="subheader-1">Личная информация</Text>
              <Text color="secondary" variant="body-2">Ваши данные видны только вам и администраторам команды.</Text>
            </div>
            <div className="avatar-row">
              <div className="avatar-circle" aria-label="Аватар профиля">
                {avatar ? <img src={avatar} alt="Аватар профиля" /> : <span>АИ</span>}
              </div>
              <div className="avatar-copy">
                <Text variant="body-1">Фотография профиля</Text>
                <Text color="secondary" variant="caption-1">JPG или PNG, не более 5 МБ</Text>
              </div>
              <Button type="button" view="outlined" size="m" style={{flexShrink: 0}} onClick={() => fileInput.current?.click()}>
                Загрузить фото
              </Button>
              <input ref={fileInput} className="visually-hidden" type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} />
            </div>
            <div className="field-grid">
              <label className="field">
                <Text variant="body-2">Имя</Text>
                <TextInput value={name} onUpdate={setName} placeholder="Введите имя" size="l" />
              </label>
              <label className="field">
                <Text variant="body-2">Email</Text>
                <TextInput type="email" value={email} onUpdate={setEmail} placeholder="name@example.com" size="l" />
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <Text variant="subheader-1">Предпочтения</Text>
              <Text color="secondary" variant="body-2">Настройте интерфейс под себя.</Text>
            </div>
            <div className="field-grid">
              <label className="field">
                <Text variant="body-2">Язык интерфейса</Text>
                <Select size="l" value={language} options={languageOptions} onUpdate={setLanguage} />
              </label>
              <label className="field">
                <Text variant="body-2">Часовой пояс</Text>
                <Select size="l" value={timezone} options={timezoneOptions} onUpdate={setTimezone} />
              </label>
            </div>
          </section>

          <section className="form-section security-section">
            <div className="setting-row">
              <div className="setting-description">
                <Text variant="subheader-2">Двухфакторная авторизация</Text>
                <Text color="secondary" variant="body-2">Дополнительная защита при входе в аккаунт.</Text>
              </div>
              <Switch size="m" checked={twoFactor} onUpdate={setTwoFactor} />
            </div>
          </section>

          <section className="form-section notifications-section">
            <div className="section-heading">
              <Text variant="subheader-1">Email-уведомления</Text>
              <Text color="secondary" variant="body-2">Выберите, какие письма вы хотите получать.</Text>
            </div>
            <div className="checkbox-list">
              <Checkbox size="m" checked={news} onUpdate={setNews}>Новости продукта</Checkbox>
              <Checkbox size="m" checked={alerts} onUpdate={setAlerts}>Системные алерты</Checkbox>
              <Checkbox size="m" checked={digest} onUpdate={setDigest}>Еженедельный дайджест</Checkbox>
            </div>
          </section>

          <footer className="form-actions">
            <Button type="button" view="flat" size="l" onClick={handleCancel}>Отмена</Button>
            <Button type="submit" view="action" size="l">Сохранить</Button>
          </footer>
        </form>
        <div className="page-footnote"><span className="status-dot" /> Ваш профиль доступен только участникам команды</div>
      </div>
    </main>
  );
}
