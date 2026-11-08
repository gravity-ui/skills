import { ProfileSettings } from './ProfileSettings';
import type { ProfileSettingsValues } from './ProfileSettings';

const INITIAL_VALUES: ProfileSettingsValues = {
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

// Заглушка вместо запроса к API: заменить на реальный вызов сохранения профиля.
async function saveProfile(values: ProfileSettingsValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.info('Profile saved', values);
}

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <ProfileSettings initialValues={INITIAL_VALUES} onSave={saveProfile} />
    </div>
  );
}
