import * as React from 'react';
import {Text} from '@gravity-ui/uikit';

import {ProfileSettingsForm} from './ProfileSettingsForm';

export function App() {
  return (
    <div style={{padding: 24}}>
      <Text as="h1" variant="header-1" style={{display: 'block', marginBottom: 24}}>
        Настройки профиля
      </Text>
      <ProfileSettingsForm />
    </div>
  );
}
