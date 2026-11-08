import { ProfileSettingsPage } from './ProfileSettingsPage';
import type { ProfileData } from './ProfileSettingsPage';

const initialProfile: ProfileData = {
  name: 'Анна Смирнова',
  email: 'anna@example.com',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

// Stub: replace with a real API call.
async function saveProfile(profile: ProfileData, avatarFile: File | null) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.info('Profile saved', profile, avatarFile?.name ?? null);
}

export function App() {
  return <ProfileSettingsPage initialProfile={initialProfile} onSave={saveProfile} />;
}
