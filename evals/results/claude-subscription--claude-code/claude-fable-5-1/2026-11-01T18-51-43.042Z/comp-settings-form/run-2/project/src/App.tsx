import { ProfileSettings } from './ProfileSettings';
import type { ProfileSettingsValues } from './ProfileSettings';

const INITIAL_VALUES: Partial<ProfileSettingsValues> = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <ProfileSettings
        initialValues={INITIAL_VALUES}
        onSave={(values) => console.log('save', values)}
        onCancel={() => console.log('cancel')}
      />
    </div>
  );
}
