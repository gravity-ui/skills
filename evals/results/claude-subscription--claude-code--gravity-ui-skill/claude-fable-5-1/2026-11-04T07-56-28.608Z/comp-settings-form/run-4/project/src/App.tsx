import { Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';

import { ProfileSettingsPage } from './ProfileSettingsPage';

const toaster = new Toaster();

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <ProfileSettingsPage />
      <ToasterComponent />
    </ToasterProvider>
  );
}
