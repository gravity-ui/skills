import { Card } from '@gravity-ui/uikit';
import { ProfileSettingsForm } from './profile/ProfileSettingsForm';
import type { ProfileSettings } from './profile/model';

const INITIAL_PROFILE: ProfileSettings = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  emailNotifications: ['systemAlerts', 'weeklyDigest'],
};

// Stand-in for the real API call: there is no backend in this project yet.
async function saveProfile(_values: ProfileSettings): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function App() {
  return (
    <div style={{ minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}>
      <Card view="outlined" style={{ maxWidth: 640, margin: '0 auto', padding: 32 }}>
        <ProfileSettingsForm initialValues={INITIAL_PROFILE} onSave={saveProfile} />
      </Card>
    </div>
  );
}
