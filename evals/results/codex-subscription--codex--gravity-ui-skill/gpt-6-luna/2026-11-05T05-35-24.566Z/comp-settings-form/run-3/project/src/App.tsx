import {useState} from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import {unstable_FileDropZone as FileDropZone} from '@gravity-ui/uikit/unstable';
import './App.css';

type Profile = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  productNews: boolean;
  alerts: boolean;
  weeklyDigest: boolean;
  avatarUrl: string;
};

const initialProfile: Profile = {
  name: 'Александр Иванов',
  email: 'alex.ivanov@example.com',
  language: 'ru',
  timezone: 'europe-moscow',
  twoFactor: true,
  productNews: true,
  alerts: true,
  weeklyDigest: false,
  avatarUrl: '',
};

const languages = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'es', content: 'Español'},
  {value: 'de', content: 'Deutsch'},
];

const timezones = [
  {value: 'europe-moscow', content: '(UTC+03:00) Москва'},
  {value: 'europe-london', content: '(UTC+00:00) Лондон'},
  {value: 'europe-berlin', content: '(UTC+01:00) Берлин'},
  {value: 'america-new-york', content: '(UTC−05:00) Нью-Йорк'},
  {value: 'asia-tokyo', content: '(UTC+09:00) Токио'},
];

export function App() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(initialProfile);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((current) => ({...current, [key]: value}));
    setSaved(false);
  };

  const handleSave = () => {
    setSavedProfile(profile);
    setSaved(true);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setSaved(false);
  };

  return (
    <main className="settings-page">
      <div className="settings-shell">
        <div className="breadcrumbs"><span>Аккаунт</span><span className="crumb-separator">/</span><span>Настройки профиля</span></div>
        <header className="page-heading">
          <div>
            <Text as="h1" variant="header-1">Настройки профиля</Text>
            <Text className="page-subtitle" variant="body-2" color="secondary">Управляйте личными данными и настройками аккаунта</Text>
          </div>
          <div className="profile-chip">
            <Avatar className="chip-avatar" size="xs" text="АИ" />
            <span>Александр Иванов</span>
            <span className="chip-caret" aria-hidden="true">⌄</span>
          </div>
        </header>

        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Настройки аккаунта">
            <div className="nav-label">АККАУНТ</div>
            <a className="nav-item nav-item-active" href="#profile"><span className="nav-symbol">◉</span>Профиль</a>
            <a className="nav-item" href="#security"><span className="nav-symbol">◇</span>Безопасность</a>
            <a className="nav-item" href="#notifications"><span className="nav-symbol">♧</span>Уведомления</a>
            <a className="nav-item" href="#preferences"><span className="nav-symbol">⚙</span>Предпочтения</a>
            <div className="nav-divider" />
            <div className="nav-label">ОРГАНИЗАЦИЯ</div>
            <a className="nav-item" href="#team"><span className="nav-symbol">♧</span>Команда</a>
            <a className="nav-item" href="#billing"><span className="nav-symbol">▤</span>Подписка и оплата</a>
            <div className="help-card">
              <div className="help-icon">?</div>
              <Text variant="subheader-2">Нужна помощь?</Text>
              <Text variant="body-2" color="secondary">Мы всегда готовы помочь с настройкой аккаунта.</Text>
              <a href="#support">Открыть справку <span aria-hidden="true">↗</span></a>
            </div>
          </nav>

          <form className="settings-content" onSubmit={(event) => {event.preventDefault(); handleSave();}}>
            <section className="settings-card" id="profile">
              <div className="card-heading">
                <div className="section-icon section-icon-blue">♙</div>
                <div><Text as="h2" variant="subheader-2">Личная информация</Text><Text variant="body-2" color="secondary">Ваши данные для профиля и входа в систему</Text></div>
              </div>
              <div className="card-body">
                <div className="avatar-row">
                  <Avatar className="large-avatar" size="xl" text="АИ" imgUrl={profile.avatarUrl || undefined} />
                  <div className="avatar-copy"><Text variant="body-2">Фотография профиля</Text><Text variant="caption-2" color="secondary">JPG, PNG или GIF. Максимальный размер — 5 МБ.</Text></div>
                  <FileDropZone
                    className="avatar-upload"
                    accept={['image/jpeg', 'image/png', 'image/gif']}
                    onUpdateAccepted={(files) => {
                      const file = files[0];
                      if (file && file.size <= 5 * 1024 * 1024) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') update('avatarUrl', reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    title="Перетащите фото сюда"
                    description="JPG, PNG или GIF, до 5 МБ"
                    buttonText="Загрузить фото"
                  />
                </div>
                <div className="field-grid">
                  <label className="field"><Text variant="body-2">Имя</Text><TextInput value={profile.name} onUpdate={(value) => update('name', value)} placeholder="Ваше имя" size="l" /></label>
                  <label className="field"><Text variant="body-2">Email</Text><TextInput type="email" value={profile.email} onUpdate={(value) => update('email', value)} placeholder="name@example.com" size="l" /></label>
                </div>
              </div>
            </section>

            <section className="settings-card" id="preferences">
              <div className="card-heading">
                <div className="section-icon section-icon-violet">◷</div>
                <div><Text as="h2" variant="subheader-2">Региональные настройки</Text><Text variant="body-2" color="secondary">Выберите язык и часовой пояс для интерфейса</Text></div>
              </div>
              <div className="card-body field-grid">
                <label className="field"><Text variant="body-2">Язык интерфейса</Text><Select size="l" value={[profile.language]} options={languages} onUpdate={(value) => update('language', value[0] || 'ru')} /></label>
                <label className="field"><Text variant="body-2">Часовой пояс</Text><Select size="l" value={[profile.timezone]} options={timezones} onUpdate={(value) => update('timezone', value[0] || 'europe-moscow')} /></label>
              </div>
            </section>

            <section className="settings-card" id="security">
              <div className="card-heading">
                <div className="section-icon section-icon-green">⌑</div>
                <div><Text as="h2" variant="subheader-2">Безопасность</Text><Text variant="body-2" color="secondary">Дополнительная защита вашего аккаунта</Text></div>
              </div>
              <div className="card-body">
                <div className="setting-row">
                  <div className="setting-copy"><Text variant="body-2">Двухфакторная авторизация</Text><Text variant="caption-2" color="secondary">Запрашивать дополнительный код при входе в аккаунт</Text></div>
                  <Switch size="m" checked={profile.twoFactor} onUpdate={(value) => update('twoFactor', value)} aria-label="Двухфакторная авторизация" />
                </div>
              </div>
            </section>

            <section className="settings-card" id="notifications">
              <div className="card-heading">
                <div className="section-icon section-icon-amber">♧</div>
                <div><Text as="h2" variant="subheader-2">Email-уведомления</Text><Text variant="body-2" color="secondary">Выберите, какие письма вы хотите получать</Text></div>
              </div>
              <div className="card-body notification-options">
                <Checkbox size="m" checked={profile.productNews} onUpdate={(value) => update('productNews', value)} content="Новости продукта" />
                <Checkbox size="m" checked={profile.alerts} onUpdate={(value) => update('alerts', value)} content="Системные алерты" />
                <Checkbox size="m" checked={profile.weeklyDigest} onUpdate={(value) => update('weeklyDigest', value)} content="Дайджест за неделю" />
              </div>
            </section>

            <footer className="form-footer">
              <div className="save-message" role="status">{saved ? 'Изменения сохранены' : ''}</div>
              <div className="form-actions">
                <Button type="button" view="outlined" size="l" onClick={handleCancel}>Отмена</Button>
                <Button type="submit" view="action" size="l">Сохранить изменения <span className="button-arrow">→</span></Button>
              </div>
            </footer>
          </form>
        </div>
        <footer className="page-footer"><span>© 2024 Northstar</span><div><a href="#privacy">Политика конфиденциальности</a><a href="#terms">Условия использования</a><span>Версия 2.4.0</span></div></footer>
      </div>
    </main>
  );
}
