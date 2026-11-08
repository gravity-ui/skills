import { Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';

import { ProfileSettingsPage, type ProfileSettings } from './profile-settings';

const toaster = new Toaster();

const DEMO_PROFILE: ProfileSettings = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: null,
  language: 'ru',
  timeZone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

// Заглушка API: имитирует запрос и возвращает сохранённые данные.
// В реальном приложении здесь будет вызов бэкенда с загрузкой файла аватара.
async function saveProfile(values: ProfileSettings, _avatarFile: File | null): Promise<ProfileSettings> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return values;
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <ProfileSettingsPage initialValues={DEMO_PROFILE} onSave={saveProfile} />
      <ToasterComponent />
    </ToasterProvider>
  );
}
