import { ProfileSettings } from './ProfileSettings';

// Имитация запроса на сервер.
const fakeSave = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

export function App() {
  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <ProfileSettings onSave={fakeSave} />
    </div>
  );
}
