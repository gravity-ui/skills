import * as React from 'react';
import {Box, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import {ProfileSettingsPage} from './ProfileSettingsPage';
import type {ProfileSettings} from './ProfileSettingsPage';

const toaster = new Toaster();

const DEMO_PROFILE: ProfileSettings = {
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

async function saveProfile(values: ProfileSettings, avatarFile: File | null) {
  // Replace with a real API call.
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.info('Профиль сохранён', values, avatarFile);
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <Box spacing={{p: 6}}>
        <ProfileSettingsPage initialValues={DEMO_PROFILE} onSave={saveProfile} />
      </Box>
      <ToasterComponent />
    </ToasterProvider>
  );
}
