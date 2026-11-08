import {ProfileSettingsPage} from './ProfileSettingsPage';

export function App() {
  return (
    <ProfileSettingsPage
      initialValues={{
        name: 'Анна Петрова',
        email: 'anna.petrova@example.com',
        language: 'ru',
        timezone: 'Europe/Moscow',
      }}
      onSave={(values) => console.log('save', values)}
      onCancel={() => console.log('cancel')}
    />
  );
}
