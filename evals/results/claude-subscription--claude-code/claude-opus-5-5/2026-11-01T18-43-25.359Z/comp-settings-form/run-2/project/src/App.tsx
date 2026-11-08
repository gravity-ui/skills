import { ProfileSettings } from './ProfileSettings/ProfileSettings';
import { getBrowserTimeZone } from './ProfileSettings/options';
import type { ProfileSettingsSubmit, ProfileSettingsValues } from './ProfileSettings/types';

const initialValues: ProfileSettingsValues = {
  name: 'Анна Смирнова',
  email: 'anna@example.com',
  avatarUrl: null,
  language: 'ru',
  timeZone: getBrowserTimeZone(),
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

// Mock API: replace with a real request (e.g. multipart upload for avatarFile).
async function saveProfile({ avatarFile, ...values }: ProfileSettingsSubmit): Promise<ProfileSettingsValues> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.info('Saved profile', values, avatarFile);
  return values;
}

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <ProfileSettings initialValues={initialValues} onSave={saveProfile} />
    </div>
  );
}
