import {ProfileSettingsPage} from './ProfileSettingsPage';

export function App() {
  return (
    <ProfileSettingsPage
      onSave={async (values, avatarFile) => {
        // Replace with a real API call; a short delay demonstrates the loading state.
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log('Profile settings saved', values, avatarFile);
      }}
    />
  );
}
