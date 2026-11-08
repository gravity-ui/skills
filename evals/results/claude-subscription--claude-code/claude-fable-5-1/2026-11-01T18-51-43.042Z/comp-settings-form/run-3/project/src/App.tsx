import { useMemo } from 'react';

import { ProfileSettings, type ProfileSettingsValues } from './ProfileSettings';

export function App() {
  // Демо-данные профиля. В реальном приложении сюда приходят значения с сервера.
  const initialValues = useMemo<ProfileSettingsValues>(
    () => ({
      name: 'Анна Смирнова',
      email: 'anna.smirnova@example.com',
      avatarUrl: '',
      language: 'ru',
      timezone: 'Europe/Moscow',
      twoFactorEnabled: false,
      notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
      },
    }),
    [],
  );

  const handleSave = async (values: ProfileSettingsValues) => {
    // Имитация запроса к API.
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log('Профиль сохранён', values);
  };

  return <ProfileSettings initialValues={initialValues} onSave={handleSave} />;
}
