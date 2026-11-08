import { ProfileSettings } from './ProfileSettings';

// Имитация запроса на сервер; замените на реальный вызов API.
const fakeSave = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <ProfileSettings onSave={fakeSave} />
    </div>
  );
}
