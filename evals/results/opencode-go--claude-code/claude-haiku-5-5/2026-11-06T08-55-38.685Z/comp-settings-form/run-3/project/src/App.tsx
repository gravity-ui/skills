import { ProfileSettingsPage } from './profile/ProfileSettingsPage';
import type { ProfileValues } from './profile/model';

const INITIAL_PROFILE: ProfileValues = {
  name: 'Анна Смирнова',
  email: 'anna@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Заглушка вместо бэкенда: имитирует задержку сети и возвращает сохранённый профиль.
async function saveProfileStub(values: ProfileValues, avatarFile: File | null): Promise<ProfileValues> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const avatarUrl = avatarFile ? await readAsDataUrl(avatarFile) : values.avatarUrl;
  return { ...values, avatarUrl };
}

export function App() {
  return <ProfileSettingsPage initialValues={INITIAL_PROFILE} onSave={saveProfileStub} />;
}
