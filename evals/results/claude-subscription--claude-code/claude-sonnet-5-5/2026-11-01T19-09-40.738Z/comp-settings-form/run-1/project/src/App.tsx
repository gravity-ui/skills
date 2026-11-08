import { ProfileSettings } from './ProfileSettings';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <ProfileSettings
        // Заглушка: здесь должен быть запрос к API
        onSave={() => new Promise((resolve) => setTimeout(resolve, 600))}
      />
    </div>
  );
}
