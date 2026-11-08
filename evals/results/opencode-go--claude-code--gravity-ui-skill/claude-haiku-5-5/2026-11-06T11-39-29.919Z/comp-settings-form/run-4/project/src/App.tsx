import {ProfileSettingsPage} from './ProfileSettingsPage';
import type {ProfileData, ProfileSaveRequest} from './profile';

const INITIAL_PROFILE: ProfileData = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
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

/** Stand-in for the real API: pretends to persist the profile and returns the saved state. */
async function saveProfileStub({profile, avatarFile}: ProfileSaveRequest): Promise<ProfileData> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    ...profile,
    // A real backend would upload `avatarFile` and return its URL.
    avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl,
  };
}

export function App() {
  return <ProfileSettingsPage profile={INITIAL_PROFILE} onSave={saveProfileStub} />;
}
