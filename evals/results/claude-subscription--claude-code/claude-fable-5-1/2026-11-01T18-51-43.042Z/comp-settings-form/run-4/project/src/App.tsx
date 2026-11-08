import { ProfileSettings } from './ProfileSettings';

export function App() {
  return (
    <ProfileSettings
      onSave={async (values) => {
        // Здесь будет запрос к API. Пока имитируем сетевую задержку.
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log('Профиль сохранён', values);
      }}
    />
  );
}
